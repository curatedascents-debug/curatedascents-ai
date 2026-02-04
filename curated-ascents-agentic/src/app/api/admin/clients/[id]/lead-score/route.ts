import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { clients } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  getLeadScoreSummary,
  recordLeadEvent,
  getOrCreateLeadScore,
} from "@/lib/lead-intelligence/scoring-engine";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/clients/[id]/lead-score
 * Get lead score and intelligence for a client
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const clientId = parseInt(id);

    // Verify client exists
    const [client] = await db
      .select()
      .from(clients)
      .where(eq(clients.id, clientId))
      .limit(1);

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Get lead score summary
    const summary = await getLeadScoreSummary(clientId);

    return NextResponse.json({
      success: true,
      clientId,
      clientEmail: client.email,
      clientName: client.name,
      leadScore: summary,
    });
  } catch (error) {
    console.error("Error fetching lead score:", error);
    return NextResponse.json(
      { error: "Failed to fetch lead score" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/clients/[id]/lead-score
 * Manually adjust lead score or record an event
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const clientId = parseInt(id);
    const body = await req.json();

    // Verify client exists
    const [client] = await db
      .select()
      .from(clients)
      .where(eq(clients.id, clientId))
      .limit(1);

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Ensure lead score exists
    await getOrCreateLeadScore(clientId);

    const {
      eventType,
      eventData,
      manualAdjustment,
      reason,
    } = body;

    let result;

    if (manualAdjustment !== undefined) {
      // Manual score adjustment
      result = await recordLeadEvent(
        clientId,
        "manual_adjustment",
        { adjustment: manualAdjustment, reason },
        "admin"
      );
    } else if (eventType) {
      // Record specific event
      result = await recordLeadEvent(
        clientId,
        eventType,
        eventData || {},
        "admin"
      );
    } else {
      return NextResponse.json(
        { error: "Either eventType or manualAdjustment is required" },
        { status: 400 }
      );
    }

    // Get updated summary
    const summary = await getLeadScoreSummary(clientId);

    return NextResponse.json({
      success: true,
      scoreChange: result.scoreChange,
      newScore: result.newScore,
      newStatus: result.status,
      leadScore: summary,
    });
  } catch (error) {
    console.error("Error updating lead score:", error);
    return NextResponse.json(
      { error: "Failed to update lead score" },
      { status: 500 }
    );
  }
}
