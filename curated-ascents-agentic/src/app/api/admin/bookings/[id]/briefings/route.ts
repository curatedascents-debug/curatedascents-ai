import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { tripBriefings, bookings, bookingEvents, clients, quotes, quoteItems, supplierConfirmationRequests, suppliers } from "@/db/schema";
import { eq } from "drizzle-orm";
import React from "react";
import { sendEmail } from "@/lib/email/send-email";
import TripBriefing7DayEmail from "@/lib/email/templates/trip-briefing-7day";
import TripBriefing24HourEmail from "@/lib/email/templates/trip-briefing-24hour";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET /api/admin/bookings/[id]/briefings - List trip briefings
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

    const briefingsList = await db
      .select()
      .from(tripBriefings)
      .where(eq(tripBriefings.bookingId, bookingId));

    return NextResponse.json({ success: true, briefings: briefingsList });
  } catch (error) {
    console.error("Error fetching trip briefings:", error);
    return NextResponse.json(
      { error: "Failed to fetch trip briefings" },
      { status: 500 }
    );
  }
}

// POST /api/admin/bookings/[id]/briefings - Generate and optionally send a trip briefing
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bookingId = parseInt(id);
    const body = await req.json();
    const { briefingType, sendEmail: shouldSendEmail } = body;

    if (!briefingType || !["7_day", "24_hour", "custom"].includes(briefingType)) {
      return NextResponse.json(
        { error: "briefingType must be '7_day', '24_hour', or 'custom'" },
        { status: 400 }
      );
    }

    // Get booking with all related data
    const bookingResult = await db
      .select({
        id: bookings.id,
        bookingReference: bookings.bookingReference,
        clientId: bookings.clientId,
        quoteId: bookings.quoteId,
        startDate: bookings.startDate,
        endDate: bookings.endDate,
        specialRequests: bookings.specialRequests,
        emergencyContact: bookings.emergencyContact,
        operationsNotes: bookings.operationsNotes,
      })
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (bookingResult.length === 0) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const booking = bookingResult[0];

    // Get client info
    let clientName: string | undefined;
    let clientEmail: string | undefined;
    if (booking.clientId) {
      const clientResult = await db
        .select({ name: clients.name, email: clients.email })
        .from(clients)
        .where(eq(clients.id, booking.clientId))
        .limit(1);

      if (clientResult.length > 0) {
        clientName = clientResult[0].name || undefined;
        clientEmail = clientResult[0].email || undefined;
      }
    }

    // Get quote info
    let quoteName: string | undefined;
    let destination: string | undefined;
    let numberOfPax: number | undefined;
    if (booking.quoteId) {
      const quoteResult = await db
        .select({
          quoteName: quotes.quoteName,
          destination: quotes.destination,
          numberOfPax: quotes.numberOfPax,
        })
        .from(quotes)
        .where(eq(quotes.id, booking.quoteId))
        .limit(1);

      if (quoteResult.length > 0) {
        quoteName = quoteResult[0].quoteName || undefined;
        destination = quoteResult[0].destination || undefined;
        numberOfPax = quoteResult[0].numberOfPax || undefined;
      }
    }

    // Get quote items (services)
    let services: Array<{ serviceType: string; serviceName: string; description?: string }> = [];
    if (booking.quoteId) {
      const itemsResult = await db
        .select({
          serviceType: quoteItems.serviceType,
          serviceName: quoteItems.serviceName,
          description: quoteItems.description,
        })
        .from(quoteItems)
        .where(eq(quoteItems.quoteId, booking.quoteId));

      services = itemsResult.map(item => ({
        serviceType: item.serviceType,
        serviceName: item.serviceName || item.serviceType,
        description: item.description || undefined,
      }));
    }

    // Get supplier confirmations
    const confirmations = await db
      .select({
        serviceName: supplierConfirmationRequests.serviceName,
        serviceType: supplierConfirmationRequests.serviceType,
        status: supplierConfirmationRequests.status,
        confirmationNumber: supplierConfirmationRequests.confirmationNumber,
        supplierName: suppliers.name,
      })
      .from(supplierConfirmationRequests)
      .leftJoin(suppliers, eq(supplierConfirmationRequests.supplierId, suppliers.id))
      .where(eq(supplierConfirmationRequests.bookingId, bookingId));

    // Build briefing content
    const content = {
      bookingReference: booking.bookingReference,
      clientName,
      tripName: quoteName,
      destination,
      startDate: booking.startDate,
      endDate: booking.endDate,
      numberOfPax,
      services,
      confirmations: confirmations.map(c => ({
        serviceName: c.serviceName,
        serviceType: c.serviceType,
        status: c.status,
        confirmationNumber: c.confirmationNumber,
        supplierName: c.supplierName,
      })),
      specialRequests: booking.specialRequests,
      emergencyContact: booking.emergencyContact,
      generatedAt: new Date().toISOString(),
    };

    // Save briefing
    const result = await db
      .insert(tripBriefings)
      .values({
        bookingId,
        briefingType,
        content,
      })
      .returning();

    // Log event
    await db.insert(bookingEvents).values({
      bookingId,
      eventType: "briefing_sent",
      eventData: {
        briefingId: result[0].id,
        briefingType,
        generated: true,
        sent: shouldSendEmail && !!clientEmail,
      },
      performedBy: "admin",
    });

    // Send email if requested
    let emailSent = false;
    if (shouldSendEmail && clientEmail) {
      const EmailComponent = briefingType === "24_hour" ? TripBriefing24HourEmail : TripBriefing7DayEmail;

      await sendEmail({
        to: clientEmail,
        subject: briefingType === "24_hour"
          ? `Your Trip Starts Tomorrow! ${booking.bookingReference} — CuratedAscents`
          : `Trip Briefing: ${booking.bookingReference} — CuratedAscents`,
        react: React.createElement(EmailComponent, {
          clientName,
          bookingReference: booking.bookingReference || `Booking #${bookingId}`,
          tripName: quoteName,
          destination,
          startDate: booking.startDate || undefined,
          endDate: booking.endDate || undefined,
          numberOfPax,
          services,
          specialRequests: booking.specialRequests || undefined,
        }),
        logContext: {
          templateType: `trip_briefing_${briefingType}`,
          toName: clientName,
          clientId: booking.clientId || undefined,
          bookingId,
          metadata: { briefingId: result[0].id },
        },
      });

      // Update briefing with sent timestamp
      await db
        .update(tripBriefings)
        .set({ sentAt: new Date(), updatedAt: new Date() })
        .where(eq(tripBriefings.id, result[0].id));

      emailSent = true;
    }

    return NextResponse.json({
      success: true,
      message: `Trip briefing ${shouldSendEmail && emailSent ? "generated and sent" : "generated"}`,
      briefing: result[0],
      emailSent,
    });
  } catch (error) {
    console.error("Error creating trip briefing:", error);
    return NextResponse.json(
      { error: "Failed to create trip briefing", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
