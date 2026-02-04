import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { suppliers } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET single supplier
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.id, parseInt(id)))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json({ error: "Supplier not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      supplier: result[0],
    });
  } catch (error) {
    console.error("Error fetching supplier:", error);
    return NextResponse.json(
      { error: "Failed to fetch supplier" },
      { status: 500 }
    );
  }
}

// PUT - Update supplier
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Build update object, removing fields that shouldn't be updated
    const { id: _id, createdAt, ...rawData } = body;
    
    const updateData: any = {
      updatedAt: new Date(),
    };

    // Copy over all valid fields
    const allowedFields = [
      'name', 'type', 'country', 'city', 'contacts',
      'salesEmail', 'reservationEmail', 'accountsEmail', 'operationsEmail',
      'phoneMain', 'phoneSales', 'phoneReservation', 'phoneEmergency', 'phoneWhatsapp',
      'website', 'bookingPortal', 'address', 'postalCode',
      'bankName', 'bankBranch', 'bankAccountName', 'bankAccountNumber', 'bankSwiftCode', 'bankIban',
      'paymentTerms', 'creditLimit', 'currency',
      'commissionPercent', 'notes', 'internalRemarks',
      'reliabilityRating', 'qualityRating', 'valueRating',
      'isActive', 'isPreferred'
    ];

    for (const field of allowedFields) {
      if (rawData[field] !== undefined) {
        updateData[field] = rawData[field];
      }
    }

    // Handle date conversions
    if (rawData.contractStartDate) {
      updateData.contractStartDate = new Date(rawData.contractStartDate);
    }
    if (rawData.contractEndDate) {
      updateData.contractEndDate = new Date(rawData.contractEndDate);
    }

    // Handle integer conversions
    if (rawData.reliabilityRating !== undefined && rawData.reliabilityRating !== null && rawData.reliabilityRating !== '') {
      updateData.reliabilityRating = parseInt(rawData.reliabilityRating);
    }
    if (rawData.qualityRating !== undefined && rawData.qualityRating !== null && rawData.qualityRating !== '') {
      updateData.qualityRating = parseInt(rawData.qualityRating);
    }
    if (rawData.valueRating !== undefined && rawData.valueRating !== null && rawData.valueRating !== '') {
      updateData.valueRating = parseInt(rawData.valueRating);
    }

    const result = await db
      .update(suppliers)
      .set(updateData)
      .where(eq(suppliers.id, parseInt(id)))
      .returning();

    if (!result || (Array.isArray(result) && result.length === 0)) {
      return NextResponse.json({ error: "Supplier not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Supplier updated successfully",
      supplier: Array.isArray(result) ? result[0] : result,
    });
  } catch (error) {
    console.error("Error updating supplier:", error);
    return NextResponse.json(
      { 
        error: "Failed to update supplier",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

// DELETE supplier
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await db
      .delete(suppliers)
      .where(eq(suppliers.id, parseInt(id)))
      .returning();

    if (!result || (Array.isArray(result) && result.length === 0)) {
      return NextResponse.json({ error: "Supplier not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Supplier deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting supplier:", error);
    return NextResponse.json(
      { error: "Failed to delete supplier" },
      { status: 500 }
    );
  }
}
