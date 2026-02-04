import { NextResponse } from "next/server";
import { db } from "@/db";
import { agencies, agencyUsers, agencySuppliers, clients, quotes, bookings } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

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

    // Get agency with stats
    const [agency] = await db
      .select({
        id: agencies.id,
        name: agencies.name,
        slug: agencies.slug,
        logo: agencies.logo,
        primaryColor: agencies.primaryColor,
        secondaryColor: agencies.secondaryColor,
        accentColor: agencies.accentColor,
        defaultMarginPercent: agencies.defaultMarginPercent,
        miceMarginPercent: agencies.miceMarginPercent,
        currency: agencies.currency,
        email: agencies.email,
        phone: agencies.phone,
        website: agencies.website,
        country: agencies.country,
        status: agencies.status,
        canAccessAllSuppliers: agencies.canAccessAllSuppliers,
        maxUsers: agencies.maxUsers,
        settings: agencies.settings,
        createdAt: agencies.createdAt,
        updatedAt: agencies.updatedAt,
      })
      .from(agencies)
      .where(eq(agencies.id, agencyId))
      .limit(1);

    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 });
    }

    // Get agency users
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
      .where(eq(agencyUsers.agencyId, agencyId))
      .orderBy(sql`${agencyUsers.createdAt} DESC`);

    // Get assigned suppliers
    const suppliers = await db
      .select()
      .from(agencySuppliers)
      .where(eq(agencySuppliers.agencyId, agencyId));

    // Get stats
    const [stats] = await db
      .select({
        clientCount: sql<number>`(
          SELECT COUNT(*) FROM clients WHERE clients.agency_id = ${agencyId}
        )::int`,
        quoteCount: sql<number>`(
          SELECT COUNT(*) FROM quotes WHERE quotes.agency_id = ${agencyId}
        )::int`,
        bookingCount: sql<number>`(
          SELECT COUNT(*) FROM bookings WHERE bookings.agency_id = ${agencyId}
        )::int`,
        totalRevenue: sql<string>`(
          SELECT COALESCE(SUM(total_amount::numeric), 0) FROM bookings
          WHERE bookings.agency_id = ${agencyId} AND payment_status = 'paid'
        )`,
      })
      .from(sql`(SELECT 1)`);

    return NextResponse.json({
      agency,
      users,
      suppliers,
      stats,
    });
  } catch (error) {
    console.error("Error fetching agency:", error);
    return NextResponse.json(
      { error: "Failed to fetch agency" },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    } = body;

    // If slug is being changed, check uniqueness
    if (slug) {
      const [existingAgency] = await db
        .select({ id: agencies.id })
        .from(agencies)
        .where(eq(agencies.slug, slug.toLowerCase()))
        .limit(1);

      if (existingAgency && existingAgency.id !== agencyId) {
        return NextResponse.json(
          { error: "An agency with this slug already exists" },
          { status: 409 }
        );
      }
    }

    const [updatedAgency] = await db
      .update(agencies)
      .set({
        ...(name && { name }),
        ...(slug && { slug: slug.toLowerCase() }),
        ...(logo !== undefined && { logo }),
        ...(primaryColor && { primaryColor }),
        ...(secondaryColor && { secondaryColor }),
        ...(accentColor && { accentColor }),
        ...(defaultMarginPercent && { defaultMarginPercent }),
        ...(miceMarginPercent && { miceMarginPercent }),
        ...(currency && { currency }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(website !== undefined && { website }),
        ...(country !== undefined && { country }),
        ...(status && { status }),
        ...(canAccessAllSuppliers !== undefined && { canAccessAllSuppliers }),
        ...(maxUsers && { maxUsers }),
        ...(settings !== undefined && { settings }),
        updatedAt: new Date(),
      })
      .where(eq(agencies.id, agencyId))
      .returning();

    if (!updatedAgency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 });
    }

    return NextResponse.json({ agency: updatedAgency });
  } catch (error) {
    console.error("Error updating agency:", error);
    return NextResponse.json(
      { error: "Failed to update agency" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const agencyId = parseInt(id, 10);

    if (isNaN(agencyId)) {
      return NextResponse.json({ error: "Invalid agency ID" }, { status: 400 });
    }

    // Check if agency exists
    const [agency] = await db
      .select({ id: agencies.id })
      .from(agencies)
      .where(eq(agencies.id, agencyId))
      .limit(1);

    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 });
    }

    // Check for existing data
    const [dataCheck] = await db
      .select({
        hasClients: sql<boolean>`EXISTS(SELECT 1 FROM clients WHERE agency_id = ${agencyId})`,
        hasQuotes: sql<boolean>`EXISTS(SELECT 1 FROM quotes WHERE agency_id = ${agencyId})`,
        hasBookings: sql<boolean>`EXISTS(SELECT 1 FROM bookings WHERE agency_id = ${agencyId})`,
      })
      .from(sql`(SELECT 1)`);

    if (dataCheck?.hasBookings) {
      return NextResponse.json(
        { error: "Cannot delete agency with existing bookings. Consider suspending instead." },
        { status: 400 }
      );
    }

    // Delete in order: users -> suppliers -> agency
    await db.delete(agencyUsers).where(eq(agencyUsers.agencyId, agencyId));
    await db.delete(agencySuppliers).where(eq(agencySuppliers.agencyId, agencyId));
    await db.delete(agencies).where(eq(agencies.id, agencyId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting agency:", error);
    return NextResponse.json(
      { error: "Failed to delete agency" },
      { status: 500 }
    );
  }
}
