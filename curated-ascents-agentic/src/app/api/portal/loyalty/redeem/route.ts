import { NextResponse } from "next/server";
import { db } from "@/db";
import { loyaltyAccounts, loyaltyTransactions } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const clientId = parseInt(request.headers.get("x-customer-id") || "0");
  if (!clientId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  try {
    const { points, reason } = await request.json();

    if (!points || points <= 0) {
      return NextResponse.json({ error: "Invalid points amount" }, { status: 400 });
    }

    const account = await db
      .select()
      .from(loyaltyAccounts)
      .where(eq(loyaltyAccounts.clientId, clientId))
      .then((rows) => rows[0]);

    if (!account) {
      return NextResponse.json({ error: "No loyalty account" }, { status: 404 });
    }

    if (account.totalPoints < points) {
      return NextResponse.json({ error: "Insufficient points" }, { status: 400 });
    }

    const newBalance = account.totalPoints - points;

    await db
      .update(loyaltyAccounts)
      .set({
        totalPoints: newBalance,
        redeemedPoints: account.redeemedPoints + points,
        updatedAt: new Date(),
      })
      .where(eq(loyaltyAccounts.id, account.id));

    await db.insert(loyaltyTransactions).values({
      loyaltyAccountId: account.id,
      type: "redeem",
      points: -points,
      balanceAfter: newBalance,
      reason: reason || "Points redeemed",
    });

    return NextResponse.json({ success: true, newBalance });
  } catch (error) {
    console.error("Redeem error:", error);
    return NextResponse.json({ error: "Failed to redeem points" }, { status: 500 });
  }
}
