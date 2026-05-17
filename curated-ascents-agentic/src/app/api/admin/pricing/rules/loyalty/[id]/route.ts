import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { loyaltyTiers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyAdminSession, adminUnauthorizedResponse } from "@/lib/auth/admin-api-auth";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = verifyAdminSession(req);
  if (!auth.authenticated) return adminUnauthorizedResponse(auth.error);

  const id = parseInt(params.id, 10);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  try {
    const body = await req.json();
    const { tierName, minPoints, discountPercent, isActive } = body;

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (tierName !== undefined) updates.tierName = tierName;
    if (minPoints !== undefined) updates.minPoints = minPoints;
    if (discountPercent !== undefined) updates.discountPercent = String(discountPercent);
    if (isActive !== undefined) updates.isActive = isActive;

    const [rule] = await db
      .update(loyaltyTiers)
      .set(updates)
      .where(eq(loyaltyTiers.id, id))
      .returning();

    return NextResponse.json({ rule });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update loyalty tier", detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = verifyAdminSession(req);
  if (!auth.authenticated) return adminUnauthorizedResponse(auth.error);

  const id = parseInt(params.id, 10);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  try {
    await db.delete(loyaltyTiers).where(eq(loyaltyTiers.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete loyalty tier", detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
