import { NextRequest, NextResponse } from "next/server";
import React from "react";
import { sendEmail } from "@/lib/email/send-email";
import {
  getUpcomingMilestones,
  markMilestoneNotified,
} from "@/lib/customer-success/feedback-engine";
import { POINTS_RULES } from "@/lib/customer-success/loyalty-engine";
import MilestoneEmail from "@/lib/email/templates/milestone";
import { nanoid } from "nanoid";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const maxDuration = 60;

const CRON_SECRET = process.env.CRON_SECRET;

/**
 * Milestone Notifications Cron Job
 * Schedule: Daily at 9 AM UTC
 *
 * Sends milestone celebration emails:
 * - Booking anniversaries (1 year since trip)
 * - Membership anniversaries
 * - Tier upgrades
 * - Spending milestones
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const results = {
      milestonesProcessed: 0,
      emailsSent: 0,
      pointsAwarded: 0,
      errors: [] as string[],
    };

    // Get upcoming milestones (within next 7 days)
    const upcomingMilestones = await getUpcomingMilestones(7);
    results.milestonesProcessed = upcomingMilestones.length;

    for (const milestone of upcomingMilestones) {
      try {
        // Generate special offer code for anniversary milestones
        let specialOfferCode: string | undefined;
        let specialOfferDiscount = 0;

        if (
          milestone.milestoneType === "booking_anniversary" ||
          milestone.milestoneType === "membership_anniversary"
        ) {
          specialOfferCode = `ANNIV${nanoid(6).toUpperCase()}`;
          specialOfferDiscount = 10; // 10% off next booking
        }

        // Determine bonus points
        const bonusPoints =
          milestone.milestoneType === "booking_anniversary" ||
          milestone.milestoneType === "membership_anniversary"
            ? POINTS_RULES.ANNIVERSARY_BONUS
            : 0;

        // Send milestone email
        const emailResult = await sendEmail({
          to: milestone.clientEmail,
          subject: getMilestoneSubject(
            milestone.milestoneType,
            milestone.milestoneName
          ),
          react: React.createElement(MilestoneEmail, {
            clientName: milestone.clientName || undefined,
            milestoneType: milestone.milestoneType,
            milestoneName: milestone.milestoneName,
            milestoneDate: milestone.milestoneDate,
            bonusPoints,
            specialOfferCode,
            specialOfferDiscount,
          }),
          logContext: {
            templateType: "milestone",
            toName: milestone.clientName || milestone.clientEmail,
            clientId: milestone.clientId,
            metadata: {
              milestoneType: milestone.milestoneType,
              milestoneId: milestone.id,
              bonusPoints,
              specialOfferCode,
            },
          },
        });

        if (emailResult.sent) {
          await markMilestoneNotified(milestone.id, bonusPoints, specialOfferCode);
          results.emailsSent++;
          results.pointsAwarded += bonusPoints;
        } else {
          results.errors.push(
            `Failed to send to ${milestone.clientEmail}: ${emailResult.error}`
          );
        }
      } catch (error) {
        results.errors.push(
          `Error processing milestone ${milestone.id}: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Milestone notifications processed",
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Milestone notifications cron error:", error);
    return NextResponse.json(
      {
        error: "Cron job failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

function getMilestoneSubject(type: string, name: string): string {
  switch (type) {
    case "booking_anniversary":
      return `Celebrating 1 Year: ${name}`;
    case "membership_anniversary":
      return `Happy Anniversary! Thank you for being with us`;
    case "tier_upgrade":
      return `Congratulations on your tier upgrade!`;
    case "vip_status":
      return `Welcome to Platinum VIP status!`;
    case "referral_milestone":
      return `Amazing! You've reached a referral milestone`;
    case "spending_milestone":
      return `Thank you for your continued trust in CuratedAscents`;
    default:
      return `Celebrating your journey with CuratedAscents`;
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
