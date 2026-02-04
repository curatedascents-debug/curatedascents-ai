import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { loyaltyAccounts, clients } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { getOrCreateLoyaltyAccount } from "@/lib/customer-success/loyalty-engine";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/loyalty/accounts
 * List all loyalty accounts with client info
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tier = searchParams.get("tier");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    let query = db
      .select({
        id: loyaltyAccounts.id,
        clientId: loyaltyAccounts.clientId,
        clientName: clients.name,
        clientEmail: clients.email,
        totalPoints: loyaltyAccounts.totalPoints,
        lifetimePoints: loyaltyAccounts.lifetimePoints,
        tier: loyaltyAccounts.tier,
        referralCode: loyaltyAccounts.referralCode,
        referralCount: loyaltyAccounts.referralCount,
        totalBookings: loyaltyAccounts.totalBookings,
        totalSpent: loyaltyAccounts.totalSpent,
        lastBookingAt: loyaltyAccounts.lastBookingAt,
        createdAt: loyaltyAccounts.createdAt,
      })
      .from(loyaltyAccounts)
      .innerJoin(clients, eq(loyaltyAccounts.clientId, clients.id))
      .orderBy(desc(loyaltyAccounts.lifetimePoints))
      .limit(limit)
      .offset(offset);

    if (tier) {
      query = query.where(eq(loyaltyAccounts.tier, tier)) as typeof query;
    }

    const accounts = await query;

    // Get tier distribution
    const tierStats = await db
      .select({
        tier: loyaltyAccounts.tier,
        count: sql<number>`COUNT(*)::int`,
        totalPoints: sql<number>`SUM(${loyaltyAccounts.totalPoints})::int`,
      })
      .from(loyaltyAccounts)
      .groupBy(loyaltyAccounts.tier);

    // Get total stats
    const [totals] = await db
      .select({
        totalAccounts: sql<number>`COUNT(*)::int`,
        totalPointsIssued: sql<number>`SUM(${loyaltyAccounts.lifetimePoints})::int`,
        totalPointsRedeemed: sql<number>`SUM(${loyaltyAccounts.redeemedPoints})::int`,
      })
      .from(loyaltyAccounts);

    return NextResponse.json({
      success: true,
      accounts,
      stats: {
        total: totals.totalAccounts || 0,
        totalPointsIssued: totals.totalPointsIssued || 0,
        totalPointsRedeemed: totals.totalPointsRedeemed || 0,
        byTier: tierStats.reduce(
          (acc, t) => ({
            ...acc,
            [t.tier]: { count: t.count, totalPoints: t.totalPoints },
          }),
          {}
        ),
      },
      pagination: {
        limit,
        offset,
        hasMore: accounts.length === limit,
      },
    });
  } catch (error) {
    console.error("Error fetching loyalty accounts:", error);
    return NextResponse.json(
      { error: "Failed to fetch loyalty accounts" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/loyalty/accounts
 * Create loyalty account for a client (or get existing)
 */
export async function POST(req: NextRequest) {
  try {
    const { clientId } = await req.json();

    if (!clientId) {
      return NextResponse.json(
        { error: "clientId is required" },
        { status: 400 }
      );
    }

    // Verify client exists
    const [client] = await db
      .select()
      .from(clients)
      .where(eq(clients.id, clientId))
      .limit(1);

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const account = await getOrCreateLoyaltyAccount(clientId);

    return NextResponse.json({
      success: true,
      account: {
        id: account.id,
        clientId: account.clientId,
        totalPoints: account.totalPoints,
        tier: account.tier,
        referralCode: account.referralCode,
      },
    });
  } catch (error) {
    console.error("Error creating loyalty account:", error);
    return NextResponse.json(
      { error: "Failed to create loyalty account" },
      { status: 500 }
    );
  }
}
