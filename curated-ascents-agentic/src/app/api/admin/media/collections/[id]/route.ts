/**
 * Admin Media Collections — Single Collection CRUD
 * GET    /api/admin/media/collections/[id] — Get collection with items
 * PUT    /api/admin/media/collections/[id] — Update collection
 * DELETE /api/admin/media/collections/[id] — Delete collection and its items
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getCollection,
  updateCollection,
  deleteCollection,
  addToCollection,
  removeFromCollection,
} from "@/lib/media/media-service";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const collectionId = parseInt(id, 10);
    if (isNaN(collectionId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const collection = await getCollection(collectionId);
    if (!collection) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(collection);
  } catch (error) {
    console.error("Collection get error:", error);
    return NextResponse.json(
      { error: "Failed to fetch collection" },
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
    const collectionId = parseInt(id, 10);
    if (isNaN(collectionId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = await req.json();

    // Handle item operations
    if (body.action === "add_item" && body.mediaId) {
      const item = await addToCollection(
        collectionId,
        body.mediaId,
        body.sortOrder || 0
      );
      return NextResponse.json(item);
    }
    if (body.action === "remove_item" && body.mediaId) {
      await removeFromCollection(collectionId, body.mediaId);
      return NextResponse.json({ success: true });
    }

    // Regular metadata update
    const updates: Record<string, unknown> = {};
    const allowedFields = ["name", "description", "country", "coverImageId", "active"];
    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = body[field];
      }
    }

    const record = await updateCollection(collectionId, updates);
    if (!record) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(record);
  } catch (error) {
    console.error("Collection update error:", error);
    return NextResponse.json(
      { error: "Failed to update collection" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const collectionId = parseInt(id, 10);
    if (isNaN(collectionId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    await deleteCollection(collectionId);
    return NextResponse.json({ success: true, message: "Collection deleted" });
  } catch (error) {
    console.error("Collection delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete collection" },
      { status: 500 }
    );
  }
}
