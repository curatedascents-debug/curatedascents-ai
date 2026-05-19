import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { verifyAdminSession, adminUnauthorizedResponse } from "@/lib/auth/admin-api-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = verifyAdminSession(req);
  if (!auth.authenticated) return adminUnauthorizedResponse();

  try {
    // DISTINCT ON deduplicates any accidental duplicate keys, keeping the most-recently-updated row.
    const result = await db.execute(sql`
      SELECT DISTINCT ON (service_type_key)
        id, service_type_key AS "serviceTypeKey",
        display_name AS "displayName",
        b2c_margin_percent AS "b2cMarginPercent",
        agent_margin_percent AS "agentMarginPercent",
        service_fee_type AS "serviceFeeType",
        service_fee_amount AS "serviceFeeAmount",
        notes, updated_at AS "updatedAt"
      FROM service_type_margins
      ORDER BY service_type_key, updated_at DESC NULLS LAST
    `);
    return NextResponse.json({ margins: result.rows });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch service margins", detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
