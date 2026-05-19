/**
 * Admin Media Upload
 * POST /api/admin/media/upload — Multipart file upload with image processing
 */

import { NextRequest, NextResponse } from "next/server";
import { uploadMediaFile } from "@/lib/media/media-service";

// Allow up to 25MB uploads (default is ~1MB)
export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm", "video/avi"];
    const isImage = IMAGE_TYPES.includes(file.type);
    const isVideo = VIDEO_TYPES.includes(file.type);

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: "Invalid file type. Accepted: JPEG, PNG, WebP, MP4, MOV, WebM, AVI" },
        { status: 400 }
      );
    }

    // Per-type size limit: 500MB for video, 20MB for images
    const maxSize = isVideo ? 500 * 1024 * 1024 : 20 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${isVideo ? "500MB" : "20MB"}.` },
        { status: 400 }
      );
    }

    const country = (formData.get("country") as string)?.toLowerCase();
    // For videos, default category to "video" if caller omits it
    const category =
      (formData.get("category") as string)?.toLowerCase() ||
      (isVideo ? "video" : "");

    if (!country || !category) {
      return NextResponse.json(
        { error: "country and category are required" },
        { status: 400 }
      );
    }

    // Read file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse optional tags from comma-separated or JSON
    let tags: string[] = [];
    const tagsRaw = formData.get("tags") as string | null;
    if (tagsRaw) {
      try {
        tags = JSON.parse(tagsRaw);
      } catch {
        tags = tagsRaw.split(",").map((t) => t.trim()).filter(Boolean);
      }
    }

    const record = await uploadMediaFile({
      file: buffer,
      filename: file.name,
      mimeType: file.type,
      country,
      category,
      destination: (formData.get("destination") as string) || undefined,
      destinationId: formData.get("destinationId")
        ? parseInt(formData.get("destinationId") as string, 10)
        : undefined,
      subcategory: (formData.get("subcategory") as string) || undefined,
      tags,
      title: (formData.get("title") as string) || undefined,
      description: (formData.get("description") as string) || undefined,
      altText: (formData.get("altText") as string) || undefined,
      season: (formData.get("season") as string) || undefined,
      serviceType: (formData.get("serviceType") as string) || undefined,
      hotelId: formData.get("hotelId")
        ? parseInt(formData.get("hotelId") as string, 10)
        : undefined,
      packageId: formData.get("packageId")
        ? parseInt(formData.get("packageId") as string, 10)
        : undefined,
      photographer: (formData.get("photographer") as string) || undefined,
      source: (formData.get("source") as string) || undefined,
      license: (formData.get("license") as string) || undefined,
      featured: formData.get("featured") === "true",
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error("Media upload error:", error);
    return NextResponse.json(
      {
        error: "Failed to upload media",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
