import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { paymentMilestones, bookings, bookingEvents, clients } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import React from "react";
import { sendEmail } from "@/lib/email/send-email";
import PaymentReceivedEmail from "@/lib/email/templates/payment-received";
import AdminNotificationEmail from "@/lib/email/templates/admin-notification";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "curatedascents@gmail.com";

// PUT /api/admin/bookings/[id]/milestones/[mid] - Update milestone (record payment)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; mid: string }> }
) {
  try {
    const { id, mid } = await params;
    const bookingId = parseInt(id);
    const milestoneId = parseInt(mid);
    const body = await req.json();

    // Verify milestone exists and belongs to booking
    const milestoneResult = await db
      .select()
      .from(paymentMilestones)
      .where(eq(paymentMilestones.id, milestoneId))
      .limit(1);

    if (milestoneResult.length === 0) {
      return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
    }

    const milestone = milestoneResult[0];
    if (milestone.bookingId !== bookingId) {
      return NextResponse.json({ error: "Milestone does not belong to this booking" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    // Handle payment recording
    if (body.paidAmount !== undefined) {
      const paidAmount = parseFloat(body.paidAmount);
      if (paidAmount <= 0) {
        return NextResponse.json({ error: "Payment amount must be positive" }, { status: 400 });
      }

      const currentPaid = parseFloat(milestone.paidAmount || "0");
      const expectedAmount = parseFloat(milestone.amount || "0");
      const newPaid = currentPaid + paidAmount;

      updateData.paidAmount = newPaid.toFixed(2);
      updateData.paidDate = new Date().toISOString().split('T')[0];

      if (newPaid >= expectedAmount) {
        updateData.status = "paid";
      }

      // Update the main booking payment amounts
      const bookingResult = await db
        .select()
        .from(bookings)
        .where(eq(bookings.id, bookingId))
        .limit(1);

      if (bookingResult.length > 0) {
        const booking = bookingResult[0];
        const bookingCurrentPaid = parseFloat(booking.paidAmount || "0");
        const bookingTotal = parseFloat(booking.totalAmount || "0");
        const bookingNewPaid = bookingCurrentPaid + paidAmount;
        const bookingNewBalance = Math.max(0, bookingTotal - bookingNewPaid);

        const bookingUpdateData: Record<string, unknown> = {
          paidAmount: bookingNewPaid.toFixed(2),
          balanceAmount: bookingNewBalance.toFixed(2),
          updatedAt: new Date(),
        };

        if (bookingNewBalance <= 0) {
          bookingUpdateData.paymentStatus = "paid";
        } else if (bookingNewPaid > 0) {
          bookingUpdateData.paymentStatus = "partial";
        }

        await db
          .update(bookings)
          .set(bookingUpdateData)
          .where(eq(bookings.id, bookingId));

        // Log the payment event
        await db.insert(bookingEvents).values({
          bookingId,
          eventType: "payment_received",
          eventData: {
            milestoneId,
            milestoneType: milestone.milestoneType,
            paymentAmount: paidAmount,
            newPaidTotal: bookingNewPaid,
            newBalance: bookingNewBalance,
          },
          performedBy: "admin",
        });

        // Send payment confirmation email
        let clientName: string | undefined;
        let clientEmail: string | undefined;

        if (booking.clientId) {
          const clientResult = await db
            .select({ email: clients.email, name: clients.name })
            .from(clients)
            .where(eq(clients.id, booking.clientId))
            .limit(1);

          if (clientResult.length > 0) {
            clientName = clientResult[0].name || undefined;
            clientEmail = clientResult[0].email || undefined;

            if (clientEmail) {
              await sendEmail({
                to: clientEmail,
                subject: `Payment Received: ${booking.bookingReference || `Booking #${id}`} — CuratedAscents`,
                react: React.createElement(PaymentReceivedEmail, {
                  clientName,
                  bookingReference: booking.bookingReference || `Booking #${id}`,
                  paymentAmount: paidAmount.toFixed(2),
                  totalPaid: bookingNewPaid.toFixed(2),
                  totalAmount: bookingTotal.toFixed(2),
                  balanceAmount: bookingNewBalance.toFixed(2),
                  paymentStatus: bookingNewBalance <= 0 ? "paid" : "partial",
                  currency: booking.currency || "USD",
                }),
                logContext: {
                  templateType: "payment_received",
                  toName: clientName,
                  clientId: booking.clientId,
                  bookingId,
                  metadata: { milestoneId, paymentAmount: paidAmount },
                },
              });
            }
          }
        }

        // Send admin notification
        sendEmail({
          to: ADMIN_EMAIL,
          subject: `Payment Received: ${booking.bookingReference || `Booking #${id}`} — CuratedAscents`,
          react: React.createElement(AdminNotificationEmail, {
            notificationType: "payment_received",
            clientName,
            clientEmail,
            bookingReference: booking.bookingReference || `Booking #${id}`,
            paymentAmount: paidAmount.toFixed(2),
            paidAmount: bookingNewPaid.toFixed(2),
            balanceAmount: bookingNewBalance.toFixed(2),
            paymentStatus: bookingNewBalance <= 0 ? "paid" : "partial",
          }),
          logContext: {
            templateType: "admin_notification",
            toName: "Admin",
            clientId: booking.clientId || undefined,
            bookingId,
            metadata: { notificationType: "payment_received", milestoneId, paymentAmount: paidAmount },
          },
        }).catch((err) => console.error("Admin payment notification failed:", err));
      }
    }

    // Handle other updates
    if (body.status) updateData.status = body.status;
    if (body.dueDate) updateData.dueDate = body.dueDate;
    if (body.notes !== undefined) updateData.notes = body.notes;

    const result = await db
      .update(paymentMilestones)
      .set(updateData)
      .where(eq(paymentMilestones.id, milestoneId))
      .returning();

    return NextResponse.json({
      success: true,
      message: "Payment milestone updated",
      milestone: result[0],
    });
  } catch (error) {
    console.error("Error updating payment milestone:", error);
    return NextResponse.json(
      { error: "Failed to update payment milestone", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
