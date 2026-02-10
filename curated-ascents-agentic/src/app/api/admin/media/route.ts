/**
 * Admin Media Library — List & Create (metadata only)
 * GET  /api/admin/media — Search/list media
 * POST /api/admin/media — Create record (metadata only, use /upload for file upload)
 */

import { NextRequest, NextResponse } from "next/server";
import { searchMedia } from "@/lib/media/media-service";
import { db } from "@/db";
import { mediaLibrary } from "@/db/schema";

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl;
    const params = {
      country: url.searchParams.get("country") || undefined,
      destination: url.searchParams.get("destination") || undefined,
      category: url.searchParams.get("category") || undefined,
      season: url.searchParams.get("season") || undefined,
      serviceType: url.searchParams.get("serviceType") || undefined,
      featured: url.searchParams.has("featured")
        ? url.searchParams.get("featured") === "true"
        : undefined,
      active: url.searchParams.has("active")
        ? url.searchParams.get("active") === "true"
        : undefined,
      tags: url.searchParams.get("tags")
        ? url.searchParams.get("tags")!.split(",")
        : undefined,
      query: url.searchParams.get("query") || undefined,
      page: url.searchParams.get("page")
        ? parseInt(url.searchParams.get("page")!, 10)
        : 1,
      limit: url.searchParams.get("limit")
        ? parseInt(url.searchParams.get("limit")!, 10)
        : 24,
      sort: (url.searchParams.get("sort") as "date" | "usage" | "country" | "destination" | "title") || "date",
      sortDir: (url.searchParams.get("sortDir") as "asc" | "desc") || "desc",
    };

    const result = await searchMedia(params);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Media list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch media" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      filename,
      cdnUrl,
      thumbnailUrl,
      country,
      category,
      destination,
      destinationId,
      subcategory,
      tags,
      title,
      description,
      altText,
      season,
      serviceType,
      hotelId,
      packageId,
      width,
      height,
      fileSize,
      mimeType,
      photographer,
      source,
      license,
      featured,
    } = body;

    if (!filename || !cdnUrl || !country || !category) {
      return NextResponse.json(
        { error: "filename, cdnUrl, country, and category are required" },
        { status: 400 }
      );
    }

    const [record] = await db
      .insert(mediaLibrary)
      .values({
        filename,
        cdnUrl,
        thumbnailUrl: thumbnailUrl || null,
        country: country.toLowerCase(),
        category: category.toLowerCase(),
        destination: destination || null,
        destinationId: destinationId || null,
        subcategory: subcategory || null,
        tags: tags || [],
        title: title || null,
        description: description || null,
        altText: altText || null,
        season: season || null,
        serviceType: serviceType || null,
        hotelId: hotelId || null,
        packageId: packageId || null,
        width: width || null,
        height: height || null,
        fileSize: fileSize || null,
        mimeType: mimeType || null,
        photographer: photographer || null,
        source: source || "original",
        license: license || null,
        featured: featured || false,
      })
      .returning();

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error("Media create error:", error);
    return NextResponse.json(
      { error: "Failed to create media record" },
      { status: 500 }
    );
  }
}
