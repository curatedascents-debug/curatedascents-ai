/**
 * Currency Conversion API
 * Convert amounts between currencies
 */

import { NextRequest, NextResponse } from "next/server";
import {
  convertCurrency,
  formatCurrency,
  BASE_CURRENCY,
} from "@/lib/currency/currency-service";

export const dynamic = "force-dynamic";

// GET /api/currency/convert?amount=100&from=USD&to=EUR
export async function GET(req: NextRequest) {
  try {
    const amountStr = req.nextUrl.searchParams.get("amount");
    const fromCurrency = req.nextUrl.searchParams.get("from") || BASE_CURRENCY;
    const toCurrency = req.nextUrl.searchParams.get("to");
    const spreadStr = req.nextUrl.searchParams.get("spread");

    if (!amountStr || !toCurrency) {
      return NextResponse.json(
        { error: "Missing required parameters: amount, to" },
        { status: 400 }
      );
    }

    const amount = parseFloat(amountStr);
    if (isNaN(amount)) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    const spread = spreadStr ? parseFloat(spreadStr) : 0;

    const result = await convertCurrency(amount, fromCurrency, toCurrency, spread);

    return NextResponse.json({
      success: true,
      original: {
        amount: result.originalAmount,
        currency: result.originalCurrency,
        formatted: formatCurrency(result.originalAmount, result.originalCurrency),
      },
      converted: {
        amount: result.convertedAmount,
        currency: result.targetCurrency,
        formatted: formatCurrency(result.convertedAmount, result.targetCurrency),
      },
      rate: result.rate,
      rateTimestamp: result.rateTimestamp.toISOString(),
      spread: spread,
    });
  } catch (error) {
    console.error("Error converting currency:", error);
    return NextResponse.json(
      { error: "Failed to convert currency" },
      { status: 500 }
    );
  }
}

// POST /api/currency/convert - Batch conversion
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, targetCurrency, spread = 0 } = body;

    if (!items || !Array.isArray(items) || !targetCurrency) {
      return NextResponse.json(
        { error: "Missing required fields: items (array), targetCurrency" },
        { status: 400 }
      );
    }

    const results = await Promise.all(
      items.map(async (item: { amount: number; currency: string }) => {
        const result = await convertCurrency(
          item.amount,
          item.currency,
          targetCurrency,
          spread
        );
        return {
          original: {
            amount: result.originalAmount,
            currency: result.originalCurrency,
            formatted: formatCurrency(result.originalAmount, result.originalCurrency),
          },
          converted: {
            amount: result.convertedAmount,
            currency: result.targetCurrency,
            formatted: formatCurrency(result.convertedAmount, result.targetCurrency),
          },
          rate: result.rate,
        };
      })
    );

    // Calculate total
    const totalConverted = results.reduce(
      (sum, r) => sum + r.converted.amount,
      0
    );

    return NextResponse.json({
      success: true,
      items: results,
      total: {
        amount: totalConverted,
        currency: targetCurrency,
        formatted: formatCurrency(totalConverted, targetCurrency),
      },
      spread,
    });
  } catch (error) {
    console.error("Error in batch conversion:", error);
    return NextResponse.json(
      { error: "Failed to convert currencies" },
      { status: 500 }
    );
  }
}
