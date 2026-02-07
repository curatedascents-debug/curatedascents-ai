import { NextResponse } from "next/server";
import { db } from "@/db";
import { quotes } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const clientId = parseInt(request.headers.get("x-customer-id") || "0");
  if (!clientId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  try {
    const clientQuotes = await db
      .select({
        id: quotes.id,
        quoteNumber: quotes.quoteNumber,
        quoteName: quotes.quoteName,
        destination: quotes.destination,
        totalSellPrice: quotes.totalSellPrice,
        status: quotes.status,
        createdAt: quotes.createdAt,
      })
      .from(quotes)
      .where(eq(quotes.clientId, clientId))
      .orderBy(desc(quotes.createdAt));

    return NextResponse.json({ quotes: clientQuotes });
  } catch (error) {
    console.error("Quotes error:", error);
    return NextResponse.json({ error: "Failed to load quotes" }, { status: 500 });
  }
}
