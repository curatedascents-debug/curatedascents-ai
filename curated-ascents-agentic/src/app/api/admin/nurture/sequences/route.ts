import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { nurtureSequences } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET - List all nurture sequences
export async function GET() {
  try {
    const sequences = await db
      .select()
      .from(nurtureSequences)
      .orderBy(desc(nurtureSequences.createdAt));

    return NextResponse.json({
      success: true,
      sequences,
    });
  } catch (error) {
    console.error("Error fetching nurture sequences:", error);
    return NextResponse.json(
      { error: "Failed to fetch sequences" },
      { status: 500 }
    );
  }
}

// POST - Create new nurture sequence
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      triggerType,
      triggerConditions,
      emails,
      isActive = true,
    } = body;

    if (!name || !triggerType || !emails) {
      return NextResponse.json(
        { error: "Missing required fields: name, triggerType, emails" },
        { status: 400 }
      );
    }

    const [newSequence] = await db
      .insert(nurtureSequences)
      .values({
        name,
        description,
        triggerType,
        triggerConditions,
        emails,
        totalEmails: Array.isArray(emails) ? emails.length : 0,
        isActive,
      })
      .returning();

    return NextResponse.json({
      success: true,
      sequence: newSequence,
    });
  } catch (error) {
    console.error("Error creating nurture sequence:", error);
    return NextResponse.json(
      { error: "Failed to create sequence" },
      { status: 500 }
    );
  }
}
