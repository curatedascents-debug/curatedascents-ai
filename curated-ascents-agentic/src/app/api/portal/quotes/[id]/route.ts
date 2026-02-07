import { NextResponse } from "next/server";
import { db } from "@/db";
import { quotes, quoteItems } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const clientId = parseInt(request.headers.get("x-customer-id") || "0");
  if (!clientId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const quoteId = parseInt(id);

  try {
    const quote = await db
      .select({
        id: quotes.id,
        quoteNumber: quotes.quoteNumber,
        quoteName: quotes.quoteName,
        destination: quotes.destination,
        startDate: quotes.startDate,
        endDate: quotes.endDate,
        numberOfPax: quotes.numberOfPax,
        totalSellPrice: quotes.totalSellPrice,
        perPersonPrice: quotes.perPersonPrice,
        currency: quotes.currency,
        status: quotes.status,
        inclusionsSummary: quotes.inclusionsSummary,
        exclusionsSummary: quotes.exclusionsSummary,
        clientId: quotes.clientId,
      })
      .from(quotes)
      .where(and(eq(quotes.id, quoteId), eq(quotes.clientId, clientId)))
      .then((rows) => rows[0]);

    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    // Get items - STRIP cost/margin fields (security boundary)
    const items = await db
      .select({
        id: quoteItems.id,
        serviceType: quoteItems.serviceType,
        description: quoteItems.description,
        quantity: quoteItems.quantity,
        unitPrice: quoteItems.sellPrice,
        totalPrice: quoteItems.sellPrice,
      })
      .from(quoteItems)
      .where(eq(quoteItems.quoteId, quoteId));

    // Calculate totalPrice as sellPrice * quantity
    const sanitizedItems = items.map((item) => ({
      id: item.id,
      serviceType: item.serviceType,
      description: item.description || item.serviceType,
      quantity: item.quantity || 1,
      unitPrice: item.unitPrice || "0",
      totalPrice: String(Number(item.unitPrice || 0) * (item.quantity || 1)),
    }));

    return NextResponse.json({
      id: quote.id,
      quoteNumber: quote.quoteNumber,
      quoteName: quote.quoteName,
      destination: quote.destination,
      startDate: quote.startDate,
      endDate: quote.endDate,
      numberOfPax: quote.numberOfPax,
      totalSellPrice: quote.totalSellPrice || "0",
      perPersonPrice: quote.perPersonPrice,
      currency: quote.currency || "USD",
      status: quote.status || "draft",
      inclusionsSummary: quote.inclusionsSummary,
      exclusionsSummary: quote.exclusionsSummary,
      items: sanitizedItems,
    });
  } catch (error) {
    console.error("Quote detail error:", error);
    return NextResponse.json({ error: "Failed to load quote" }, { status: 500 });
  }
}
