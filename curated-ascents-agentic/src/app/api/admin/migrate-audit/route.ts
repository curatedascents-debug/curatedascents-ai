import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { verifyAdminSession, adminUnauthorizedResponse } from "@/lib/auth/admin-api-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = verifyAdminSession(req);
  if (!auth.authenticated) return adminUnauthorizedResponse();

  try {
    // Add audit columns to quote_items (IF NOT EXISTS per column)
    await db.execute(sql`
      ALTER TABLE quote_items
        ADD COLUMN IF NOT EXISTS rate_source VARCHAR(50),
        ADD COLUMN IF NOT EXISTS source_reference VARCHAR(255),
        ADD COLUMN IF NOT EXISTS source_url VARCHAR(500),
        ADD COLUMN IF NOT EXISTS margin_percent NUMERIC(5,2),
        ADD COLUMN IF NOT EXISTS service_type_margin_key VARCHAR(100),
        ADD COLUMN IF NOT EXISTS base_sell_price NUMERIC(10,2),
        ADD COLUMN IF NOT EXISTS applied_discounts JSONB,
        ADD COLUMN IF NOT EXISTS calculation_note TEXT
    `);

    // Create quote_audit_log table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS quote_audit_log (
        id SERIAL PRIMARY KEY,
        quote_id INTEGER REFERENCES quotes(id),
        event_type VARCHAR(100) NOT NULL,
        changed_by VARCHAR(100),
        changed_by_detail VARCHAR(255),
        tools_used JSONB,
        rate_source_summary JSONB,
        quote_snapshot JSONB,
        calculation_summary TEXT,
        ip_address VARCHAR(45),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS quote_audit_log_quote_idx ON quote_audit_log(quote_id)
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS quote_audit_log_event_idx ON quote_audit_log(event_type)
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS quote_audit_log_created_idx ON quote_audit_log(created_at)
    `);

    return NextResponse.json({
      success: true,
      message: "Audit columns added to quote_items and quote_audit_log table created.",
    });
  } catch (error) {
    console.error("migrate-audit error:", error);
    return NextResponse.json(
      { error: "Migration failed", detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
