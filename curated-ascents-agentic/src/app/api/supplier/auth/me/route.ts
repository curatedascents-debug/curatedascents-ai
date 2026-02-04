import { NextResponse } from "next/server";
import { db } from "@/db";

export const dynamic = "force-dynamic";
import { supplierUsers, suppliers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSupplierSession } from "@/lib/auth/supplier-auth";

export async function GET() {
  try {
    const session = await getSupplierSession();

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get user details
    const [user] = await db
      .select({
        id: supplierUsers.id,
        email: supplierUsers.email,
        name: supplierUsers.name,
        phone: supplierUsers.phone,
        role: supplierUsers.role,
        supplierId: supplierUsers.supplierId,
      })
      .from(supplierUsers)
      .where(eq(supplierUsers.id, session.userId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get supplier details
    const [supplier] = await db
      .select({
        id: suppliers.id,
        name: suppliers.name,
        type: suppliers.type,
        country: suppliers.country,
        city: suppliers.city,
        email: suppliers.salesEmail,
        phone: suppliers.phoneMain,
        website: suppliers.website,
        isActive: suppliers.isActive,
      })
      .from(suppliers)
      .where(eq(suppliers.id, user.supplierId))
      .limit(1);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
      supplier: supplier || null,
    });
  } catch (error) {
    console.error("Get supplier session error:", error);
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
}
