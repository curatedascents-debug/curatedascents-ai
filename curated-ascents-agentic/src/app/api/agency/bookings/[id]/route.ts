import { NextResponse } from "next/server";
import { db } from "@/db";
import { bookings, quotes, quoteItems, clients } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { requireAgencyContext, AgencyAuthError } from "@/lib/api/agency-context";
import { hasPermission } from "@/lib/auth/permissions";
import type { AgencyRole } from "@/lib/auth/permissions";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await requireAgencyContext();
    const { id } = await params;
    const bookingId = parseInt(id, 10);

    if (isNaN(bookingId)) {
      return NextResponse.json({ error: "Invalid booking ID" }, { status: 400 });
    }

    // Check permission
    if (!hasPermission(ctx.role as AgencyRole, "bookings", "view")) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    // Get booking (must belong to this agency)
    const [booking] = await db
      .select({
        id: bookings.id,
        bookingReference: bookings.bookingReference,
        status: bookings.status,
        paymentStatus: bookings.paymentStatus,
        totalAmount: bookings.totalAmount,
        paidAmount: bookings.paidAmount,
        balanceAmount: bookings.balanceAmount,
        currency: bookings.currency,
        supplierConfirmations: bookings.supplierConfirmations,
        operationsNotes: bookings.operationsNotes,
        createdAt: bookings.createdAt,
        quoteId: bookings.quoteId,
        quoteNumber: quotes.quoteNumber,
        quoteName: quotes.quoteName,
        destination: quotes.destination,
        numberOfPax: quotes.numberOfPax,
        clientName: clients.name,
        clientEmail: clients.email,
      })
      .from(bookings)
      .leftJoin(quotes, eq(bookings.quoteId, quotes.id))
      .leftJoin(clients, eq(bookings.clientId, clients.id))
      .where(
        and(
          eq(bookings.id, bookingId),
          eq(bookings.agencyId, ctx.agencyId)
        )
      )
      .limit(1);

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Get quote items if quote exists
    let items: any[] = [];
    if (booking.quoteId) {
      items = await db
        .select()
        .from(quoteItems)
        .where(eq(quoteItems.quoteId, booking.quoteId));
    }

    return NextResponse.json({
      booking,
      quoteItems: items,
    });
  } catch (error) {
    if (error instanceof AgencyAuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Error fetching booking:", error);
    return NextResponse.json(
      { error: "Failed to fetch booking" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await requireAgencyContext();
    const { id } = await params;
    const bookingId = parseInt(id, 10);

    if (isNaN(bookingId)) {
      return NextResponse.json({ error: "Invalid booking ID" }, { status: 400 });
    }

    // Check permission
    if (!hasPermission(ctx.role as AgencyRole, "bookings", "update")) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    // Verify booking belongs to this agency
    const [existingBooking] = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.id, bookingId),
          eq(bookings.agencyId, ctx.agencyId)
        )
      )
      .limit(1);

    if (!existingBooking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const body = await request.json();
    const { status, paymentAmount, operationsNotes } = body;

    const updates: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (status) {
      updates.status = status;
    }

    if (operationsNotes !== undefined) {
      updates.operationsNotes = operationsNotes;
    }

    // Handle payment recording
    if (paymentAmount && paymentAmount > 0) {
      const currentPaid = parseFloat(existingBooking.paidAmount || "0");
      const totalAmount = parseFloat(existingBooking.totalAmount || "0");
      const newPaid = currentPaid + paymentAmount;
      const newBalance = Math.max(0, totalAmount - newPaid);

      updates.paidAmount = newPaid.toFixed(2);
      updates.balanceAmount = newBalance.toFixed(2);

      if (newBalance <= 0) {
        updates.paymentStatus = "paid";
      } else if (newPaid > 0) {
        updates.paymentStatus = "partial";
      }
    }

    const [updatedBooking] = await db
      .update(bookings)
      .set(updates)
      .where(eq(bookings.id, bookingId))
      .returning();

    return NextResponse.json({ booking: updatedBooking });
  } catch (error) {
    if (error instanceof AgencyAuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Error updating booking:", error);
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 }
    );
  }
}
