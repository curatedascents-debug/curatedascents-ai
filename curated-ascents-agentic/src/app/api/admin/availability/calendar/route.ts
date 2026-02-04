import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { availabilityCalendar, suppliers } from "@/db/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { updateAvailabilityCalendar } from "@/lib/availability/availability-engine";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/availability/calendar
 * Get availability calendar for services
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const serviceType = searchParams.get("serviceType");
    const serviceId = searchParams.get("serviceId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const supplierId = searchParams.get("supplierId");
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "100");

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "startDate and endDate are required" },
        { status: 400 }
      );
    }

    let whereConditions = [
      gte(availabilityCalendar.availabilityDate, startDate),
      lte(availabilityCalendar.availabilityDate, endDate),
    ];

    if (serviceType) {
      whereConditions.push(eq(availabilityCalendar.serviceType, serviceType));
    }
    if (serviceId) {
      whereConditions.push(eq(availabilityCalendar.serviceId, parseInt(serviceId)));
    }
    if (supplierId) {
      whereConditions.push(eq(availabilityCalendar.supplierId, parseInt(supplierId)));
    }
    if (status) {
      whereConditions.push(eq(availabilityCalendar.status, status));
    }

    const calendar = await db
      .select({
        id: availabilityCalendar.id,
        serviceType: availabilityCalendar.serviceType,
        serviceId: availabilityCalendar.serviceId,
        serviceName: availabilityCalendar.serviceName,
        supplierId: availabilityCalendar.supplierId,
        supplierName: suppliers.name,
        availabilityDate: availabilityCalendar.availabilityDate,
        totalCapacity: availabilityCalendar.totalCapacity,
        bookedCapacity: availabilityCalendar.bookedCapacity,
        heldCapacity: availabilityCalendar.heldCapacity,
        availableCapacity: availabilityCalendar.availableCapacity,
        status: availabilityCalendar.status,
        isBlocked: availabilityCalendar.isBlocked,
        priceOverride: availabilityCalendar.priceOverride,
        priceOverrideReason: availabilityCalendar.priceOverrideReason,
        notes: availabilityCalendar.notes,
        lastSyncedAt: availabilityCalendar.lastSyncedAt,
      })
      .from(availabilityCalendar)
      .leftJoin(suppliers, eq(availabilityCalendar.supplierId, suppliers.id))
      .where(and(...whereConditions))
      .orderBy(availabilityCalendar.availabilityDate)
      .limit(limit);

    // Calculate summary stats
    const stats = {
      totalDates: calendar.length,
      available: calendar.filter((c) => c.status === "available").length,
      limited: calendar.filter((c) => c.status === "limited").length,
      soldOut: calendar.filter((c) => c.status === "sold_out").length,
      blocked: calendar.filter((c) => c.status === "blocked").length,
    };

    return NextResponse.json({
      success: true,
      calendar,
      stats,
    });
  } catch (error) {
    console.error("Error fetching availability calendar:", error);
    return NextResponse.json(
      { error: "Failed to fetch availability calendar" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/availability/calendar
 * Update or create calendar entry
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      serviceType,
      serviceId,
      serviceName,
      supplierId,
      date,
      totalCapacity,
      isBlocked,
      priceOverride,
      priceOverrideReason,
      notes,
      agencyId,
    } = body;

    if (!serviceType || !serviceId || !date) {
      return NextResponse.json(
        { error: "serviceType, serviceId, and date are required" },
        { status: 400 }
      );
    }

    const result = await updateAvailabilityCalendar({
      serviceType,
      serviceId,
      serviceName,
      supplierId,
      date: new Date(date),
      totalCapacity,
      isBlocked,
      priceOverride,
      priceOverrideReason,
      notes,
      agencyId,
    });

    return NextResponse.json({
      success: true,
      calendarId: result.calendarId,
      message: "Availability calendar updated successfully",
    });
  } catch (error) {
    console.error("Error updating availability calendar:", error);
    return NextResponse.json(
      { error: "Failed to update availability calendar" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/availability/calendar
 * Bulk update calendar entries
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { entries } = body;

    if (!entries || !Array.isArray(entries)) {
      return NextResponse.json(
        { error: "entries array is required" },
        { status: 400 }
      );
    }

    const results = [];

    for (const entry of entries) {
      try {
        const result = await updateAvailabilityCalendar({
          serviceType: entry.serviceType,
          serviceId: entry.serviceId,
          serviceName: entry.serviceName,
          supplierId: entry.supplierId,
          date: new Date(entry.date),
          totalCapacity: entry.totalCapacity,
          isBlocked: entry.isBlocked,
          priceOverride: entry.priceOverride,
          priceOverrideReason: entry.priceOverrideReason,
          notes: entry.notes,
          agencyId: entry.agencyId,
        });
        results.push({ date: entry.date, success: true, calendarId: result.calendarId });
      } catch (error) {
        results.push({
          date: entry.date,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: results.length,
        successful: results.filter((r) => r.success).length,
        failed: results.filter((r) => !r.success).length,
      },
    });
  } catch (error) {
    console.error("Error bulk updating availability calendar:", error);
    return NextResponse.json(
      { error: "Failed to bulk update availability calendar" },
      { status: 500 }
    );
  }
}
