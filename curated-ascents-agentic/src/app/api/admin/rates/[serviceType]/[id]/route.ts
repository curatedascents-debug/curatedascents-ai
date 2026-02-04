import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import {
  hotelRoomRates,
  transportation,
  guides,
  porters,
  flightsDomestic,
  helicopterSharing,
  helicopterCharter,
  permitsFees,
  packages,
  miscellaneousServices,
} from "@/db/schema";

// Map service types to their tables
const tableMap: Record<string, any> = {
  hotel: hotelRoomRates,
  transportation: transportation,
  guide: guides,
  porter: porters,
  flight: flightsDomestic,
  helicopter_sharing: helicopterSharing,
  helicopter_charter: helicopterCharter,
  permit: permitsFees,
  package: packages,
  miscellaneous: miscellaneousServices,
};

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ serviceType: string; id: string }> }
) {
  try {
    const { serviceType, id } = await params;
    const body = await req.json();

    const table = tableMap[serviceType];
    if (!table) {
      return NextResponse.json(
        { error: `Unknown service type: ${serviceType}` },
        { status: 400 }
      );
    }

    // Remove fields that shouldn't be updated
    const {
      serviceType: _serviceType,
      hotelName,
      hotelId,
      starRating,
      hotelCategory,
      description,
      amenities,
      createdAt,
      ...updateData
    } = body;

    // Add updated timestamp
    updateData.updatedAt = new Date();

    // Update the record
    const result = await db
      .update(table)
      .set(updateData)
      .where(eq(table.id, parseInt(id)))
      .returning();

    // Check if any rows were updated
    if (!result || (Array.isArray(result) && result.length === 0)) {
      return NextResponse.json({ error: "Rate not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Rate updated successfully",
      rate: Array.isArray(result) ? result[0] : result,
    });
  } catch (error) {
    console.error("Error updating rate:", error);
    return NextResponse.json(
      {
        error: "Failed to update rate",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ serviceType: string; id: string }> }
) {
  try {
    const { serviceType, id } = await params;

    const table = tableMap[serviceType];
    if (!table) {
      return NextResponse.json(
        { error: `Unknown service type: ${serviceType}` },
        { status: 400 }
      );
    }

    // Delete the record
    const result = await db
      .delete(table)
      .where(eq(table.id, parseInt(id)))
      .returning();

    // Check if any rows were deleted
    if (!result || (Array.isArray(result) && result.length === 0)) {
      return NextResponse.json({ error: "Rate not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Rate deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting rate:", error);
    return NextResponse.json({ error: "Failed to delete rate" }, { status: 500 });
  }
}
