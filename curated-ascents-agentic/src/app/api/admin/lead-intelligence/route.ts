import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { leadScores, leadEvents, clients, quotes, bookings } from "@/db/schema";
import { eq, sql, and, gte, desc, count } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/lead-intelligence
 * Get lead intelligence dashboard data
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get("days") || "30");

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get lead score distribution
    const scoreDistribution = await db
      .select({
        status: leadScores.status,
        count: count(),
        avgScore: sql<number>`AVG(${leadScores.currentScore})::int`,
      })
      .from(leadScores)
      .groupBy(leadScores.status);

    // Get high-value leads requiring handoff
    const highValueLeads = await db
      .select({
        id: leadScores.id,
        clientId: leadScores.clientId,
        clientName: clients.name,
        clientEmail: clients.email,
        currentScore: leadScores.currentScore,
        status: leadScores.status,
        detectedBudget: leadScores.detectedBudget,
        budgetCurrency: leadScores.budgetCurrency,
        detectedDestinations: leadScores.detectedDestinations,
        lastActivityAt: leadScores.lastActivityAt,
        handoffReason: leadScores.handoffReason,
      })
      .from(leadScores)
      .innerJoin(clients, eq(leadScores.clientId, clients.id))
      .where(eq(leadScores.requiresHumanHandoff, true))
      .orderBy(desc(leadScores.currentScore))
      .limit(10);

    // Get recent lead events
    const recentEvents = await db
      .select({
        id: leadEvents.id,
        clientId: leadEvents.clientId,
        clientName: clients.name,
        eventType: leadEvents.eventType,
        scoreChange: leadEvents.scoreChange,
        scoreAfter: leadEvents.scoreAfter,
        createdAt: leadEvents.createdAt,
      })
      .from(leadEvents)
      .innerJoin(clients, eq(leadEvents.clientId, clients.id))
      .where(gte(leadEvents.createdAt, startDate))
      .orderBy(desc(leadEvents.createdAt))
      .limit(50);

    // Get conversion funnel stats
    const totalLeads = await db
      .select({ count: count() })
      .from(leadScores);

    const quotesGenerated = await db
      .select({ count: count() })
      .from(quotes)
      .where(gte(quotes.createdAt, startDate));

    const bookingsCreated = await db
      .select({ count: count() })
      .from(bookings)
      .where(gte(bookings.createdAt, startDate));

    // Get top performing lead sources
    const leadsBySource = await db
      .select({
        source: leadScores.source,
        count: count(),
        avgScore: sql<number>`AVG(${leadScores.currentScore})::int`,
      })
      .from(leadScores)
      .where(sql`${leadScores.source} IS NOT NULL`)
      .groupBy(leadScores.source)
      .orderBy(desc(count()));

    // Get leads by intent level
    const leadsByIntent = await db
      .select({
        status: leadScores.status,
        count: count(),
      })
      .from(leadScores)
      .where(
        sql`${leadScores.status} IN ('browsing', 'comparing', 'interested', 'ready_to_book', 'qualified')`
      )
      .groupBy(leadScores.status);

    // Calculate conversion rate
    const convertedLeads = await db
      .select({ count: count() })
      .from(leadScores)
      .where(eq(leadScores.status, "converted"));

    const conversionRate =
      totalLeads[0].count > 0
        ? ((convertedLeads[0].count / totalLeads[0].count) * 100).toFixed(1)
        : "0";

    // Get re-engagement stats
    const reengagementStats = await db
      .select({
        totalSent: sql<number>`SUM(${leadScores.reengagementCount})::int`,
        leadsReengaged: count(),
      })
      .from(leadScores)
      .where(sql`${leadScores.reengagementCount} > 0`);

    // Get average score by event type
    const eventImpact = await db
      .select({
        eventType: leadEvents.eventType,
        avgScoreChange: sql<number>`AVG(${leadEvents.scoreChange})::numeric(5,1)`,
        occurrences: count(),
      })
      .from(leadEvents)
      .where(gte(leadEvents.createdAt, startDate))
      .groupBy(leadEvents.eventType)
      .orderBy(desc(count()));

    return NextResponse.json({
      success: true,
      period: `Last ${days} days`,
      summary: {
        totalLeads: totalLeads[0].count,
        quotesGenerated: quotesGenerated[0].count,
        bookingsCreated: bookingsCreated[0].count,
        conversionRate: `${conversionRate}%`,
        highValueLeadsCount: highValueLeads.length,
      },
      distribution: {
        byStatus: scoreDistribution,
        bySource: leadsBySource,
        byIntent: leadsByIntent,
      },
      highValueLeads: highValueLeads.map((lead) => ({
        id: lead.id,
        clientId: lead.clientId,
        name: lead.clientName || lead.clientEmail,
        email: lead.clientEmail,
        score: lead.currentScore,
        status: lead.status,
        budget: lead.detectedBudget
          ? `${lead.budgetCurrency || "USD"} ${parseFloat(lead.detectedBudget).toLocaleString()}`
          : null,
        destinations: lead.detectedDestinations,
        lastActivity: lead.lastActivityAt,
        handoffReason: lead.handoffReason,
      })),
      recentEvents: recentEvents.map((event) => ({
        id: event.id,
        clientId: event.clientId,
        clientName: event.clientName,
        eventType: event.eventType,
        scoreChange: event.scoreChange,
        scoreAfter: event.scoreAfter,
        timestamp: event.createdAt,
      })),
      reengagement: {
        totalEmailsSent: reengagementStats[0]?.totalSent || 0,
        leadsReengaged: reengagementStats[0]?.leadsReengaged || 0,
      },
      eventImpact: eventImpact.map((e) => ({
        eventType: e.eventType,
        avgScoreChange: e.avgScoreChange,
        occurrences: e.occurrences,
      })),
    });
  } catch (error) {
    console.error("Error fetching lead intelligence:", error);
    return NextResponse.json(
      { error: "Failed to fetch lead intelligence data" },
      { status: 500 }
    );
  }
}
