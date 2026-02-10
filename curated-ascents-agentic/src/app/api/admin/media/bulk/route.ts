/**
 * Admin Media — Bulk Operations
 * POST /api/admin/media/bulk
 * Body: { action: 'tag' | 'categorize' | 'delete' | 'collection', ids: number[], value: any }
 */

import { NextRequest, NextResponse } from "next/server";
import {
  bulkAddTags,
  bulkUpdateCategory,
  bulkDelete,
  addToCollection,
} from "@/lib/media/media-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, ids, value } = body;

    if (!action || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "action and ids[] are required" },
        { status: 400 }
      );
    }

    switch (action) {
      case "tag": {
        if (!Array.isArray(value) || value.length === 0) {
          return NextResponse.json(
            { error: "value must be an array of tags" },
            { status: 400 }
          );
        }
        await bulkAddTags(ids, value);
        return NextResponse.json({
          success: true,
          message: `Added ${value.length} tag(s) to ${ids.length} item(s)`,
        });
      }

      case "categorize": {
        if (typeof value !== "string" || !value) {
          return NextResponse.json(
            { error: "value must be a category string" },
            { status: 400 }
          );
        }
        await bulkUpdateCategory(ids, value);
        return NextResponse.json({
          success: true,
          message: `Updated category to "${value}" for ${ids.length} item(s)`,
        });
      }

      case "delete": {
        await bulkDelete(ids);
        return NextResponse.json({
          success: true,
          message: `Soft deleted ${ids.length} item(s)`,
        });
      }

      case "collection": {
        if (typeof value !== "number" || !value) {
          return NextResponse.json(
            { error: "value must be a collection ID" },
            { status: 400 }
          );
        }
        for (const mediaId of ids) {
          await addToCollection(value, mediaId);
        }
        return NextResponse.json({
          success: true,
          message: `Added ${ids.length} item(s) to collection`,
        });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Media bulk error:", error);
    return NextResponse.json(
      { error: "Bulk operation failed" },
      { status: 500 }
    );
  }
}
