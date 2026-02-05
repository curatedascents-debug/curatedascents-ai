/**
 * Nurture Sequences Cron Job
 * Runs daily to process auto-enrollments and send due emails
 * Schedule: Daily at 12 PM UTC (after lead re-engagement)
 */

import { NextRequest, NextResponse } from "next/server";
import {
  processAutoEnrollments,
  processDueEmails,
} from "@/lib/lead-intelligence/nurture-engine";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const maxDuration = 60;

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("Starting nurture sequences cron job...");

    // Step 1: Process auto-enrollments based on triggers
    console.log("Processing auto-enrollments...");
    const enrollmentResults = await processAutoEnrollments();
    console.log(
      `Auto-enrollments: ${enrollmentResults.enrolled} enrolled out of ${enrollmentResults.processed} processed`
    );

    // Step 2: Process and send due emails
    console.log("Processing due emails...");
    const emailResults = await processDueEmails();
    console.log(
      `Emails: ${emailResults.sent} sent, ${emailResults.skipped} skipped, ${emailResults.completed} sequences completed`
    );

    // Combine results
    const allErrors = [
      ...enrollmentResults.errors,
      ...emailResults.errors,
    ];

    if (allErrors.length > 0) {
      console.warn("Nurture sequence errors:", allErrors);
    }

    return NextResponse.json({
      success: true,
      message: "Nurture sequences processed",
      results: {
        enrollments: {
          processed: enrollmentResults.processed,
          enrolled: enrollmentResults.enrolled,
        },
        emails: {
          processed: emailResults.processed,
          sent: emailResults.sent,
          skipped: emailResults.skipped,
          completed: emailResults.completed,
        },
        errors: allErrors.length > 0 ? allErrors : undefined,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Nurture sequences cron error:", error);
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
