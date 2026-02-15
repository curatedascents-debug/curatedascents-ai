import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { priceAlerts } from "@/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/price-alerts
 * List price alerts with optional filters
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const alertType = searchParams.get("alertType");
    const limit = parseInt(searchParams.get("limit") || "50");

    const conditions = [];
    if (status) conditions.push(eq(priceAlerts.status, status));
    if (priority) conditions.push(eq(priceAlerts.priority, priority));
    if (alertType) conditions.push(eq(priceAlerts.alertType, alertType));

    const alerts = await db
      .select()
      .from(priceAlerts)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(
        sql`CASE ${priceAlerts.priority} WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END`,
        desc(priceAlerts.createdAt)
      )
      .limit(limit);

    // Get summary stats
    const [stats] = await db
      .select({
        total: sql<number>`COUNT(*)::int`,
        newCount: sql<number>`COUNT(*) FILTER (WHERE ${priceAlerts.status} = 'new')::int`,
        highPriority: sql<number>`COUNT(*) FILTER (WHERE ${priceAlerts.priority} = 'high' AND ${priceAlerts.status} = 'new')::int`,
        acknowledgedCount: sql<number>`COUNT(*) FILTER (WHERE ${priceAlerts.status} = 'acknowledged')::int`,
      })
      .from(priceAlerts);

    return NextResponse.json({
      alerts,
      stats,
    });
  } catch (error) {
    console.error("Error fetching price alerts:", error);
    return NextResponse.json(
      { error: "Failed to fetch price alerts" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/price-alerts
 * Update alert status (acknowledge, dismiss, action)
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { alertId, status: newStatus, bulkIds } = body;

    if (bulkIds && Array.isArray(bulkIds)) {
      // Bulk update
      const updateData: Record<string, unknown> = { status: newStatus };
      if (newStatus === "acknowledged") updateData.acknowledgedAt = new Date();
      if (newStatus === "dismissed") updateData.dismissedAt = new Date();

      for (const id of bulkIds) {
        await db
          .update(priceAlerts)
          .set(updateData)
          .where(eq(priceAlerts.id, id));
      }

      return NextResponse.json({ updated: bulkIds.length });
    }

    if (!alertId) {
      return NextResponse.json(
        { error: "alertId is required" },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = { status: newStatus };
    if (newStatus === "acknowledged") updateData.acknowledgedAt = new Date();
    if (newStatus === "dismissed") updateData.dismissedAt = new Date();

    const [updated] = await db
      .update(priceAlerts)
      .set(updateData)
      .where(eq(priceAlerts.id, alertId))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: "Alert not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ alert: updated });
  } catch (error) {
    console.error("Error updating price alert:", error);
    return NextResponse.json(
      { error: "Failed to update price alert" },
      { status: 500 }
    );
  }
}
