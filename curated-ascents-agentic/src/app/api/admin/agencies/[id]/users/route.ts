import { NextResponse } from "next/server";
import { db } from "@/db";
import { agencyUsers, agencies } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { hashPassword } from "@/lib/auth/agency-auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const agencyId = parseInt(id, 10);

    if (isNaN(agencyId)) {
      return NextResponse.json({ error: "Invalid agency ID" }, { status: 400 });
    }

    const users = await db
      .select({
        id: agencyUsers.id,
        email: agencyUsers.email,
        name: agencyUsers.name,
        phone: agencyUsers.phone,
        role: agencyUsers.role,
        isActive: agencyUsers.isActive,
        lastLoginAt: agencyUsers.lastLoginAt,
        createdAt: agencyUsers.createdAt,
      })
      .from(agencyUsers)
      .where(eq(agencyUsers.agencyId, agencyId));

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error fetching agency users:", error);
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
    const agencyId = parseInt(id, 10);

    if (isNaN(agencyId)) {
      return NextResponse.json({ error: "Invalid agency ID" }, { status: 400 });
    }

    const body = await request.json();
    const { email, password, name, phone, role } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Check if agency exists and get max users
    const [agency] = await db
      .select({ id: agencies.id, maxUsers: agencies.maxUsers })
      .from(agencies)
      .where(eq(agencies.id, agencyId))
      .limit(1);

    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 });
    }

    // Check user count
    const existingUsers = await db
      .select({ id: agencyUsers.id })
      .from(agencyUsers)
      .where(eq(agencyUsers.agencyId, agencyId));

    if (existingUsers.length >= (agency.maxUsers || 5)) {
      return NextResponse.json(
        { error: "Agency has reached maximum user limit" },
        { status: 400 }
      );
    }

    // Check if email is unique
    const [existingUser] = await db
      .select({ id: agencyUsers.id })
      .from(agencyUsers)
      .where(eq(agencyUsers.email, email.toLowerCase()))
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
      .insert(agencyUsers)
      .values({
        agencyId,
        email: email.toLowerCase(),
        passwordHash,
        name,
        phone,
        role: role || "agent",
        isActive: true,
      })
      .returning({
        id: agencyUsers.id,
        email: agencyUsers.email,
        name: agencyUsers.name,
        role: agencyUsers.role,
        isActive: agencyUsers.isActive,
        createdAt: agencyUsers.createdAt,
      });

    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (error) {
    console.error("Error creating agency user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
