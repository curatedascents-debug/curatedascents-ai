import { NextRequest, NextResponse } from "next/server";
import { processExpiredHolds } from "@/lib/availability/availability-engine";

export const dynamic = "force-dynamic";

/**
 * POST /api/cron/release-expired-holds
 *
 * Cron job to automatically release expired inventory holds.
 * This ensures that holds that have timed out are released back to available inventory.
 *
 * Triggered daily by Vercel Cron (Hobby plan limitation).
 * In production, this should run more frequently (every 5-15 minutes).
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

    console.log("[CRON] Starting expired holds processing...");

    // Process expired holds
    const result = await processExpiredHolds();

    console.log(`[CRON] Expired holds processing complete:`, {
      processed: result.processed,
      released: result.released,
    });

    return NextResponse.json({
      success: true,
      processed: result.processed,
      released: result.released,
      message: `Processed ${result.processed} expired holds, released ${result.released} back to inventory`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[CRON] Error processing expired holds:", error);
    return NextResponse.json(
      {
        error: "Failed to process expired holds",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cron/release-expired-holds
 * Health check and manual trigger endpoint
 */
export async function GET(req: NextRequest) {
  try {
    // Allow manual triggering without secret for testing
    const { searchParams } = new URL(req.url);
    const execute = searchParams.get("execute") === "true";

    if (execute) {
      const result = await processExpiredHolds();

      return NextResponse.json({
        success: true,
        processed: result.processed,
        released: result.released,
        message: "Manual execution completed",
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      status: "ok",
      endpoint: "/api/cron/release-expired-holds",
      description: "Releases expired inventory holds back to available inventory",
      schedule: "Daily (Vercel Hobby plan)",
      lastCheck: new Date().toISOString(),
      usage: {
        manual: "GET ?execute=true",
        cron: "POST with Bearer token",
      },
    });
  } catch (error) {
    console.error("Error in expired holds health check:", error);
    return NextResponse.json(
      { error: "Health check failed" },
      { status: 500 }
    );
  }
}
