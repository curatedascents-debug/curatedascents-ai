import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { paymentMilestones, bookings, bookingEvents, clients, quotes } from "@/db/schema";
import { eq, and, lte, ne, isNull, or, sql } from "drizzle-orm";
import React from "react";
import { sendEmail } from "@/lib/email/send-email";
import PaymentReminderEmail from "@/lib/email/templates/payment-reminder";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const maxDuration = 60; // Allow up to 60 seconds for cron job

// Cron secret for authentication
const CRON_SECRET = process.env.CRON_SECRET;

/**
 * Payment Reminders Cron Job
 * Schedule: Daily at 9 AM UTC
 *
 * Logic:
 * - Send reminders at 7 days, 3 days, 1 day before due date, and on due date
 * - Mark milestones as overdue if past due date
 */
export async function GET(req: NextRequest) {
  // Verify cron secret (Vercel passes this automatically)
  const authHeader = req.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    // Calculate reminder dates
    const dates = {
      sevenDays: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      threeDays: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      oneDay: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      dueToday: todayStr,
    };

    const results = {
      remindersSent: 0,
      markedOverdue: 0,
      errors: [] as string[],
    };

    // Find all pending milestones
    const pendingMilestones = await db
      .select({
        milestoneId: paymentMilestones.id,
        bookingId: paymentMilestones.bookingId,
        milestoneType: paymentMilestones.milestoneType,
        amount: paymentMilestones.amount,
        dueDate: paymentMilestones.dueDate,
        status: paymentMilestones.status,
        reminderCount: paymentMilestones.reminderCount,
        reminderSentAt: paymentMilestones.reminderSentAt,
        // Booking info
        bookingReference: bookings.bookingReference,
        clientId: bookings.clientId,
        startDate: bookings.startDate,
        totalAmount: bookings.totalAmount,
        paidAmount: bookings.paidAmount,
        balanceAmount: bookings.balanceAmount,
        currency: bookings.currency,
        // Quote info
        destination: quotes.destination,
      })
      .from(paymentMilestones)
      .innerJoin(bookings, eq(paymentMilestones.bookingId, bookings.id))
      .leftJoin(quotes, eq(bookings.quoteId, quotes.id))
      .where(
        and(
          eq(paymentMilestones.status, "pending"),
          ne(bookings.status, "cancelled")
        )
      );

    for (const milestone of pendingMilestones) {
      const dueDate = milestone.dueDate;
      if (!dueDate) continue;

      // Check if overdue
      if (dueDate < todayStr) {
        // Mark as overdue
        await db
          .update(paymentMilestones)
          .set({ status: "overdue", updatedAt: new Date() })
          .where(eq(paymentMilestones.id, milestone.milestoneId));

        results.markedOverdue++;

        // Send overdue reminder
        await sendReminderEmail(milestone, "overdue");
        results.remindersSent++;

        // Log event
        await db.insert(bookingEvents).values({
          bookingId: milestone.bookingId,
          eventType: "reminder_sent",
          eventData: {
            milestoneId: milestone.milestoneId,
            reminderType: "overdue",
            milestoneType: milestone.milestoneType,
          },
          performedBy: "system",
        });

        continue;
      }

      // Determine if we should send a reminder
      let reminderType: string | null = null;

      if (dueDate === dates.dueToday) {
        reminderType = "due_today";
      } else if (dueDate === dates.oneDay) {
        reminderType = "1_day";
      } else if (dueDate === dates.threeDays) {
        reminderType = "3_days";
      } else if (dueDate === dates.sevenDays) {
        reminderType = "7_days";
      }

      if (reminderType) {
        // Check if we already sent a reminder today
        const lastReminderDate = milestone.reminderSentAt
          ? new Date(milestone.reminderSentAt).toISOString().split('T')[0]
          : null;

        if (lastReminderDate !== todayStr) {
          try {
            await sendReminderEmail(milestone, reminderType);
            results.remindersSent++;

            // Update reminder tracking
            await db
              .update(paymentMilestones)
              .set({
                reminderSentAt: new Date(),
                reminderCount: (milestone.reminderCount || 0) + 1,
                updatedAt: new Date(),
              })
              .where(eq(paymentMilestones.id, milestone.milestoneId));

            // Log event
            await db.insert(bookingEvents).values({
              bookingId: milestone.bookingId,
              eventType: "reminder_sent",
              eventData: {
                milestoneId: milestone.milestoneId,
                reminderType,
                milestoneType: milestone.milestoneType,
                dueDate,
              },
              performedBy: "system",
            });
          } catch (error) {
            results.errors.push(`Failed to send reminder for milestone ${milestone.milestoneId}: ${error}`);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Payment reminders processed",
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Payment reminders cron error:", error);
    return NextResponse.json(
      { error: "Cron job failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

async function sendReminderEmail(
  milestone: {
    clientId: number | null;
    bookingReference: string | null;
    destination: string | null;
    totalAmount: string | null;
    paidAmount: string | null;
    balanceAmount: string | null;
    currency: string | null;
    startDate: string | null;
    bookingId: number;
  },
  reminderType: string
) {
  if (!milestone.clientId) return;

  const clientResult = await db
    .select({ email: clients.email, name: clients.name })
    .from(clients)
    .where(eq(clients.id, milestone.clientId))
    .limit(1);

  if (clientResult.length === 0 || !clientResult[0].email) return;

  const client = clientResult[0];

  // Calculate days until travel
  let daysUntilTravel: number | undefined;
  if (milestone.startDate) {
    const start = new Date(milestone.startDate);
    const today = new Date();
    daysUntilTravel = Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  await sendEmail({
    to: client.email,
    subject: `Payment Reminder: ${milestone.bookingReference} — CuratedAscents`,
    react: React.createElement(PaymentReminderEmail, {
      clientName: client.name || undefined,
      bookingReference: milestone.bookingReference || `Booking #${milestone.bookingId}`,
      destination: milestone.destination || undefined,
      totalAmount: milestone.totalAmount || undefined,
      paidAmount: milestone.paidAmount || undefined,
      balanceAmount: milestone.balanceAmount || undefined,
      currency: milestone.currency || "USD",
      startDate: milestone.startDate || undefined,
      daysUntilTravel,
    }),
    logContext: {
      templateType: "payment_reminder",
      toName: client.name || undefined,
      clientId: milestone.clientId,
      bookingId: milestone.bookingId,
      metadata: { reminderType },
    },
  });
}

// Allow POST for manual triggering
export async function POST(req: NextRequest) {
  return GET(req);
}
