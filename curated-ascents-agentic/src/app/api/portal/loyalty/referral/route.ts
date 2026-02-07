import { NextResponse } from "next/server";
import { db } from "@/db";
import { loyaltyAccounts, referrals } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const clientId = parseInt(request.headers.get("x-customer-id") || "0");
  if (!clientId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const account = await db
      .select()
      .from(loyaltyAccounts)
      .where(eq(loyaltyAccounts.clientId, clientId))
      .then((rows) => rows[0]);

    if (!account) {
      return NextResponse.json({ error: "No loyalty account" }, { status: 404 });
    }

    // Check if already referred
    const existing = await db
      .select()
      .from(referrals)
      .where(eq(referrals.referredEmail, email.trim().toLowerCase()))
      .then((rows) => rows[0]);

    if (existing) {
      return NextResponse.json({ error: "This email has already been referred" }, { status: 400 });
    }

    await db.insert(referrals).values({
      referrerClientId: clientId,
      referredEmail: email.trim().toLowerCase(),
      referralCode: account.referralCode,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Referral error:", error);
    return NextResponse.json({ error: "Failed to create referral" }, { status: 500 });
  }
}
