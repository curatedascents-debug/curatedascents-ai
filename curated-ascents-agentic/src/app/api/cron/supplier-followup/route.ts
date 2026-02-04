import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { supplierConfirmationRequests, bookings, bookingEvents, suppliers } from "@/db/schema";
import { eq, and, lt, or } from "drizzle-orm";
import React from "react";
import { sendEmail } from "@/lib/email/send-email";
import SupplierConfirmationRequestEmail from "@/lib/email/templates/supplier-confirmation-request";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const maxDuration = 60;

const CRON_SECRET = process.env.CRON_SECRET;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "curatedascents@gmail.com";

/**
 * Supplier Follow-up Cron Job
 * Schedule: Daily at 11 AM UTC
 *
 * Logic:
 * - Follow up on confirmations pending > 48 hours after being sent
 * - Alert admin about long-pending confirmations
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    const results = {
      followUpsSent: 0,
      alertsSent: 0,
      errors: [] as string[],
    };

    // Find confirmations that were sent > 48 hours ago but not confirmed
    const pendingConfirmations = await db
      .select({
        id: supplierConfirmationRequests.id,
        bookingId: supplierConfirmationRequests.bookingId,
        supplierId: supplierConfirmationRequests.supplierId,
        serviceName: supplierConfirmationRequests.serviceName,
        serviceType: supplierConfirmationRequests.serviceType,
        serviceDetails: supplierConfirmationRequests.serviceDetails,
        status: supplierConfirmationRequests.status,
        sentAt: supplierConfirmationRequests.sentAt,
        // Booking info
        bookingReference: bookings.bookingReference,
        startDate: bookings.startDate,
        endDate: bookings.endDate,
      })
      .from(supplierConfirmationRequests)
      .innerJoin(bookings, eq(supplierConfirmationRequests.bookingId, bookings.id))
      .where(
        and(
          eq(supplierConfirmationRequests.status, "sent"),
          lt(supplierConfirmationRequests.sentAt, fortyEightHoursAgo)
        )
      );

    // Group by supplier for efficient follow-up
    const supplierGroups: Map<number, typeof pendingConfirmations> = new Map();
    const noSupplierItems: typeof pendingConfirmations = [];

    for (const confirmation of pendingConfirmations) {
      if (confirmation.supplierId) {
        const existing = supplierGroups.get(confirmation.supplierId) || [];
        existing.push(confirmation);
        supplierGroups.set(confirmation.supplierId, existing);
      } else {
        noSupplierItems.push(confirmation);
      }
    }

    // Send follow-up emails to suppliers
    for (const [supplierId, confirmations] of supplierGroups) {
      try {
        const supplierResult = await db
          .select()
          .from(suppliers)
          .where(eq(suppliers.id, supplierId))
          .limit(1);

        if (supplierResult.length === 0) continue;

        const supplier = supplierResult[0];
        const supplierEmail = supplier.reservationEmail || supplier.salesEmail;

        if (!supplierEmail) {
          results.errors.push(`No email for supplier ${supplier.name} (ID: ${supplierId})`);
          continue;
        }

        // Send follow-up for each pending confirmation
        for (const confirmation of confirmations) {
          await sendEmail({
            to: supplierEmail,
            subject: `Follow-up: Booking Confirmation Request ${confirmation.bookingReference} — CuratedAscents`,
            react: React.createElement(SupplierConfirmationRequestEmail, {
              supplierName: supplier.name,
              bookingReference: confirmation.bookingReference || `Booking #${confirmation.bookingId}`,
              serviceName: confirmation.serviceName,
              serviceType: confirmation.serviceType,
              serviceDetails: confirmation.serviceDetails as Record<string, unknown> | undefined,
              startDate: confirmation.startDate || undefined,
              endDate: confirmation.endDate || undefined,
            }),
            logContext: {
              templateType: "supplier_followup",
              toName: supplier.name,
              bookingId: confirmation.bookingId,
              metadata: {
                confirmationId: confirmation.id,
                supplierId,
                isFollowUp: true,
              },
            },
          });

          results.followUpsSent++;

          // Log event
          await db.insert(bookingEvents).values({
            bookingId: confirmation.bookingId,
            eventType: "supplier_confirmed",
            eventData: {
              action: "followup_sent",
              confirmationId: confirmation.id,
              supplierId,
              supplierName: supplier.name,
              serviceName: confirmation.serviceName,
              originalSentAt: confirmation.sentAt,
            },
            performedBy: "system",
          });
        }
      } catch (error) {
        results.errors.push(`Failed to send follow-up to supplier ${supplierId}: ${error}`);
      }
    }

    // Alert admin about pending confirmations without supplier assignment
    if (noSupplierItems.length > 0) {
      const alertMessage = noSupplierItems
        .map(c => `- ${c.bookingReference}: ${c.serviceName} (${c.serviceType})`)
        .join("\n");

      await sendEmail({
        to: ADMIN_EMAIL,
        subject: `Action Required: ${noSupplierItems.length} Pending Confirmations Without Supplier — CuratedAscents`,
        react: React.createElement("div", {}, [
          React.createElement("h2", { key: "h2" }, "Pending Supplier Confirmations"),
          React.createElement("p", { key: "p1" }, "The following services need supplier assignment and confirmation:"),
          React.createElement("pre", { key: "pre", style: { backgroundColor: "#f4f4f4", padding: "16px" } }, alertMessage),
          React.createElement("p", { key: "p2" }, "Please assign suppliers and send confirmation requests."),
        ]),
        logContext: {
          templateType: "admin_alert",
          toName: "Admin",
          metadata: {
            alertType: "unassigned_confirmations",
            count: noSupplierItems.length,
          },
        },
      });

      results.alertsSent++;
    }

    // Alert admin about long-pending confirmations (> 5 days)
    const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
    const criticalPending = pendingConfirmations.filter(
      c => c.sentAt && new Date(c.sentAt) < fiveDaysAgo
    );

    if (criticalPending.length > 0) {
      const criticalMessage = criticalPending
        .map(c => `- ${c.bookingReference}: ${c.serviceName} (sent ${c.sentAt ? new Date(c.sentAt).toLocaleDateString() : 'unknown'})`)
        .join("\n");

      await sendEmail({
        to: ADMIN_EMAIL,
        subject: `Urgent: ${criticalPending.length} Confirmations Pending > 5 Days — CuratedAscents`,
        react: React.createElement("div", {}, [
          React.createElement("h2", { key: "h2", style: { color: "#dc2626" } }, "Critical: Long-Pending Confirmations"),
          React.createElement("p", { key: "p1" }, "The following confirmations have been pending for more than 5 days:"),
          React.createElement("pre", { key: "pre", style: { backgroundColor: "#fef2f2", padding: "16px", borderLeft: "4px solid #dc2626" } }, criticalMessage),
          React.createElement("p", { key: "p2" }, "Please follow up directly with these suppliers or consider alternatives."),
        ]),
        logContext: {
          templateType: "admin_alert",
          toName: "Admin",
          metadata: {
            alertType: "critical_pending_confirmations",
            count: criticalPending.length,
          },
        },
      });

      results.alertsSent++;
    }

    return NextResponse.json({
      success: true,
      message: "Supplier follow-ups processed",
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Supplier follow-up cron error:", error);
    return NextResponse.json(
      { error: "Cron job failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
