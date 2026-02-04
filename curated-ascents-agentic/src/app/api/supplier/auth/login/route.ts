import { NextResponse } from "next/server";
import { db } from "@/db";
import { supplierUsers, suppliers } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  verifyPassword,
  createSupplierSession,
  setSupplierSessionCookie,
} from "@/lib/auth/supplier-auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find the user
    const [user] = await db
      .select({
        id: supplierUsers.id,
        email: supplierUsers.email,
        passwordHash: supplierUsers.passwordHash,
        name: supplierUsers.name,
        role: supplierUsers.role,
        isActive: supplierUsers.isActive,
        supplierId: supplierUsers.supplierId,
      })
      .from(supplierUsers)
      .where(eq(supplierUsers.email, email.toLowerCase()))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: "Your account has been deactivated" },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Get supplier info
    const [supplier] = await db
      .select({
        id: suppliers.id,
        name: suppliers.name,
        isActive: suppliers.isActive,
      })
      .from(suppliers)
      .where(eq(suppliers.id, user.supplierId))
      .limit(1);

    if (!supplier || !supplier.isActive) {
      return NextResponse.json(
        { error: "Your supplier account is not active" },
        { status: 401 }
      );
    }

    // Update last login
    await db
      .update(supplierUsers)
      .set({ lastLoginAt: new Date() })
      .where(eq(supplierUsers.id, user.id));

    // Create session
    const token = await createSupplierSession({
      userId: user.id,
      supplierId: supplier.id,
      email: user.email,
      role: user.role || "staff",
      supplierName: supplier.name,
    });

    // Set cookie
    await setSupplierSessionCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      supplier: {
        id: supplier.id,
        name: supplier.name,
      },
    });
  } catch (error) {
    console.error("Supplier login error:", error);
    return NextResponse.json(
      { error: "An error occurred during login" },
      { status: 500 }
    );
  }
}
