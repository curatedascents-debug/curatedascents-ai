import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bookings, quotes, quoteItems, clients } from "@/db/schema";
import { eq } from "drizzle-orm";
import React from "react";
import { sendEmail } from "@/lib/email/send-email";
import PaymentReceivedEmail from "@/lib/email/templates/payment-received";
import AdminNotificationEmail from "@/lib/email/templates/admin-notification";

// Disable caching for this route
export const dynamic = "force-dynamic";
export const revalidate = 0;

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "curatedascents@gmail.com";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const bookingResult = await db
      .select({
        id: bookings.id,
        bookingReference: bookings.bookingReference,
        quoteId: bookings.quoteId,
        clientId: bookings.clientId,
        clientName: clients.name,
        clientEmail: clients.email,
        destination: quotes.destination,
        quoteName: quotes.quoteName,
        quoteNumber: quotes.quoteNumber,
        numberOfPax: quotes.numberOfPax,
        status: bookings.status,
        paymentStatus: bookings.paymentStatus,
        totalAmount: bookings.totalAmount,
        paidAmount: bookings.paidAmount,
        balanceAmount: bookings.balanceAmount,
        currency: bookings.currency,
        operationsNotes: bookings.operationsNotes,
        supplierConfirmations: bookings.supplierConfirmations,
        createdAt: bookings.createdAt,
        updatedAt: bookings.updatedAt,
      })
      .from(bookings)
      .leftJoin(clients, eq(bookings.clientId, clients.id))
      .leftJoin(quotes, eq(bookings.quoteId, quotes.id))
      .where(eq(bookings.id, parseInt(id)))
      .limit(1);

    if (bookingResult.length === 0) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Get quote items
    const booking = bookingResult[0];
    let items: any[] = [];
    if (booking.quoteId) {
      items = await db
        .select()
        .from(quoteItems)
        .where(eq(quoteItems.quoteId, booking.quoteId));
    }

    return NextResponse.json({
      success: true,
      booking,
      quoteItems: items,
    });
  } catch (error) {
    console.error("Error fetching booking:", error);
    return NextResponse.json({ error: "Failed to fetch booking" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const existing = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const booking = existing[0];
    const updateData: any = { updatedAt: new Date() };

    // Record payment
    if (body.paymentAmount !== undefined) {
      const paymentAmount = parseFloat(body.paymentAmount);
      if (paymentAmount <= 0) {
        return NextResponse.json({ error: "Payment amount must be positive" }, { status: 400 });
      }

      const currentPaid = parseFloat(booking.paidAmount || "0");
      const total = parseFloat(booking.totalAmount || "0");
      const newPaid = currentPaid + paymentAmount;
      const newBalance = Math.max(0, total - newPaid);

      updateData.paidAmount = newPaid.toFixed(2);
      updateData.balanceAmount = newBalance.toFixed(2);

      if (newBalance <= 0) {
        updateData.paymentStatus = "paid";
      } else if (newPaid > 0) {
        updateData.paymentStatus = "partial";
      }
    }

    if (body.status) updateData.status = body.status;
    if (body.operationsNotes !== undefined) updateData.operationsNotes = body.operationsNotes;
    if (body.supplierConfirmations !== undefined) updateData.supplierConfirmations = body.supplierConfirmations;

    const result = await db
      .update(bookings)
      .set(updateData)
      .where(eq(bookings.id, parseInt(id)))
      .returning();

    // Send payment received email if a payment was recorded
    let emailStatus: { sent: boolean; error?: string } = { sent: false };

    if (body.paymentAmount !== undefined && result[0]) {
      const updated = result[0];
      let clientName: string | undefined;
      let clientEmail: string | undefined;

      if (booking.clientId) {
        const clientResult = await db
          .select({ email: clients.email, name: clients.name })
          .from(clients)
          .where(eq(clients.id, booking.clientId))
          .limit(1);

        const client = clientResult[0];
        clientName = client?.name || undefined;
        clientEmail = client?.email || undefined;

        if (clientEmail) {
          emailStatus = await sendEmail({
            to: clientEmail,
            subject: `Payment Received: ${booking.bookingReference || `Booking #${id}`} — CuratedAscents`,
            react: React.createElement(PaymentReceivedEmail, {
              clientName,
              bookingReference: booking.bookingReference || `Booking #${id}`,
              paymentAmount: parseFloat(body.paymentAmount).toFixed(2),
              totalPaid: updated.paidAmount || "0.00",
              totalAmount: updated.totalAmount || "0.00",
              balanceAmount: updated.balanceAmount || "0.00",
              paymentStatus: updated.paymentStatus || "pending",
              currency: updated.currency || "USD",
            }),
            logContext: {
              templateType: "payment_received",
              toName: clientName,
              clientId: booking.clientId,
              bookingId: parseInt(id),
              metadata: { paymentAmount: body.paymentAmount },
            },
          });
        }
      }

      // Send admin notification for payment (fire-and-forget)
      sendEmail({
        to: ADMIN_EMAIL,
        subject: `Payment Received: ${booking.bookingReference || `Booking #${id}`} — CuratedAscents`,
        react: React.createElement(AdminNotificationEmail, {
          notificationType: "payment_received",
          clientName,
          clientEmail,
          bookingReference: booking.bookingReference || `Booking #${id}`,
          paymentAmount: parseFloat(body.paymentAmount).toFixed(2),
          paidAmount: updated.paidAmount || "0.00",
          balanceAmount: updated.balanceAmount || "0.00",
          paymentStatus: updated.paymentStatus || "pending",
        }),
        logContext: {
          templateType: "admin_notification",
          toName: "Admin",
          clientId: booking.clientId || undefined,
          bookingId: parseInt(id),
          metadata: { notificationType: "payment_received", paymentAmount: body.paymentAmount },
        },
      }).catch((err) => console.error("Admin payment notification failed:", err));
    }

    return NextResponse.json({
      success: true,
      message: "Booking updated successfully",
      booking: result[0],
      emailStatus,
    });
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      { error: "Failed to update booking", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
