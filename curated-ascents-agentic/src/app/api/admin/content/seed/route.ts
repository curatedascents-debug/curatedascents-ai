/**
 * Seed Content API
 * POST /api/admin/content/seed - Seed default content templates
 */

import { NextRequest, NextResponse } from "next/server";
import { seedDefaultContentTemplates } from "@/lib/content/seed-content";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const result = await seedDefaultContentTemplates();

    return NextResponse.json({
      success: true,
      message: `Seeded ${result.templatesSeeded} templates and ${result.contentSeeded} destination content pieces`,
      result,
    });
  } catch (error) {
    console.error("Error seeding content:", error);
    return NextResponse.json(
      { error: "Failed to seed content" },
      { status: 500 }
    );
  }
}
