/**
 * Nurture Sequences Admin API
 * GET /api/admin/nurture-sequences - List all sequences with stats
 * POST /api/admin/nurture-sequences - Create new sequence
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { nurtureSequences, nurtureEnrollments } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import {
  createNurtureSequence,
  getNurtureStats,
} from "@/lib/lead-intelligence/nurture-engine";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const includeStats = searchParams.get("includeStats") === "true";

    // Get all sequences
    const sequences = await db
      .select()
      .from(nurtureSequences)
      .orderBy(desc(nurtureSequences.createdAt));

    if (includeStats) {
      // Get stats for all sequences
      const stats = await getNurtureStats();

      // Combine sequences with their stats
      const sequencesWithStats = sequences.map((sequence) => {
        const sequenceStats = stats.find((s) => s.sequenceId === sequence.id);
        return {
          ...sequence,
          stats: sequenceStats || {
            totalEnrollments: 0,
            activeEnrollments: 0,
            completedEnrollments: 0,
            cancelledEnrollments: 0,
            totalEmailsSent: 0,
            totalEmailsOpened: 0,
            totalLinksClicked: 0,
          },
        };
      });

      return NextResponse.json({ sequences: sequencesWithStats });
    }

    return NextResponse.json({ sequences });
  } catch (error) {
    console.error("Error fetching nurture sequences:", error);
    return NextResponse.json(
      { error: "Failed to fetch nurture sequences" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, triggerType, triggerConditions, emails } = body;

    // Validate required fields
    if (!name || !triggerType || !emails || !Array.isArray(emails)) {
      return NextResponse.json(
        { error: "name, triggerType, and emails are required" },
        { status: 400 }
      );
    }

    // Validate trigger type
    const validTriggerTypes = [
      "new_lead",
      "abandoned_conversation",
      "post_quote",
      "post_inquiry",
      "high_value_lead",
    ];
    if (!validTriggerTypes.includes(triggerType)) {
      return NextResponse.json(
        { error: `Invalid triggerType. Must be one of: ${validTriggerTypes.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate emails array
    for (const email of emails) {
      if (
        typeof email.dayOffset !== "number" ||
        !email.subject ||
        !email.templateId
      ) {
        return NextResponse.json(
          { error: "Each email must have dayOffset (number), subject, and templateId" },
          { status: 400 }
        );
      }
    }

    const sequence = await createNurtureSequence({
      name,
      description,
      triggerType,
      triggerConditions,
      emails,
    });

    return NextResponse.json({ sequence }, { status: 201 });
  } catch (error) {
    console.error("Error creating nurture sequence:", error);
    return NextResponse.json(
      { error: "Failed to create nurture sequence" },
      { status: 500 }
    );
  }
}
