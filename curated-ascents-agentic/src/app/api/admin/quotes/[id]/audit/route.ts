import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { quoteItems, quoteAuditLog, quotes } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { verifyAdminSession, adminUnauthorizedResponse } from "@/lib/auth/admin-api-auth";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = verifyAdminSession(req);
  if (!auth.authenticated) return adminUnauthorizedResponse();

  const quoteId = parseInt(params.id, 10);
  if (isNaN(quoteId)) return NextResponse.json({ error: "Invalid quote ID" }, { status: 400 });

  try {
    const [quote] = await db.select().from(quotes).where(eq(quotes.id, quoteId)).limit(1);
    if (!quote) return NextResponse.json({ error: "Quote not found" }, { status: 404 });

    const items = await db.select().from(quoteItems).where(eq(quoteItems.quoteId, quoteId));
    const auditEntries = await db
      .select()
      .from(quoteAuditLog)
      .where(eq(quoteAuditLog.quoteId, quoteId))
      .orderBy(desc(quoteAuditLog.createdAt));

    // Compute rateSourceSummary from items
    const rateSourceSummary: Record<string, number> = {};
    for (const item of items) {
      const src = (item as Record<string, unknown>).rateSource as string | null ?? "unknown";
      rateSourceSummary[src] = (rateSourceSummary[src] || 0) + 1;
    }

    // Blended margin
    let totalCost = 0;
    let totalSell = 0;
    for (const item of items) {
      const qty = Number(item.quantity) || 1;
      const cost = parseFloat(String(item.costPrice) || "0");
      const sell = parseFloat(String(item.sellPrice) || "0");
      totalCost += cost * qty;
      totalSell += sell * qty;
    }
    const blendedMarginPct = totalCost > 0 ? ((totalSell - totalCost) / totalCost * 100).toFixed(1) : null;

    return NextResponse.json({
      quote,
      items,
      auditEntries,
      rateSourceSummary,
      blendedMarginPercent: blendedMarginPct,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch audit data", detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
