/**
 * Compliance Requirements API
 * GET /api/admin/risk/compliance - List compliance requirements
 * POST /api/admin/risk/compliance - Create compliance requirement
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { complianceRequirements } from "@/db/schema";
import { eq, and, desc, or, isNull } from "drizzle-orm";
import { createComplianceRequirement, getComplianceRequirements } from "@/lib/risk/risk-compliance-engine";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const country = searchParams.get("country") || undefined;
    const destinationId = searchParams.get("destinationId")
      ? parseInt(searchParams.get("destinationId")!)
      : undefined;
    const requirementType = searchParams.get("requirementType") || undefined;
    const includeInactive = searchParams.get("includeInactive") === "true";

    if (includeInactive) {
      // Return all requirements for admin management
      let whereConditions = [];

      if (country) {
        whereConditions.push(
          or(
            isNull(complianceRequirements.country),
            eq(complianceRequirements.country, country)
          )
        );
      }
      if (destinationId) {
        whereConditions.push(
          or(
            isNull(complianceRequirements.destinationId),
            eq(complianceRequirements.destinationId, destinationId)
          )
        );
      }
      if (requirementType) {
        whereConditions.push(eq(complianceRequirements.requirementType, requirementType));
      }

      const requirements = await db
        .select()
        .from(complianceRequirements)
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
        .orderBy(desc(complianceRequirements.createdAt));

      return NextResponse.json({ requirements });
    }

    // Return only active requirements
    const requirements = await getComplianceRequirements({ country, destinationId, requirementType });
    return NextResponse.json({ requirements });
  } catch (error) {
    console.error("Error fetching compliance requirements:", error);
    return NextResponse.json(
      { error: "Failed to fetch compliance requirements" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      country,
      destinationId,
      serviceType,
      requirementType,
      requirementName,
      description,
      processingDays,
      costEstimate,
      requiredDocuments,
      applicationProcess,
      issuingAuthority,
      isMandatory,
      agencyId,
    } = body;

    // Validate required fields
    if (!requirementType || !requirementName) {
      return NextResponse.json(
        { error: "Missing required fields: requirementType, requirementName" },
        { status: 400 }
      );
    }

    const result = await createComplianceRequirement({
      country,
      destinationId,
      serviceType,
      requirementType,
      requirementName,
      description,
      processingDays,
      costEstimate,
      requiredDocuments,
      applicationProcess,
      issuingAuthority,
      isMandatory,
      agencyId,
    });

    return NextResponse.json({
      success: true,
      requirementId: result.requirementId,
    });
  } catch (error) {
    console.error("Error creating compliance requirement:", error);
    return NextResponse.json(
      { error: "Failed to create compliance requirement" },
      { status: 500 }
    );
  }
}
