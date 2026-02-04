import { NextResponse } from "next/server";
import { db } from "@/db";
import { quotes, quoteItems, clients } from "@/db/schema";
import { eq, and } from "drizzle-orm";
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
    const quoteId = parseInt(id, 10);

    if (isNaN(quoteId)) {
      return NextResponse.json({ error: "Invalid quote ID" }, { status: 400 });
    }

    // Check permission
    if (!hasPermission(ctx.role as AgencyRole, "quotes", "view")) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    // Get quote (must belong to this agency)
    const [quote] = await db
      .select({
        id: quotes.id,
        quoteNumber: quotes.quoteNumber,
        quoteName: quotes.quoteName,
        destination: quotes.destination,
        startDate: quotes.startDate,
        endDate: quotes.endDate,
        numberOfPax: quotes.numberOfPax,
        numberOfRooms: quotes.numberOfRooms,
        totalSellPrice: quotes.totalSellPrice,
        perPersonPrice: quotes.perPersonPrice,
        totalCostPrice: quotes.totalCostPrice,
        totalMargin: quotes.totalMargin,
        marginPercent: quotes.marginPercent,
        currency: quotes.currency,
        isMICE: quotes.isMICE,
        status: quotes.status,
        validUntil: quotes.validUntil,
        inclusionsSummary: quotes.inclusionsSummary,
        exclusionsSummary: quotes.exclusionsSummary,
        termsConditions: quotes.termsConditions,
        notes: quotes.notes,
        createdAt: quotes.createdAt,
        clientName: clients.name,
        clientEmail: clients.email,
      })
      .from(quotes)
      .leftJoin(clients, eq(quotes.clientId, clients.id))
      .where(
        and(
          eq(quotes.id, quoteId),
          eq(quotes.agencyId, ctx.agencyId)
        )
      )
      .limit(1);

    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    // Get quote items
    const items = await db
      .select()
      .from(quoteItems)
      .where(eq(quoteItems.quoteId, quoteId));

    return NextResponse.json({
      quote,
      items,
    });
  } catch (error) {
    if (error instanceof AgencyAuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Error fetching quote:", error);
    return NextResponse.json(
      { error: "Failed to fetch quote" },
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
    const quoteId = parseInt(id, 10);

    if (isNaN(quoteId)) {
      return NextResponse.json({ error: "Invalid quote ID" }, { status: 400 });
    }

    // Check permission
    if (!hasPermission(ctx.role as AgencyRole, "quotes", "update")) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    // Verify quote belongs to this agency
    const [existingQuote] = await db
      .select()
      .from(quotes)
      .where(
        and(
          eq(quotes.id, quoteId),
          eq(quotes.agencyId, ctx.agencyId)
        )
      )
      .limit(1);

    if (!existingQuote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    const body = await request.json();
    const {
      status,
      quoteName,
      destination,
      startDate,
      endDate,
      numberOfPax,
      numberOfRooms,
      validUntil,
      notes,
      inclusionsSummary,
      exclusionsSummary,
      totalSellPrice,
      totalCostPrice,
      totalMargin,
      marginPercent,
      perPersonPrice,
      items,
    } = body;

    // Build update object
    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (status !== undefined) updateData.status = status;
    if (quoteName !== undefined) updateData.quoteName = quoteName;
    if (destination !== undefined) updateData.destination = destination;
    if (startDate !== undefined) updateData.startDate = startDate;
    if (endDate !== undefined) updateData.endDate = endDate;
    if (numberOfPax !== undefined) updateData.numberOfPax = numberOfPax;
    if (numberOfRooms !== undefined) updateData.numberOfRooms = numberOfRooms;
    if (validUntil !== undefined) updateData.validUntil = validUntil;
    if (notes !== undefined) updateData.notes = notes;
    if (inclusionsSummary !== undefined) updateData.inclusionsSummary = inclusionsSummary;
    if (exclusionsSummary !== undefined) updateData.exclusionsSummary = exclusionsSummary;
    if (totalSellPrice !== undefined) updateData.totalSellPrice = totalSellPrice;
    if (totalCostPrice !== undefined) updateData.totalCostPrice = totalCostPrice;
    if (totalMargin !== undefined) updateData.totalMargin = totalMargin;
    if (marginPercent !== undefined) updateData.marginPercent = marginPercent;
    if (perPersonPrice !== undefined) updateData.perPersonPrice = perPersonPrice;

    const [updatedQuote] = await db
      .update(quotes)
      .set(updateData)
      .where(eq(quotes.id, quoteId))
      .returning();

    // If items are provided, update line items
    if (items && Array.isArray(items)) {
      // Delete existing items and insert new ones
      await db.delete(quoteItems).where(eq(quoteItems.quoteId, quoteId));

      if (items.length > 0) {
        const itemsToInsert = items.map((item: any) => ({
          quoteId: quoteId,
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
          currency: updatedQuote.currency || "USD",
        }));

        await db.insert(quoteItems).values(itemsToInsert);
      }
    }

    return NextResponse.json({ quote: updatedQuote });
  } catch (error) {
    if (error instanceof AgencyAuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Error updating quote:", error);
    return NextResponse.json(
      { error: "Failed to update quote" },
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
    const quoteId = parseInt(id, 10);

    if (isNaN(quoteId)) {
      return NextResponse.json({ error: "Invalid quote ID" }, { status: 400 });
    }

    // Check permission
    if (!hasPermission(ctx.role as AgencyRole, "quotes", "delete")) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    // Verify quote belongs to this agency
    const [existingQuote] = await db
      .select()
      .from(quotes)
      .where(
        and(
          eq(quotes.id, quoteId),
          eq(quotes.agencyId, ctx.agencyId)
        )
      )
      .limit(1);

    if (!existingQuote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    // Only allow deletion of draft quotes
    if (existingQuote.status !== "draft") {
      return NextResponse.json(
        { error: "Only draft quotes can be deleted" },
        { status: 400 }
      );
    }

    // Delete quote items first
    await db.delete(quoteItems).where(eq(quoteItems.quoteId, quoteId));

    // Delete quote
    await db.delete(quotes).where(eq(quotes.id, quoteId));

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AgencyAuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Error deleting quote:", error);
    return NextResponse.json(
      { error: "Failed to delete quote" },
      { status: 500 }
    );
  }
}
