import { NextResponse } from "next/server";
import { db } from "@/db";
import { bookings, quotes, loyaltyAccounts, paymentMilestones } from "@/db/schema";
import { eq, desc, and, gte } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const clientId = parseInt(request.headers.get("x-customer-id") || "0");
  if (!clientId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  try {
    // Upcoming booking
    const today = new Date().toISOString().split("T")[0];
    const upcomingBookings = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.clientId, clientId),
          gte(bookings.startDate, today)
        )
      )
      .orderBy(bookings.startDate)
      .limit(1);

    const upcomingBooking = upcomingBookings[0]
      ? {
          id: upcomingBookings[0].id,
          reference: upcomingBookings[0].bookingReference,
          destination: upcomingBookings[0].startDate || "Upcoming Trip",
          startDate: upcomingBookings[0].startDate,
          daysUntil: Math.ceil(
            (new Date(upcomingBookings[0].startDate!).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          ),
        }
      : null;

    // Recent quotes (last 5)
    const recentQuotes = await db
      .select({
        id: quotes.id,
        quoteName: quotes.quoteName,
        destination: quotes.destination,
        status: quotes.status,
        totalSellPrice: quotes.totalSellPrice,
      })
      .from(quotes)
      .where(eq(quotes.clientId, clientId))
      .orderBy(desc(quotes.createdAt))
      .limit(5);

    // Loyalty
    const loyaltyRows = await db
      .select({
        tier: loyaltyAccounts.tier,
        points: loyaltyAccounts.totalPoints,
      })
      .from(loyaltyAccounts)
      .where(eq(loyaltyAccounts.clientId, clientId))
      .limit(1);

    const loyalty = loyaltyRows[0] || null;

    // Recent payments (from milestones of client's bookings)
    const clientBookings = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(eq(bookings.clientId, clientId));

    const bookingIds = clientBookings.map((b) => b.id);

    let recentPayments: { id: number; description: string; amount: string; status: string }[] = [];
    if (bookingIds.length > 0) {
      const milestones = await db
        .select({
          id: paymentMilestones.id,
          description: paymentMilestones.description,
          amount: paymentMilestones.amount,
          status: paymentMilestones.status,
        })
        .from(paymentMilestones)
        .where(eq(paymentMilestones.bookingId, bookingIds[0]))
        .orderBy(desc(paymentMilestones.createdAt))
        .limit(3);

      recentPayments = milestones.map((m) => ({
        id: m.id,
        description: m.description || "Payment",
        amount: m.amount,
        status: m.status || "pending",
      }));
    }

    return NextResponse.json({
      upcomingBooking,
      recentQuotes,
      loyalty,
      recentPayments,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json({ error: "Failed to load dashboard" }, { status: 500 });
  }
}
