import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { earlyBirdRules } from "@/db/schema";
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
    const { daysInAdvance, discountPercent, isActive, label } = body;

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (daysInAdvance !== undefined) updates.daysInAdvance = daysInAdvance;
    if (discountPercent !== undefined) updates.discountPercent = String(discountPercent);
    if (isActive !== undefined) updates.isActive = isActive;
    if (label !== undefined) updates.label = label;

    const [rule] = await db
      .update(earlyBirdRules)
      .set(updates)
      .where(eq(earlyBirdRules.id, id))
      .returning();

    return NextResponse.json({ rule });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update early bird rule", detail: error instanceof Error ? error.message : String(error) },
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
    await db.delete(earlyBirdRules).where(eq(earlyBirdRules.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete early bird rule", detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
