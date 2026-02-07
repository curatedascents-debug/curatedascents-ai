import { NextResponse } from "next/server";
import { db } from "@/db";
import { loyaltyAccounts, loyaltyTransactions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

const TIER_THRESHOLDS: Record<string, { next: string | null; pointsNeeded: number }> = {
  bronze: { next: "Silver", pointsNeeded: 5000 },
  silver: { next: "Gold", pointsNeeded: 15000 },
  gold: { next: "Platinum", pointsNeeded: 50000 },
  platinum: { next: null, pointsNeeded: 0 },
};

export async function GET(request: Request) {
  const clientId = parseInt(request.headers.get("x-customer-id") || "0");
  if (!clientId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  try {
    const account = await db
      .select()
      .from(loyaltyAccounts)
      .where(eq(loyaltyAccounts.clientId, clientId))
      .then((rows) => rows[0]);

    if (!account) {
      return NextResponse.json({ account: null, transactions: [], referralCode: null });
    }

    const tierInfo = TIER_THRESHOLDS[account.tier.toLowerCase()] || TIER_THRESHOLDS.bronze;
    const pointsToNextTier = tierInfo.next
      ? Math.max(0, tierInfo.pointsNeeded - account.lifetimePoints)
      : null;

    // Capitalize tier
    const tierCapitalized = account.tier.charAt(0).toUpperCase() + account.tier.slice(1);

    // Transactions
    const transactions = await db
      .select({
        id: loyaltyTransactions.id,
        type: loyaltyTransactions.type,
        points: loyaltyTransactions.points,
        description: loyaltyTransactions.reason,
        createdAt: loyaltyTransactions.createdAt,
      })
      .from(loyaltyTransactions)
      .where(eq(loyaltyTransactions.loyaltyAccountId, account.id))
      .orderBy(desc(loyaltyTransactions.createdAt))
      .limit(20);

    return NextResponse.json({
      account: {
        tier: tierCapitalized,
        points: account.totalPoints,
        lifetimePoints: account.lifetimePoints,
        nextTier: tierInfo.next,
        pointsToNextTier,
      },
      transactions,
      referralCode: account.referralCode,
    });
  } catch (error) {
    console.error("Loyalty error:", error);
    return NextResponse.json({ error: "Failed to load loyalty" }, { status: 500 });
  }
}
