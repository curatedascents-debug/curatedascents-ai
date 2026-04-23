/**
 * Migrates all media from production (Vercel local storage) to Cloudflare R2.
 * 1. Logs into production admin to get all media records
 * 2. Downloads each photo from production
 * 3. Uploads to R2
 * 4. Updates DB record directly via Drizzle
 */

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });

const PROD_URL = "https://curated-ascents-agentic.vercel.app";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "curatedascents-media";
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;
const DATABASE_URL = process.env.DATABASE_URL;

if (!ADMIN_PASSWORD || !R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_PUBLIC_URL || !DATABASE_URL) {
  console.error("Missing required env vars. Check .env.local");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

async function login() {
  const res = await fetch(`${PROD_URL}/api/admin/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: ADMIN_PASSWORD }),
  });
  if (!res.ok) throw new Error(`Login failed: ${res.status}`);
  const setCookie = res.headers.get("set-cookie");
  const match = setCookie?.match(/admin_session=([^;]+)/);
  if (!match) throw new Error("No session cookie in login response");
  console.log("✓ Logged in to production");
  return match[1];
}

async function fetchAllMedia(sessionCookie) {
  let page = 1;
  const all = [];
  while (true) {
    const res = await fetch(`${PROD_URL}/api/admin/media?limit=100&page=${page}`, {
      headers: { Cookie: `admin_session=${sessionCookie}` },
    });
    if (!res.ok) throw new Error(`Media fetch failed: ${res.status}`);
    const data = await res.json();
    const items = data.items || data.media || (Array.isArray(data) ? data : []);
    if (items.length === 0) break;
    all.push(...items);
    console.log(`  Fetched page ${page}: ${items.length} items`);
    if (items.length < 100) break;
    page++;
  }
  return all;
}

async function downloadFile(url) {
  const fullUrl = url.startsWith("http") ? url : `${PROD_URL}${url}`;
  const res = await fetch(fullUrl);
  if (!res.ok) throw new Error(`Download failed for ${url}: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function uploadToR2(buffer, key, contentType = "image/webp") {
  await r2.send(new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  }));
  return `${R2_PUBLIC_URL}/${key}`;
}

function keyFromLocalUrl(url) {
  // /uploads/media/nepal/landscape/foo.webp -> nepal/landscape/foo.webp
  return url.replace(/^\/uploads\/media\//, "");
}

async function updateDbRecord(id, cdnUrl, thumbnailUrl) {
  if (thumbnailUrl) {
    await sql`UPDATE media_library SET cdn_url = ${cdnUrl}, thumbnail_url = ${thumbnailUrl} WHERE id = ${id}`;
  } else {
    await sql`UPDATE media_library SET cdn_url = ${cdnUrl} WHERE id = ${id}`;
  }
}

async function main() {
  console.log("=== Media Migration: Vercel → Cloudflare R2 ===\n");

  const sessionCookie = await login();
  const media = await fetchAllMedia(sessionCookie);
  console.log(`\nFound ${media.length} media items to migrate\n`);

  let success = 0, failed = 0, skipped = 0;

  for (const item of media) {
    const { id, cdnUrl, thumbnailUrl, filename } = item;

    // Skip already migrated (R2 URLs)
    if (cdnUrl?.startsWith(R2_PUBLIC_URL)) {
      console.log(`  [skip] Already on R2: ${filename}`);
      skipped++;
      continue;
    }

    try {
      process.stdout.write(`  [↑] ${filename} ... `);

      const mainBuffer = await downloadFile(cdnUrl);
      const mainKey = keyFromLocalUrl(cdnUrl);
      const newCdnUrl = await uploadToR2(mainBuffer, mainKey);

      let newThumbUrl = null;
      if (thumbnailUrl) {
        const thumbBuffer = await downloadFile(thumbnailUrl);
        const thumbKey = keyFromLocalUrl(thumbnailUrl);
        newThumbUrl = await uploadToR2(thumbBuffer, thumbKey);
      }

      await updateDbRecord(id, newCdnUrl, newThumbUrl);

      console.log("done");
      success++;
    } catch (err) {
      console.log(`FAILED: ${err.message}`);
      failed++;
    }
  }

  console.log(`\n=== Done ===`);
  console.log(`  ✓ Migrated: ${success}`);
  console.log(`  ↷ Skipped:  ${skipped}`);
  console.log(`  ✗ Failed:   ${failed}`);
}

main().catch(console.error);
