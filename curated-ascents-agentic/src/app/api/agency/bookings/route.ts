import { NextResponse } from "next/server";
import { db } from "@/db";
import { bookings, quotes, clients } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { requireAgencyContext, AgencyAuthError } from "@/lib/api/agency-context";
import { hasPermission } from "@/lib/auth/permissions";
import type { AgencyRole } from "@/lib/auth/permissions";

export async function GET() {
  try {
    const ctx = await requireAgencyContext();

    // Check permission
    if (!hasPermission(ctx.role as AgencyRole, "bookings", "view")) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    // Get bookings for this agency only
    const bookingsWithDetails = await db
      .select({
        id: bookings.id,
        bookingReference: bookings.bookingReference,
        status: bookings.status,
        paymentStatus: bookings.paymentStatus,
        totalAmount: bookings.totalAmount,
        paidAmount: bookings.paidAmount,
        balanceAmount: bookings.balanceAmount,
        currency: bookings.currency,
        createdAt: bookings.createdAt,
        clientName: clients.name,
        clientEmail: clients.email,
        quoteName: quotes.quoteName,
        destination: quotes.destination,
      })
      .from(bookings)
      .leftJoin(quotes, eq(bookings.quoteId, quotes.id))
      .leftJoin(clients, eq(bookings.clientId, clients.id))
      .where(eq(bookings.agencyId, ctx.agencyId))
      .orderBy(sql`${bookings.createdAt} DESC`);

    return NextResponse.json({ bookings: bookingsWithDetails });
  } catch (error) {
    if (error instanceof AgencyAuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Error fetching agency bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await requireAgencyContext();

    // Check permission
    if (!hasPermission(ctx.role as AgencyRole, "bookings", "create")) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    const body = await request.json();
    const { quoteId } = body;

    if (!quoteId) {
      return NextResponse.json(
        { error: "Quote ID is required" },
        { status: 400 }
      );
    }

    // Verify quote belongs to this agency
    const [quote] = await db
      .select()
      .from(quotes)
      .where(eq(quotes.id, quoteId))
      .limit(1);

    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    if (quote.agencyId !== ctx.agencyId) {
      return NextResponse.json(
        { error: "Quote does not belong to your agency" },
        { status: 403 }
      );
    }

    // Check if booking already exists for this quote
    const [existingBooking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.quoteId, quoteId))
      .limit(1);

    if (existingBooking) {
      return NextResponse.json(
        { error: "A booking already exists for this quote", booking: existingBooking },
        { status: 409 }
      );
    }

    // Generate booking reference
    const year = new Date().getFullYear();
    const [lastBooking] = await db
      .select({ bookingReference: bookings.bookingReference })
      .from(bookings)
      .where(eq(bookings.agencyId, ctx.agencyId))
      .orderBy(sql`${bookings.id} DESC`)
      .limit(1);

    let nextNumber = 1;
    if (lastBooking?.bookingReference) {
      const match = lastBooking.bookingReference.match(/BK-(\d+)-(\d+)/);
      if (match && parseInt(match[1]) === year) {
        nextNumber = parseInt(match[2]) + 1;
      }
    }
    const bookingReference = `BK-${year}-${String(nextNumber).padStart(4, "0")}`;

    // Create booking
    const [newBooking] = await db
      .insert(bookings)
      .values({
        agencyId: ctx.agencyId,
        quoteId,
        clientId: quote.clientId,
        bookingReference,
        status: "confirmed",
        paymentStatus: "pending",
        totalAmount: quote.totalSellPrice,
        paidAmount: "0",
        balanceAmount: quote.totalSellPrice,
        currency: quote.currency || "USD",
      })
      .returning();

    // Update quote status to accepted
    await db
      .update(quotes)
      .set({ status: "accepted", updatedAt: new Date() })
      .where(eq(quotes.id, quoteId));

    return NextResponse.json({ booking: newBooking }, { status: 201 });
  } catch (error) {
    if (error instanceof AgencyAuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Error creating agency booking:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
