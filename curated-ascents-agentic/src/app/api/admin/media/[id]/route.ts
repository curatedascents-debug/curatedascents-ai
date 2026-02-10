/**
 * Admin Media — Single Record CRUD
 * GET    /api/admin/media/[id] — Get full details
 * PUT    /api/admin/media/[id] — Update metadata
 * DELETE /api/admin/media/[id] — Soft delete (or hard with ?hard=true)
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getMediaById,
  updateMedia,
  softDeleteMedia,
  hardDeleteMedia,
} from "@/lib/media/media-service";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const mediaId = parseInt(id, 10);
    if (isNaN(mediaId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const record = await getMediaById(mediaId);
    if (!record) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(record);
  } catch (error) {
    console.error("Media get error:", error);
    return NextResponse.json(
      { error: "Failed to fetch media" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const mediaId = parseInt(id, 10);
    if (isNaN(mediaId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = await req.json();

    // Only allow known update fields
    const updates: Record<string, unknown> = {};
    const allowedFields = [
      "title", "description", "altText", "country", "destination",
      "destinationId", "category", "subcategory", "tags", "season",
      "serviceType", "hotelId", "packageId", "photographer", "source",
      "license", "featured", "active", "sortOrder",
    ];

    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const record = await updateMedia(mediaId, updates);
    if (!record) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(record);
  } catch (error) {
    console.error("Media update error:", error);
    return NextResponse.json(
      { error: "Failed to update media" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const mediaId = parseInt(id, 10);
    if (isNaN(mediaId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const existing = await getMediaById(mediaId);
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const hard = req.nextUrl.searchParams.get("hard") === "true";

    if (hard) {
      await hardDeleteMedia(mediaId);
      return NextResponse.json({ success: true, message: "Permanently deleted" });
    } else {
      await softDeleteMedia(mediaId);
      return NextResponse.json({ success: true, message: "Soft deleted (set inactive)" });
    }
  } catch (error) {
    console.error("Media delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete media" },
      { status: 500 }
    );
  }
}
