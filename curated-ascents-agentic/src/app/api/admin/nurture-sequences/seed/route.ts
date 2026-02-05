/**
 * Seed Nurture Sequences API
 * POST /api/admin/nurture-sequences/seed - Create default sequences
 */

import { NextRequest, NextResponse } from "next/server";
import { seedDefaultNurtureSequences } from "@/lib/lead-intelligence/seed-sequences";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const result = await seedDefaultNurtureSequences();

    return NextResponse.json({
      success: true,
      message: result.seeded > 0
        ? `Created ${result.seeded} nurture sequences`
        : `Skipped: ${result.existing} sequences already exist`,
      result,
    });
  } catch (error) {
    console.error("Error seeding nurture sequences:", error);
    return NextResponse.json(
      { error: "Failed to seed nurture sequences" },
      { status: 500 }
    );
  }
}
