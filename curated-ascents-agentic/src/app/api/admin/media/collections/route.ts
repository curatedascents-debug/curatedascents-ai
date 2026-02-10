/**
 * Admin Media Collections — List & Create
 * GET  /api/admin/media/collections
 * POST /api/admin/media/collections
 */

import { NextRequest, NextResponse } from "next/server";
import {
  listCollections,
  createCollection,
} from "@/lib/media/media-service";

export async function GET() {
  try {
    const collections = await listCollections();
    return NextResponse.json(collections);
  } catch (error) {
    console.error("Collections list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch collections" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, country, coverImageId } = body;

    if (!name) {
      return NextResponse.json(
        { error: "name is required" },
        { status: 400 }
      );
    }

    const collection = await createCollection({
      name,
      description,
      country,
      coverImageId,
    });

    return NextResponse.json(collection, { status: 201 });
  } catch (error) {
    console.error("Collection create error:", error);
    return NextResponse.json(
      { error: "Failed to create collection" },
      { status: 500 }
    );
  }
}
