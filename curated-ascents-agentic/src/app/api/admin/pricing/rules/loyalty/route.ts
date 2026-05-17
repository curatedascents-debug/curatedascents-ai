import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { loyaltyTiers } from "@/db/schema";
import { verifyAdminSession, adminUnauthorizedResponse } from "@/lib/auth/admin-api-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = verifyAdminSession(req);
  if (!auth.authenticated) return adminUnauthorizedResponse(auth.error);

  try {
    const rules = await db.select().from(loyaltyTiers).orderBy(loyaltyTiers.minPoints);
    return NextResponse.json({ rules });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch loyalty tiers", detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = verifyAdminSession(req);
  if (!auth.authenticated) return adminUnauthorizedResponse(auth.error);

  try {
    const body = await req.json();
    const { tierName, minPoints, discountPercent, isActive } = body;

    const [rule] = await db
      .insert(loyaltyTiers)
      .values({
        tierName,
        minPoints,
        discountPercent: String(discountPercent),
        isActive,
      })
      .returning();

    return NextResponse.json({ rule });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create loyalty tier", detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
