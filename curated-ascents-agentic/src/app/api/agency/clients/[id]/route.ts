import { NextResponse } from "next/server";
import { db } from "@/db";
import { clients, quotes } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { requireAgencyContext, AgencyAuthError } from "@/lib/api/agency-context";
import { hasPermission } from "@/lib/auth/permissions";
import type { AgencyRole } from "@/lib/auth/permissions";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await requireAgencyContext();
    const { id } = await params;
    const clientId = parseInt(id, 10);

    if (isNaN(clientId)) {
      return NextResponse.json({ error: "Invalid client ID" }, { status: 400 });
    }

    // Check permission
    if (!hasPermission(ctx.role as AgencyRole, "clients", "view")) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    // Get client (must belong to this agency)
    const [client] = await db
      .select()
      .from(clients)
      .where(
        and(
          eq(clients.id, clientId),
          eq(clients.agencyId, ctx.agencyId)
        )
      )
      .limit(1);

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Get linked quotes
    const clientQuotes = await db
      .select({
        id: quotes.id,
        quoteNumber: quotes.quoteNumber,
        quoteName: quotes.quoteName,
        destination: quotes.destination,
        totalSellPrice: quotes.totalSellPrice,
        status: quotes.status,
        createdAt: quotes.createdAt,
      })
      .from(quotes)
      .where(eq(quotes.clientId, clientId))
      .orderBy(sql`${quotes.createdAt} DESC`);

    return NextResponse.json({
      client,
      quotes: clientQuotes,
    });
  } catch (error) {
    if (error instanceof AgencyAuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Error fetching client:", error);
    return NextResponse.json(
      { error: "Failed to fetch client" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await requireAgencyContext();
    const { id } = await params;
    const clientId = parseInt(id, 10);

    if (isNaN(clientId)) {
      return NextResponse.json({ error: "Invalid client ID" }, { status: 400 });
    }

    // Check permission
    if (!hasPermission(ctx.role as AgencyRole, "clients", "update")) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    // Verify client belongs to this agency
    const [existingClient] = await db
      .select()
      .from(clients)
      .where(
        and(
          eq(clients.id, clientId),
          eq(clients.agencyId, ctx.agencyId)
        )
      )
      .limit(1);

    if (!existingClient) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const body = await request.json();
    const { name, phone, country, source, isActive } = body;

    const [updatedClient] = await db
      .update(clients)
      .set({
        name,
        phone,
        country,
        source,
        isActive,
        updatedAt: new Date(),
      })
      .where(eq(clients.id, clientId))
      .returning();

    return NextResponse.json({ client: updatedClient });
  } catch (error) {
    if (error instanceof AgencyAuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Error updating client:", error);
    return NextResponse.json(
      { error: "Failed to update client" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await requireAgencyContext();
    const { id } = await params;
    const clientId = parseInt(id, 10);

    if (isNaN(clientId)) {
      return NextResponse.json({ error: "Invalid client ID" }, { status: 400 });
    }

    // Check permission
    if (!hasPermission(ctx.role as AgencyRole, "clients", "delete")) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    // Verify client belongs to this agency
    const [existingClient] = await db
      .select()
      .from(clients)
      .where(
        and(
          eq(clients.id, clientId),
          eq(clients.agencyId, ctx.agencyId)
        )
      )
      .limit(1);

    if (!existingClient) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Check if client has quotes
    const [quoteCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(quotes)
      .where(eq(quotes.clientId, clientId));

    if (quoteCount && quoteCount.count > 0) {
      return NextResponse.json(
        { error: "Cannot delete client with linked quotes" },
        { status: 400 }
      );
    }

    await db.delete(clients).where(eq(clients.id, clientId));

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AgencyAuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Error deleting client:", error);
    return NextResponse.json(
      { error: "Failed to delete client" },
      { status: 500 }
    );
  }
}
