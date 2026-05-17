import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { pricingConfig } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyAdminSession, adminUnauthorizedResponse } from "@/lib/auth/admin-api-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = verifyAdminSession(req);
  if (!auth.authenticated) return adminUnauthorizedResponse();

  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");

  try {
    if (key) {
      const [row] = await db.select().from(pricingConfig).where(eq(pricingConfig.key, key)).limit(1);
      if (!row) return NextResponse.json({ key, value: null }, { status: 404 });
      return NextResponse.json({ key: row.key, value: row.value, description: row.description });
    }
    const rows = await db.select().from(pricingConfig);
    return NextResponse.json({ config: rows });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch pricing config", detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const auth = verifyAdminSession(req);
  if (!auth.authenticated) return adminUnauthorizedResponse();

  try {
    const { key, value, description } = await req.json();
    if (!key || value === undefined) {
      return NextResponse.json({ error: "key and value are required" }, { status: 400 });
    }

    const existing = await db.select().from(pricingConfig).where(eq(pricingConfig.key, key)).limit(1);
    if (existing.length > 0) {
      await db
        .update(pricingConfig)
        .set({ value: String(value), description: description ?? existing[0].description, updatedAt: new Date() })
        .where(eq(pricingConfig.key, key));
    } else {
      await db.insert(pricingConfig).values({ key, value: String(value), description: description ?? null });
    }

    return NextResponse.json({ success: true, key, value: String(value) });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update pricing config", detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
