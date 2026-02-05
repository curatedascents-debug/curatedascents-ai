import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { competitorRates } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET - Get single competitor rate
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [rate] = await db
      .select()
      .from(competitorRates)
      .where(eq(competitorRates.id, parseInt(id)));

    if (!rate) {
      return NextResponse.json({ error: "Rate not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, rate });
  } catch (error) {
    console.error("Error fetching competitor rate:", error);
    return NextResponse.json(
      { error: "Failed to fetch competitor rate" },
      { status: 500 }
    );
  }
}

// PUT - Update competitor rate
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      competitorName,
      competitorUrl,
      serviceType,
      serviceName,
      destinationId,
      price,
      currency,
      priceDate,
      travelDateStart,
      travelDateEnd,
      source,
      notes,
    } = body;

    const [updated] = await db
      .update(competitorRates)
      .set({
        competitorName,
        competitorUrl,
        serviceType,
        serviceName,
        destinationId: destinationId ? parseInt(destinationId) : null,
        price: price?.toString(),
        currency,
        priceDate,
        travelDateStart,
        travelDateEnd,
        source,
        notes,
      })
      .where(eq(competitorRates.id, parseInt(id)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Rate not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, rate: updated });
  } catch (error) {
    console.error("Error updating competitor rate:", error);
    return NextResponse.json(
      { error: "Failed to update competitor rate" },
      { status: 500 }
    );
  }
}

// DELETE - Delete competitor rate
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [deleted] = await db
      .delete(competitorRates)
      .where(eq(competitorRates.id, parseInt(id)))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Rate not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Rate deleted" });
  } catch (error) {
    console.error("Error deleting competitor rate:", error);
    return NextResponse.json(
      { error: "Failed to delete competitor rate" },
      { status: 500 }
    );
  }
}
