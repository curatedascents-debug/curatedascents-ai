import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bookings, tripBriefings, bookingEvents, clients, quotes, quoteItems, supplierConfirmationRequests, suppliers } from "@/db/schema";
import { eq, and, ne, isNull, or } from "drizzle-orm";
import React from "react";
import { sendEmail } from "@/lib/email/send-email";
import TripBriefing7DayEmail from "@/lib/email/templates/trip-briefing-7day";
import TripBriefing24HourEmail from "@/lib/email/templates/trip-briefing-24hour";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const maxDuration = 60;

const CRON_SECRET = process.env.CRON_SECRET;

/**
 * Trip Briefings Cron Job
 * Schedule: Daily at 10 AM UTC
 *
 * Logic:
 * - Send 7-day briefing 7 days before trip start
 * - Send 24-hour briefing 1 day before trip start
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate target dates
    const sevenDaysOut = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const oneDayOut = new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const results = {
      sevenDayBriefingsSent: 0,
      twentyFourHourBriefingsSent: 0,
      errors: [] as string[],
    };

    // Find bookings starting in 7 days (for 7-day briefing)
    const sevenDayBookings = await db
      .select({
        id: bookings.id,
        bookingReference: bookings.bookingReference,
        clientId: bookings.clientId,
        quoteId: bookings.quoteId,
        startDate: bookings.startDate,
        endDate: bookings.endDate,
        specialRequests: bookings.specialRequests,
      })
      .from(bookings)
      .where(
        and(
          eq(bookings.startDate, sevenDaysOut),
          ne(bookings.status, "cancelled")
        )
      );

    for (const booking of sevenDayBookings) {
      // Check if 7-day briefing already sent
      const existingBriefing = await db
        .select({ id: tripBriefings.id })
        .from(tripBriefings)
        .where(
          and(
            eq(tripBriefings.bookingId, booking.id),
            eq(tripBriefings.briefingType, "7_day")
          )
        )
        .limit(1);

      if (existingBriefing.length > 0) continue; // Already sent

      try {
        await sendTripBriefing(booking, "7_day");
        results.sevenDayBriefingsSent++;
      } catch (error) {
        results.errors.push(`Failed to send 7-day briefing for ${booking.bookingReference}: ${error}`);
      }
    }

    // Find bookings starting tomorrow (for 24-hour briefing)
    const oneDayBookings = await db
      .select({
        id: bookings.id,
        bookingReference: bookings.bookingReference,
        clientId: bookings.clientId,
        quoteId: bookings.quoteId,
        startDate: bookings.startDate,
        endDate: bookings.endDate,
        specialRequests: bookings.specialRequests,
      })
      .from(bookings)
      .where(
        and(
          eq(bookings.startDate, oneDayOut),
          ne(bookings.status, "cancelled")
        )
      );

    for (const booking of oneDayBookings) {
      // Check if 24-hour briefing already sent
      const existingBriefing = await db
        .select({ id: tripBriefings.id })
        .from(tripBriefings)
        .where(
          and(
            eq(tripBriefings.bookingId, booking.id),
            eq(tripBriefings.briefingType, "24_hour")
          )
        )
        .limit(1);

      if (existingBriefing.length > 0) continue; // Already sent

      try {
        await sendTripBriefing(booking, "24_hour");
        results.twentyFourHourBriefingsSent++;
      } catch (error) {
        results.errors.push(`Failed to send 24-hour briefing for ${booking.bookingReference}: ${error}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Trip briefings processed",
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Trip briefings cron error:", error);
    return NextResponse.json(
      { error: "Cron job failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

async function sendTripBriefing(
  booking: {
    id: number;
    bookingReference: string | null;
    clientId: number | null;
    quoteId: number | null;
    startDate: string | null;
    endDate: string | null;
    specialRequests: string | null;
  },
  briefingType: "7_day" | "24_hour"
) {
  if (!booking.clientId) return;

  // Get client info
  const clientResult = await db
    .select({ email: clients.email, name: clients.name })
    .from(clients)
    .where(eq(clients.id, booking.clientId))
    .limit(1);

  if (clientResult.length === 0 || !clientResult[0].email) return;

  const client = clientResult[0];

  // Get quote info
  let tripName: string | undefined;
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
      tripName = quoteResult[0].quoteName || undefined;
      destination = quoteResult[0].destination || undefined;
      numberOfPax = quoteResult[0].numberOfPax || undefined;
    }
  }

  // Get services
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

  // Build briefing content
  const content = {
    bookingReference: booking.bookingReference,
    clientName: client.name,
    tripName,
    destination,
    startDate: booking.startDate,
    endDate: booking.endDate,
    numberOfPax,
    services,
    specialRequests: booking.specialRequests,
    generatedAt: new Date().toISOString(),
  };

  // Save briefing
  const briefingResult = await db
    .insert(tripBriefings)
    .values({
      bookingId: booking.id,
      briefingType,
      content,
      sentAt: new Date(),
    })
    .returning();

  // Send email
  const EmailComponent = briefingType === "24_hour" ? TripBriefing24HourEmail : TripBriefing7DayEmail;

  await sendEmail({
    to: client.email,
    subject: briefingType === "24_hour"
      ? `Your Trip Starts Tomorrow! ${booking.bookingReference} — CuratedAscents`
      : `Trip Briefing: ${booking.bookingReference} — CuratedAscents`,
    react: React.createElement(EmailComponent, {
      clientName: client.name || undefined,
      bookingReference: booking.bookingReference || `Booking #${booking.id}`,
      tripName,
      destination,
      startDate: booking.startDate || undefined,
      endDate: booking.endDate || undefined,
      numberOfPax,
      services,
      specialRequests: booking.specialRequests || undefined,
    }),
    logContext: {
      templateType: `trip_briefing_${briefingType}`,
      toName: client.name || undefined,
      clientId: booking.clientId,
      bookingId: booking.id,
      metadata: { briefingId: briefingResult[0]?.id },
    },
  });

  // Log event
  await db.insert(bookingEvents).values({
    bookingId: booking.id,
    eventType: "briefing_sent",
    eventData: {
      briefingId: briefingResult[0]?.id,
      briefingType,
      automated: true,
    },
    performedBy: "system",
  });
}

export async function POST(req: NextRequest) {
  return GET(req);
}
