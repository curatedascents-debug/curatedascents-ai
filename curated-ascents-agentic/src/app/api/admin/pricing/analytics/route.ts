import { NextRequest, NextResponse } from "next/server";
import { getPricingAnalytics } from "@/lib/pricing/pricing-engine";
import { db } from "@/db";
import { priceHistory, priceAdjustments, pricingRules, demandMetrics } from "@/db/schema";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/pricing/analytics
 * Get pricing analytics and trends
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const serviceType = searchParams.get("serviceType");
    const destinationId = searchParams.get("destinationId");

    // Default to last 30 days
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate
      ? new Date(startDate)
      : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get core analytics
    const analytics = await getPricingAnalytics({
      startDate: start,
      endDate: end,
      serviceType: serviceType || undefined,
      destinationId: destinationId ? parseInt(destinationId) : undefined,
    });

    // Get rule performance
    const rulePerformance = await db
      .select({
        ruleId: priceAdjustments.ruleId,
        ruleName: priceAdjustments.ruleName,
        adjustmentType: priceAdjustments.adjustmentType,
        usageCount: sql<number>`COUNT(*)::int`,
        totalImpact: sql<number>`SUM((${priceAdjustments.adjustedPrice}::numeric - ${priceAdjustments.originalPrice}::numeric))::numeric`,
        avgImpact: sql<number>`AVG((${priceAdjustments.adjustedPrice}::numeric - ${priceAdjustments.originalPrice}::numeric))::numeric`,
      })
      .from(priceAdjustments)
      .where(
        and(
          gte(priceAdjustments.adjustmentDate, start.toISOString().split("T")[0]),
          lte(priceAdjustments.adjustmentDate, end.toISOString().split("T")[0]),
          serviceType ? eq(priceAdjustments.serviceType, serviceType) : sql`1=1`
        )
      )
      .groupBy(
        priceAdjustments.ruleId,
        priceAdjustments.ruleName,
        priceAdjustments.adjustmentType
      )
      .orderBy(desc(sql`COUNT(*)`))
      .limit(10);

    // Get demand trends
    const demandTrends = await db
      .select({
        metricDate: demandMetrics.metricDate,
        avgDemandScore: sql<number>`AVG(${demandMetrics.demandScore}::numeric)::numeric`,
        totalSearches: sql<number>`SUM(${demandMetrics.searchCount})::int`,
        totalBookings: sql<number>`SUM(${demandMetrics.bookingsConfirmed})::int`,
      })
      .from(demandMetrics)
      .where(
        and(
          gte(demandMetrics.metricDate, start.toISOString().split("T")[0]),
          lte(demandMetrics.metricDate, end.toISOString().split("T")[0]),
          destinationId
            ? eq(demandMetrics.destinationId, parseInt(destinationId))
            : sql`1=1`
        )
      )
      .groupBy(demandMetrics.metricDate)
      .orderBy(demandMetrics.metricDate);

    // Get price volatility (std dev of adjusted prices)
    const volatilityStats = await db
      .select({
        serviceType: priceHistory.serviceType,
        avgPrice: sql<number>`AVG(${priceHistory.adjustedPrice}::numeric)::numeric`,
        minPrice: sql<number>`MIN(${priceHistory.adjustedPrice}::numeric)::numeric`,
        maxPrice: sql<number>`MAX(${priceHistory.adjustedPrice}::numeric)::numeric`,
        priceStdDev: sql<number>`STDDEV(${priceHistory.adjustedPrice}::numeric)::numeric`,
      })
      .from(priceHistory)
      .where(
        and(
          gte(priceHistory.recordDate, start.toISOString().split("T")[0]),
          lte(priceHistory.recordDate, end.toISOString().split("T")[0]),
          serviceType ? eq(priceHistory.serviceType, serviceType) : sql`1=1`
        )
      )
      .groupBy(priceHistory.serviceType);

    // Active rules count
    const [activeRulesCount] = await db
      .select({
        count: sql<number>`COUNT(*)::int`,
      })
      .from(pricingRules)
      .where(eq(pricingRules.isActive, true));

    return NextResponse.json({
      success: true,
      period: {
        start: start.toISOString().split("T")[0],
        end: end.toISOString().split("T")[0],
      },
      overview: {
        totalAdjustments: analytics.totalAdjustments,
        averageAdjustment: analytics.averageAdjustment.toFixed(2),
        activeRules: activeRulesCount?.count || 0,
      },
      ruleBreakdown: analytics.ruleBreakdown,
      rulePerformance: rulePerformance.map((r) => ({
        ruleId: r.ruleId,
        ruleName: r.ruleName || "Unknown",
        adjustmentType: r.adjustmentType,
        usageCount: r.usageCount,
        totalImpact: parseFloat(r.totalImpact?.toString() || "0").toFixed(2),
        avgImpact: parseFloat(r.avgImpact?.toString() || "0").toFixed(2),
      })),
      demandTrends: demandTrends.map((d) => ({
        date: d.metricDate,
        demandScore: parseFloat(d.avgDemandScore?.toString() || "0").toFixed(1),
        searches: d.totalSearches || 0,
        bookings: d.totalBookings || 0,
      })),
      priceVolatility: volatilityStats.map((v) => ({
        serviceType: v.serviceType,
        avgPrice: parseFloat(v.avgPrice?.toString() || "0").toFixed(2),
        minPrice: parseFloat(v.minPrice?.toString() || "0").toFixed(2),
        maxPrice: parseFloat(v.maxPrice?.toString() || "0").toFixed(2),
        priceRange:
          parseFloat(v.maxPrice?.toString() || "0") -
          parseFloat(v.minPrice?.toString() || "0"),
        volatility: parseFloat(v.priceStdDev?.toString() || "0").toFixed(2),
      })),
      dailyTrends: analytics.dailyTrends,
    });
  } catch (error) {
    console.error("Error fetching pricing analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch pricing analytics" },
      { status: 500 }
    );
  }
}
