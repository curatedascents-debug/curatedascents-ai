import { NextResponse } from "next/server";
import { db } from "@/db";
import { agencyUsers, agencies } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import {
  verifyPassword,
  createSession,
  setAgencySessionCookie,
} from "@/lib/auth/agency-auth";

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

    // Find the user by email
    const [user] = await db
      .select({
        id: agencyUsers.id,
        email: agencyUsers.email,
        passwordHash: agencyUsers.passwordHash,
        name: agencyUsers.name,
        role: agencyUsers.role,
        isActive: agencyUsers.isActive,
        agencyId: agencyUsers.agencyId,
      })
      .from(agencyUsers)
      .where(eq(agencyUsers.email, email.toLowerCase()))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: "Your account has been deactivated. Please contact your agency administrator." },
        { status: 403 }
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

    // Get agency details
    const [agency] = await db
      .select({
        id: agencies.id,
        name: agencies.name,
        slug: agencies.slug,
        status: agencies.status,
      })
      .from(agencies)
      .where(and(eq(agencies.id, user.agencyId), eq(agencies.status, "active")))
      .limit(1);

    if (!agency) {
      return NextResponse.json(
        { error: "Your agency is not active. Please contact support." },
        { status: 403 }
      );
    }

    // Create session token
    const token = await createSession({
      userId: user.id,
      agencyId: agency.id,
      email: user.email,
      role: user.role || "agent",
      agencySlug: agency.slug,
      agencyName: agency.name,
    });

    // Set session cookie
    await setAgencySessionCookie(token);

    // Update last login
    await db
      .update(agencyUsers)
      .set({ lastLoginAt: new Date() })
      .where(eq(agencyUsers.id, user.id));

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      agency: {
        id: agency.id,
        name: agency.name,
        slug: agency.slug,
      },
    });
  } catch (error) {
    console.error("Agency login error:", error);
    return NextResponse.json(
      { error: "An error occurred during login" },
      { status: 500 }
    );
  }
}
