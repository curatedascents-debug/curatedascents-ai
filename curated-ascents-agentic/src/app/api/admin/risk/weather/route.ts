/**
 * Weather Alerts API
 * GET /api/admin/risk/weather - List weather alerts
 * POST /api/admin/risk/weather - Create weather alert
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { weatherAlerts } from "@/db/schema";
import { eq, and, desc, or, isNull } from "drizzle-orm";
import { createWeatherAlert, getActiveWeatherAlerts } from "@/lib/risk/risk-compliance-engine";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const country = searchParams.get("country") || undefined;
    const destinationId = searchParams.get("destinationId")
      ? parseInt(searchParams.get("destinationId")!)
      : undefined;
    const includeInactive = searchParams.get("includeInactive") === "true";

    if (includeInactive) {
      // Return all alerts for admin management
      let whereConditions = [];

      if (country) {
        whereConditions.push(eq(weatherAlerts.country, country));
      }
      if (destinationId) {
        whereConditions.push(
          or(
            isNull(weatherAlerts.destinationId),
            eq(weatherAlerts.destinationId, destinationId)
          )
        );
      }

      const alerts = await db
        .select()
        .from(weatherAlerts)
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
        .orderBy(desc(weatherAlerts.createdAt));

      return NextResponse.json({ alerts });
    }

    // Return only active alerts
    const alerts = await getActiveWeatherAlerts({ country, destinationId });
    return NextResponse.json({ alerts });
  } catch (error) {
    console.error("Error fetching weather alerts:", error);
    return NextResponse.json(
      { error: "Failed to fetch weather alerts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      country,
      region,
      destinationId,
      alertType,
      severity,
      alertTitle,
      alertDescription,
      weatherData,
      expectedStart,
      expectedEnd,
      source,
      agencyId,
    } = body;

    // Validate required fields
    if (!country || !alertType || !severity || !alertTitle) {
      return NextResponse.json(
        { error: "Missing required fields: country, alertType, severity, alertTitle" },
        { status: 400 }
      );
    }

    const result = await createWeatherAlert({
      country,
      region,
      destinationId,
      alertType,
      severity,
      alertTitle,
      alertDescription,
      weatherData,
      expectedStart: expectedStart ? new Date(expectedStart) : undefined,
      expectedEnd: expectedEnd ? new Date(expectedEnd) : undefined,
      source,
      agencyId,
    });

    return NextResponse.json({
      success: true,
      alertId: result.alertId,
    });
  } catch (error) {
    console.error("Error creating weather alert:", error);
    return NextResponse.json(
      { error: "Failed to create weather alert" },
      { status: 500 }
    );
  }
}
