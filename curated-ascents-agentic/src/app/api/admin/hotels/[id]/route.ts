import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { hotels } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET single hotel
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await db
      .select()
      .from(hotels)
      .where(eq(hotels.id, parseInt(id)))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json({ error: "Hotel not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      hotel: result[0],
    });
  } catch (error) {
    console.error("Error fetching hotel:", error);
    return NextResponse.json(
      { error: "Failed to fetch hotel" },
      { status: 500 }
    );
  }
}

// PUT - Update hotel
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Remove fields that shouldn't be updated
    const { 
      id: _id, 
      createdAt, 
      supplierName, 
      destinationCity, 
      destinationCountry,
      destinationRegion,
      ...updateData 
    } = body;
    
    updateData.updatedAt = new Date();

    // Convert string IDs to integers if present
    if (updateData.supplierId) {
      updateData.supplierId = parseInt(updateData.supplierId);
    }
    if (updateData.destinationId) {
      updateData.destinationId = parseInt(updateData.destinationId);
    }
    if (updateData.starRating) {
      updateData.starRating = parseInt(updateData.starRating);
    }

    const result = await db
      .update(hotels)
      .set(updateData)
      .where(eq(hotels.id, parseInt(id)))
      .returning();

    if (!result || (Array.isArray(result) && result.length === 0)) {
      return NextResponse.json({ error: "Hotel not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Hotel updated successfully",
      hotel: Array.isArray(result) ? result[0] : result,
    });
  } catch (error) {
    console.error("Error updating hotel:", error);
    return NextResponse.json(
      { error: "Failed to update hotel" },
      { status: 500 }
    );
  }
}

// DELETE hotel
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await db
      .delete(hotels)
      .where(eq(hotels.id, parseInt(id)))
      .returning();

    if (!result || (Array.isArray(result) && result.length === 0)) {
      return NextResponse.json({ error: "Hotel not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Hotel deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting hotel:", error);
    return NextResponse.json(
      { error: "Failed to delete hotel" },
      { status: 500 }
    );
  }
}
