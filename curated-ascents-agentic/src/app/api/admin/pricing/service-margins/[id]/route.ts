import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { serviceTypeMargins } from "@/db/schema";
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
    const { b2cMarginPercent, agentMarginPercent } = body;

    const [margin] = await db
      .update(serviceTypeMargins)
      .set({
        b2cMarginPercent: String(b2cMarginPercent),
        agentMarginPercent: String(agentMarginPercent),
        updatedAt: new Date(),
      })
      .where(eq(serviceTypeMargins.id, id))
      .returning();

    return NextResponse.json({ margin });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update service margin", detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
