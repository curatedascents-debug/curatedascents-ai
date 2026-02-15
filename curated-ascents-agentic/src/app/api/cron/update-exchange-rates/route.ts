/**
 * Daily Exchange Rate Update Cron
 * Updates exchange rates from external API
 * Schedule: Daily at 6 AM UTC
 */

import { NextRequest, NextResponse } from "next/server";
import {
  updateExchangeRates,
  seedSupportedCurrencies,
} from "@/lib/currency/currency-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("Starting exchange rate update...");

    // Ensure supported currencies are seeded
    const seeded = await seedSupportedCurrencies();
    if (seeded > 0) {
      console.log(`Seeded ${seeded} supported currencies`);
    }

    // Update exchange rates
    const result = await updateExchangeRates();

    console.log(
      `Exchange rate update complete: ${result.updated} rates from ${result.source}`
    );

    return NextResponse.json({
      success: true,
      message: `Updated ${result.updated} exchange rates`,
      source: result.source,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Exchange rate update failed:", error);
    return NextResponse.json(
      {
        error: "Exchange rate update failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Also support POST for manual triggers
export async function POST(req: NextRequest) {
  return GET(req);
}
