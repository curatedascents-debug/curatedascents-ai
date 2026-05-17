import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { serviceTypeMargins } from "@/db/schema";
import { verifyAdminSession, adminUnauthorizedResponse } from "@/lib/auth/admin-api-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = verifyAdminSession(req);
  if (!auth.authenticated) return adminUnauthorizedResponse();

  try {
    const margins = await db.select().from(serviceTypeMargins).orderBy(serviceTypeMargins.serviceTypeKey);
    return NextResponse.json({ margins });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch service margins", detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
