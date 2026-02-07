import { NextResponse } from "next/server";
import { db } from "@/db";
import { bookings, paymentMilestones, tripBriefings, quotes } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const clientId = parseInt(request.headers.get("x-customer-id") || "0");
  if (!clientId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const bookingId = parseInt(id);

  try {
    const booking = await db
      .select()
      .from(bookings)
      .where(and(eq(bookings.id, bookingId), eq(bookings.clientId, clientId)))
      .then((rows) => rows[0]);

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Get quote info for destination
    let quoteName = "";
    let destination = "";
    if (booking.quoteId) {
      const q = await db
        .select({ quoteName: quotes.quoteName, destination: quotes.destination })
        .from(quotes)
        .where(eq(quotes.id, booking.quoteId))
        .limit(1);
      quoteName = q[0]?.quoteName || "";
      destination = q[0]?.destination || "";
    }

    // Milestones - strip cost fields
    const milestones = await db
      .select({
        id: paymentMilestones.id,
        description: paymentMilestones.description,
        amount: paymentMilestones.amount,
        dueDate: paymentMilestones.dueDate,
        status: paymentMilestones.status,
        paidDate: paymentMilestones.paidDate,
      })
      .from(paymentMilestones)
      .where(eq(paymentMilestones.bookingId, bookingId));

    // Briefings
    const briefingsRaw = await db
      .select({
        id: tripBriefings.id,
        briefingType: tripBriefings.briefingType,
        content: tripBriefings.content,
      })
      .from(tripBriefings)
      .where(eq(tripBriefings.bookingId, bookingId));

    const briefings = briefingsRaw.map((b) => ({
      id: b.id,
      title: b.briefingType,
      content: typeof b.content === "string" ? b.content : JSON.stringify(b.content, null, 2),
    }));

    return NextResponse.json({
      id: booking.id,
      reference: booking.bookingReference,
      destination: destination || quoteName,
      quoteName,
      startDate: booking.startDate,
      endDate: booking.endDate,
      status: booking.status || "pending",
      totalSellPrice: booking.totalAmount || "0",
      milestones: milestones.map((m) => ({
        id: m.id,
        description: m.description || "Payment",
        amount: m.amount,
        dueDate: m.dueDate,
        status: m.status || "pending",
        paidAt: m.paidDate,
      })),
      briefings,
    });
  } catch (error) {
    console.error("Booking detail error:", error);
    return NextResponse.json({ error: "Failed to load booking" }, { status: 500 });
  }
}
