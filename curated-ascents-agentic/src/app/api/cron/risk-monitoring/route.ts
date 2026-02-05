/**
 * Risk Monitoring Cron Job
 * Runs daily to assess risk for upcoming trips and send alerts for high-risk bookings
 * Schedule: Daily at 6 AM UTC
 */

import { NextRequest, NextResponse } from "next/server";
import { processUpcomingTripRisks } from "@/lib/risk/risk-compliance-engine";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for Vercel
    const authHeader = request.headers.get("authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Starting risk monitoring cron job...");

    // Process risk assessments for trips in the next 30 days
    const result = await processUpcomingTripRisks(30);

    console.log(
      `Risk monitoring complete: ${result.processed} bookings processed, ` +
      `${result.highRiskCount} high risk, ${result.alertsSent} alerts sent`
    );

    return NextResponse.json({
      success: true,
      processed: result.processed,
      highRiskCount: result.highRiskCount,
      alertsSent: result.alertsSent,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Risk monitoring cron error:", error);
    return NextResponse.json(
      { error: "Risk monitoring failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// Also allow POST for manual triggering
export async function POST(request: NextRequest) {
  return GET(request);
}
