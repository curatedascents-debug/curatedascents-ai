/**
 * Single Advisory API
 * GET /api/admin/risk/advisories/[id] - Get advisory details
 * PUT /api/admin/risk/advisories/[id] - Update advisory
 * DELETE /api/admin/risk/advisories/[id] - Deactivate advisory
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { travelAdvisories } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const advisoryId = parseInt(id);

    const [advisory] = await db
      .select()
      .from(travelAdvisories)
      .where(eq(travelAdvisories.id, advisoryId))
      .limit(1);

    if (!advisory) {
      return NextResponse.json(
        { error: "Advisory not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ advisory });
  } catch (error) {
    console.error("Error fetching advisory:", error);
    return NextResponse.json(
      { error: "Failed to fetch advisory" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const advisoryId = parseInt(id);
    const body = await request.json();

    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    if (body.advisoryLevel) updateData.advisoryLevel = body.advisoryLevel;
    if (body.advisoryTitle) updateData.advisoryTitle = body.advisoryTitle;
    if (body.advisoryDescription !== undefined) updateData.advisoryDescription = body.advisoryDescription;
    if (body.advisoryType) updateData.advisoryType = body.advisoryType;
    if (body.region !== undefined) updateData.region = body.region;
    if (body.source !== undefined) updateData.source = body.source;
    if (body.sourceUrl !== undefined) updateData.sourceUrl = body.sourceUrl;
    if (body.effectiveFrom) updateData.effectiveFrom = body.effectiveFrom;
    if (body.effectiveTo !== undefined) updateData.effectiveTo = body.effectiveTo;
    if (body.impactLevel) updateData.impactLevel = body.impactLevel;
    if (body.affectedServices !== undefined) updateData.affectedServices = body.affectedServices;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    await db
      .update(travelAdvisories)
      .set(updateData)
      .where(eq(travelAdvisories.id, advisoryId));

    const [updated] = await db
      .select()
      .from(travelAdvisories)
      .where(eq(travelAdvisories.id, advisoryId))
      .limit(1);

    return NextResponse.json({ advisory: updated });
  } catch (error) {
    console.error("Error updating advisory:", error);
    return NextResponse.json(
      { error: "Failed to update advisory" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const advisoryId = parseInt(id);

    // Soft delete - set isActive to false
    await db
      .update(travelAdvisories)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(travelAdvisories.id, advisoryId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting advisory:", error);
    return NextResponse.json(
      { error: "Failed to delete advisory" },
      { status: 500 }
    );
  }
}
