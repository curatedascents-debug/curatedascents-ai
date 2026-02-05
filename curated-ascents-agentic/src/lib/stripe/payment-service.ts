/**
 * Stripe Payment Service
 * Handles payment checkout sessions, payment links, and webhook processing
 */

import { stripe } from "./stripe-client";
import { db } from "@/db";
import {
  paymentMilestones,
  bookings,
  quotes,
  clients,
  bookingEvents,
  stripePayments,
} from "@/db/schema";
import { eq } from "drizzle-orm";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export interface CreateCheckoutSessionParams {
  milestoneId: number;
  successUrl?: string;
  cancelUrl?: string;
}

export interface CreatePaymentLinkParams {
  milestoneId: number;
}

/**
 * Create a Stripe Checkout Session for a payment milestone
 */
export async function createCheckoutSession(
  params: CreateCheckoutSessionParams
): Promise<{ sessionId: string; sessionUrl: string }> {
  const { milestoneId, successUrl, cancelUrl } = params;

  // Get milestone with booking and client info
  const milestone = await db
    .select({
      id: paymentMilestones.id,
      bookingId: paymentMilestones.bookingId,
      milestoneType: paymentMilestones.milestoneType,
      description: paymentMilestones.description,
      amount: paymentMilestones.amount,
      currency: paymentMilestones.currency,
      status: paymentMilestones.status,
    })
    .from(paymentMilestones)
    .where(eq(paymentMilestones.id, milestoneId))
    .limit(1);

  if (milestone.length === 0) {
    throw new Error("Payment milestone not found");
  }

  const ms = milestone[0];

  if (ms.status === "paid") {
    throw new Error("This payment milestone is already paid");
  }

  // Get booking details with quote info
  const booking = await db
    .select({
      id: bookings.id,
      bookingReference: bookings.bookingReference,
      quoteId: bookings.quoteId,
      clientId: bookings.clientId,
      quoteName: quotes.quoteName,
      destination: quotes.destination,
    })
    .from(bookings)
    .leftJoin(quotes, eq(bookings.quoteId, quotes.id))
    .where(eq(bookings.id, ms.bookingId))
    .limit(1);

  if (booking.length === 0) {
    throw new Error("Booking not found");
  }

  const bk = booking[0];

  // Get client email if available
  let customerEmail: string | undefined;
  if (bk.clientId) {
    const client = await db
      .select({ email: clients.email })
      .from(clients)
      .where(eq(clients.id, bk.clientId))
      .limit(1);

    if (client.length > 0 && client[0].email) {
      customerEmail = client[0].email;
    }
  }

  // Convert amount to cents
  const amountInCents = Math.round(parseFloat(ms.amount) * 100);
  const currency = (ms.currency || "usd").toLowerCase();

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: customerEmail,
    line_items: [
      {
        price_data: {
          currency,
          product_data: {
            name: `${bk.bookingReference} - ${ms.milestoneType} Payment`,
            description: `${bk.quoteName || bk.destination || "Trip"} - ${ms.description || ms.milestoneType}`,
          },
          unit_amount: amountInCents,
        },
        quantity: 1,
      },
    ],
    metadata: {
      milestoneId: ms.id.toString(),
      bookingId: ms.bookingId.toString(),
      bookingReference: bk.bookingReference || "",
      milestoneType: ms.milestoneType,
    },
    success_url:
      successUrl ||
      `${APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:
      cancelUrl ||
      `${APP_URL}/payment/cancelled?milestone_id=${milestoneId}`,
  });

  // Record the checkout session in our database
  await db.insert(stripePayments).values({
    milestoneId: ms.id,
    bookingId: ms.bookingId,
    stripeSessionId: session.id,
    stripePaymentIntentId: null,
    amount: ms.amount,
    currency: currency.toUpperCase(),
    status: "pending",
  });

  return {
    sessionId: session.id,
    sessionUrl: session.url!,
  };
}

/**
 * Create a reusable payment link for a milestone
 */
export async function createPaymentLink(
  params: CreatePaymentLinkParams
): Promise<{ paymentLinkId: string; paymentLinkUrl: string }> {
  const { milestoneId } = params;

  // Get milestone with booking info
  const milestone = await db
    .select({
      id: paymentMilestones.id,
      bookingId: paymentMilestones.bookingId,
      milestoneType: paymentMilestones.milestoneType,
      description: paymentMilestones.description,
      amount: paymentMilestones.amount,
      currency: paymentMilestones.currency,
      status: paymentMilestones.status,
    })
    .from(paymentMilestones)
    .where(eq(paymentMilestones.id, milestoneId))
    .limit(1);

  if (milestone.length === 0) {
    throw new Error("Payment milestone not found");
  }

  const ms = milestone[0];

  if (ms.status === "paid") {
    throw new Error("This payment milestone is already paid");
  }

  // Get booking details with quote info
  const booking = await db
    .select({
      bookingReference: bookings.bookingReference,
      quoteName: quotes.quoteName,
      destination: quotes.destination,
    })
    .from(bookings)
    .leftJoin(quotes, eq(bookings.quoteId, quotes.id))
    .where(eq(bookings.id, ms.bookingId))
    .limit(1);

  if (booking.length === 0) {
    throw new Error("Booking not found");
  }

  const bk = booking[0];

  // Convert amount to cents
  const amountInCents = Math.round(parseFloat(ms.amount) * 100);
  const currency = (ms.currency || "usd").toLowerCase();

  // Create a product for this payment
  const product = await stripe.products.create({
    name: `${bk.bookingReference} - ${ms.milestoneType} Payment`,
    description: `${bk.quoteName || bk.destination || "Trip"} - ${ms.description || ms.milestoneType}`,
    metadata: {
      milestoneId: ms.id.toString(),
      bookingId: ms.bookingId.toString(),
    },
  });

  // Create a one-time price
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: amountInCents,
    currency,
  });

  // Create payment link
  const paymentLink = await stripe.paymentLinks.create({
    line_items: [{ price: price.id, quantity: 1 }],
    metadata: {
      milestoneId: ms.id.toString(),
      bookingId: ms.bookingId.toString(),
      bookingReference: bk.bookingReference || "",
      milestoneType: ms.milestoneType,
    },
    after_completion: {
      type: "redirect",
      redirect: {
        url: `${APP_URL}/payment/success?payment_link_id={PAYMENT_LINK_ID}`,
      },
    },
  });

  // Update milestone with payment link
  await db
    .update(paymentMilestones)
    .set({ stripePaymentLinkId: paymentLink.id })
    .where(eq(paymentMilestones.id, milestoneId));

  return {
    paymentLinkId: paymentLink.id,
    paymentLinkUrl: paymentLink.url,
  };
}

/**
 * Handle Stripe webhook event - checkout.session.completed
 */
export async function handleCheckoutSessionCompleted(
  session: {
    id: string;
    payment_intent: string | null;
    metadata: { milestoneId?: string; bookingId?: string } | null;
    amount_total: number | null;
    currency: string | null;
    customer_email: string | null;
  }
): Promise<void> {
  const milestoneId = session.metadata?.milestoneId;
  const bookingId = session.metadata?.bookingId;

  if (!milestoneId) {
    console.error("No milestoneId in session metadata:", session.id);
    return;
  }

  const msId = parseInt(milestoneId);
  const bkId = bookingId ? parseInt(bookingId) : undefined;

  // Update the stripe payment record
  await db
    .update(stripePayments)
    .set({
      stripePaymentIntentId: session.payment_intent,
      status: "completed",
      completedAt: new Date(),
    })
    .where(eq(stripePayments.stripeSessionId, session.id));

  // Calculate paid amount
  const paidAmount = session.amount_total
    ? (session.amount_total / 100).toFixed(2)
    : "0.00";

  // Update the payment milestone as paid
  await db
    .update(paymentMilestones)
    .set({
      status: "paid",
      paidDate: new Date().toISOString().split("T")[0],
      paidAmount,
    })
    .where(eq(paymentMilestones.id, msId));

  // Update booking paid amount if we have the booking ID
  if (bkId) {
    // Calculate total paid across all milestones
    const allMilestones = await db
      .select({
        paidAmount: paymentMilestones.paidAmount,
        status: paymentMilestones.status,
      })
      .from(paymentMilestones)
      .where(eq(paymentMilestones.bookingId, bkId));

    let totalPaid = 0;
    let allPaid = true;

    for (const m of allMilestones) {
      if (m.paidAmount) {
        totalPaid += parseFloat(m.paidAmount);
      }
      if (m.status !== "paid") {
        allPaid = false;
      }
    }

    // Get booking total
    const bookingResult = await db
      .select({ totalAmount: bookings.totalAmount })
      .from(bookings)
      .where(eq(bookings.id, bkId))
      .limit(1);

    if (bookingResult.length > 0) {
      const totalAmount = parseFloat(bookingResult[0].totalAmount || "0");
      const balanceAmount = Math.max(0, totalAmount - totalPaid);

      await db
        .update(bookings)
        .set({
          paidAmount: totalPaid.toFixed(2),
          balanceAmount: balanceAmount.toFixed(2),
          paymentStatus: allPaid ? "paid" : totalPaid > 0 ? "partial" : "pending",
        })
        .where(eq(bookings.id, bkId));
    }

    // Log the event
    await db.insert(bookingEvents).values({
      bookingId: bkId,
      eventType: "payment_received",
      eventData: {
        milestoneId: msId,
        amount: paidAmount,
        stripeSessionId: session.id,
        paymentIntent: session.payment_intent,
        customerEmail: session.customer_email,
        description: `Payment received: $${paidAmount} via Stripe`,
      },
      performedBy: "stripe_webhook",
    });
  }
}

/**
 * Handle Stripe webhook event - checkout.session.expired
 */
export async function handleCheckoutSessionExpired(sessionId: string): Promise<void> {
  await db
    .update(stripePayments)
    .set({
      status: "expired",
    })
    .where(eq(stripePayments.stripeSessionId, sessionId));
}

/**
 * Handle Stripe webhook event - payment_intent.payment_failed
 */
export async function handlePaymentFailed(
  paymentIntentId: string,
  errorMessage?: string
): Promise<void> {
  const stripePayment = await db
    .select()
    .from(stripePayments)
    .where(eq(stripePayments.stripePaymentIntentId, paymentIntentId))
    .limit(1);

  if (stripePayment.length > 0) {
    const sp = stripePayment[0];

    await db
      .update(stripePayments)
      .set({
        status: "failed",
        errorMessage: errorMessage || "Payment failed",
      })
      .where(eq(stripePayments.id, sp.id));

    // Log the event
    if (sp.bookingId) {
      await db.insert(bookingEvents).values({
        bookingId: sp.bookingId,
        eventType: "payment_received",
        eventData: {
          milestoneId: sp.milestoneId,
          paymentIntentId,
          status: "failed",
          errorMessage,
          description: `Payment failed: ${errorMessage || "Unknown error"}`,
        },
        performedBy: "stripe_webhook",
      });
    }
  }
}

/**
 * Get payment session status for a checkout session ID
 */
export async function getCheckoutSessionStatus(
  sessionId: string
): Promise<{
  status: string;
  paymentStatus: string | null;
  milestoneId: number | null;
  bookingReference: string | null;
}> {
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  return {
    status: session.status || "unknown",
    paymentStatus: session.payment_status,
    milestoneId: session.metadata?.milestoneId
      ? parseInt(session.metadata.milestoneId)
      : null,
    bookingReference: session.metadata?.bookingReference || null,
  };
}
