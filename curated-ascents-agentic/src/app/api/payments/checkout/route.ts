/**
 * Stripe Checkout Session API
 * Creates checkout sessions for payment milestones
 */

import { NextRequest, NextResponse } from "next/server";
import { createCheckoutSession, createPaymentLink } from "@/lib/stripe/payment-service";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limiter";

export const dynamic = "force-dynamic";

// POST /api/payments/checkout - Create a checkout session or payment link
export async function POST(req: NextRequest) {
  // Rate limit: 10 requests per hour per IP
  const limit = rateLimit(req, { window: 3600, max: 10, identifier: "checkout" });
  if (!limit.success) {
    return rateLimitResponse(limit, "Too many payment requests. Please try again later.");
  }

  try {
    const body = await req.json();
    const { milestoneId, type = "checkout", successUrl, cancelUrl } = body;

    if (!milestoneId) {
      return NextResponse.json(
        { error: "milestoneId is required" },
        { status: 400 }
      );
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 503 }
      );
    }

    if (type === "payment_link") {
      // Create a reusable payment link
      const result = await createPaymentLink({ milestoneId });
      return NextResponse.json({
        success: true,
        type: "payment_link",
        paymentLinkId: result.paymentLinkId,
        url: result.paymentLinkUrl,
      });
    } else {
      // Create a checkout session (default)
      const result = await createCheckoutSession({
        milestoneId,
        successUrl,
        cancelUrl,
      });
      return NextResponse.json({
        success: true,
        type: "checkout_session",
        sessionId: result.sessionId,
        url: result.sessionUrl,
      });
    }
  } catch (error) {
    console.error("Error creating checkout:", error);
    return NextResponse.json(
      {
        error: "Failed to create checkout",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
