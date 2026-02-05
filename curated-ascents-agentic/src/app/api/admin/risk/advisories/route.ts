/**
 * Travel Advisories API
 * GET /api/admin/risk/advisories - List active advisories
 * POST /api/admin/risk/advisories - Create advisory
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { travelAdvisories } from "@/db/schema";
import { eq, and, gte, lte, or, isNull, desc } from "drizzle-orm";
import { createTravelAdvisory, getActiveAdvisories } from "@/lib/risk/risk-compliance-engine";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const country = searchParams.get("country") || undefined;
    const destinationId = searchParams.get("destinationId")
      ? parseInt(searchParams.get("destinationId")!)
      : undefined;
    const includeInactive = searchParams.get("includeInactive") === "true";

    if (includeInactive) {
      // Return all advisories for admin management
      let whereConditions = [];

      if (country) {
        whereConditions.push(eq(travelAdvisories.country, country));
      }
      if (destinationId) {
        whereConditions.push(
          or(
            isNull(travelAdvisories.destinationId),
            eq(travelAdvisories.destinationId, destinationId)
          )
        );
      }

      const advisories = await db
        .select()
        .from(travelAdvisories)
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
        .orderBy(desc(travelAdvisories.createdAt));

      return NextResponse.json({ advisories });
    }

    // Return only active advisories
    const advisories = await getActiveAdvisories({ country, destinationId });
    return NextResponse.json({ advisories });
  } catch (error) {
    console.error("Error fetching advisories:", error);
    return NextResponse.json(
      { error: "Failed to fetch advisories" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      country,
      region,
      destinationId,
      advisoryLevel,
      advisoryTitle,
      advisoryDescription,
      advisoryType,
      source,
      sourceUrl,
      effectiveFrom,
      effectiveTo,
      impactLevel,
      affectedServices,
      agencyId,
      createdBy,
    } = body;

    // Validate required fields
    if (!country || !advisoryLevel || !advisoryTitle || !advisoryType || !effectiveFrom) {
      return NextResponse.json(
        { error: "Missing required fields: country, advisoryLevel, advisoryTitle, advisoryType, effectiveFrom" },
        { status: 400 }
      );
    }

    const result = await createTravelAdvisory({
      country,
      region,
      destinationId,
      advisoryLevel,
      advisoryTitle,
      advisoryDescription,
      advisoryType,
      source,
      sourceUrl,
      effectiveFrom: new Date(effectiveFrom),
      effectiveTo: effectiveTo ? new Date(effectiveTo) : undefined,
      impactLevel,
      affectedServices,
      agencyId,
      createdBy,
    });

    return NextResponse.json({
      success: true,
      advisoryId: result.advisoryId,
    });
  } catch (error) {
    console.error("Error creating advisory:", error);
    return NextResponse.json(
      { error: "Failed to create advisory" },
      { status: 500 }
    );
  }
}
