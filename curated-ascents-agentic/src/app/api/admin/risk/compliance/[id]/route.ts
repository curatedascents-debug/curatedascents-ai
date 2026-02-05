/**
 * Single Compliance Requirement API
 * GET /api/admin/risk/compliance/[id] - Get requirement details
 * PUT /api/admin/risk/compliance/[id] - Update requirement
 * DELETE /api/admin/risk/compliance/[id] - Deactivate requirement
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { complianceRequirements } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const requirementId = parseInt(id);

    const [requirement] = await db
      .select()
      .from(complianceRequirements)
      .where(eq(complianceRequirements.id, requirementId))
      .limit(1);

    if (!requirement) {
      return NextResponse.json(
        { error: "Compliance requirement not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ requirement });
  } catch (error) {
    console.error("Error fetching compliance requirement:", error);
    return NextResponse.json(
      { error: "Failed to fetch compliance requirement" },
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
    const requirementId = parseInt(id);
    const body = await request.json();

    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    if (body.requirementType) updateData.requirementType = body.requirementType;
    if (body.requirementName) updateData.requirementName = body.requirementName;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.country !== undefined) updateData.country = body.country;
    if (body.destinationId !== undefined) updateData.destinationId = body.destinationId;
    if (body.serviceType !== undefined) updateData.serviceType = body.serviceType;
    if (body.processingDays !== undefined) updateData.processingDays = body.processingDays;
    if (body.costEstimate !== undefined) updateData.costEstimate = body.costEstimate?.toString();
    if (body.requiredDocuments !== undefined) updateData.requiredDocuments = body.requiredDocuments;
    if (body.applicationProcess !== undefined) updateData.applicationProcess = body.applicationProcess;
    if (body.issuingAuthority !== undefined) updateData.issuingAuthority = body.issuingAuthority;
    if (body.isMandatory !== undefined) updateData.isMandatory = body.isMandatory;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    await db
      .update(complianceRequirements)
      .set(updateData)
      .where(eq(complianceRequirements.id, requirementId));

    const [updated] = await db
      .select()
      .from(complianceRequirements)
      .where(eq(complianceRequirements.id, requirementId))
      .limit(1);

    return NextResponse.json({ requirement: updated });
  } catch (error) {
    console.error("Error updating compliance requirement:", error);
    return NextResponse.json(
      { error: "Failed to update compliance requirement" },
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
    const requirementId = parseInt(id);

    // Soft delete - set isActive to false
    await db
      .update(complianceRequirements)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(complianceRequirements.id, requirementId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting compliance requirement:", error);
    return NextResponse.json(
      { error: "Failed to delete compliance requirement" },
      { status: 500 }
    );
  }
}
