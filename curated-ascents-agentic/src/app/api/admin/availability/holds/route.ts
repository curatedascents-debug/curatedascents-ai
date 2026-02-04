import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { inventoryHolds, quotes, clients, bookings } from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import {
  createHold,
  releaseHold,
  convertHoldToBooking,
  processExpiredHolds,
} from "@/lib/availability/availability-engine";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/availability/holds
 * List inventory holds
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const clientId = searchParams.get("clientId");
    const quoteId = searchParams.get("quoteId");
    const serviceType = searchParams.get("serviceType");
    const includeExpired = searchParams.get("includeExpired") === "true";
    const limit = parseInt(searchParams.get("limit") || "50");

    let whereConditions = [];

    if (status) {
      whereConditions.push(eq(inventoryHolds.status, status));
    } else if (!includeExpired) {
      whereConditions.push(eq(inventoryHolds.status, "active"));
    }

    if (clientId) {
      whereConditions.push(eq(inventoryHolds.clientId, parseInt(clientId)));
    }
    if (quoteId) {
      whereConditions.push(eq(inventoryHolds.quoteId, parseInt(quoteId)));
    }
    if (serviceType) {
      whereConditions.push(eq(inventoryHolds.serviceType, serviceType));
    }

    const holds = await db
      .select({
        id: inventoryHolds.id,
        holdType: inventoryHolds.holdType,
        serviceType: inventoryHolds.serviceType,
        serviceId: inventoryHolds.serviceId,
        holdDate: inventoryHolds.holdDate,
        quantity: inventoryHolds.quantity,
        holdReference: inventoryHolds.holdReference,
        quoteId: inventoryHolds.quoteId,
        quoteNumber: quotes.quoteNumber,
        clientId: inventoryHolds.clientId,
        clientName: clients.name,
        clientEmail: clients.email,
        expiresAt: inventoryHolds.expiresAt,
        isExpired: inventoryHolds.isExpired,
        status: inventoryHolds.status,
        convertedToBookingId: inventoryHolds.convertedToBookingId,
        bookingReference: bookings.bookingReference,
        convertedAt: inventoryHolds.convertedAt,
        releasedAt: inventoryHolds.releasedAt,
        releaseReason: inventoryHolds.releaseReason,
        createdBy: inventoryHolds.createdBy,
        createdAt: inventoryHolds.createdAt,
      })
      .from(inventoryHolds)
      .leftJoin(quotes, eq(inventoryHolds.quoteId, quotes.id))
      .leftJoin(clients, eq(inventoryHolds.clientId, clients.id))
      .leftJoin(bookings, eq(inventoryHolds.convertedToBookingId, bookings.id))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(desc(inventoryHolds.createdAt))
      .limit(limit);

    // Get stats
    const [stats] = await db
      .select({
        active: sql<number>`COUNT(*) FILTER (WHERE status = 'active')::int`,
        converted: sql<number>`COUNT(*) FILTER (WHERE status = 'converted')::int`,
        released: sql<number>`COUNT(*) FILTER (WHERE status = 'released')::int`,
        expired: sql<number>`COUNT(*) FILTER (WHERE status = 'expired')::int`,
      })
      .from(inventoryHolds);

    return NextResponse.json({
      success: true,
      holds,
      stats: {
        active: stats?.active || 0,
        converted: stats?.converted || 0,
        released: stats?.released || 0,
        expired: stats?.expired || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching holds:", error);
    return NextResponse.json(
      { error: "Failed to fetch holds" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/availability/holds
 * Create a new inventory hold
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      serviceType,
      serviceId,
      holdDate,
      quantity,
      quoteId,
      clientId,
      holdDurationMinutes,
      agencyId,
      createdBy,
    } = body;

    if (!serviceType || !serviceId || !holdDate) {
      return NextResponse.json(
        { error: "serviceType, serviceId, and holdDate are required" },
        { status: 400 }
      );
    }

    const result = await createHold({
      serviceType,
      serviceId,
      holdDate: new Date(holdDate),
      quantity,
      quoteId,
      clientId,
      holdDurationMinutes,
      agencyId,
      createdBy,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      holdId: result.holdId,
      holdReference: result.holdReference,
      expiresAt: result.expiresAt?.toISOString(),
      message: "Hold created successfully",
    });
  } catch (error) {
    console.error("Error creating hold:", error);
    return NextResponse.json(
      { error: "Failed to create hold" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/availability/holds
 * Release or convert a hold
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { holdId, action, bookingId, releaseReason } = body;

    if (!holdId || !action) {
      return NextResponse.json(
        { error: "holdId and action are required" },
        { status: 400 }
      );
    }

    let result;

    if (action === "release") {
      result = await releaseHold(holdId, releaseReason || "manual_release");
    } else if (action === "convert") {
      if (!bookingId) {
        return NextResponse.json(
          { error: "bookingId is required for conversion" },
          { status: 400 }
        );
      }
      result = await convertHoldToBooking(holdId, bookingId);
    } else {
      return NextResponse.json(
        { error: "Invalid action. Use 'release' or 'convert'" },
        { status: 400 }
      );
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Hold ${action === "release" ? "released" : "converted"} successfully`,
    });
  } catch (error) {
    console.error("Error updating hold:", error);
    return NextResponse.json(
      { error: "Failed to update hold" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/availability/holds/expired
 * Process and release expired holds
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const processExpired = searchParams.get("processExpired") === "true";

    if (processExpired) {
      const result = await processExpiredHolds();

      return NextResponse.json({
        success: true,
        processed: result.processed,
        released: result.released,
        message: `Processed ${result.processed} expired holds, released ${result.released}`,
      });
    }

    return NextResponse.json(
      { error: "Use ?processExpired=true to process expired holds" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error processing expired holds:", error);
    return NextResponse.json(
      { error: "Failed to process expired holds" },
      { status: 500 }
    );
  }
}
