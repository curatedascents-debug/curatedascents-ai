/**
 * Booking Risk Assessment API
 * GET /api/admin/bookings/[id]/risk-assessment - Get latest risk assessment
 * POST /api/admin/bookings/[id]/risk-assessment - Generate new risk assessment
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bookingRiskAssessments, bookingComplianceChecks, complianceRequirements } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import {
  generateRiskAssessment,
  getBookingRiskAssessment,
  createBookingComplianceChecks,
} from "@/lib/risk/risk-compliance-engine";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bookingId = parseInt(id);
    const searchParams = request.nextUrl.searchParams;
    const includeHistory = searchParams.get("includeHistory") === "true";
    const includeComplianceChecks = searchParams.get("includeComplianceChecks") === "true";

    if (includeHistory) {
      // Return all assessments
      const assessments = await db
        .select()
        .from(bookingRiskAssessments)
        .where(eq(bookingRiskAssessments.bookingId, bookingId))
        .orderBy(desc(bookingRiskAssessments.assessmentDate));

      let complianceChecks = null;
      if (includeComplianceChecks) {
        complianceChecks = await db
          .select({
            id: bookingComplianceChecks.id,
            requirementId: bookingComplianceChecks.requirementId,
            status: bookingComplianceChecks.status,
            documentProvided: bookingComplianceChecks.documentProvided,
            documentName: bookingComplianceChecks.documentName,
            verifiedAt: bookingComplianceChecks.verifiedAt,
            requirement: {
              requirementType: complianceRequirements.requirementType,
              requirementName: complianceRequirements.requirementName,
              isMandatory: complianceRequirements.isMandatory,
            },
          })
          .from(bookingComplianceChecks)
          .leftJoin(
            complianceRequirements,
            eq(bookingComplianceChecks.requirementId, complianceRequirements.id)
          )
          .where(eq(bookingComplianceChecks.bookingId, bookingId));
      }

      return NextResponse.json({
        assessments,
        complianceChecks,
      });
    }

    // Return latest assessment
    const assessment = await getBookingRiskAssessment(bookingId);

    let complianceChecks = null;
    if (includeComplianceChecks) {
      complianceChecks = await db
        .select({
          id: bookingComplianceChecks.id,
          requirementId: bookingComplianceChecks.requirementId,
          status: bookingComplianceChecks.status,
          documentProvided: bookingComplianceChecks.documentProvided,
          documentName: bookingComplianceChecks.documentName,
          verifiedAt: bookingComplianceChecks.verifiedAt,
          requirement: {
            requirementType: complianceRequirements.requirementType,
            requirementName: complianceRequirements.requirementName,
            isMandatory: complianceRequirements.isMandatory,
          },
        })
        .from(bookingComplianceChecks)
        .leftJoin(
          complianceRequirements,
          eq(bookingComplianceChecks.requirementId, complianceRequirements.id)
        )
        .where(eq(bookingComplianceChecks.bookingId, bookingId));
    }

    return NextResponse.json({
      assessment,
      complianceChecks,
    });
  } catch (error) {
    console.error("Error fetching risk assessment:", error);
    return NextResponse.json(
      { error: "Failed to fetch risk assessment" },
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
    const { createComplianceChecks, country, destinationId } = body;

    // Create compliance checks if requested
    if (createComplianceChecks && country) {
      await createBookingComplianceChecks(bookingId, country, destinationId);
    }

    // Generate new risk assessment
    const assessment = await generateRiskAssessment(bookingId);

    return NextResponse.json({
      success: true,
      assessment,
    });
  } catch (error) {
    console.error("Error generating risk assessment:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate risk assessment" },
      { status: 500 }
    );
  }
}
