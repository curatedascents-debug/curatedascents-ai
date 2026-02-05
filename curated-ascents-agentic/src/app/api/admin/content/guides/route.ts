/**
 * Destination Guides API
 * GET /api/admin/content/guides - List guides
 * POST /api/admin/content/guides - Generate/create guide
 */

import { NextRequest, NextResponse } from "next/server";
import {
  listDestinationGuides,
  getDestinationGuide,
  saveDestinationGuide,
  publishGuide,
} from "@/lib/content/destination-guides";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const destinationId = searchParams.get("destinationId");
    const language = searchParams.get("language");
    const publishedOnly = searchParams.get("publishedOnly") === "true";
    const generate = searchParams.get("generate") === "true";

    // If requesting to generate a guide for a specific destination
    if (generate && destinationId) {
      const guideType = searchParams.get("guideType") || "comprehensive";
      const guide = await getDestinationGuide(
        parseInt(destinationId),
        language || "en",
        guideType
      );

      if (!guide) {
        return NextResponse.json(
          { error: "Destination not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ guide });
    }

    // List guides
    const guides = await listDestinationGuides({
      destinationId: destinationId ? parseInt(destinationId) : undefined,
      language: language || undefined,
      publishedOnly,
    });

    return NextResponse.json({ guides });
  } catch (error) {
    console.error("Error fetching guides:", error);
    return NextResponse.json(
      { error: "Failed to fetch guides" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    // Handle publish action
    if (action === "publish") {
      const { guideId } = body;
      if (!guideId) {
        return NextResponse.json(
          { error: "guideId is required for publish action" },
          { status: 400 }
        );
      }

      const success = await publishGuide(guideId);
      return NextResponse.json({ success });
    }

    // Handle generate and save action
    if (action === "generate") {
      const { destinationId, language, guideType } = body;

      if (!destinationId) {
        return NextResponse.json(
          { error: "destinationId is required" },
          { status: 400 }
        );
      }

      const guide = await getDestinationGuide(
        destinationId,
        language || "en",
        guideType || "comprehensive"
      );

      if (!guide) {
        return NextResponse.json(
          { error: "Destination not found" },
          { status: 404 }
        );
      }

      // Save to database
      const savedId = await saveDestinationGuide(guide);

      return NextResponse.json({
        guide: { ...guide, id: savedId },
        message: "Guide generated and saved. Use publish action to make it live.",
      }, { status: 201 });
    }

    // Handle manual guide creation/update
    const guide = body.guide;
    if (!guide || !guide.destinationId || !guide.title) {
      return NextResponse.json(
        { error: "guide object with destinationId and title is required" },
        { status: 400 }
      );
    }

    const savedId = await saveDestinationGuide(guide);

    return NextResponse.json({
      guideId: savedId,
      message: "Guide saved successfully",
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating guide:", error);
    return NextResponse.json(
      { error: "Failed to create guide" },
      { status: 500 }
    );
  }
}
