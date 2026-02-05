/**
 * Single Compliance Check API
 * PUT /api/admin/bookings/[id]/compliance-checks/[checkId] - Update compliance check
 */

import { NextRequest, NextResponse } from "next/server";
import { updateComplianceCheck } from "@/lib/risk/risk-compliance-engine";

export const dynamic = "force-dynamic";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; checkId: string }> }
) {
  try {
    const { checkId } = await params;
    const checkIdNum = parseInt(checkId);
    const body = await request.json();

    const {
      status,
      documentProvided,
      documentName,
      documentReference,
      documentExpiryDate,
      verifiedBy,
      verificationNotes,
    } = body;

    await updateComplianceCheck(checkIdNum, {
      status,
      documentProvided,
      documentName,
      documentReference,
      documentExpiryDate: documentExpiryDate ? new Date(documentExpiryDate) : undefined,
      verifiedBy,
      verificationNotes,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating compliance check:", error);
    return NextResponse.json(
      { error: "Failed to update compliance check" },
      { status: 500 }
    );
  }
}
