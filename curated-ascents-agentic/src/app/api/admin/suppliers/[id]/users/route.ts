import { NextResponse } from "next/server";
import { db } from "@/db";
import { supplierUsers, suppliers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/auth/supplier-auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supplierId = parseInt(id, 10);

    if (isNaN(supplierId)) {
      return NextResponse.json({ error: "Invalid supplier ID" }, { status: 400 });
    }

    const users = await db
      .select({
        id: supplierUsers.id,
        email: supplierUsers.email,
        name: supplierUsers.name,
        phone: supplierUsers.phone,
        role: supplierUsers.role,
        isActive: supplierUsers.isActive,
        lastLoginAt: supplierUsers.lastLoginAt,
        createdAt: supplierUsers.createdAt,
      })
      .from(supplierUsers)
      .where(eq(supplierUsers.supplierId, supplierId));

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error fetching supplier users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supplierId = parseInt(id, 10);

    if (isNaN(supplierId)) {
      return NextResponse.json({ error: "Invalid supplier ID" }, { status: 400 });
    }

    const body = await request.json();
    const { email, password, name, phone, role } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Check if supplier exists
    const [supplier] = await db
      .select({ id: suppliers.id, name: suppliers.name })
      .from(suppliers)
      .where(eq(suppliers.id, supplierId))
      .limit(1);

    if (!supplier) {
      return NextResponse.json({ error: "Supplier not found" }, { status: 404 });
    }

    // Check if email is unique
    const [existingUser] = await db
      .select({ id: supplierUsers.id })
      .from(supplierUsers)
      .where(eq(supplierUsers.email, email.toLowerCase()))
      .limit(1);

    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password);

    const [newUser] = await db
      .insert(supplierUsers)
      .values({
        supplierId,
        email: email.toLowerCase(),
        passwordHash,
        name: name || `${supplier.name} User`,
        phone,
        role: role || "staff",
        isActive: true,
      })
      .returning({
        id: supplierUsers.id,
        email: supplierUsers.email,
        name: supplierUsers.name,
        role: supplierUsers.role,
        isActive: supplierUsers.isActive,
        createdAt: supplierUsers.createdAt,
      });

    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (error) {
    console.error("Error creating supplier user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
