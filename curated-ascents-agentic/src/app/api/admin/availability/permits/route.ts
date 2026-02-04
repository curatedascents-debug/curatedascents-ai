import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { permitInventory, destinations } from "@/db/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { updatePermitInventory, checkPermitAvailability } from "@/lib/availability/availability-engine";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/availability/permits
 * List permit inventory
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const permitType = searchParams.get("permitType");
    const destinationId = searchParams.get("destinationId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const limit = parseInt(searchParams.get("limit") || "100");

    let whereConditions = [];

    if (permitType) {
      whereConditions.push(eq(permitInventory.permitType, permitType));
    }
    if (destinationId) {
      whereConditions.push(eq(permitInventory.destinationId, parseInt(destinationId)));
    }
    if (startDate) {
      whereConditions.push(gte(permitInventory.validDate, startDate));
    }
    if (endDate) {
      whereConditions.push(lte(permitInventory.validDate, endDate));
    }

    const permits = await db
      .select({
        id: permitInventory.id,
        permitType: permitInventory.permitType,
        permitName: permitInventory.permitName,
        issuingAuthority: permitInventory.issuingAuthority,
        destinationId: permitInventory.destinationId,
        destinationCity: destinations.city,
        validDate: permitInventory.validDate,
        dailyQuota: permitInventory.dailyQuota,
        agencyAllocation: permitInventory.agencyAllocation,
        bookedCount: permitInventory.bookedCount,
        heldCount: permitInventory.heldCount,
        availableCount: permitInventory.availableCount,
        permitCost: permitInventory.permitCost,
        permitSellPrice: permitInventory.permitSellPrice,
        currency: permitInventory.currency,
        status: permitInventory.status,
        notes: permitInventory.notes,
        createdAt: permitInventory.createdAt,
        updatedAt: permitInventory.updatedAt,
      })
      .from(permitInventory)
      .leftJoin(destinations, eq(permitInventory.destinationId, destinations.id))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(desc(permitInventory.validDate))
      .limit(limit);

    // Get permit type summary
    const permitTypes = [
      "TIMS",
      "ACAP",
      "Sagarmatha",
      "Langtang",
      "Manaslu",
      "Kanchenjunga",
      "Makalu",
      "Annapurna_Circuit",
      "Everest_Climbing",
      "Tibet_Entry",
    ];

    return NextResponse.json({
      success: true,
      permits,
      count: permits.length,
      permitTypes,
    });
  } catch (error) {
    console.error("Error fetching permit inventory:", error);
    return NextResponse.json(
      { error: "Failed to fetch permit inventory" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/availability/permits
 * Update or create permit inventory entry
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      permitType,
      permitName,
      issuingAuthority,
      destinationId,
      validDate,
      dailyQuota,
      agencyAllocation,
      permitCost,
      permitSellPrice,
      agencyId,
    } = body;

    if (!permitType || !permitName || !validDate) {
      return NextResponse.json(
        { error: "permitType, permitName, and validDate are required" },
        { status: 400 }
      );
    }

    const result = await updatePermitInventory({
      permitType,
      permitName,
      issuingAuthority,
      destinationId,
      validDate: new Date(validDate),
      dailyQuota,
      agencyAllocation,
      permitCost,
      permitSellPrice,
      agencyId,
    });

    return NextResponse.json({
      success: true,
      permitId: result.permitId,
      message: "Permit inventory updated successfully",
    });
  } catch (error) {
    console.error("Error updating permit inventory:", error);
    return NextResponse.json(
      { error: "Failed to update permit inventory" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/availability/permits/check
 * Check permit availability for a date range
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { permitType, startDate, endDate, quantity, agencyId } = body;

    if (!permitType || !startDate || !endDate) {
      return NextResponse.json(
        { error: "permitType, startDate, and endDate are required" },
        { status: 400 }
      );
    }

    const result = await checkPermitAvailability({
      permitType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      quantity: quantity || 1,
      agencyId,
    });

    return NextResponse.json({
      success: true,
      availability: {
        isAvailable: result.isAvailable,
        requestedQuantity: quantity || 1,
      },
      dates: result.dates.map((d) => ({
        date: d.date,
        isAvailable: d.available >= (quantity || 1),
        availableQuota: d.available,
        status: d.status,
      })),
      summary: {
        totalDates: result.dates.length,
        availableDates: result.dates.filter((d) => d.available >= (quantity || 1)).length,
        unavailableDates: result.dates.filter((d) => d.available < (quantity || 1)).length,
      },
    });
  } catch (error) {
    console.error("Error checking permit availability:", error);
    return NextResponse.json(
      { error: "Failed to check permit availability" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/availability/permits
 * Delete permit inventory entry
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const permitId = searchParams.get("id");

    if (!permitId) {
      return NextResponse.json(
        { error: "Permit id is required" },
        { status: 400 }
      );
    }

    await db.delete(permitInventory).where(eq(permitInventory.id, parseInt(permitId)));

    return NextResponse.json({
      success: true,
      message: "Permit inventory entry deleted",
    });
  } catch (error) {
    console.error("Error deleting permit inventory:", error);
    return NextResponse.json(
      { error: "Failed to delete permit inventory" },
      { status: 500 }
    );
  }
}
