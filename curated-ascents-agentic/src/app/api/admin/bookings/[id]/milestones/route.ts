import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { paymentMilestones, bookings, bookingEvents } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET /api/admin/bookings/[id]/milestones - List payment milestones
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bookingId = parseInt(id);

    // Verify booking exists
    const bookingResult = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (bookingResult.length === 0) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const milestones = await db
      .select()
      .from(paymentMilestones)
      .where(eq(paymentMilestones.bookingId, bookingId))
      .orderBy(paymentMilestones.dueDate);

    return NextResponse.json({ success: true, milestones });
  } catch (error) {
    console.error("Error fetching payment milestones:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment milestones" },
      { status: 500 }
    );
  }
}

// POST /api/admin/bookings/[id]/milestones - Create a payment milestone
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bookingId = parseInt(id);
    const body = await req.json();

    // Verify booking exists
    const bookingResult = await db
      .select({
        id: bookings.id,
        totalAmount: bookings.totalAmount,
        currency: bookings.currency,
      })
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (bookingResult.length === 0) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const booking = bookingResult[0];
    const { milestoneType, description, amount, percentage, dueDate, notes } = body;

    if (!milestoneType || !dueDate) {
      return NextResponse.json(
        { error: "milestoneType and dueDate are required" },
        { status: 400 }
      );
    }

    // Calculate amount from percentage if not provided
    let milestoneAmount = parseFloat(amount || "0");
    let milestonePercentage = percentage ? parseFloat(percentage) : null;

    if (!amount && percentage && booking.totalAmount) {
      milestoneAmount = (parseFloat(booking.totalAmount) * parseFloat(percentage)) / 100;
      milestonePercentage = parseFloat(percentage);
    }

    const result = await db
      .insert(paymentMilestones)
      .values({
        bookingId,
        milestoneType,
        description: description || `${milestoneType.charAt(0).toUpperCase() + milestoneType.slice(1)} Payment`,
        amount: milestoneAmount.toFixed(2),
        percentage: milestonePercentage?.toFixed(2),
        dueDate,
        status: "pending",
        currency: booking.currency || "USD",
        notes,
      })
      .returning();

    // Log the event
    await db.insert(bookingEvents).values({
      bookingId,
      eventType: "payment_received",
      eventData: {
        action: "milestone_created",
        milestoneId: result[0].id,
        milestoneType,
        amount: milestoneAmount,
        dueDate,
      },
      performedBy: "admin",
    });

    return NextResponse.json({
      success: true,
      message: "Payment milestone created",
      milestone: result[0],
    });
  } catch (error) {
    console.error("Error creating payment milestone:", error);
    return NextResponse.json(
      { error: "Failed to create payment milestone", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
