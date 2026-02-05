/**
 * Currency Exchange Rates API
 * GET - Get current exchange rates
 * POST - Update exchange rates (admin only)
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { exchangeRates } from "@/db/schema";
import { desc } from "drizzle-orm";
import {
  fetchExchangeRates,
  updateExchangeRates,
  getSupportedCurrencies,
  BASE_CURRENCY,
  FALLBACK_RATES,
} from "@/lib/currency/currency-service";

export const dynamic = "force-dynamic";

// GET /api/currency/rates - Get current exchange rates
export async function GET(req: NextRequest) {
  try {
    const baseCurrency = req.nextUrl.searchParams.get("base") || BASE_CURRENCY;

    // Get rates from database
    const dbRates = await db
      .select({
        fromCurrency: exchangeRates.fromCurrency,
        toCurrency: exchangeRates.toCurrency,
        rate: exchangeRates.rate,
        source: exchangeRates.source,
        fetchedAt: exchangeRates.fetchedAt,
      })
      .from(exchangeRates)
      .orderBy(desc(exchangeRates.fetchedAt));

    // Build rates object
    const rates: Record<string, number> = { [baseCurrency]: 1 };
    let lastUpdated: Date | null = null;
    let source = "fallback";

    if (dbRates.length > 0) {
      for (const rate of dbRates) {
        if (rate.fromCurrency === baseCurrency) {
          rates[rate.toCurrency] = parseFloat(rate.rate);
          if (!lastUpdated && rate.fetchedAt) {
            lastUpdated = rate.fetchedAt;
            source = rate.source || "database";
          }
        }
      }
    }

    // If no DB rates, use fallback
    if (Object.keys(rates).length <= 1) {
      Object.assign(rates, FALLBACK_RATES);
      source = "fallback";
    }

    // Get supported currencies
    const currencies = await getSupportedCurrencies();

    return NextResponse.json({
      success: true,
      baseCurrency,
      rates,
      currencies,
      source,
      lastUpdated: lastUpdated?.toISOString() || null,
    });
  } catch (error) {
    console.error("Error getting exchange rates:", error);
    return NextResponse.json(
      { error: "Failed to get exchange rates" },
      { status: 500 }
    );
  }
}

// POST /api/currency/rates - Update exchange rates
export async function POST(req: NextRequest) {
  try {
    // Optionally check for admin auth here
    const result = await updateExchangeRates();

    return NextResponse.json({
      success: true,
      message: `Updated ${result.updated} exchange rates`,
      source: result.source,
    });
  } catch (error) {
    console.error("Error updating exchange rates:", error);
    return NextResponse.json(
      { error: "Failed to update exchange rates" },
      { status: 500 }
    );
  }
}
