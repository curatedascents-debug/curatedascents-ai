/**
 * Content Assets API
 * GET /api/admin/content/assets - List assets
 * POST /api/admin/content/assets - Create asset
 */

import { NextRequest, NextResponse } from "next/server";
import {
  searchAssets,
  createContentAsset,
  getDestinationAssets,
} from "@/lib/content/content-engine";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const destinationId = searchParams.get("destinationId");
    const hotelId = searchParams.get("hotelId");
    const assetType = searchParams.get("assetType");
    const category = searchParams.get("category");
    const isFeatured = searchParams.get("isFeatured") === "true";
    const limit = parseInt(searchParams.get("limit") || "20");

    // If getting destination assets specifically
    if (destinationId && !hotelId) {
      const assets = await getDestinationAssets(parseInt(destinationId), {
        category: category || undefined,
        limit,
        featuredOnly: isFeatured,
      });

      return NextResponse.json({ assets });
    }

    // General asset search
    const assets = await searchAssets({
      destinationId: destinationId ? parseInt(destinationId) : undefined,
      hotelId: hotelId ? parseInt(hotelId) : undefined,
      assetType: assetType || undefined,
      category: category || undefined,
      isFeatured: isFeatured || undefined,
      limit,
    });

    return NextResponse.json({ assets });
  } catch (error) {
    console.error("Error fetching assets:", error);
    return NextResponse.json(
      { error: "Failed to fetch assets" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      filename,
      assetType,
      url,
      thumbnailUrl,
      storageProvider,
      storagePath,
      mimeType,
      fileSize,
      dimensions,
      duration,
      destinationId,
      hotelId,
      supplierId,
      category,
      tags,
      caption,
      altText,
      credits,
      licenseType,
      licenseExpiry,
      usageRights,
      qualityScore,
    } = body;

    // Validate required fields
    if (!name || !filename || !assetType || !url) {
      return NextResponse.json(
        { error: "name, filename, assetType, and url are required" },
        { status: 400 }
      );
    }

    // Validate asset type
    const validTypes = ["image", "video", "document", "audio"];
    if (!validTypes.includes(assetType)) {
      return NextResponse.json(
        { error: `Invalid assetType. Must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    const asset = await createContentAsset({
      name,
      filename,
      assetType,
      url,
      thumbnailUrl,
      storageProvider,
      storagePath,
      mimeType,
      fileSize,
      dimensions,
      duration,
      destinationId,
      hotelId,
      supplierId,
      category,
      tags,
      caption,
      altText,
      credits,
      licenseType,
      licenseExpiry: licenseExpiry ? new Date(licenseExpiry) : undefined,
      usageRights,
      qualityScore,
    });

    return NextResponse.json({ asset }, { status: 201 });
  } catch (error) {
    console.error("Error creating asset:", error);
    return NextResponse.json(
      { error: "Failed to create asset" },
      { status: 500 }
    );
  }
}
