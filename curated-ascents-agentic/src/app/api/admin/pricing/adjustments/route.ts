import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { priceAdjustments, pricingRules, quotes, bookings } from "@/db/schema";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/pricing/adjustments
 * Get price adjustment history
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const serviceType = searchParams.get("serviceType");
    const ruleId = searchParams.get("ruleId");
    const triggeredBy = searchParams.get("triggeredBy");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    let whereConditions = [];

    if (startDate) {
      whereConditions.push(gte(priceAdjustments.adjustmentDate, startDate));
    }
    if (endDate) {
      whereConditions.push(lte(priceAdjustments.adjustmentDate, endDate));
    }
    if (serviceType) {
      whereConditions.push(eq(priceAdjustments.serviceType, serviceType));
    }
    if (ruleId) {
      whereConditions.push(eq(priceAdjustments.ruleId, parseInt(ruleId)));
    }
    if (triggeredBy) {
      whereConditions.push(eq(priceAdjustments.triggeredBy, triggeredBy));
    }

    const adjustments = await db
      .select({
        id: priceAdjustments.id,
        serviceType: priceAdjustments.serviceType,
        serviceId: priceAdjustments.serviceId,
        serviceName: priceAdjustments.serviceName,
        ruleId: priceAdjustments.ruleId,
        ruleName: priceAdjustments.ruleName,
        adjustmentType: priceAdjustments.adjustmentType,
        adjustmentValue: priceAdjustments.adjustmentValue,
        originalPrice: priceAdjustments.originalPrice,
        adjustedPrice: priceAdjustments.adjustedPrice,
        currency: priceAdjustments.currency,
        adjustmentDate: priceAdjustments.adjustmentDate,
        travelDate: priceAdjustments.travelDate,
        reason: priceAdjustments.reason,
        triggeredBy: priceAdjustments.triggeredBy,
        approvedBy: priceAdjustments.approvedBy,
        quoteId: priceAdjustments.quoteId,
        quoteNumber: quotes.quoteNumber,
        bookingId: priceAdjustments.bookingId,
        bookingReference: bookings.bookingReference,
        createdAt: priceAdjustments.createdAt,
      })
      .from(priceAdjustments)
      .leftJoin(quotes, eq(priceAdjustments.quoteId, quotes.id))
      .leftJoin(bookings, eq(priceAdjustments.bookingId, bookings.id))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(desc(priceAdjustments.createdAt))
      .limit(limit)
      .offset(offset);

    // Calculate impact summary
    const impactStats = await db
      .select({
        totalAdjustments: sql<number>`COUNT(*)::int`,
        totalImpact: sql<number>`SUM((${priceAdjustments.adjustedPrice}::numeric - ${priceAdjustments.originalPrice}::numeric))::numeric`,
        avgAdjustment: sql<number>`AVG(${priceAdjustments.adjustmentValue}::numeric)::numeric`,
      })
      .from(priceAdjustments)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

    // Breakdown by adjustment type
    const typeBreakdown = await db
      .select({
        adjustmentType: priceAdjustments.adjustmentType,
        count: sql<number>`COUNT(*)::int`,
        totalImpact: sql<number>`SUM((${priceAdjustments.adjustedPrice}::numeric - ${priceAdjustments.originalPrice}::numeric))::numeric`,
      })
      .from(priceAdjustments)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .groupBy(priceAdjustments.adjustmentType);

    // Breakdown by trigger source
    const triggerBreakdown = await db
      .select({
        triggeredBy: priceAdjustments.triggeredBy,
        count: sql<number>`COUNT(*)::int`,
      })
      .from(priceAdjustments)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .groupBy(priceAdjustments.triggeredBy);

    return NextResponse.json({
      success: true,
      adjustments,
      summary: {
        totalAdjustments: impactStats[0]?.totalAdjustments || 0,
        totalImpact: impactStats[0]?.totalImpact
          ? parseFloat(impactStats[0].totalImpact.toString()).toFixed(2)
          : "0",
        avgAdjustment: impactStats[0]?.avgAdjustment
          ? parseFloat(impactStats[0].avgAdjustment.toString()).toFixed(2)
          : "0",
        byType: typeBreakdown.reduce(
          (acc, t) => ({
            ...acc,
            [t.adjustmentType]: {
              count: t.count,
              impact: parseFloat(t.totalImpact?.toString() || "0").toFixed(2),
            },
          }),
          {}
        ),
        byTrigger: triggerBreakdown.reduce(
          (acc, t) => ({ ...acc, [t.triggeredBy || "unknown"]: t.count }),
          {} as Record<string, number>
        ),
      },
      pagination: {
        limit,
        offset,
        hasMore: adjustments.length === limit,
      },
    });
  } catch (error) {
    console.error("Error fetching price adjustments:", error);
    return NextResponse.json(
      { error: "Failed to fetch price adjustments" },
      { status: 500 }
    );
  }
}
