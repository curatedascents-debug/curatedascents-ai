import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { nurtureSequences } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET - Get single sequence
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [sequence] = await db
      .select()
      .from(nurtureSequences)
      .where(eq(nurtureSequences.id, parseInt(id)));

    if (!sequence) {
      return NextResponse.json({ error: "Sequence not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, sequence });
  } catch (error) {
    console.error("Error fetching sequence:", error);
    return NextResponse.json(
      { error: "Failed to fetch sequence" },
      { status: 500 }
    );
  }
}

// PUT - Update sequence
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      name,
      description,
      triggerType,
      triggerConditions,
      emails,
      isActive,
    } = body;

    const [updated] = await db
      .update(nurtureSequences)
      .set({
        name,
        description,
        triggerType,
        triggerConditions,
        emails,
        totalEmails: Array.isArray(emails) ? emails.length : undefined,
        isActive,
        updatedAt: new Date(),
      })
      .where(eq(nurtureSequences.id, parseInt(id)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Sequence not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, sequence: updated });
  } catch (error) {
    console.error("Error updating sequence:", error);
    return NextResponse.json(
      { error: "Failed to update sequence" },
      { status: 500 }
    );
  }
}

// DELETE - Delete sequence
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [deleted] = await db
      .delete(nurtureSequences)
      .where(eq(nurtureSequences.id, parseInt(id)))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Sequence not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Sequence deleted" });
  } catch (error) {
    console.error("Error deleting sequence:", error);
    return NextResponse.json(
      { error: "Failed to delete sequence" },
      { status: 500 }
    );
  }
}
