/**
 * Single Weather Alert API
 * GET /api/admin/risk/weather/[id] - Get alert details
 * PUT /api/admin/risk/weather/[id] - Update alert
 * DELETE /api/admin/risk/weather/[id] - Deactivate alert
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { weatherAlerts } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const alertId = parseInt(id);

    const [alert] = await db
      .select()
      .from(weatherAlerts)
      .where(eq(weatherAlerts.id, alertId))
      .limit(1);

    if (!alert) {
      return NextResponse.json(
        { error: "Weather alert not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ alert });
  } catch (error) {
    console.error("Error fetching weather alert:", error);
    return NextResponse.json(
      { error: "Failed to fetch weather alert" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const alertId = parseInt(id);
    const body = await request.json();

    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    if (body.alertType) updateData.alertType = body.alertType;
    if (body.severity) updateData.severity = body.severity;
    if (body.alertTitle) updateData.alertTitle = body.alertTitle;
    if (body.alertDescription !== undefined) updateData.alertDescription = body.alertDescription;
    if (body.region !== undefined) updateData.region = body.region;
    if (body.weatherData !== undefined) updateData.weatherData = body.weatherData;
    if (body.expectedStart !== undefined) {
      updateData.expectedStart = body.expectedStart ? new Date(body.expectedStart) : null;
    }
    if (body.expectedEnd !== undefined) {
      updateData.expectedEnd = body.expectedEnd ? new Date(body.expectedEnd) : null;
    }
    if (body.source !== undefined) updateData.source = body.source;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    await db
      .update(weatherAlerts)
      .set(updateData)
      .where(eq(weatherAlerts.id, alertId));

    const [updated] = await db
      .select()
      .from(weatherAlerts)
      .where(eq(weatherAlerts.id, alertId))
      .limit(1);

    return NextResponse.json({ alert: updated });
  } catch (error) {
    console.error("Error updating weather alert:", error);
    return NextResponse.json(
      { error: "Failed to update weather alert" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const alertId = parseInt(id);

    // Soft delete - set isActive to false
    await db
      .update(weatherAlerts)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(weatherAlerts.id, alertId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting weather alert:", error);
    return NextResponse.json(
      { error: "Failed to delete weather alert" },
      { status: 500 }
    );
  }
}
