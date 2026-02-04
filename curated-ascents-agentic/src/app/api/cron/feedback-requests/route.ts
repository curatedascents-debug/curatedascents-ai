import { NextRequest, NextResponse } from "next/server";
import React from "react";
import { sendEmail } from "@/lib/email/send-email";
import {
  getPendingSurveys,
  markSurveySent,
} from "@/lib/customer-success/feedback-engine";
import FeedbackRequestEmail from "@/lib/email/templates/feedback-request";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const maxDuration = 60;

const CRON_SECRET = process.env.CRON_SECRET;

/**
 * Feedback Requests Cron Job
 * Schedule: Daily at 10 AM UTC
 *
 * Sends post-trip feedback survey requests:
 * - Initial request 3 days after trip ends
 * - Reminder 5 days after initial request (if not completed)
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const results = {
      surveysProcessed: 0,
      emailsSent: 0,
      errors: [] as string[],
    };

    // Get pending surveys
    const pendingSurveys = await getPendingSurveys();
    results.surveysProcessed = pendingSurveys.length;

    for (const survey of pendingSurveys) {
      try {
        // Send feedback request email
        const emailResult = await sendEmail({
          to: survey.clientEmail,
          subject: `How was your ${survey.destination} adventure? We'd love your feedback!`,
          react: React.createElement(FeedbackRequestEmail, {
            clientName: survey.clientName || undefined,
            destination: survey.destination || "your destination",
            bookingReference: survey.bookingReference || "N/A",
            surveyId: survey.id,
          }),
          logContext: {
            templateType: "feedback_request",
            toName: survey.clientName || survey.clientEmail,
            clientId: survey.clientId,
            metadata: {
              bookingId: survey.bookingId,
              surveyType: survey.surveyType,
              surveyId: survey.id,
            },
          },
        });

        if (emailResult.sent) {
          await markSurveySent(survey.id);
          results.emailsSent++;
        } else {
          results.errors.push(
            `Failed to send to ${survey.clientEmail}: ${emailResult.error}`
          );
        }
      } catch (error) {
        results.errors.push(
          `Error processing survey ${survey.id}: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Feedback requests processed",
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Feedback requests cron error:", error);
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
