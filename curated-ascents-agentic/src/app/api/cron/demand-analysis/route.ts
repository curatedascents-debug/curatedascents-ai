import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  demandMetrics,
  quotes,
  bookings,
  destinations,
} from "@/db/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { updateDemandMetrics } from "@/lib/pricing/pricing-engine";

export const dynamic = "force-dynamic";

/**
 * POST /api/cron/demand-analysis
 * Analyze demand patterns and update metrics
 * Runs daily at 6 AM UTC
 */
export async function POST(req: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = req.headers.get("authorization");
    if (
      process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const results = {
      metricsUpdated: 0,
      priceHistoryRecorded: 0,
      errors: [] as string[],
    };

    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    // Analyze global quote and booking metrics
    try {
      // Count quotes generated yesterday
      const [quoteStats] = await db
        .select({
          count: sql<number>`COUNT(*)::int`,
        })
        .from(quotes)
        .where(
          and(
            gte(quotes.createdAt, new Date(yesterdayStr)),
            lte(quotes.createdAt, new Date(todayStr))
          )
        );

      // Count bookings confirmed yesterday
      const [bookingStats] = await db
        .select({
          count: sql<number>`COUNT(*)::int`,
          totalRevenue: sql<number>`COALESCE(SUM(${bookings.totalAmount}::numeric), 0)::numeric`,
        })
        .from(bookings)
        .where(
          and(
            gte(bookings.createdAt, new Date(yesterdayStr)),
            lte(bookings.createdAt, new Date(todayStr))
          )
        );

      // Update global demand metrics
      await updateDemandMetrics({
        metricDate: yesterday,
        quotesGenerated: quoteStats?.count || 0,
        bookingsConfirmed: bookingStats?.count || 0,
        totalRevenue: parseFloat(bookingStats?.totalRevenue?.toString() || "0"),
      });

      results.metricsUpdated++;
    } catch (error) {
      const errorMsg = `Failed to analyze global demand: ${error instanceof Error ? error.message : "Unknown error"}`;
      console.error(errorMsg);
      results.errors.push(errorMsg);
    }

    // Analyze by destination (text-based matching)
    const activeDestinations = await db
      .select({ id: destinations.id, city: destinations.city, country: destinations.country })
      .from(destinations)
      .where(eq(destinations.isActive, true));

    for (const destination of activeDestinations) {
      try {
        const searchTerm = destination.city || destination.country;
        if (!searchTerm) continue;

        // Count quotes for this destination (using text ILIKE)
        const [quoteStats] = await db
          .select({
            count: sql<number>`COUNT(*)::int`,
          })
          .from(quotes)
          .where(
            and(
              sql`${quotes.destination} ILIKE ${`%${searchTerm}%`}`,
              gte(quotes.createdAt, new Date(yesterdayStr)),
              lte(quotes.createdAt, new Date(todayStr))
            )
          );

        // Update demand metrics for this destination
        await updateDemandMetrics({
          metricDate: yesterday,
          destinationId: destination.id,
          quotesGenerated: quoteStats?.count || 0,
        });

        results.metricsUpdated++;
      } catch (error) {
        const errorMsg = `Failed to analyze demand for ${destination.city || destination.country}: ${error instanceof Error ? error.message : "Unknown error"}`;
        console.error(errorMsg);
        results.errors.push(errorMsg);
      }
    }

    // Analyze by service type
    const serviceTypes = [
      "hotel",
      "transportation",
      "guide",
      "package",
      "flight",
      "helicopter",
      "permit",
    ];

    for (const serviceType of serviceTypes) {
      try {
        // Placeholder metrics - would come from analytics tracking
        await updateDemandMetrics({
          metricDate: yesterday,
          serviceType,
          searchCount: 0,
          inquiryCount: 0,
        });
      } catch (error) {
        // Ignore errors for service type metrics
      }
    }

    console.log(
      `Demand analysis completed: ${results.metricsUpdated} metrics updated`
    );

    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in demand analysis cron:", error);
    return NextResponse.json(
      { error: "Failed to run demand analysis" },
      { status: 500 }
    );
  }
}

// Also handle GET for manual testing
export async function GET(req: NextRequest) {
  return POST(req);
}
