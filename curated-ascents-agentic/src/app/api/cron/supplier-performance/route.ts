import { NextRequest, NextResponse } from "next/server";
import {
  calculateAllSupplierPerformance,
  sendPendingConfirmationFollowups,
} from "@/lib/suppliers/supplier-relations-engine";

export const dynamic = "force-dynamic";

/**
 * POST /api/cron/supplier-performance
 *
 * Cron job to calculate supplier performance metrics and send follow-ups.
 * Runs daily to:
 * 1. Calculate performance metrics for all suppliers (last 30 days)
 * 2. Send follow-ups for pending confirmation requests (older than 48 hours)
 */
export async function POST(req: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("[CRON] Starting supplier performance calculation...");

    // Calculate performance for last 30 days
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const performanceResult = await calculateAllSupplierPerformance(
      thirtyDaysAgo,
      now
    );

    console.log(`[CRON] Performance calculated: ${performanceResult.processed} suppliers, ${performanceResult.errors} errors`);

    // Send follow-ups for pending confirmations older than 48 hours
    console.log("[CRON] Sending follow-ups for pending confirmations...");

    const followupResult = await sendPendingConfirmationFollowups(48);

    console.log(`[CRON] Follow-ups sent: ${followupResult.sent}, errors: ${followupResult.errors}`);

    return NextResponse.json({
      success: true,
      performance: {
        processed: performanceResult.processed,
        errors: performanceResult.errors,
      },
      followups: {
        sent: followupResult.sent,
        errors: followupResult.errors,
      },
      message: "Supplier performance cron completed",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[CRON] Error in supplier performance cron:", error);
    return NextResponse.json(
      {
        error: "Failed to run supplier performance cron",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cron/supplier-performance
 * Health check and manual trigger endpoint
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const execute = searchParams.get("execute") === "true";
    const daysBack = parseInt(searchParams.get("daysBack") || "30");

    if (execute) {
      const now = new Date();
      const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

      const performanceResult = await calculateAllSupplierPerformance(
        startDate,
        now
      );

      return NextResponse.json({
        success: true,
        performance: {
          processed: performanceResult.processed,
          errors: performanceResult.errors,
          period: {
            start: startDate.toISOString(),
            end: now.toISOString(),
          },
        },
        message: "Manual execution completed",
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      status: "ok",
      endpoint: "/api/cron/supplier-performance",
      description: "Calculates supplier performance metrics and sends confirmation follow-ups",
      schedule: "Daily",
      lastCheck: new Date().toISOString(),
      usage: {
        manual: "GET ?execute=true&daysBack=30",
        cron: "POST with Bearer token",
      },
    });
  } catch (error) {
    console.error("Error in supplier performance health check:", error);
    return NextResponse.json(
      { error: "Health check failed" },
      { status: 500 }
    );
  }
}
