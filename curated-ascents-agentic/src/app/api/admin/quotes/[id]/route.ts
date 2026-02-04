import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { quotes, quoteItems, clients } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendEmail } from "@/lib/email/send-email";
import React from "react";
import QuoteSentEmail from "@/lib/email/templates/quote-sent";
import QuoteExpiredEmail from "@/lib/email/templates/quote-expired";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const quoteResult = await db
      .select({
        id: quotes.id,
        quoteNumber: quotes.quoteNumber,
        quoteName: quotes.quoteName,
        destination: quotes.destination,
        clientId: quotes.clientId,
        clientName: clients.name,
        clientEmail: clients.email,
        startDate: quotes.startDate,
        endDate: quotes.endDate,
        numberOfPax: quotes.numberOfPax,
        numberOfRooms: quotes.numberOfRooms,
        totalSellPrice: quotes.totalSellPrice,
        totalCostPrice: quotes.totalCostPrice,
        totalMargin: quotes.totalMargin,
        marginPercent: quotes.marginPercent,
        perPersonPrice: quotes.perPersonPrice,
        currency: quotes.currency,
        isMICE: quotes.isMICE,
        status: quotes.status,
        validUntil: quotes.validUntil,
        pdfUrl: quotes.pdfUrl,
        inclusionsSummary: quotes.inclusionsSummary,
        exclusionsSummary: quotes.exclusionsSummary,
        termsConditions: quotes.termsConditions,
        notes: quotes.notes,
        createdAt: quotes.createdAt,
        updatedAt: quotes.updatedAt,
      })
      .from(quotes)
      .leftJoin(clients, eq(quotes.clientId, clients.id))
      .where(eq(quotes.id, parseInt(id)))
      .limit(1);

    if (quoteResult.length === 0) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    const items = await db
      .select()
      .from(quoteItems)
      .where(eq(quoteItems.quoteId, parseInt(id)));

    return NextResponse.json({
      success: true,
      quote: quoteResult[0],
      items,
    });
  } catch (error) {
    console.error("Error fetching quote:", error);
    return NextResponse.json({ error: "Failed to fetch quote" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updateData: any = { updatedAt: new Date() };

    // Status transitions: draft -> sent -> accepted | expired
    if (body.status) {
      const current = await db.select({ status: quotes.status }).from(quotes).where(eq(quotes.id, parseInt(id))).limit(1);
      const currentStatus = current[0]?.status || "draft";

      const validTransitions: Record<string, string[]> = {
        draft: ["sent", "expired"],
        sent: ["accepted", "expired"],
        accepted: ["expired"],
        expired: [],
      };

      if (!validTransitions[currentStatus]?.includes(body.status)) {
        return NextResponse.json(
          { error: `Cannot transition from ${currentStatus} to ${body.status}` },
          { status: 400 }
        );
      }

      updateData.status = body.status;
    }

    const allowedFields = [
      "quoteName", "destination", "startDate", "endDate",
      "numberOfPax", "numberOfRooms", "totalSellPrice", "totalCostPrice",
      "totalMargin", "marginPercent", "perPersonPrice", "currency",
      "isMICE", "validUntil", "inclusionsSummary", "exclusionsSummary",
      "termsConditions", "notes", "pdfUrl",
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const result = await db
      .update(quotes)
      .set(updateData)
      .where(eq(quotes.id, parseInt(id)))
      .returning();

    if (!result || result.length === 0) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    // If items are provided, update line items (delete and recreate)
    if (body.items && Array.isArray(body.items)) {
      await db.delete(quoteItems).where(eq(quoteItems.quoteId, parseInt(id)));

      if (body.items.length > 0) {
        const itemsToInsert = body.items.map((item: any) => ({
          quoteId: parseInt(id),
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
          currency: result[0].currency || "USD",
        }));

        await db.insert(quoteItems).values(itemsToInsert);
      }
    }

    // Send email notifications on status transitions (fire-and-forget)
    let emailStatus: { sent: boolean; error?: string } = { sent: false };

    if (body.status === "sent" || body.status === "expired") {
      // Fetch client email and quote details for the email
      const quoteWithClient = await db
        .select({
          quoteNumber: quotes.quoteNumber,
          quoteName: quotes.quoteName,
          destination: quotes.destination,
          startDate: quotes.startDate,
          endDate: quotes.endDate,
          numberOfPax: quotes.numberOfPax,
          totalSellPrice: quotes.totalSellPrice,
          currency: quotes.currency,
          validUntil: quotes.validUntil,
          clientEmail: clients.email,
          clientName: clients.name,
        })
        .from(quotes)
        .leftJoin(clients, eq(quotes.clientId, clients.id))
        .where(eq(quotes.id, parseInt(id)))
        .limit(1);

      const q = quoteWithClient[0];
      const clientEmail = q?.clientEmail;
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || undefined;

      if (clientEmail) {
        if (body.status === "sent") {
          // Generate PDF attachment
          let pdfBuffer: Buffer | undefined;
          try {
            const { renderToBuffer } = await import("@react-pdf/renderer");
            const { default: QuoteDocument } = await import("@/lib/pdf/QuoteDocument");

            const items = await db
              .select()
              .from(quoteItems)
              .where(eq(quoteItems.quoteId, parseInt(id)));

            const pdfElement = React.createElement(QuoteDocument, {
              quote: {
                quoteNumber: q.quoteNumber || `QT-${id}`,
                quoteName: q.quoteName || undefined,
                destination: q.destination || undefined,
                clientName: q.clientName || undefined,
                clientEmail: q.clientEmail || undefined,
                numberOfPax: q.numberOfPax || undefined,
                startDate: q.startDate || undefined,
                endDate: q.endDate || undefined,
                validUntil: q.validUntil || undefined,
                totalSellPrice: q.totalSellPrice || undefined,
                currency: q.currency || undefined,
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
            pdfBuffer = Buffer.from(buffer);
          } catch (pdfErr) {
            console.error("PDF generation for email failed:", pdfErr);
          }

          emailStatus = await sendEmail({
            to: clientEmail,
            subject: `Your Travel Quote ${q.quoteNumber || ""} from CuratedAscents`,
            react: React.createElement(QuoteSentEmail, {
              clientName: q.clientName || undefined,
              quoteNumber: q.quoteNumber || `QT-${id}`,
              destination: q.destination || undefined,
              startDate: q.startDate || undefined,
              endDate: q.endDate || undefined,
              numberOfPax: q.numberOfPax || undefined,
              totalSellPrice: q.totalSellPrice || undefined,
              currency: q.currency || undefined,
              validUntil: q.validUntil || undefined,
              appUrl,
            }),
            attachments: pdfBuffer
              ? [{ filename: `${q.quoteNumber || `Quote-${id}`}.pdf`, content: pdfBuffer }]
              : undefined,
          });
        } else if (body.status === "expired") {
          emailStatus = await sendEmail({
            to: clientEmail,
            subject: `Quote ${q.quoteNumber || ""} has expired — CuratedAscents`,
            react: React.createElement(QuoteExpiredEmail, {
              clientName: q.clientName || undefined,
              quoteNumber: q.quoteNumber || `QT-${id}`,
              destination: q.destination || undefined,
              appUrl,
            }),
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Quote updated successfully",
      quote: result[0],
      emailStatus,
    });
  } catch (error) {
    console.error("Error updating quote:", error);
    return NextResponse.json(
      { error: "Failed to update quote", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Only allow deleting drafts
    const existing = await db.select({ status: quotes.status }).from(quotes).where(eq(quotes.id, parseInt(id))).limit(1);
    if (existing[0]?.status !== "draft") {
      return NextResponse.json({ error: "Can only delete draft quotes" }, { status: 400 });
    }

    // Delete line items first
    await db.delete(quoteItems).where(eq(quoteItems.quoteId, parseInt(id)));
    await db.delete(quotes).where(eq(quotes.id, parseInt(id)));

    return NextResponse.json({ success: true, message: "Quote deleted successfully" });
  } catch (error) {
    console.error("Error deleting quote:", error);
    return NextResponse.json({ error: "Failed to delete quote" }, { status: 500 });
  }
}
