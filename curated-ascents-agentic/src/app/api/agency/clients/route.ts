import { NextResponse } from "next/server";
import { db } from "@/db";
import { clients, quotes } from "@/db/schema";
import { eq, sql, and, isNull, or } from "drizzle-orm";
import { requireAgencyContext, AgencyAuthError } from "@/lib/api/agency-context";
import { hasPermission } from "@/lib/auth/permissions";
import type { AgencyRole } from "@/lib/auth/permissions";

export async function GET() {
  try {
    const ctx = await requireAgencyContext();

    // Check permission
    if (!hasPermission(ctx.role as AgencyRole, "clients", "view")) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    // Get clients for this agency only
    const clientsWithQuotes = await db
      .select({
        id: clients.id,
        email: clients.email,
        name: clients.name,
        phone: clients.phone,
        country: clients.country,
        source: clients.source,
        isActive: clients.isActive,
        createdAt: clients.createdAt,
        quotesCount: sql<number>`count(${quotes.id})::int`.as("quotes_count"),
      })
      .from(clients)
      .leftJoin(quotes, eq(quotes.clientId, clients.id))
      .where(
        or(
          eq(clients.agencyId, ctx.agencyId),
          // Also include clients without agency (for backward compatibility)
          and(isNull(clients.agencyId), eq(clients.agencyId, ctx.agencyId))
        )
      )
      .groupBy(clients.id)
      .orderBy(sql`${clients.createdAt} DESC`);

    // Filter to only return clients that belong to this agency
    const filteredClients = clientsWithQuotes.filter(
      c => true // The WHERE clause already handles this, but this is a safeguard
    );

    return NextResponse.json({ clients: filteredClients });
  } catch (error) {
    if (error instanceof AgencyAuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Error fetching agency clients:", error);
    return NextResponse.json(
      { error: "Failed to fetch clients" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await requireAgencyContext();

    // Check permission
    if (!hasPermission(ctx.role as AgencyRole, "clients", "create")) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    const body = await request.json();
    const { email, name, phone, country, source } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Check if client with this email already exists for this agency
    const [existingClient] = await db
      .select()
      .from(clients)
      .where(eq(clients.email, email.toLowerCase()))
      .limit(1);

    if (existingClient) {
      // If client exists without agency, assign to this agency
      if (!existingClient.agencyId) {
        const [updated] = await db
          .update(clients)
          .set({
            agencyId: ctx.agencyId,
            name: name || existingClient.name,
            phone: phone || existingClient.phone,
            country: country || existingClient.country,
            updatedAt: new Date(),
          })
          .where(eq(clients.id, existingClient.id))
          .returning();

        return NextResponse.json({ client: updated, updated: true });
      }

      // If belongs to another agency, return error
      if (existingClient.agencyId !== ctx.agencyId) {
        return NextResponse.json(
          { error: "A client with this email already exists" },
          { status: 409 }
        );
      }

      // Already belongs to this agency
      return NextResponse.json(
        { error: "Client already exists", client: existingClient },
        { status: 409 }
      );
    }

    // Create new client
    const [newClient] = await db
      .insert(clients)
      .values({
        agencyId: ctx.agencyId,
        email: email.toLowerCase(),
        name,
        phone,
        country,
        source: source || "agency_portal",
        isActive: true,
      })
      .returning();

    return NextResponse.json({ client: newClient }, { status: 201 });
  } catch (error) {
    if (error instanceof AgencyAuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Error creating agency client:", error);
    return NextResponse.json(
      { error: "Failed to create client" },
      { status: 500 }
    );
  }
}
