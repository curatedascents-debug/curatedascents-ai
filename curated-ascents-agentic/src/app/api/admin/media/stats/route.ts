/**
 * Admin Media — Stats
 * GET /api/admin/media/stats
 */

import { NextResponse } from "next/server";
import { getMediaStats } from "@/lib/media/media-service";

export async function GET() {
  try {
    const stats = await getMediaStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Media stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch media stats" },
      { status: 500 }
    );
  }
}
