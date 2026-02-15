/**
 * Cloudflare R2 Client (S3-compatible) with local filesystem fallback.
 * When R2 env vars are not set, files are saved to public/uploads/media/ for local dev.
 */

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import sharp from "sharp";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";

// ─── Configuration ───────────────────────────────────────────────────────────

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "curatedascents-media";
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || "";

function getS3Client(): S3Client {
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    throw new Error(
      "R2 credentials not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY."
    );
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });
}

export function isR2Configured(): boolean {
  return !!(R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && R2_PUBLIC_URL);
}

// ─── Key Generation ──────────────────────────────────────────────────────────

/**
 * Generate an organized storage key.
 * Format: {country}/{category}/{filename}-{uuid}.webp
 */
export function generateKey(
  country: string,
  category: string,
  filename: string
): string {
  const sanitized = filename
    .replace(/\.[^.]+$/, "") // strip extension
    .replace(/[^a-zA-Z0-9_-]/g, "-") // sanitize
    .replace(/-+/g, "-") // collapse dashes
    .toLowerCase()
    .slice(0, 60);

  const uuid = crypto.randomUUID().slice(0, 8);
  return `${country.toLowerCase()}/${category.toLowerCase()}/${sanitized}-${uuid}.webp`;
}

/**
 * Generate thumbnail key from the original key.
 */
function thumbnailKey(key: string): string {
  return key.replace(/\.webp$/, "-thumb.webp");
}

// ─── Image Processing ────────────────────────────────────────────────────────

export interface ProcessedImage {
  webpBuffer: Buffer;
  thumbnailBuffer: Buffer;
  width: number;
  height: number;
  originalSize: number;
}

/**
 * Process an uploaded image:
 * - Convert to WebP (quality 85) for optimal web delivery
 * - Generate a 400px-wide thumbnail
 * - Extract dimensions
 */
export async function processImage(
  input: Buffer
): Promise<ProcessedImage> {
  const originalSize = input.length;

  // Convert to WebP, preserving aspect ratio, max 2400px wide
  const mainImage = sharp(input).webp({ quality: 85 });
  const metadata = await sharp(input).metadata();
  const width = metadata.width || 0;
  const height = metadata.height || 0;

  // Resize if wider than 2400px
  const webpBuffer = await (width > 2400
    ? mainImage.resize({ width: 2400, withoutEnlargement: true }).toBuffer()
    : mainImage.toBuffer());

  // Generate thumbnail (400px wide)
  const thumbnailBuffer = await sharp(input)
    .resize({ width: 400, withoutEnlargement: true })
    .webp({ quality: 75 })
    .toBuffer();

  // Get final dimensions after potential resize
  const finalMeta = await sharp(webpBuffer).metadata();

  return {
    webpBuffer,
    thumbnailBuffer,
    width: finalMeta.width || width,
    height: finalMeta.height || height,
    originalSize,
  };
}

// ─── Local Storage Fallback ──────────────────────────────────────────────────

const LOCAL_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "media");
const LOCAL_URL_PREFIX = "/uploads/media";

/**
 * Save a buffer to local public/uploads/media/ directory.
 */
async function uploadToLocal(file: Buffer, key: string): Promise<string> {
  const filePath = path.join(LOCAL_UPLOAD_DIR, key);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, file);
  return `${LOCAL_URL_PREFIX}/${key}`;
}

/**
 * Delete a file from local storage.
 */
async function deleteFromLocal(key: string): Promise<void> {
  const filePath = path.join(LOCAL_UPLOAD_DIR, key);
  try {
    await unlink(filePath);
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
  }
}

// ─── R2 Operations ───────────────────────────────────────────────────────────

/**
 * Upload a buffer to R2 and return the public CDN URL.
 */
export async function uploadToR2(
  file: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  const client = getS3Client();

  await client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    })
  );

  return `${R2_PUBLIC_URL}/${key}`;
}

/**
 * Delete a file from R2.
 */
export async function deleteFromR2(key: string): Promise<void> {
  const client = getS3Client();

  await client.send(
    new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    })
  );
}

// ─── High-Level Upload ───────────────────────────────────────────────────────

export interface UploadResult {
  cdnUrl: string;
  thumbnailUrl: string;
  key: string;
  thumbnailKey: string;
  width: number;
  height: number;
  fileSize: number;
  mimeType: string;
}

/**
 * Full upload pipeline:
 * 1. Process image (WebP conversion + thumbnail)
 * 2. Upload to R2 (or local filesystem as fallback)
 * 3. Return URLs and metadata
 */
export async function uploadMedia(
  file: Buffer,
  country: string,
  category: string,
  filename: string
): Promise<UploadResult> {
  // Process image
  const processed = await processImage(file);

  // Generate keys
  const mainKey = generateKey(country, category, filename);
  const thumbKey = thumbnailKey(mainKey);

  let cdnUrl: string;
  let thumbUrl: string;

  if (isR2Configured()) {
    // Upload to R2
    [cdnUrl, thumbUrl] = await Promise.all([
      uploadToR2(processed.webpBuffer, mainKey, "image/webp"),
      uploadToR2(processed.thumbnailBuffer, thumbKey, "image/webp"),
    ]);
  } else {
    // Local filesystem fallback
    console.log("[Media] R2 not configured — saving to local public/uploads/media/");
    [cdnUrl, thumbUrl] = await Promise.all([
      uploadToLocal(processed.webpBuffer, mainKey),
      uploadToLocal(processed.thumbnailBuffer, thumbKey),
    ]);
  }

  return {
    cdnUrl,
    thumbnailUrl: thumbUrl,
    key: mainKey,
    thumbnailKey: thumbKey,
    width: processed.width,
    height: processed.height,
    fileSize: processed.originalSize,
    mimeType: "image/webp",
  };
}

/**
 * Delete both main image and thumbnail from storage (R2 or local).
 */
export async function deleteMedia(key: string): Promise<void> {
  const thumbKey = thumbnailKey(key);

  if (isR2Configured()) {
    await Promise.all([deleteFromR2(key), deleteFromR2(thumbKey)]);
  } else {
    await Promise.all([deleteFromLocal(key), deleteFromLocal(thumbKey)]);
  }
}

/**
 * Extract the storage key from a CDN or local URL.
 */
export function keyFromCdnUrl(cdnUrl: string): string | null {
  // Local URL
  if (cdnUrl.startsWith(LOCAL_URL_PREFIX)) {
    return cdnUrl.slice(LOCAL_URL_PREFIX.length + 1);
  }
  // R2 URL
  if (R2_PUBLIC_URL && cdnUrl.startsWith(R2_PUBLIC_URL)) {
    return cdnUrl.slice(R2_PUBLIC_URL.length + 1);
  }
  return null;
}
