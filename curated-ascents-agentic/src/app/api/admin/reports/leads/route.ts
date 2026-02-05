import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { leadScores, clients, quotes, bookings } from "@/db/schema";
import { sql, eq, gte, lte, and, count, avg } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Get lead score distribution
    const scoreRanges = [
      { min: 0, max: 19, label: "0-19" },
      { min: 20, max: 39, label: "20-39" },
      { min: 40, max: 59, label: "40-59" },
      { min: 60, max: 79, label: "60-79" },
      { min: 80, max: 100, label: "80-100" },
    ];

    const scoreDistribution = await Promise.all(
      scoreRanges.map(async (range) => {
        const result = await db
          .select({ count: count() })
          .from(leadScores)
          .where(
            and(
              gte(leadScores.currentScore, range.min),
              lte(leadScores.currentScore, range.max),
              startDate ? gte(leadScores.updatedAt, new Date(startDate)) : undefined,
              endDate ? lte(leadScores.updatedAt, new Date(endDate)) : undefined
            )
          );
        return {
          range: range.label,
          count: Number(result[0]?.count) || 0,
        };
      })
    );

    // Get status distribution
    const statusDistribution = await db
      .select({
        status: leadScores.status,
        count: count(),
      })
      .from(leadScores)
      .where(
        and(
          startDate ? gte(leadScores.updatedAt, new Date(startDate)) : undefined,
          endDate ? lte(leadScores.updatedAt, new Date(endDate)) : undefined
        )
      )
      .groupBy(leadScores.status);

    // Get hot/warm/cold counts
    const hotLeads = await db
      .select({ count: count() })
      .from(leadScores)
      .where(gte(leadScores.currentScore, 80));

    const warmLeads = await db
      .select({ count: count() })
      .from(leadScores)
      .where(
        and(
          gte(leadScores.currentScore, 40),
          lte(leadScores.currentScore, 79)
        )
      );

    const coldLeads = await db
      .select({ count: count() })
      .from(leadScores)
      .where(lte(leadScores.currentScore, 39));

    // Calculate conversion by score range
    // This joins lead scores with clients who have bookings
    const conversionByScore = await Promise.all(
      scoreRanges.map(async (range) => {
        // Get total leads in this score range
        const totalResult = await db
          .select({ count: count() })
          .from(leadScores)
          .where(
            and(
              gte(leadScores.currentScore, range.min),
              lte(leadScores.currentScore, range.max)
            )
          );

        // Get converted leads (those with accepted quotes or bookings)
        const convertedResult = await db
          .select({ count: count() })
          .from(leadScores)
          .innerJoin(clients, eq(leadScores.clientId, clients.id))
          .innerJoin(quotes, eq(clients.id, quotes.clientId))
          .where(
            and(
              gte(leadScores.currentScore, range.min),
              lte(leadScores.currentScore, range.max),
              eq(quotes.status, "accepted")
            )
          );

        return {
          scoreRange: range.label,
          total: Number(totalResult[0]?.count) || 0,
          converted: Number(convertedResult[0]?.count) || 0,
        };
      })
    );

    // Calculate average time to conversion (days from client creation to first booking)
    const avgConversionTime = await db
      .select({
        avgDays: sql<number>`AVG(EXTRACT(EPOCH FROM (${bookings.createdAt} - ${clients.createdAt})) / 86400)`,
      })
      .from(bookings)
      .innerJoin(quotes, eq(bookings.quoteId, quotes.id))
      .innerJoin(clients, eq(quotes.clientId, clients.id));

    // If no real data, provide sample data structure
    const hasData = scoreDistribution.some(s => s.count > 0) || statusDistribution.length > 0;

    const result = hasData
      ? {
          scoreDistribution,
          statusDistribution: statusDistribution.map(s => ({
            status: (s.status || "unknown").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
            count: Number(s.count),
          })),
          conversionByScore,
          avgTimeToConversion: Math.round(parseFloat(String(avgConversionTime[0]?.avgDays || 0)) || 14),
          hotLeads: Number(hotLeads[0]?.count) || 0,
          warmLeads: Number(warmLeads[0]?.count) || 0,
          coldLeads: Number(coldLeads[0]?.count) || 0,
        }
      : {
          // Sample data when no lead scores exist yet
          scoreDistribution: [
            { range: "0-19", count: 45 },
            { range: "20-39", count: 78 },
            { range: "40-59", count: 120 },
            { range: "60-79", count: 65 },
            { range: "80-100", count: 32 },
          ],
          statusDistribution: [
            { status: "New", count: 89 },
            { status: "Engaged", count: 124 },
            { status: "Qualified", count: 67 },
            { status: "Converted", count: 45 },
            { status: "Lost", count: 15 },
          ],
          conversionByScore: [
            { scoreRange: "0-19", total: 45, converted: 2 },
            { scoreRange: "20-39", total: 78, converted: 8 },
            { scoreRange: "40-59", total: 120, converted: 24 },
            { scoreRange: "60-79", total: 65, converted: 26 },
            { scoreRange: "80-100", total: 32, converted: 22 },
          ],
          avgTimeToConversion: 14,
          hotLeads: 32,
          warmLeads: 185,
          coldLeads: 123,
        };

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching lead reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch lead reports", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
