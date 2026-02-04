import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { leadScores, clients } from "@/db/schema";
import { eq, and, lt, isNotNull, sql } from "drizzle-orm";
import { sendEmail } from "@/lib/email/send-email";
import React from "react";
import LeadReengagementEmail from "@/lib/email/templates/lead-reengagement";
import { recordLeadEvent } from "@/lib/lead-intelligence/scoring-engine";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const maxDuration = 60;

const CRON_SECRET = process.env.CRON_SECRET;

// Re-engagement thresholds
const FIRST_REENGAGEMENT_HOURS = 48; // 2 days
const SECOND_REENGAGEMENT_HOURS = 120; // 5 days
const MAX_REENGAGEMENTS = 3;

/**
 * Lead Re-engagement Cron Job
 * Schedule: Daily at 10 AM UTC (after trip briefings)
 *
 * Logic:
 * - Find leads with no activity for 48+ hours
 * - Send re-engagement email (max 3 per lead)
 * - Skip leads that are converted, lost, or dormant
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const firstThreshold = new Date(now.getTime() - FIRST_REENGAGEMENT_HOURS * 60 * 60 * 1000);
    const secondThreshold = new Date(now.getTime() - SECOND_REENGAGEMENT_HOURS * 60 * 60 * 1000);

    const results = {
      leadsChecked: 0,
      emailsSent: 0,
      skipped: 0,
      errors: [] as string[],
    };

    // Find leads that need re-engagement
    // Criteria:
    // - Has lead score record
    // - Last activity > 48 hours ago
    // - Status not in [converted, lost, dormant]
    // - Reengagement count < 3
    // - Either never sent reengagement or last sent > 48 hours ago
    const inactiveLeads = await db
      .select({
        leadScoreId: leadScores.id,
        clientId: leadScores.clientId,
        currentScore: leadScores.currentScore,
        status: leadScores.status,
        lastActivityAt: leadScores.lastActivityAt,
        reengagementCount: leadScores.reengagementCount,
        reengagementSentAt: leadScores.reengagementSentAt,
        detectedDestinations: leadScores.detectedDestinations,
        // Client info
        clientEmail: clients.email,
        clientName: clients.name,
      })
      .from(leadScores)
      .innerJoin(clients, eq(leadScores.clientId, clients.id))
      .where(
        and(
          // Last activity more than threshold ago
          lt(leadScores.lastActivityAt, firstThreshold),
          // Not converted, lost, or dormant
          sql`${leadScores.status} NOT IN ('converted', 'lost', 'dormant')`,
          // Under max reengagements
          lt(leadScores.reengagementCount, MAX_REENGAGEMENTS),
          // Has email
          isNotNull(clients.email)
        )
      );

    results.leadsChecked = inactiveLeads.length;

    for (const lead of inactiveLeads) {
      try {
        // Check if enough time has passed since last reengagement
        if (lead.reengagementSentAt) {
          const hoursSinceLastReengagement =
            (now.getTime() - new Date(lead.reengagementSentAt).getTime()) / (60 * 60 * 1000);

          // Need at least 48 hours between reengagements
          if (hoursSinceLastReengagement < FIRST_REENGAGEMENT_HOURS) {
            results.skipped++;
            continue;
          }
        }

        // Calculate days since last activity
        const daysSinceActivity = Math.floor(
          (now.getTime() - new Date(lead.lastActivityAt!).getTime()) / (24 * 60 * 60 * 1000)
        );

        // Get last destination if any
        const destinations = lead.detectedDestinations as string[] | null;
        const lastDestination = destinations && destinations.length > 0
          ? destinations[destinations.length - 1].charAt(0).toUpperCase() + destinations[destinations.length - 1].slice(1)
          : undefined;

        // Send re-engagement email
        const emailResult = await sendEmail({
          to: lead.clientEmail!,
          subject: lastDestination
            ? `Still planning your ${lastDestination} adventure?`
            : "Continue planning your Himalayan journey",
          react: React.createElement(LeadReengagementEmail, {
            clientName: lead.clientName || undefined,
            lastDestination,
            daysSinceActivity,
          }),
          logContext: {
            templateType: "lead_reengagement",
            toName: lead.clientName || lead.clientEmail!,
            clientId: lead.clientId,
            metadata: {
              reengagementNumber: (lead.reengagementCount || 0) + 1,
              daysSinceActivity,
              leadScore: lead.currentScore,
              leadStatus: lead.status,
            },
          },
        });

        if (emailResult.sent) {
          // Update reengagement tracking
          await db
            .update(leadScores)
            .set({
              reengagementSentAt: now,
              reengagementCount: (lead.reengagementCount || 0) + 1,
              updatedAt: now,
            })
            .where(eq(leadScores.id, lead.leadScoreId));

          // Record event for scoring
          await recordLeadEvent(
            lead.clientId,
            "inactivity",
            { reason: daysSinceActivity >= 7 ? "7_days" : "activity_gap" },
            "cron"
          );

          results.emailsSent++;
        } else {
          results.errors.push(
            `Failed to send to ${lead.clientEmail}: ${emailResult.error}`
          );
        }
      } catch (error) {
        results.errors.push(
          `Error processing lead ${lead.clientId}: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }

    // Mark leads as dormant if they've received max reengagements with no response
    const dormantCandidates = await db
      .select({ id: leadScores.id, clientId: leadScores.clientId })
      .from(leadScores)
      .where(
        and(
          eq(leadScores.reengagementCount, MAX_REENGAGEMENTS),
          lt(leadScores.lastActivityAt, secondThreshold),
          sql`${leadScores.status} NOT IN ('converted', 'lost', 'dormant')`
        )
      );

    let dormantMarked = 0;
    for (const lead of dormantCandidates) {
      await db
        .update(leadScores)
        .set({
          status: "dormant",
          updatedAt: now,
        })
        .where(eq(leadScores.id, lead.id));
      dormantMarked++;
    }

    return NextResponse.json({
      success: true,
      message: "Lead re-engagement processed",
      results: {
        ...results,
        dormantMarked,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Lead re-engagement cron error:", error);
    return NextResponse.json(
      {
        error: "Cron job failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
