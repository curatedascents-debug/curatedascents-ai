import { NextResponse } from "next/server";
import { db } from "@/db";

export const dynamic = "force-dynamic";
import { agencyUsers, agencies } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAgencySession } from "@/lib/auth/agency-auth";
import { getRolePermissions } from "@/lib/auth/permissions";
import type { AgencyRole } from "@/lib/auth/permissions";

export async function GET() {
  try {
    const session = await getAgencySession();

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get full user details
    const [user] = await db
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
      .where(eq(agencyUsers.id, session.userId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get agency details
    const [agency] = await db
      .select({
        id: agencies.id,
        name: agencies.name,
        slug: agencies.slug,
        logo: agencies.logo,
        primaryColor: agencies.primaryColor,
        secondaryColor: agencies.secondaryColor,
        accentColor: agencies.accentColor,
        currency: agencies.currency,
        status: agencies.status,
      })
      .from(agencies)
      .where(eq(agencies.id, session.agencyId))
      .limit(1);

    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 });
    }

    // Get role permissions
    const permissions = getRolePermissions(user.role as AgencyRole);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
      },
      agency: {
        id: agency.id,
        name: agency.name,
        slug: agency.slug,
        logo: agency.logo,
        primaryColor: agency.primaryColor,
        secondaryColor: agency.secondaryColor,
        accentColor: agency.accentColor,
        currency: agency.currency,
      },
      permissions,
    });
  } catch (error) {
    console.error("Get current user error:", error);
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
}
