import { NextResponse } from "next/server";
import { db } from "@/db";
import { clients } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const clientId = parseInt(request.headers.get("x-customer-id") || "0");
  if (!clientId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  try {
    const client = await db
      .select({
        id: clients.id,
        email: clients.email,
        name: clients.name,
        phone: clients.phone,
        country: clients.country,
        preferredCurrency: clients.preferredCurrency,
      })
      .from(clients)
      .where(eq(clients.id, clientId))
      .then((rows) => rows[0]);

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error("Profile error:", error);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const clientId = parseInt(request.headers.get("x-customer-id") || "0");
  if (!clientId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  try {
    const { name, phone, country, preferredCurrency } = await request.json();

    await db
      .update(clients)
      .set({
        name: name || undefined,
        phone: phone || undefined,
        country: country || undefined,
        preferredCurrency: preferredCurrency || undefined,
        updatedAt: new Date(),
      })
      .where(eq(clients.id, clientId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
