/**
 * Stripe Webhook Handler
 * Processes Stripe events for payment confirmations
 */

import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/stripe-client";
import {
  handleCheckoutSessionCompleted,
  handleCheckoutSessionExpired,
  handlePaymentFailed,
} from "@/lib/stripe/payment-service";
import { handleApiError } from "@/lib/api/error-handler";

export const dynamic = "force-dynamic";

// Disable body parsing for raw webhook payload
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("Missing STRIPE_WEBHOOK_SECRET");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event;

  try {
    // Get raw body for signature verification
    const body = await req.text();

    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  // Handle the event
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        console.log("Processing checkout.session.completed:", session.id);

        await handleCheckoutSessionCompleted({
          id: session.id,
          payment_intent: session.payment_intent as string | null,
          metadata: session.metadata,
          amount_total: session.amount_total,
          currency: session.currency,
          customer_email: session.customer_email,
        });

        console.log("Successfully processed payment for session:", session.id);
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object;
        console.log("Processing checkout.session.expired:", session.id);

        await handleCheckoutSessionExpired(session.id);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        console.log("Processing payment_intent.payment_failed:", paymentIntent.id);

        const errorMessage =
          paymentIntent.last_payment_error?.message || "Payment failed";
        await handlePaymentFailed(paymentIntent.id, errorMessage);
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object;
        console.log("Charge refunded:", charge.id);
        // TODO: Implement refund handling
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    return handleApiError(error, "stripe-webhook");
  }
}
