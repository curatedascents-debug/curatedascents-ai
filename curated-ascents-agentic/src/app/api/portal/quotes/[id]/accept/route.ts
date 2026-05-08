/**
 * Portal: Accept a quote and initiate Stripe deposit checkout
 * POST /api/portal/quotes/[id]/accept
 *
 * Flow: quote → booking + 30% deposit milestone → Stripe checkout URL
 */

import { NextResponse } from "next/server";
import { db } from "@/db";
import { quotes, bookings, paymentMilestones } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { createCheckoutSession } from "@/lib/stripe/payment-service";

export const dynamic = "force-dynamic";

const DEPOSIT_PERCENT = 30; // 30% deposit to confirm booking

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const clientId = parseInt(request.headers.get("x-customer-id") || "0");
  if (!clientId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const quoteId = parseInt(id);
  if (isNaN(quoteId)) {
    return NextResponse.json({ error: "Invalid quote ID" }, { status: 400 });
  }

  try {
    // 1. Load the quote (must belong to this customer)
    const [quote] = await db
      .select({
        id: quotes.id,
        quoteNumber: quotes.quoteNumber,
        quoteName: quotes.quoteName,
        destination: quotes.destination,
        totalSellPrice: quotes.totalSellPrice,
        currency: quotes.currency,
        status: quotes.status,
        startDate: quotes.startDate,
        endDate: quotes.endDate,
        numberOfPax: quotes.numberOfPax,
        clientId: quotes.clientId,
      })
      .from(quotes)
      .where(and(eq(quotes.id, quoteId), eq(quotes.clientId, clientId)))
      .limit(1);

    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    if (quote.status === "cancelled") {
      return NextResponse.json(
        { error: "This quote has been cancelled and cannot be accepted." },
        { status: 400 }
      );
    }

    // 2. Check if a booking already exists for this quote
    const [existingBooking] = await db
      .select({ id: bookings.id, bookingReference: bookings.bookingReference })
      .from(bookings)
      .where(eq(bookings.quoteId, quoteId))
      .limit(1);

    let bookingId: number;
    let bookingReference: string;

    if (existingBooking) {
      bookingId = existingBooking.id;
      bookingReference = existingBooking.bookingReference ?? "";
    } else {
      // 3. Create booking from quote
      const year = new Date().getFullYear();
      const seqResult = await db.execute(
        sql`SELECT COALESCE(MAX(CAST(SUBSTRING(booking_reference FROM 'CA-[0-9]+-([0-9]+)') AS INTEGER)), 0) + 1 AS next_seq FROM bookings WHERE booking_reference LIKE ${"CA-" + year + "-%"}`
      );
      const seqNum = (seqResult.rows[0] as { next_seq: number }).next_seq || 1;
      bookingReference = `CA-${year}-${String(seqNum).padStart(4, "0")}`;

      const [newBooking] = await db
        .insert(bookings)
        .values({
          bookingReference,
          quoteId,
          clientId: clientId,
          status: "confirmed",
          totalAmount: quote.totalSellPrice ?? "0",
          currency: quote.currency ?? "USD",
          startDate: quote.startDate ?? undefined,
          endDate: quote.endDate ?? undefined,
        })
        .returning({ id: bookings.id });

      bookingId = newBooking.id;

      // Mark quote as accepted
      await db
        .update(quotes)
        .set({ status: "accepted", updatedAt: new Date() })
        .where(eq(quotes.id, quoteId));
    }

    // 4. Find or create 30% deposit milestone
    const [existingMilestone] = await db
      .select({ id: paymentMilestones.id, status: paymentMilestones.status })
      .from(paymentMilestones)
      .where(
        and(
          eq(paymentMilestones.bookingId, bookingId),
          eq(paymentMilestones.milestoneType, "deposit")
        )
      )
      .limit(1);

    let milestoneId: number;

    if (existingMilestone) {
      if (existingMilestone.status === "paid") {
        return NextResponse.json(
          { error: "Deposit already paid. Contact us for balance payment details." },
          { status: 400 }
        );
      }
      milestoneId = existingMilestone.id;
    } else {
      const totalAmount = parseFloat(quote.totalSellPrice || "0");
      const depositAmount = (totalAmount * DEPOSIT_PERCENT) / 100;
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7); // due in 7 days

      const [newMilestone] = await db
        .insert(paymentMilestones)
        .values({
          bookingId,
          milestoneType: "deposit",
          description: `${DEPOSIT_PERCENT}% deposit — ${quote.quoteName || quote.destination || bookingReference}`,
          amount: String(depositAmount.toFixed(2)),
          percentage: String(DEPOSIT_PERCENT),
          dueDate: dueDate.toISOString().split("T")[0],
          status: "pending",
          currency: quote.currency || "USD",
        })
        .returning({ id: paymentMilestones.id });

      milestoneId = newMilestone.id;
    }

    // 5. Create Stripe checkout session
    if (!process.env.STRIPE_SECRET_KEY) {
      // Stripe not configured — return booking confirmation without payment URL
      return NextResponse.json({
        success: true,
        bookingReference,
        stripeConfigured: false,
        message:
          "Your quote has been accepted and your booking confirmed. Our team will send deposit payment details to your email within 24 hours.",
      });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://curated-ascents-agentic.vercel.app";
    const { sessionUrl } = await createCheckoutSession({
      milestoneId,
      successUrl: `${appUrl}/payment/success?booking=${bookingReference}`,
      cancelUrl: `${appUrl}/portal/quotes/${quoteId}`,
    });

    return NextResponse.json({
      success: true,
      bookingReference,
      stripeConfigured: true,
      checkoutUrl: sessionUrl,
    });
  } catch (error) {
    console.error("Quote accept error:", error);
    return NextResponse.json(
      { error: "Failed to process your request. Please contact us directly." },
      { status: 500 }
    );
  }
}
