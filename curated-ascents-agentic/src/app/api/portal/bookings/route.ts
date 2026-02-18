import { NextResponse } from "next/server";
import { db } from "@/db";
import { bookings, paymentMilestones, quotes } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { handleApiError } from "@/lib/api/error-handler";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const clientId = parseInt(request.headers.get("x-customer-id") || "0");
  if (!clientId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  try {
    const clientBookings = await db
      .select({
        id: bookings.id,
        reference: bookings.bookingReference,
        status: bookings.status,
        startDate: bookings.startDate,
        endDate: bookings.endDate,
        totalSellPrice: bookings.totalAmount,
        quoteId: bookings.quoteId,
      })
      .from(bookings)
      .where(eq(bookings.clientId, clientId))
      .orderBy(desc(bookings.createdAt));

    // Get destination from quotes and payment info
    const results = await Promise.all(
      clientBookings.map(async (b) => {
        let destination = "";
        if (b.quoteId) {
          const q = await db
            .select({ destination: quotes.destination, quoteName: quotes.quoteName })
            .from(quotes)
            .where(eq(quotes.id, b.quoteId))
            .limit(1);
          destination = q[0]?.quoteName || q[0]?.destination || "";
        }

        // Sum paid milestones
        const paidResult = await db
          .select({
            total: sql<number>`COALESCE(SUM(CASE WHEN ${paymentMilestones.status} = 'paid' THEN ${paymentMilestones.amount}::numeric ELSE 0 END), 0)`,
          })
          .from(paymentMilestones)
          .where(eq(paymentMilestones.bookingId, b.id));

        return {
          id: b.id,
          reference: b.reference,
          destination,
          startDate: b.startDate,
          endDate: b.endDate,
          status: b.status || "pending",
          totalSellPrice: b.totalSellPrice,
          paidAmount: Number(paidResult[0]?.total || 0),
          totalAmount: Number(b.totalSellPrice || 0),
        };
      })
    );

    return NextResponse.json({ bookings: results });
  } catch (error) {
    return handleApiError(error, "portal-bookings");
  }
}
