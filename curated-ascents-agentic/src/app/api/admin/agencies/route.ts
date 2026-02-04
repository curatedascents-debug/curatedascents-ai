import { NextResponse } from "next/server";
import { db } from "@/db";
import { agencies, agencyUsers, agencySuppliers } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { hashPassword } from "@/lib/auth/agency-auth";

export async function GET() {
  try {
    // Get all agencies with user count
    const agenciesWithStats = await db
      .select({
        id: agencies.id,
        name: agencies.name,
        slug: agencies.slug,
        logo: agencies.logo,
        primaryColor: agencies.primaryColor,
        email: agencies.email,
        phone: agencies.phone,
        website: agencies.website,
        country: agencies.country,
        status: agencies.status,
        canAccessAllSuppliers: agencies.canAccessAllSuppliers,
        maxUsers: agencies.maxUsers,
        defaultMarginPercent: agencies.defaultMarginPercent,
        miceMarginPercent: agencies.miceMarginPercent,
        currency: agencies.currency,
        createdAt: agencies.createdAt,
        userCount: sql<number>`(
          SELECT COUNT(*) FROM agency_users
          WHERE agency_users.agency_id = agencies.id
        )::int`.as("user_count"),
        supplierCount: sql<number>`(
          SELECT COUNT(*) FROM agency_suppliers
          WHERE agency_suppliers.agency_id = agencies.id AND agency_suppliers.is_active = true
        )::int`.as("supplier_count"),
      })
      .from(agencies)
      .orderBy(sql`${agencies.createdAt} DESC`);

    return NextResponse.json({ agencies: agenciesWithStats });
  } catch (error) {
    console.error("Error fetching agencies:", error);
    return NextResponse.json(
      { error: "Failed to fetch agencies" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      slug,
      logo,
      primaryColor,
      secondaryColor,
      accentColor,
      defaultMarginPercent,
      miceMarginPercent,
      currency,
      email,
      phone,
      website,
      country,
      status,
      canAccessAllSuppliers,
      maxUsers,
      settings,
      // Owner user details
      ownerEmail,
      ownerPassword,
      ownerName,
    } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400 }
      );
    }

    // Check if slug is unique
    const [existingAgency] = await db
      .select({ id: agencies.id })
      .from(agencies)
      .where(eq(agencies.slug, slug.toLowerCase()))
      .limit(1);

    if (existingAgency) {
      return NextResponse.json(
        { error: "An agency with this slug already exists" },
        { status: 409 }
      );
    }

    // Create the agency
    const [newAgency] = await db
      .insert(agencies)
      .values({
        name,
        slug: slug.toLowerCase(),
        logo,
        primaryColor: primaryColor || "#3b82f6",
        secondaryColor: secondaryColor || "#1e293b",
        accentColor: accentColor || "#60a5fa",
        defaultMarginPercent: defaultMarginPercent || "50.00",
        miceMarginPercent: miceMarginPercent || "35.00",
        currency: currency || "USD",
        email,
        phone,
        website,
        country,
        status: status || "pending",
        canAccessAllSuppliers: canAccessAllSuppliers || false,
        maxUsers: maxUsers || 5,
        settings,
      })
      .returning();

    // Create owner user if credentials provided
    if (ownerEmail && ownerPassword) {
      // Check if email is unique
      const [existingUser] = await db
        .select({ id: agencyUsers.id })
        .from(agencyUsers)
        .where(eq(agencyUsers.email, ownerEmail.toLowerCase()))
        .limit(1);

      if (existingUser) {
        // Rollback by deleting the agency
        await db.delete(agencies).where(eq(agencies.id, newAgency.id));
        return NextResponse.json(
          { error: "A user with this email already exists" },
          { status: 409 }
        );
      }

      const passwordHash = await hashPassword(ownerPassword);

      await db.insert(agencyUsers).values({
        agencyId: newAgency.id,
        email: ownerEmail.toLowerCase(),
        passwordHash,
        name: ownerName || name + " Admin",
        role: "owner",
        isActive: true,
      });
    }

    return NextResponse.json({ agency: newAgency }, { status: 201 });
  } catch (error) {
    console.error("Error creating agency:", error);
    return NextResponse.json(
      { error: "Failed to create agency" },
      { status: 500 }
    );
  }
}
