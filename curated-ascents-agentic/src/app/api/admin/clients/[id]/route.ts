import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { clients, quotes } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await db
      .select()
      .from(clients)
      .where(eq(clients.id, parseInt(id)))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const clientQuotes = await db
      .select()
      .from(quotes)
      .where(eq(quotes.clientId, parseInt(id)))
      .orderBy(desc(quotes.createdAt));

    return NextResponse.json({
      success: true,
      client: result[0],
      quotes: clientQuotes,
    });
  } catch (error) {
    console.error("Error fetching client:", error);
    return NextResponse.json({ error: "Failed to fetch client" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updateData: any = { updatedAt: new Date() };

    const allowedFields = ["name", "email", "phone", "country", "source", "preferences", "isActive"];
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const result = await db
      .update(clients)
      .set(updateData)
      .where(eq(clients.id, parseInt(id)))
      .returning();

    if (!result || result.length === 0) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Client updated successfully",
      client: result[0],
    });
  } catch (error) {
    console.error("Error updating client:", error);
    return NextResponse.json(
      { error: "Failed to update client", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if client has linked quotes
    const clientQuotes = await db
      .select()
      .from(quotes)
      .where(eq(quotes.clientId, parseInt(id)))
      .limit(1);

    if (clientQuotes.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete client with linked quotes. Deactivate the client instead." },
        { status: 400 }
      );
    }

    const result = await db
      .delete(clients)
      .where(eq(clients.id, parseInt(id)))
      .returning();

    if (!result || result.length === 0) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Client deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting client:", error);
    return NextResponse.json(
      { error: "Failed to delete client", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
