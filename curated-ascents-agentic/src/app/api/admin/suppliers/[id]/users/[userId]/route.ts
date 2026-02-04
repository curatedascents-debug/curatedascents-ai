import { NextResponse } from "next/server";
import { db } from "@/db";
import { supplierUsers } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { hashPassword } from "@/lib/auth/supplier-auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const { id, userId } = await params;
    const supplierId = parseInt(id, 10);
    const userIdNum = parseInt(userId, 10);

    if (isNaN(supplierId) || isNaN(userIdNum)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const [user] = await db
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
      .where(
        and(
          eq(supplierUsers.id, userIdNum),
          eq(supplierUsers.supplierId, supplierId)
        )
      )
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error fetching supplier user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const { id, userId } = await params;
    const supplierId = parseInt(id, 10);
    const userIdNum = parseInt(userId, 10);

    if (isNaN(supplierId) || isNaN(userIdNum)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = await request.json();
    const { name, phone, role, isActive, password } = body;

    // Verify user belongs to supplier
    const [existingUser] = await db
      .select({ id: supplierUsers.id })
      .from(supplierUsers)
      .where(
        and(
          eq(supplierUsers.id, userIdNum),
          eq(supplierUsers.supplierId, supplierId)
        )
      )
      .limit(1);

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;

    // If password is provided, hash and update it
    if (password) {
      updateData.passwordHash = await hashPassword(password);
    }

    const [updatedUser] = await db
      .update(supplierUsers)
      .set(updateData)
      .where(eq(supplierUsers.id, userIdNum))
      .returning({
        id: supplierUsers.id,
        email: supplierUsers.email,
        name: supplierUsers.name,
        phone: supplierUsers.phone,
        role: supplierUsers.role,
        isActive: supplierUsers.isActive,
      });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Error updating supplier user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const { id, userId } = await params;
    const supplierId = parseInt(id, 10);
    const userIdNum = parseInt(userId, 10);

    if (isNaN(supplierId) || isNaN(userIdNum)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    // Verify user belongs to supplier
    const [existingUser] = await db
      .select({ id: supplierUsers.id, role: supplierUsers.role })
      .from(supplierUsers)
      .where(
        and(
          eq(supplierUsers.id, userIdNum),
          eq(supplierUsers.supplierId, supplierId)
        )
      )
      .limit(1);

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Don't allow deleting the last owner
    if (existingUser.role === "owner") {
      const owners = await db
        .select({ id: supplierUsers.id })
        .from(supplierUsers)
        .where(
          and(
            eq(supplierUsers.supplierId, supplierId),
            eq(supplierUsers.role, "owner")
          )
        );

      if (owners.length <= 1) {
        return NextResponse.json(
          { error: "Cannot delete the last owner. Assign another owner first." },
          { status: 400 }
        );
      }
    }

    await db.delete(supplierUsers).where(eq(supplierUsers.id, userIdNum));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting supplier user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
