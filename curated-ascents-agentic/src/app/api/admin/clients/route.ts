import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { clients } from "@/db/schema";
import { desc, sql } from "drizzle-orm";
import { verifyAdminSession, adminUnauthorizedResponse } from "@/lib/auth/admin-api-auth";

export async function GET(req: NextRequest) {
  const auth = verifyAdminSession(req);
  if (!auth.authenticated) return adminUnauthorizedResponse(auth.error);

  try {
    const result = await db
      .select({
        id: clients.id,
        email: clients.email,
        name: clients.name,
        phone: clients.phone,
        country: clients.country,
        source: clients.source,
        isActive: clients.isActive,
        createdAt: clients.createdAt,
        updatedAt: clients.updatedAt,
        quotesCount: sql<number>`(SELECT COUNT(*) FROM quotes WHERE quotes.client_id = ${clients.id})`.as('quotes_count'),
      })
      .from(clients)
      .orderBy(desc(clients.createdAt));

    return NextResponse.json({ success: true, clients: result });
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const insertData: any = {
      email: body.email,
      name: body.name || null,
      phone: body.phone || null,
      country: body.country || null,
      source: body.source || "admin",
      isActive: body.isActive ?? true,
    };

    if (body.preferences) insertData.preferences = body.preferences;

    const result = await db.insert(clients).values(insertData).returning();

    return NextResponse.json({
      success: true,
      message: "Client created successfully",
      client: result[0],
    });
  } catch (error) {
    console.error("Error creating client:", error);
    return NextResponse.json(
      { error: "Failed to create client", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
