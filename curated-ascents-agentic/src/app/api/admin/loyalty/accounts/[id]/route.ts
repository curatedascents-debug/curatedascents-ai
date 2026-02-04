import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { loyaltyAccounts, clients } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  getLoyaltyAccountSummary,
  addPoints,
  redeemPoints,
  TIER_BENEFITS,
} from "@/lib/customer-success/loyalty-engine";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/loyalty/accounts/[id]
 * Get detailed loyalty account info
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const accountId = parseInt(id);

    // Get account
    const [account] = await db
      .select({
        id: loyaltyAccounts.id,
        clientId: loyaltyAccounts.clientId,
        clientName: clients.name,
        clientEmail: clients.email,
      })
      .from(loyaltyAccounts)
      .innerJoin(clients, eq(loyaltyAccounts.clientId, clients.id))
      .where(eq(loyaltyAccounts.id, accountId))
      .limit(1);

    if (!account) {
      return NextResponse.json(
        { error: "Loyalty account not found" },
        { status: 404 }
      );
    }

    // Get full summary
    const summary = await getLoyaltyAccountSummary(account.clientId);

    return NextResponse.json({
      success: true,
      account: {
        ...summary.account,
        clientName: account.clientName,
        clientEmail: account.clientEmail,
      },
      benefits: summary.benefits,
      progress: {
        pointsToNextTier: summary.pointsToNextTier,
        nextTier: summary.nextTier,
        nextTierBenefits: summary.nextTier
          ? TIER_BENEFITS[summary.nextTier]
          : null,
      },
      recentTransactions: summary.recentTransactions,
    });
  } catch (error) {
    console.error("Error fetching loyalty account:", error);
    return NextResponse.json(
      { error: "Failed to fetch loyalty account" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/loyalty/accounts/[id]
 * Update loyalty account (add/redeem points, adjust)
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const accountId = parseInt(id);
    const body = await req.json();

    // Get account
    const [account] = await db
      .select()
      .from(loyaltyAccounts)
      .where(eq(loyaltyAccounts.id, accountId))
      .limit(1);

    if (!account) {
      return NextResponse.json(
        { error: "Loyalty account not found" },
        { status: 404 }
      );
    }

    const { action, points, reason } = body;

    if (!action || !points || !reason) {
      return NextResponse.json(
        { error: "action, points, and reason are required" },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case "add":
        result = await addPoints(
          account.clientId,
          points,
          "earned_bonus",
          reason,
          undefined,
          undefined,
          "admin"
        );
        return NextResponse.json({
          success: true,
          message: `Added ${points} points`,
          newBalance: result.newBalance,
          newTier: result.newTier,
          tierChanged: result.tierChanged,
        });

      case "redeem":
        result = await redeemPoints(account.clientId, points, reason);
        if (!result.success) {
          return NextResponse.json({ error: result.error }, { status: 400 });
        }
        return NextResponse.json({
          success: true,
          message: `Redeemed ${points} points`,
          newBalance: result.newBalance,
        });

      case "adjust":
        // Allow negative adjustments
        result = await addPoints(
          account.clientId,
          points, // can be negative
          "adjusted",
          reason,
          undefined,
          undefined,
          "admin"
        );
        return NextResponse.json({
          success: true,
          message: `Adjusted by ${points} points`,
          newBalance: result.newBalance,
          newTier: result.newTier,
          tierChanged: result.tierChanged,
        });

      default:
        return NextResponse.json(
          { error: "Invalid action. Use: add, redeem, or adjust" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error updating loyalty account:", error);
    return NextResponse.json(
      { error: "Failed to update loyalty account" },
      { status: 500 }
    );
  }
}
