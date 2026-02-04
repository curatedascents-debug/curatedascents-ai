import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { suppliers } from "@/db/schema";
import { eq, ilike } from "drizzle-orm";

// This endpoint is for AI agent use only
// Returns supplier contact information for internal operations
// NEVER expose this to frontend users

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const supplierId = searchParams.get("id");
    const supplierName = searchParams.get("name");
    const supplierType = searchParams.get("type");

    // Get by ID
    if (supplierId) {
      const result = await db
        .select()
        .from(suppliers)
        .where(eq(suppliers.id, parseInt(supplierId)))
        .limit(1);

      if (result.length === 0) {
        return NextResponse.json({ error: "Supplier not found" }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        supplier: result[0],
      });
    }

    // Search by name
    if (supplierName) {
      const result = await db
        .select()
        .from(suppliers)
        .where(ilike(suppliers.name, `%${supplierName}%`));

      return NextResponse.json({
        success: true,
        suppliers: result,
      });
    }

    // Filter by type
    if (supplierType) {
      const result = await db
        .select()
        .from(suppliers)
        .where(eq(suppliers.type, supplierType));

      return NextResponse.json({
        success: true,
        suppliers: result,
      });
    }

    // Return all suppliers if no filter
    const result = await db.select().from(suppliers);
    
    return NextResponse.json({
      success: true,
      suppliers: result,
    });
  } catch (error) {
    console.error("Error fetching supplier contacts:", error);
    return NextResponse.json(
      { error: "Failed to fetch supplier contacts" },
      { status: 500 }
    );
  }
}
