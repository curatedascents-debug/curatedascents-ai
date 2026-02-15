import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { dailyFxRates } from "@/db/schema";
import { desc, gte } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const days = Math.min(parseInt(searchParams.get("days") || "30", 10), 365);

    const since = new Date();
    since.setDate(since.getDate() - days);
    const sinceStr = since.toISOString().split("T")[0];

    const rates = await db
      .select()
      .from(dailyFxRates)
      .where(gte(dailyFxRates.rateDate, sinceStr))
      .orderBy(desc(dailyFxRates.rateDate));

    return NextResponse.json({
      success: true,
      days,
      count: rates.length,
      rates,
    });
  } catch (error) {
    console.error("Failed to fetch daily FX rates:", error);
    return NextResponse.json(
      { error: "Failed to fetch daily FX rates" },
      { status: 500 }
    );
  }
}
