import { NextRequest, NextResponse } from "next/server";
import { seedNepalHotels } from "@/db/seed-hotels-nepal";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/seed-hotels
 * Seed Nepal hotel database with ~100 hotels and room rates
 */
export async function POST(req: NextRequest) {
  try {
    const result = await seedNepalHotels();

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error seeding hotels:", error);
    return NextResponse.json(
      { error: "Failed to seed hotels", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}

// Also handle GET for manual testing
export async function GET(req: NextRequest) {
  return POST(req);
}
