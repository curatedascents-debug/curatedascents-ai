/**
 * Booking Compliance Checks API
 * GET /api/admin/bookings/[id]/compliance-checks - List compliance checks
 * POST /api/admin/bookings/[id]/compliance-checks - Create compliance checks for booking
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bookingComplianceChecks, complianceRequirements } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createBookingComplianceChecks } from "@/lib/risk/risk-compliance-engine";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bookingId = parseInt(id);

    const checks = await db
      .select({
        id: bookingComplianceChecks.id,
        bookingId: bookingComplianceChecks.bookingId,
        requirementId: bookingComplianceChecks.requirementId,
        status: bookingComplianceChecks.status,
        documentProvided: bookingComplianceChecks.documentProvided,
        documentName: bookingComplianceChecks.documentName,
        documentReference: bookingComplianceChecks.documentReference,
        documentExpiryDate: bookingComplianceChecks.documentExpiryDate,
        verifiedBy: bookingComplianceChecks.verifiedBy,
        verifiedAt: bookingComplianceChecks.verifiedAt,
        verificationNotes: bookingComplianceChecks.verificationNotes,
        createdAt: bookingComplianceChecks.createdAt,
        requirement: {
          id: complianceRequirements.id,
          requirementType: complianceRequirements.requirementType,
          requirementName: complianceRequirements.requirementName,
          description: complianceRequirements.description,
          processingDays: complianceRequirements.processingDays,
          isMandatory: complianceRequirements.isMandatory,
          requiredDocuments: complianceRequirements.requiredDocuments,
        },
      })
      .from(bookingComplianceChecks)
      .leftJoin(
        complianceRequirements,
        eq(bookingComplianceChecks.requirementId, complianceRequirements.id)
      )
      .where(eq(bookingComplianceChecks.bookingId, bookingId));

    return NextResponse.json({ checks });
  } catch (error) {
    console.error("Error fetching compliance checks:", error);
    return NextResponse.json(
      { error: "Failed to fetch compliance checks" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bookingId = parseInt(id);
    const body = await request.json();
    const { country, destinationId } = body;

    if (!country) {
      return NextResponse.json(
        { error: "Country is required to create compliance checks" },
        { status: 400 }
      );
    }

    const result = await createBookingComplianceChecks(bookingId, country, destinationId);

    return NextResponse.json({
      success: true,
      created: result.created,
    });
  } catch (error) {
    console.error("Error creating compliance checks:", error);
    return NextResponse.json(
      { error: "Failed to create compliance checks" },
      { status: 500 }
    );
  }
}
