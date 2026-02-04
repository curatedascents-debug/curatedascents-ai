import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { loyaltyAccounts, loyaltyTransactions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/loyalty/accounts/[id]/transactions
 * Get transaction history for a loyalty account
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const accountId = parseInt(id);

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Verify account exists
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

    // Get transactions
    const transactions = await db
      .select()
      .from(loyaltyTransactions)
      .where(eq(loyaltyTransactions.loyaltyAccountId, accountId))
      .orderBy(desc(loyaltyTransactions.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      success: true,
      accountId,
      currentBalance: account.totalPoints,
      transactions: transactions.map((t) => ({
        id: t.id,
        type: t.type,
        points: t.points,
        balanceAfter: t.balanceAfter,
        reason: t.reason,
        referenceType: t.referenceType,
        referenceId: t.referenceId,
        performedBy: t.performedBy,
        createdAt: t.createdAt,
      })),
      pagination: {
        limit,
        offset,
        hasMore: transactions.length === limit,
      },
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
