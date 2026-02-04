import { NextResponse } from "next/server";
import { db } from "@/db";
import { quotes, quoteItems, clients } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { requireAgencyContext, AgencyAuthError } from "@/lib/api/agency-context";
import { hasPermission } from "@/lib/auth/permissions";
import type { AgencyRole } from "@/lib/auth/permissions";

export async function GET() {
  try {
    const ctx = await requireAgencyContext();

    // Check permission
    if (!hasPermission(ctx.role as AgencyRole, "quotes", "view")) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    // Get quotes for this agency only
    const quotesWithClients = await db
      .select({
        id: quotes.id,
        quoteNumber: quotes.quoteNumber,
        quoteName: quotes.quoteName,
        destination: quotes.destination,
        numberOfPax: quotes.numberOfPax,
        totalSellPrice: quotes.totalSellPrice,
        currency: quotes.currency,
        status: quotes.status,
        validUntil: quotes.validUntil,
        createdAt: quotes.createdAt,
        clientName: clients.name,
        clientEmail: clients.email,
      })
      .from(quotes)
      .leftJoin(clients, eq(quotes.clientId, clients.id))
      .where(eq(quotes.agencyId, ctx.agencyId))
      .orderBy(sql`${quotes.createdAt} DESC`);

    return NextResponse.json({ quotes: quotesWithClients });
  } catch (error) {
    if (error instanceof AgencyAuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Error fetching agency quotes:", error);
    return NextResponse.json(
      { error: "Failed to fetch quotes" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await requireAgencyContext();

    // Check permission
    if (!hasPermission(ctx.role as AgencyRole, "quotes", "create")) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    const body = await request.json();
    const {
      clientId,
      quoteName,
      destination,
      startDate,
      endDate,
      numberOfPax,
      numberOfRooms,
      currency,
      isMICE,
      validUntil,
      inclusionsSummary,
      exclusionsSummary,
      termsConditions,
      notes,
      items,
    } = body;

    // Verify client belongs to this agency if provided
    if (clientId) {
      const [client] = await db
        .select()
        .from(clients)
        .where(eq(clients.id, clientId))
        .limit(1);

      if (!client) {
        return NextResponse.json(
          { error: "Client not found" },
          { status: 404 }
        );
      }

      // If client has an agency, ensure it matches
      if (client.agencyId && client.agencyId !== ctx.agencyId) {
        return NextResponse.json(
          { error: "Client does not belong to your agency" },
          { status: 403 }
        );
      }
    }

    // Generate quote number
    const year = new Date().getFullYear();
    const [lastQuote] = await db
      .select({ quoteNumber: quotes.quoteNumber })
      .from(quotes)
      .where(eq(quotes.agencyId, ctx.agencyId))
      .orderBy(sql`${quotes.id} DESC`)
      .limit(1);

    let nextNumber = 1;
    if (lastQuote?.quoteNumber) {
      const match = lastQuote.quoteNumber.match(/Q-(\d+)-(\d+)/);
      if (match && parseInt(match[1]) === year) {
        nextNumber = parseInt(match[2]) + 1;
      }
    }
    const quoteNumber = `Q-${year}-${String(nextNumber).padStart(4, "0")}`;

    // Calculate totals from items
    let totalCost = 0;
    let totalSell = 0;

    if (items && Array.isArray(items)) {
      for (const item of items) {
        const qty = item.quantity || 1;
        const cost = parseFloat(item.costPrice || "0");
        const sell = parseFloat(item.sellPrice || "0");
        totalCost += cost * qty;
        totalSell += sell * qty;
      }
    }

    const totalMargin = totalSell - totalCost;
    const marginPercent = totalCost > 0 ? ((totalMargin / totalCost) * 100).toFixed(2) : "0";
    const perPersonPrice = numberOfPax && numberOfPax > 0 ? (totalSell / numberOfPax).toFixed(2) : null;

    // Create the quote
    const [newQuote] = await db
      .insert(quotes)
      .values({
        agencyId: ctx.agencyId,
        agencyUserId: ctx.userId,
        clientId,
        quoteNumber,
        quoteName,
        destination,
        startDate,
        endDate,
        numberOfPax,
        numberOfRooms,
        totalSellPrice: totalSell.toFixed(2),
        totalCostPrice: totalCost.toFixed(2),
        totalMargin: totalMargin.toFixed(2),
        marginPercent,
        perPersonPrice,
        currency: currency || "USD",
        isMICE: isMICE || false,
        status: "draft",
        validUntil,
        inclusionsSummary,
        exclusionsSummary,
        termsConditions,
        notes,
      })
      .returning();

    // Save line items
    if (items && Array.isArray(items) && items.length > 0) {
      const itemsToInsert = items.map((item: any) => ({
        quoteId: newQuote.id,
        serviceType: item.serviceType || "miscellaneous",
        serviceName: item.serviceName,
        description: item.description,
        quantity: item.quantity || 1,
        costPrice: item.costPrice || "0",
        sellPrice: item.sellPrice || "0",
        margin: (
          (parseFloat(item.sellPrice || "0") - parseFloat(item.costPrice || "0")) *
          (item.quantity || 1)
        ).toFixed(2),
        currency: currency || "USD",
      }));

      await db.insert(quoteItems).values(itemsToInsert);
    }

    return NextResponse.json({ quote: newQuote }, { status: 201 });
  } catch (error) {
    if (error instanceof AgencyAuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Error creating agency quote:", error);
    return NextResponse.json(
      { error: "Failed to create quote" },
      { status: 500 }
    );
  }
}
