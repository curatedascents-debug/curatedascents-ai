import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bookings, quotes, quoteItems, clients, bookingSequence, paymentMilestones, supplierConfirmationRequests, bookingEvents } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import React from "react";
import { sendEmail } from "@/lib/email/send-email";
import BookingConfirmationEmail from "@/lib/email/templates/booking-confirmation";
import AdminNotificationEmail from "@/lib/email/templates/admin-notification";

// Disable caching for this route
export const dynamic = "force-dynamic";
export const revalidate = 0;

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "curatedascents@gmail.com";

export async function GET() {
  try {
    const result = await db
      .select({
        id: bookings.id,
        bookingReference: bookings.bookingReference,
        quoteId: bookings.quoteId,
        clientId: bookings.clientId,
        clientName: clients.name,
        clientEmail: clients.email,
        destination: quotes.destination,
        quoteName: quotes.quoteName,
        status: bookings.status,
        paymentStatus: bookings.paymentStatus,
        totalAmount: bookings.totalAmount,
        paidAmount: bookings.paidAmount,
        balanceAmount: bookings.balanceAmount,
        currency: bookings.currency,
        createdAt: bookings.createdAt,
        updatedAt: bookings.updatedAt,
      })
      .from(bookings)
      .leftJoin(clients, eq(bookings.clientId, clients.id))
      .leftJoin(quotes, eq(bookings.quoteId, quotes.id))
      .orderBy(desc(bookings.createdAt));

    return NextResponse.json({ success: true, bookings: result });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { quoteId } = body;

    if (!quoteId) {
      return NextResponse.json({ error: "quoteId is required" }, { status: 400 });
    }

    // Verify quote exists and is accepted
    const quoteResult = await db
      .select()
      .from(quotes)
      .where(eq(quotes.id, quoteId))
      .limit(1);

    if (quoteResult.length === 0) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    const quote = quoteResult[0];
    if (quote.status !== "accepted") {
      return NextResponse.json({ error: "Only accepted quotes can be converted to bookings" }, { status: 400 });
    }

    // Generate booking reference: CA-YYYY-NNNN
    const year = new Date().getFullYear();

    // Atomic sequence generation
    const seqResult = await db
      .insert(bookingSequence)
      .values({ year, lastNumber: 1 })
      .onConflictDoUpdate({
        target: bookingSequence.year,
        set: { lastNumber: sql`${bookingSequence.lastNumber} + 1` },
      })
      .returning();

    const seqNum = seqResult[0].lastNumber;
    const bookingReference = `CA-${year}-${String(seqNum).padStart(4, "0")}`;

    const totalAmount = parseFloat(quote.totalSellPrice || "0");

    // Calculate deposit and balance deadlines
    const today = new Date();
    const depositDeadline = new Date(today);
    depositDeadline.setDate(depositDeadline.getDate() + 7); // Deposit due in 7 days

    // Balance due 30 days before trip start, or 14 days from now if no start date
    let balanceDeadline: Date;
    if (quote.startDate) {
      balanceDeadline = new Date(quote.startDate);
      balanceDeadline.setDate(balanceDeadline.getDate() - 30);
      // If balance deadline is in the past or too soon, set it 14 days from now
      if (balanceDeadline <= today) {
        balanceDeadline = new Date(today);
        balanceDeadline.setDate(balanceDeadline.getDate() + 14);
      }
    } else {
      balanceDeadline = new Date(today);
      balanceDeadline.setDate(balanceDeadline.getDate() + 30);
    }

    const result = await db
      .insert(bookings)
      .values({
        quoteId,
        clientId: quote.clientId,
        bookingReference,
        status: "confirmed",
        paymentStatus: "pending",
        // Copy dates from quote
        startDate: quote.startDate,
        endDate: quote.endDate,
        // Set payment deadlines
        depositDeadline: depositDeadline.toISOString().split('T')[0],
        balanceDeadline: balanceDeadline.toISOString().split('T')[0],
        totalAmount: totalAmount.toFixed(2),
        paidAmount: "0.00",
        balanceAmount: totalAmount.toFixed(2),
        currency: quote.currency || "USD",
        operationsStatus: "pending",
      })
      .returning();

    const booking = result[0];

    // Auto-create payment milestones (30% deposit, 70% balance)
    const depositAmount = totalAmount * 0.30;
    const balanceAmount = totalAmount * 0.70;

    await db.insert(paymentMilestones).values([
      {
        bookingId: booking.id,
        milestoneType: "deposit",
        description: "Initial Deposit (30%)",
        amount: depositAmount.toFixed(2),
        percentage: "30.00",
        dueDate: depositDeadline.toISOString().split('T')[0],
        status: "pending",
        currency: quote.currency || "USD",
      },
      {
        bookingId: booking.id,
        milestoneType: "balance",
        description: "Final Balance (70%)",
        amount: balanceAmount.toFixed(2),
        percentage: "70.00",
        dueDate: balanceDeadline.toISOString().split('T')[0],
        status: "pending",
        currency: quote.currency || "USD",
      },
    ]);

    // Auto-create supplier confirmation requests from quote items
    const items = await db
      .select()
      .from(quoteItems)
      .where(eq(quoteItems.quoteId, quoteId));

    if (items.length > 0) {
      await db.insert(supplierConfirmationRequests).values(
        items.map(item => ({
          bookingId: booking.id,
          quoteItemId: item.id,
          serviceType: item.serviceType,
          serviceName: item.serviceName || item.description || item.serviceType,
          serviceDetails: {
            quantity: item.quantity,
            days: item.days,
            nights: item.nights,
            notes: item.notes,
          },
          status: "pending",
          requestedAt: new Date(),
        }))
      );
    }

    // Log booking created event
    await db.insert(bookingEvents).values({
      bookingId: booking.id,
      eventType: "created",
      eventData: {
        quoteId,
        quoteNumber: quote.quoteNumber,
        totalAmount,
        depositAmount,
        balanceAmount,
        depositDeadline: depositDeadline.toISOString().split('T')[0],
        balanceDeadline: balanceDeadline.toISOString().split('T')[0],
        itemsCount: items.length,
      },
      performedBy: "system",
    });

    // Send booking confirmation email to client
    let emailStatus: { sent: boolean; error?: string } = { sent: false };
    let clientName: string | undefined;
    let clientEmail: string | undefined;

    if (quote.clientId) {
      const clientResult = await db
        .select({ email: clients.email, name: clients.name })
        .from(clients)
        .where(eq(clients.id, quote.clientId))
        .limit(1);

      const client = clientResult[0];
      clientName = client?.name || undefined;
      clientEmail = client?.email || undefined;

      if (clientEmail) {
        emailStatus = await sendEmail({
          to: clientEmail,
          subject: `Booking Confirmed: ${bookingReference} — CuratedAscents`,
          react: React.createElement(BookingConfirmationEmail, {
            clientName,
            bookingReference,
            destination: quote.destination || undefined,
            quoteName: quote.quoteName || undefined,
            startDate: quote.startDate || undefined,
            endDate: quote.endDate || undefined,
            totalAmount: totalAmount.toFixed(2),
            currency: quote.currency || "USD",
          }),
          logContext: {
            templateType: "booking_confirmation",
            toName: clientName,
            clientId: quote.clientId,
            quoteId,
            bookingId: booking.id,
          },
        });
      }
    }

    // Send admin notification (fire-and-forget)
    sendEmail({
      to: ADMIN_EMAIL,
      subject: `New Booking: ${bookingReference} — CuratedAscents`,
      react: React.createElement(AdminNotificationEmail, {
        notificationType: "new_booking",
        clientName,
        clientEmail,
        bookingReference,
        quoteName: quote.quoteName || undefined,
        destination: quote.destination || undefined,
        totalAmount: totalAmount.toFixed(2),
      }),
      logContext: {
        templateType: "admin_notification",
        toName: "Admin",
        clientId: quote.clientId || undefined,
        quoteId,
        bookingId: booking.id,
        metadata: { notificationType: "new_booking" },
      },
    }).catch((err) => console.error("Admin booking notification failed:", err));

    return NextResponse.json({
      success: true,
      message: "Booking created successfully",
      booking,
      emailStatus,
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { error: "Failed to create booking", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
