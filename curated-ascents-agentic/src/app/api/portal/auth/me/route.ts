import { NextResponse } from "next/server";
import { db } from "@/db";
import { clients } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const clientId = request.headers.get("x-customer-id");

  if (!clientId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const client = await db
    .select({
      id: clients.id,
      email: clients.email,
      name: clients.name,
      phone: clients.phone,
      country: clients.country,
      preferredCurrency: clients.preferredCurrency,
      createdAt: clients.createdAt,
    })
    .from(clients)
    .where(eq(clients.id, parseInt(clientId)))
    .then((rows) => rows[0]);

  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  return NextResponse.json(client);
}
