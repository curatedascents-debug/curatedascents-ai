/**
 * Admin Media Upload
 * POST /api/admin/media/upload — Multipart file upload with image processing
 */

import { NextRequest, NextResponse } from "next/server";
import { uploadMediaFile } from "@/lib/media/media-service";
import { isR2Configured } from "@/lib/media/r2-client";

export async function POST(req: NextRequest) {
  try {
    if (!isR2Configured()) {
      return NextResponse.json(
        { error: "R2 storage is not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_PUBLIC_URL." },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Accepted: JPEG, PNG, WebP" },
        { status: 400 }
      );
    }

    // Validate file size (max 20MB)
    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 20MB." },
        { status: 400 }
      );
    }

    const country = (formData.get("country") as string)?.toLowerCase();
    const category = (formData.get("category") as string)?.toLowerCase();

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
