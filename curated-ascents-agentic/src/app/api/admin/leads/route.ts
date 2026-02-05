/**
 * Lead Scores Admin API
 * GET /api/admin/leads - List all leads with scores
 * PUT /api/admin/leads - Update lead status
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { leadScores, clients, leadEvents } from "@/db/schema";
import { eq, desc, sql, and, gte, lte, or } from "drizzle-orm";
import {
  getLeadScoreSummary,
  markLeadConverted,
  markLeadLost,
} from "@/lib/lead-intelligence/scoring-engine";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const minScore = searchParams.get("minScore");
    const maxScore = searchParams.get("maxScore");
    const isHighValue = searchParams.get("isHighValue");
    const clientId = searchParams.get("clientId");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build where conditions
    const conditions = [];

    if (status) {
      conditions.push(eq(leadScores.status, status));
    }

    if (minScore) {
      conditions.push(gte(leadScores.currentScore, parseInt(minScore)));
    }

    if (maxScore) {
      conditions.push(lte(leadScores.currentScore, parseInt(maxScore)));
    }

    if (isHighValue === "true") {
      conditions.push(eq(leadScores.isHighValue, true));
    }

    if (clientId) {
      // Get detailed summary for a specific client
      const summary = await getLeadScoreSummary(parseInt(clientId));
      return NextResponse.json(summary);
    }

    // Get leads with client info
    const leads = await db
      .select({
        leadScore: leadScores,
        client: {
          id: clients.id,
          name: clients.name,
          email: clients.email,
          source: clients.source,
          createdAt: clients.createdAt,
        },
      })
      .from(leadScores)
      .innerJoin(clients, eq(leadScores.clientId, clients.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(leadScores.currentScore), desc(leadScores.lastActivityAt))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(leadScores)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    // Get summary stats
    const stats = await db
      .select({
        status: leadScores.status,
        count: sql<number>`count(*)`,
        avgScore: sql<number>`avg(${leadScores.currentScore})`,
      })
      .from(leadScores)
      .groupBy(leadScores.status);

    const highValueCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(leadScores)
      .where(eq(leadScores.isHighValue, true));

    return NextResponse.json({
      leads: leads.map(({ leadScore, client }) => ({
        ...leadScore,
        client,
      })),
      pagination: {
        total: count,
        limit,
        offset,
        hasMore: offset + leads.length < count,
      },
      stats: {
        byStatus: stats,
        highValueLeads: highValueCount[0]?.count || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json(
      { error: "Failed to fetch leads" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientId, action, reason } = body;

    if (!clientId) {
      return NextResponse.json(
        { error: "clientId is required" },
        { status: 400 }
      );
    }

    switch (action) {
      case "mark_converted": {
        const result = await markLeadConverted(clientId, body.bookingId);
        return NextResponse.json({
          success: true,
          previousStatus: result.previousStatus,
          newStatus: "converted",
        });
      }

      case "mark_lost": {
        if (!reason) {
          return NextResponse.json(
            { error: "reason is required for marking as lost" },
            { status: 400 }
          );
        }
        const result = await markLeadLost(clientId, reason);
        return NextResponse.json({
          success: true,
          newStatus: "lost",
        });
      }

      case "update_status": {
        const { status } = body;
        if (!status) {
          return NextResponse.json(
            { error: "status is required" },
            { status: 400 }
          );
        }

        await db
          .update(leadScores)
          .set({
            status,
            updatedAt: new Date(),
          })
          .where(eq(leadScores.clientId, clientId));

        return NextResponse.json({
          success: true,
          newStatus: status,
        });
      }

      case "manual_score_adjustment": {
        const { adjustment, adjustmentReason } = body;
        if (typeof adjustment !== "number") {
          return NextResponse.json(
            { error: "adjustment must be a number" },
            { status: 400 }
          );
        }

        const { recordLeadEvent } = await import("@/lib/lead-intelligence/scoring-engine");
        const result = await recordLeadEvent(
          clientId,
          "manual_adjustment",
          { adjustment, reason: adjustmentReason },
          "admin"
        );

        return NextResponse.json({
          success: true,
          newScore: result.newScore,
          scoreChange: result.scoreChange,
        });
      }

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error updating lead:", error);
    return NextResponse.json(
      { error: "Failed to update lead" },
      { status: 500 }
    );
  }
}
