import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { referrals, clients, bookings } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { createReferral } from "@/lib/customer-success/loyalty-engine";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/referrals
 * List all referrals
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Alias for referrer and referred clients
    const referrerClient = clients;

    let baseQuery = db
      .select({
        id: referrals.id,
        referralCode: referrals.referralCode,
        status: referrals.status,
        referrerClientId: referrals.referrerClientId,
        referrerName: referrerClient.name,
        referrerEmail: referrerClient.email,
        referredClientId: referrals.referredClientId,
        referredEmail: referrals.referredEmail,
        referrerRewardPoints: referrals.referrerRewardPoints,
        referredRewardPoints: referrals.referredRewardPoints,
        referrerRewardGiven: referrals.referrerRewardGiven,
        referredRewardGiven: referrals.referredRewardGiven,
        convertedBookingId: referrals.convertedBookingId,
        convertedAt: referrals.convertedAt,
        expiresAt: referrals.expiresAt,
        createdAt: referrals.createdAt,
      })
      .from(referrals)
      .innerJoin(referrerClient, eq(referrals.referrerClientId, referrerClient.id))
      .orderBy(desc(referrals.createdAt))
      .limit(limit)
      .offset(offset);

    if (status) {
      baseQuery = baseQuery.where(eq(referrals.status, status)) as typeof baseQuery;
    }

    const referralList = await baseQuery;

    // Get referred client names for those who registered
    const referralsWithDetails = await Promise.all(
      referralList.map(async (ref) => {
        let referredName = null;
        let bookingValue = null;

        if (ref.referredClientId) {
          const [referred] = await db
            .select({ name: clients.name, email: clients.email })
            .from(clients)
            .where(eq(clients.id, ref.referredClientId))
            .limit(1);
          referredName = referred?.name || referred?.email;
        }

        if (ref.convertedBookingId) {
          const [booking] = await db
            .select({ totalAmount: bookings.totalAmount })
            .from(bookings)
            .where(eq(bookings.id, ref.convertedBookingId))
            .limit(1);
          bookingValue = booking?.totalAmount;
        }

        return {
          ...ref,
          referredName,
          bookingValue,
        };
      })
    );

    // Get stats
    const stats = await db
      .select({
        status: referrals.status,
        count: sql<number>`COUNT(*)::int`,
      })
      .from(referrals)
      .groupBy(referrals.status);

    const totalConverted = stats.find((s) => s.status === "converted")?.count || 0;
    const totalPending = stats.find((s) => s.status === "pending")?.count || 0;
    const totalRegistered = stats.find((s) => s.status === "registered")?.count || 0;

    return NextResponse.json({
      success: true,
      referrals: referralsWithDetails,
      stats: {
        total: stats.reduce((sum, s) => sum + s.count, 0),
        pending: totalPending,
        registered: totalRegistered,
        converted: totalConverted,
        conversionRate:
          totalPending + totalRegistered + totalConverted > 0
            ? (
                (totalConverted /
                  (totalPending + totalRegistered + totalConverted)) *
                100
              ).toFixed(1) + "%"
            : "0%",
      },
      pagination: {
        limit,
        offset,
        hasMore: referralList.length === limit,
      },
    });
  } catch (error) {
    console.error("Error fetching referrals:", error);
    return NextResponse.json(
      { error: "Failed to fetch referrals" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/referrals
 * Create a new referral invite
 */
export async function POST(req: NextRequest) {
  try {
    const { referrerClientId, referredEmail } = await req.json();

    if (!referrerClientId || !referredEmail) {
      return NextResponse.json(
        { error: "referrerClientId and referredEmail are required" },
        { status: 400 }
      );
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(referredEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const result = await createReferral(referrerClientId, referredEmail);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      referralCode: result.referralCode,
      referralLink: `${process.env.NEXT_PUBLIC_APP_URL}?ref=${result.referralCode}`,
    });
  } catch (error) {
    console.error("Error creating referral:", error);
    return NextResponse.json(
      { error: "Failed to create referral" },
      { status: 500 }
    );
  }
}
