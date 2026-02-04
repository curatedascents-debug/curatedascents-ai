import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { blackoutDates, suppliers, destinations } from "@/db/schema";
import { eq, and, gte, lte, desc, or, isNull } from "drizzle-orm";
import { createBlackout } from "@/lib/availability/availability-engine";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/availability/blackouts
 * List blackout dates
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const serviceType = searchParams.get("serviceType");
    const supplierId = searchParams.get("supplierId");
    const destinationId = searchParams.get("destinationId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const isActive = searchParams.get("isActive");
    const limit = parseInt(searchParams.get("limit") || "50");

    let whereConditions = [];

    if (serviceType) {
      whereConditions.push(
        or(isNull(blackoutDates.serviceType), eq(blackoutDates.serviceType, serviceType))
      );
    }
    if (supplierId) {
      whereConditions.push(eq(blackoutDates.supplierId, parseInt(supplierId)));
    }
    if (destinationId) {
      whereConditions.push(eq(blackoutDates.destinationId, parseInt(destinationId)));
    }
    if (startDate) {
      whereConditions.push(gte(blackoutDates.endDate, startDate));
    }
    if (endDate) {
      whereConditions.push(lte(blackoutDates.startDate, endDate));
    }
    if (isActive !== null && isActive !== undefined) {
      whereConditions.push(eq(blackoutDates.isActive, isActive === "true"));
    }

    const blackouts = await db
      .select({
        id: blackoutDates.id,
        serviceType: blackoutDates.serviceType,
        serviceId: blackoutDates.serviceId,
        supplierId: blackoutDates.supplierId,
        supplierName: suppliers.name,
        destinationId: blackoutDates.destinationId,
        destinationCity: destinations.city,
        startDate: blackoutDates.startDate,
        endDate: blackoutDates.endDate,
        reason: blackoutDates.reason,
        description: blackoutDates.description,
        blackoutType: blackoutDates.blackoutType,
        reducedCapacity: blackoutDates.reducedCapacity,
        isRecurring: blackoutDates.isRecurring,
        recurrencePattern: blackoutDates.recurrencePattern,
        isActive: blackoutDates.isActive,
        createdBy: blackoutDates.createdBy,
        createdAt: blackoutDates.createdAt,
      })
      .from(blackoutDates)
      .leftJoin(suppliers, eq(blackoutDates.supplierId, suppliers.id))
      .leftJoin(destinations, eq(blackoutDates.destinationId, destinations.id))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(desc(blackoutDates.startDate))
      .limit(limit);

    return NextResponse.json({
      success: true,
      blackouts,
      count: blackouts.length,
    });
  } catch (error) {
    console.error("Error fetching blackout dates:", error);
    return NextResponse.json(
      { error: "Failed to fetch blackout dates" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/availability/blackouts
 * Create a new blackout period
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      startDate,
      endDate,
      reason,
      description,
      blackoutType,
      reducedCapacity,
      serviceType,
      serviceId,
      supplierId,
      destinationId,
      isRecurring,
      recurrencePattern,
      agencyId,
      createdBy,
    } = body;

    if (!startDate || !endDate || !reason) {
      return NextResponse.json(
        { error: "startDate, endDate, and reason are required" },
        { status: 400 }
      );
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
      return NextResponse.json(
        { error: "endDate must be after startDate" },
        { status: 400 }
      );
    }

    const result = await createBlackout({
      startDate: start,
      endDate: end,
      reason,
      description,
      blackoutType,
      reducedCapacity,
      serviceType,
      serviceId,
      supplierId,
      destinationId,
      isRecurring,
      recurrencePattern,
      agencyId,
      createdBy,
    });

    return NextResponse.json({
      success: true,
      blackoutId: result.blackoutId,
      message: "Blackout period created successfully",
    });
  } catch (error) {
    console.error("Error creating blackout:", error);
    return NextResponse.json(
      { error: "Failed to create blackout" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/availability/blackouts
 * Delete or deactivate a blackout
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const blackoutId = searchParams.get("id");
    const permanent = searchParams.get("permanent") === "true";

    if (!blackoutId) {
      return NextResponse.json(
        { error: "Blackout id is required" },
        { status: 400 }
      );
    }

    if (permanent) {
      await db.delete(blackoutDates).where(eq(blackoutDates.id, parseInt(blackoutId)));
    } else {
      await db
        .update(blackoutDates)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(blackoutDates.id, parseInt(blackoutId)));
    }

    return NextResponse.json({
      success: true,
      message: permanent ? "Blackout deleted" : "Blackout deactivated",
    });
  } catch (error) {
    console.error("Error deleting blackout:", error);
    return NextResponse.json(
      { error: "Failed to delete blackout" },
      { status: 500 }
    );
  }
}
