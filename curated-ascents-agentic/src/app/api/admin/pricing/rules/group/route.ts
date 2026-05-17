import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { groupDiscountRules } from "@/db/schema";
import { desc } from "drizzle-orm";
import { verifyAdminSession, adminUnauthorizedResponse } from "@/lib/auth/admin-api-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = verifyAdminSession(req);
  if (!auth.authenticated) return adminUnauthorizedResponse(auth.error);

  try {
    const rules = await db.select().from(groupDiscountRules).orderBy(desc(groupDiscountRules.minPax));
    return NextResponse.json({ rules });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch group discount rules", detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = verifyAdminSession(req);
  if (!auth.authenticated) return adminUnauthorizedResponse(auth.error);

  try {
    const body = await req.json();
    const { minPax, maxPax, discountPercent, isActive, label } = body;

    const [rule] = await db
      .insert(groupDiscountRules)
      .values({
        minPax,
        maxPax: maxPax ?? null,
        discountPercent: String(discountPercent),
        isActive,
        label,
      })
      .returning();

    return NextResponse.json({ rule });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create group discount rule", detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
