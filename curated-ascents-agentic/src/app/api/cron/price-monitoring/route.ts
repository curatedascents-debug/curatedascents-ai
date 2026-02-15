import { NextRequest, NextResponse } from "next/server";
import { runPriceMonitoring } from "@/lib/pricing/price-monitor";
import { sendEmail } from "@/lib/email/send-email";
import { db } from "@/db";
import { priceAlerts } from "@/db/schema";
import { gte } from "drizzle-orm";
import PriceAlertDigestEmail from "@/lib/email/templates/price-alert-digest";

export const dynamic = "force-dynamic";

/**
 * POST /api/cron/price-monitoring
 * Run daily price monitoring analysis
 * Schedule: 0 6 * * * (daily at 6 AM UTC)
 */
export async function POST(req: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = req.headers.get("authorization");
    if (
      process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Run price monitoring
    const results = await runPriceMonitoring();

    // Check if we should send a digest email (weekly on Mondays)
    const today = new Date();
    if (today.getDay() === 1) {
      await sendWeeklyDigest();
    }

    console.log(
      `Price monitoring completed: ${results.hotelsAnalyzed} hotels analyzed, ${results.alertsGenerated} alerts generated`
    );

    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in price monitoring cron:", error);
    return NextResponse.json(
      { error: "Failed to run price monitoring" },
      { status: 500 }
    );
  }
}

async function sendWeeklyDigest() {
  try {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Get alerts from the past week
    const weekAlerts = await db
      .select()
      .from(priceAlerts)
      .where(gte(priceAlerts.createdAt, oneWeekAgo));

    if (weekAlerts.length === 0) return;

    const highPriorityCount = weekAlerts.filter((a) => a.priority === "high").length;

    const alertsForEmail = weekAlerts.slice(0, 20).map((a) => ({
      serviceName: a.serviceName,
      alertType: a.alertType,
      currentPrice: parseFloat(a.currentPrice || "0"),
      previousPrice: a.previousPrice ? parseFloat(a.previousPrice) : undefined,
      changePercent: a.changePercent ? parseFloat(a.changePercent) : undefined,
      marketAverage: a.marketAverage ? parseFloat(a.marketAverage) : undefined,
      recommendation: a.recommendation || "",
      priority: a.priority,
    }));

    const today = new Date();
    const dateRange = `${oneWeekAgo.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${today.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

    await sendEmail({
      to: process.env.ADMIN_EMAIL || "admin@curatedascents.com",
      subject: `Price Intelligence: ${weekAlerts.length} alerts (${highPriorityCount} high priority)`,
      react: PriceAlertDigestEmail({
        alerts: alertsForEmail,
        totalAlerts: weekAlerts.length,
        highPriorityCount,
        dateRange,
      }),
      logContext: {
        templateType: "price_alert_digest",
      },
    });
  } catch (err) {
    console.error("Failed to send price alert digest:", err);
  }
}

// Also handle GET for manual testing
export async function GET(req: NextRequest) {
  return POST(req);
}
