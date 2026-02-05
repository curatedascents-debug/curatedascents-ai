/**
 * Customer Loyalty API
 * GET /api/customer/loyalty - Get loyalty account for a client
 * POST /api/customer/loyalty - Redeem points
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getLoyaltyAccountSummary,
  redeemPoints,
  getReferralByCode,
  createReferral,
  TIER_BENEFITS,
} from "@/lib/customer-success/loyalty-engine";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const clientId = searchParams.get("clientId");
    const referralCode = searchParams.get("referralCode");

    // Validate referral code if provided
    if (referralCode) {
      const referral = await getReferralByCode(referralCode);
      if (!referral) {
        return NextResponse.json(
          { valid: false, error: "Invalid referral code" },
          { status: 200 }
        );
      }
      return NextResponse.json({
        valid: true,
        referrerName: referral.clientName,
        message: `You were referred by ${referral.clientName}! You'll receive bonus points when you join.`,
      });
    }

    // Get loyalty account
    if (!clientId) {
      return NextResponse.json(
        { error: "clientId is required" },
        { status: 400 }
      );
    }

    const summary = await getLoyaltyAccountSummary(parseInt(clientId));

    return NextResponse.json({
      account: summary.account,
      benefits: summary.benefits,
      pointsToNextTier: summary.pointsToNextTier,
      nextTier: summary.nextTier,
      recentTransactions: summary.recentTransactions,
      allTierBenefits: TIER_BENEFITS,
    });
  } catch (error) {
    console.error("Error fetching loyalty account:", error);
    return NextResponse.json(
      { error: "Failed to fetch loyalty account" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, clientId } = body;

    if (!clientId) {
      return NextResponse.json(
        { error: "clientId is required" },
        { status: 400 }
      );
    }

    switch (action) {
      case "redeem": {
        const { points, reason, bookingId } = body;
        if (!points || points <= 0) {
          return NextResponse.json(
            { error: "points must be a positive number" },
            { status: 400 }
          );
        }

        const result = await redeemPoints(
          clientId,
          points,
          reason || "Points redemption",
          bookingId
        );

        if (!result.success) {
          return NextResponse.json(
            { error: result.error, newBalance: result.newBalance },
            { status: 400 }
          );
        }

        return NextResponse.json({
          success: true,
          pointsRedeemed: points,
          newBalance: result.newBalance,
        });
      }

      case "create_referral": {
        const { referredEmail } = body;
        if (!referredEmail) {
          return NextResponse.json(
            { error: "referredEmail is required" },
            { status: 400 }
          );
        }

        const result = await createReferral(clientId, referredEmail);

        if (!result.success) {
          return NextResponse.json(
            { error: result.error },
            { status: 400 }
          );
        }

        return NextResponse.json({
          success: true,
          referralCode: result.referralCode,
          message: `Share this code with your friend: ${result.referralCode}`,
        });
      }

      default:
        return NextResponse.json(
          { error: "Invalid action. Use 'redeem' or 'create_referral'" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error processing loyalty action:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
