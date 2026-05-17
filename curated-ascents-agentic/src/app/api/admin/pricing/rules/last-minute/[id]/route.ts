import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { lastMinuteRules } from "@/db/schema";
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
    const { daysBeforeDeparture, discountPercent, isActive, label } = body;

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (daysBeforeDeparture !== undefined) updates.daysBeforeDeparture = daysBeforeDeparture;
    if (discountPercent !== undefined) updates.discountPercent = String(discountPercent);
    if (isActive !== undefined) updates.isActive = isActive;
    if (label !== undefined) updates.label = label;

    const [rule] = await db
      .update(lastMinuteRules)
      .set(updates)
      .where(eq(lastMinuteRules.id, id))
      .returning();

    return NextResponse.json({ rule });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update last minute rule", detail: error instanceof Error ? error.message : String(error) },
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
    await db.delete(lastMinuteRules).where(eq(lastMinuteRules.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete last minute rule", detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
