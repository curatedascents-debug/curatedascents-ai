/**
 * Payment Status API
 * Check status of a checkout session
 */

import { NextRequest, NextResponse } from "next/server";
import { getCheckoutSessionStatus } from "@/lib/stripe/payment-service";

export const dynamic = "force-dynamic";

// GET /api/payments/status?session_id=xxx
export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { error: "session_id is required" },
        { status: 400 }
      );
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 503 }
      );
    }

    const status = await getCheckoutSessionStatus(sessionId);

    return NextResponse.json({
      success: true,
      ...status,
    });
  } catch (error) {
    console.error("Error getting payment status:", error);
    return NextResponse.json(
      {
        error: "Failed to get payment status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
