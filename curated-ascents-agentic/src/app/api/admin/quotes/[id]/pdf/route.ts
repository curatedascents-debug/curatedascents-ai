import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { quotes, quoteItems, clients } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Dynamically import to keep server-only
    const { renderToBuffer } = await import("@react-pdf/renderer");
    const { default: React } = await import("react");
    const { default: QuoteDocument } = await import("@/lib/pdf/QuoteDocument");

    // Fetch quote with client info
    const quoteResult = await db
      .select({
        id: quotes.id,
        quoteNumber: quotes.quoteNumber,
        quoteName: quotes.quoteName,
        destination: quotes.destination,
        clientName: clients.name,
        clientEmail: clients.email,
        numberOfPax: quotes.numberOfPax,
        numberOfRooms: quotes.numberOfRooms,
        startDate: quotes.startDate,
        endDate: quotes.endDate,
        validUntil: quotes.validUntil,
        totalSellPrice: quotes.totalSellPrice,
        perPersonPrice: quotes.perPersonPrice,
        currency: quotes.currency,
        inclusionsSummary: quotes.inclusionsSummary,
        exclusionsSummary: quotes.exclusionsSummary,
        termsConditions: quotes.termsConditions,
        notes: quotes.notes,
        createdAt: quotes.createdAt,
      })
      .from(quotes)
      .leftJoin(clients, eq(quotes.clientId, clients.id))
      .where(eq(quotes.id, parseInt(id)))
      .limit(1);

    if (quoteResult.length === 0) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    const quote = quoteResult[0];

    // Fetch line items
    const items = await db
      .select()
      .from(quoteItems)
      .where(eq(quoteItems.quoteId, parseInt(id)));

    // Render PDF to buffer
    const pdfElement = React.createElement(QuoteDocument, {
      quote: {
        quoteNumber: quote.quoteNumber || `QT-${quote.id}`,
        quoteName: quote.quoteName || undefined,
        destination: quote.destination || undefined,
        clientName: quote.clientName || undefined,
        clientEmail: quote.clientEmail || undefined,
        numberOfPax: quote.numberOfPax || undefined,
        numberOfRooms: quote.numberOfRooms || undefined,
        startDate: quote.startDate || undefined,
        endDate: quote.endDate || undefined,
        validUntil: quote.validUntil || undefined,
        totalSellPrice: quote.totalSellPrice || undefined,
        perPersonPrice: quote.perPersonPrice || undefined,
        currency: quote.currency || undefined,
        inclusionsSummary: quote.inclusionsSummary || undefined,
        exclusionsSummary: quote.exclusionsSummary || undefined,
        termsConditions: quote.termsConditions || undefined,
        notes: quote.notes || undefined,
        createdAt: quote.createdAt?.toISOString() || undefined,
      },
      items: items.map((item) => ({
        serviceName: item.serviceName || undefined,
        serviceType: item.serviceType,
        description: item.description || undefined,
        quantity: item.quantity || undefined,
        days: item.days || undefined,
        nights: item.nights || undefined,
        sellPrice: item.sellPrice || undefined,
        notes: item.notes || undefined,
      })),
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buffer = await renderToBuffer(pdfElement as any);

    const filename = `${quote.quoteNumber || `Quote-${quote.id}`}.pdf`;

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
