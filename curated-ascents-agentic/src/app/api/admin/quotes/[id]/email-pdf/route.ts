import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { quotes, quoteItems, clients } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendEmail } from "@/lib/email/send-email";
import React from "react";
import QuotePdfEmail from "@/lib/email/templates/quote-pdf-email";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { personalMessage } = body;

    // Dynamically import PDF rendering
    const { renderToBuffer } = await import("@react-pdf/renderer");
    const { default: QuoteDocument } = await import("@/lib/pdf/QuoteDocument");

    // Fetch quote with client info
    const quoteResult = await db
      .select({
        id: quotes.id,
        quoteNumber: quotes.quoteNumber,
        quoteName: quotes.quoteName,
        destination: quotes.destination,
        clientId: quotes.clientId,
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

    if (!quote.clientEmail) {
      return NextResponse.json(
        { error: "No client email associated with this quote" },
        { status: 400 }
      );
    }

    // Fetch line items
    const items = await db
      .select()
      .from(quoteItems)
      .where(eq(quoteItems.quoteId, parseInt(id)));

    // Calculate deposit/balance deadlines
    let depositDeadline: string | undefined;
    let balanceDeadline: string | undefined;

    if (quote.startDate) {
      // Deposit due 7 days from now or quote creation
      const depositDate = new Date();
      depositDate.setDate(depositDate.getDate() + 7);
      depositDeadline = depositDate.toISOString();

      // Balance due 30 days before trip
      const balanceDate = new Date(quote.startDate);
      balanceDate.setDate(balanceDate.getDate() - 30);
      balanceDeadline = balanceDate.toISOString();
    }

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
        depositPercent: 30,
        balancePercent: 70,
        depositDeadline,
        balanceDeadline,
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
    const pdfBuffer = await renderToBuffer(pdfElement as any);
    const filename = `${quote.quoteNumber || `Quote-${quote.id}`}.pdf`;

    // Send email with PDF attachment
    const emailResult = await sendEmail({
      to: quote.clientEmail,
      subject: `Your Travel Proposal ${quote.quoteNumber} — CuratedAscents`,
      react: React.createElement(QuotePdfEmail, {
        clientName: quote.clientName || undefined,
        quoteNumber: quote.quoteNumber || `QT-${quote.id}`,
        quoteName: quote.quoteName || undefined,
        destination: quote.destination || undefined,
        startDate: quote.startDate || undefined,
        endDate: quote.endDate || undefined,
        totalAmount: quote.totalSellPrice || undefined,
        validUntil: quote.validUntil || undefined,
        personalMessage: personalMessage || undefined,
      }),
      attachments: [
        {
          filename,
          content: Buffer.from(pdfBuffer),
        },
      ],
      logContext: {
        templateType: "quote_pdf",
        toName: quote.clientName || quote.clientEmail,
        quoteId: quote.id,
        metadata: {
          quoteNumber: quote.quoteNumber,
          destination: quote.destination,
          hasPersonalMessage: !!personalMessage,
        },
      },
    });

    if (!emailResult.sent) {
      return NextResponse.json(
        { error: "Failed to send email", details: emailResult.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Quote PDF sent to ${quote.clientEmail}`,
      emailLogId: emailResult.emailLogId,
    });
  } catch (error) {
    console.error("Error sending quote PDF email:", error);
    return NextResponse.json(
      {
        error: "Failed to send quote PDF",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
