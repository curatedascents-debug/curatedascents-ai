import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { demandMetrics, destinations } from "@/db/schema";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";
import { updateDemandMetrics } from "@/lib/pricing/pricing-engine";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/pricing/demand
 * Get demand metrics
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const destinationId = searchParams.get("destinationId");
    const serviceType = searchParams.get("serviceType");
    const limit = parseInt(searchParams.get("limit") || "30");

    let whereConditions = [];

    if (startDate) {
      whereConditions.push(gte(demandMetrics.metricDate, startDate));
    }
    if (endDate) {
      whereConditions.push(lte(demandMetrics.metricDate, endDate));
    }
    if (destinationId) {
      whereConditions.push(eq(demandMetrics.destinationId, parseInt(destinationId)));
    }
    if (serviceType) {
      whereConditions.push(eq(demandMetrics.serviceType, serviceType));
    }

    const metrics = await db
      .select({
        id: demandMetrics.id,
        metricDate: demandMetrics.metricDate,
        serviceType: demandMetrics.serviceType,
        destinationId: demandMetrics.destinationId,
        destinationCity: destinations.city,
        destinationCountry: destinations.country,
        searchCount: demandMetrics.searchCount,
        inquiryCount: demandMetrics.inquiryCount,
        quoteRequestCount: demandMetrics.quoteRequestCount,
        quotesGenerated: demandMetrics.quotesGenerated,
        bookingsConfirmed: demandMetrics.bookingsConfirmed,
        conversionRate: demandMetrics.conversionRate,
        totalRevenue: demandMetrics.totalRevenue,
        averageOrderValue: demandMetrics.averageOrderValue,
        availableInventory: demandMetrics.availableInventory,
        bookedInventory: demandMetrics.bookedInventory,
        occupancyRate: demandMetrics.occupancyRate,
        demandScore: demandMetrics.demandScore,
        createdAt: demandMetrics.createdAt,
      })
      .from(demandMetrics)
      .leftJoin(destinations, eq(demandMetrics.destinationId, destinations.id))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(desc(demandMetrics.metricDate))
      .limit(limit);

    // Calculate aggregate stats
    const aggregateStats = await db
      .select({
        avgDemandScore: sql<number>`AVG(${demandMetrics.demandScore}::numeric)::numeric`,
        avgConversionRate: sql<number>`AVG(${demandMetrics.conversionRate}::numeric)::numeric`,
        avgOccupancyRate: sql<number>`AVG(${demandMetrics.occupancyRate}::numeric)::numeric`,
        totalSearches: sql<number>`SUM(${demandMetrics.searchCount})::int`,
        totalBookings: sql<number>`SUM(${demandMetrics.bookingsConfirmed})::int`,
        totalRevenue: sql<number>`SUM(${demandMetrics.totalRevenue}::numeric)::numeric`,
      })
      .from(demandMetrics)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

    return NextResponse.json({
      success: true,
      metrics,
      summary: {
        avgDemandScore: aggregateStats[0]?.avgDemandScore
          ? parseFloat(aggregateStats[0].avgDemandScore.toString()).toFixed(1)
          : "0",
        avgConversionRate: aggregateStats[0]?.avgConversionRate
          ? parseFloat(aggregateStats[0].avgConversionRate.toString()).toFixed(1) + "%"
          : "0%",
        avgOccupancyRate: aggregateStats[0]?.avgOccupancyRate
          ? parseFloat(aggregateStats[0].avgOccupancyRate.toString()).toFixed(1) + "%"
          : "0%",
        totalSearches: aggregateStats[0]?.totalSearches || 0,
        totalBookings: aggregateStats[0]?.totalBookings || 0,
        totalRevenue: aggregateStats[0]?.totalRevenue || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching demand metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch demand metrics" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/pricing/demand
 * Update demand metrics (manual entry or from tracking events)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      metricDate,
      serviceType,
      destinationId,
      searchCount,
      inquiryCount,
      quoteRequestCount,
      quotesGenerated,
      bookingsConfirmed,
      totalRevenue,
      availableInventory,
      bookedInventory,
    } = body;

    if (!metricDate) {
      return NextResponse.json(
        { error: "metricDate is required" },
        { status: 400 }
      );
    }

    await updateDemandMetrics({
      metricDate: new Date(metricDate),
      serviceType,
      destinationId,
      searchCount,
      inquiryCount,
      quoteRequestCount,
      quotesGenerated,
      bookingsConfirmed,
      totalRevenue,
      availableInventory,
      bookedInventory,
    });

    return NextResponse.json({
      success: true,
      message: "Demand metrics updated successfully",
    });
  } catch (error) {
    console.error("Error updating demand metrics:", error);
    return NextResponse.json(
      { error: "Failed to update demand metrics" },
      { status: 500 }
    );
  }
}
