import { NextRequest, NextResponse } from "next/server";
import React from "react";
import { sendEmail } from "@/lib/email/send-email";
import {
  getPendingCheckins,
  markCheckinSent,
} from "@/lib/customer-success/feedback-engine";
import TripCheckinEmail from "@/lib/email/templates/trip-checkin";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const maxDuration = 60;

const CRON_SECRET = process.env.CRON_SECRET;

/**
 * Trip Check-ins Cron Job
 * Schedule: Every 2 hours (8 AM, 10 AM, 12 PM, etc.)
 *
 * Sends check-in emails to clients during their trips:
 * - Pre-departure (1 day before)
 * - Day 1 (evening of first day)
 * - Mid-trip (for trips > 3 days)
 * - Post-trip (1 day after)
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const results = {
      checkinsProcessed: 0,
      emailsSent: 0,
      errors: [] as string[],
    };

    // Get pending check-ins (scheduled within next 2 hours)
    const pendingCheckins = await getPendingCheckins(120);
    results.checkinsProcessed = pendingCheckins.length;

    for (const checkin of pendingCheckins) {
      try {
        // Determine email subject and content based on check-in type
        const subjectMap: Record<string, string> = {
          pre_departure: `Your ${checkin.destination} adventure begins tomorrow!`,
          day_1: `How's your first day in ${checkin.destination}?`,
          mid_trip: `Checking in on your ${checkin.destination} adventure`,
          post_trip: `Welcome back from ${checkin.destination}!`,
        };

        const subject = subjectMap[checkin.checkinType] || "How's your trip going?";

        // Send email
        const emailResult = await sendEmail({
          to: checkin.clientEmail,
          subject,
          react: React.createElement(TripCheckinEmail, {
            clientName: checkin.clientName || undefined,
            destination: checkin.destination || "your destination",
            checkinType: checkin.checkinType as "pre_departure" | "day_1" | "mid_trip" | "post_trip",
            bookingReference: checkin.bookingReference || "N/A",
          }),
          logContext: {
            templateType: "trip_checkin",
            toName: checkin.clientName || checkin.clientEmail,
            clientId: checkin.clientId,
            metadata: {
              bookingId: checkin.bookingId,
              checkinType: checkin.checkinType,
              checkinId: checkin.id,
            },
          },
        });

        if (emailResult.sent) {
          await markCheckinSent(checkin.id, emailResult.emailLogId?.toString());
          results.emailsSent++;
        } else {
          results.errors.push(
            `Failed to send to ${checkin.clientEmail}: ${emailResult.error}`
          );
        }
      } catch (error) {
        results.errors.push(
          `Error processing check-in ${checkin.id}: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Trip check-ins processed",
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Trip check-ins cron error:", error);
    return NextResponse.json(
      {
        error: "Cron job failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
