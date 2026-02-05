/**
 * Destination Content API
 * GET /api/admin/content/destinations - List destination content
 * POST /api/admin/content/destinations - Create destination content
 */

import { NextRequest, NextResponse } from "next/server";
import {
  searchDestinationContent,
  createDestinationContent,
  approveDestinationContent,
} from "@/lib/content/content-engine";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const destinationId = searchParams.get("destinationId");
    const contentType = searchParams.get("contentType");
    const language = searchParams.get("language");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const results = await searchDestinationContent({
      destinationId: destinationId ? parseInt(destinationId) : undefined,
      contentType: contentType || undefined,
      language: language || undefined,
      limit,
      offset,
    });

    return NextResponse.json({
      content: results,
      pagination: {
        limit,
        offset,
        hasMore: results.length === limit,
      },
    });
  } catch (error) {
    console.error("Error fetching destination content:", error);
    return NextResponse.json(
      { error: "Failed to fetch destination content" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      destinationId,
      contentType,
      language,
      title,
      content,
      summary,
      highlights,
      keywords,
      tags,
      seasonalVariations,
      featuredImage,
      gallery,
    } = body;

    // Validate required fields
    if (!contentType || !title || !content) {
      return NextResponse.json(
        { error: "contentType, title, and content are required" },
        { status: 400 }
      );
    }

    const created = await createDestinationContent({
      destinationId,
      contentType,
      language,
      title,
      content,
      summary,
      highlights,
      keywords,
      tags,
      seasonalVariations,
      featuredImage,
      gallery,
    });

    return NextResponse.json({ content: created }, { status: 201 });
  } catch (error) {
    console.error("Error creating destination content:", error);
    return NextResponse.json(
      { error: "Failed to create destination content" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { contentId, action, approvedBy } = body;

    if (action === "approve" && contentId && approvedBy) {
      const approved = await approveDestinationContent(contentId, approvedBy);
      return NextResponse.json({ content: approved });
    }

    return NextResponse.json(
      { error: "Invalid action or missing parameters" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error updating destination content:", error);
    return NextResponse.json(
      { error: "Failed to update destination content" },
      { status: 500 }
    );
  }
}
