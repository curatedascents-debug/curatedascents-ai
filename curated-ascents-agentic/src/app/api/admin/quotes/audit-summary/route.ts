import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { quoteItems, quoteAuditLog, quotes } from "@/db/schema";
import { sql } from "drizzle-orm";
import { verifyAdminSession, adminUnauthorizedResponse } from "@/lib/auth/admin-api-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = verifyAdminSession(req);
  if (!auth.authenticated) return adminUnauthorizedResponse();

  try {
    // Total quotes
    const [{ total }] = await db
      .select({ total: sql<number>`COUNT(*)` })
      .from(quotes) as [{ total: number }];

    // rateSource breakdown across all quoteItems
    const rateSourceRows = await db.execute(sql`
      SELECT rate_source, COUNT(*) AS cnt
      FROM quote_items
      WHERE rate_source IS NOT NULL
      GROUP BY rate_source
    `);
    const rateSourceBreakdown: Record<string, number> = {};
    for (const row of rateSourceRows.rows as Array<{ rate_source: string; cnt: string }>) {
      rateSourceBreakdown[row.rate_source] = parseInt(row.cnt, 10);
    }

    // Average margin by service type margin key
    const marginRows = await db.execute(sql`
      SELECT service_type_margin_key, AVG(margin_percent::numeric) AS avg_margin
      FROM quote_items
      WHERE service_type_margin_key IS NOT NULL AND margin_percent IS NOT NULL
      GROUP BY service_type_margin_key
      ORDER BY service_type_margin_key
    `);
    const avgMarginByServiceType: Record<string, string> = {};
    for (const row of marginRows.rows as Array<{ service_type_margin_key: string; avg_margin: string }>) {
      avgMarginByServiceType[row.service_type_margin_key] = parseFloat(row.avg_margin).toFixed(1);
    }

    // Quotes with at least one ai_estimate item
    const [{ aiEstimateQuotes }] = await db.execute(sql`
      SELECT COUNT(DISTINCT quote_id) AS ai_estimate_quotes
      FROM quote_items
      WHERE rate_source = 'ai_estimate'
    `) as unknown as [{ aiEstimateQuotes: string }];

    return NextResponse.json({
      totalQuotes: Number(total),
      rateSourceBreakdown,
      avgMarginByServiceType,
      quotesWithAiEstimate: parseInt(String(aiEstimateQuotes || "0"), 10),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch audit summary", detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
