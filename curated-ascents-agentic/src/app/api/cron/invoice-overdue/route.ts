import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { invoices, clients } from "@/db/schema";
import { eq, and, lte, sql } from "drizzle-orm";
import { processOverdueInvoices } from "@/lib/financial/invoice-engine";
import { sendEmail } from "@/lib/email/send-email";
import PaymentReminderEmail from "@/lib/email/templates/payment-reminder";

export const dynamic = "force-dynamic";

/**
 * POST /api/cron/invoice-overdue
 * Process overdue invoices and send reminders
 * Runs daily at 8 AM UTC
 */
export async function POST(req: NextRequest) {
  try {
    // Verify cron secret (for Vercel Cron)
    const authHeader = req.headers.get("authorization");
    if (
      process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const results = {
      processed: 0,
      markedOverdue: 0,
      remindersSent: 0,
      errors: [] as string[],
    };

    // First, update status of overdue invoices
    const overdueResult = await processOverdueInvoices();
    results.processed = overdueResult.processed;
    results.markedOverdue = overdueResult.markedOverdue;

    // Get invoices that need reminders
    const today = new Date().toISOString().split("T")[0];

    // Get invoices that are:
    // 1. Overdue (past due date with balance)
    // 2. Due today
    // 3. Due in 3 days
    // 4. Due in 7 days
    const reminderDates = [
      today, // Due today
      new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 3 days from now
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 7 days from now
    ];

    // Get overdue invoices for reminder
    const overdueInvoices = await db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        dueDate: invoices.dueDate,
        totalAmount: invoices.totalAmount,
        paidAmount: invoices.paidAmount,
        balanceAmount: invoices.balanceAmount,
        currency: invoices.currency,
        clientId: invoices.clientId,
        clientName: clients.name,
        clientEmail: clients.email,
        lastReminderAt: invoices.lastReminderAt,
      })
      .from(invoices)
      .innerJoin(clients, eq(invoices.clientId, clients.id))
      .where(
        and(
          lte(invoices.dueDate, today),
          sql`${invoices.balanceAmount}::numeric > 0`,
          sql`${invoices.status} IN ('sent', 'partially_paid', 'overdue')`,
          // Don't send more than one reminder per 3 days for overdue
          sql`(${invoices.lastReminderAt} IS NULL OR ${invoices.lastReminderAt} < NOW() - INTERVAL '3 days')`
        )
      );

    // Get invoices due on specific dates
    const upcomingInvoices = await db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        dueDate: invoices.dueDate,
        totalAmount: invoices.totalAmount,
        paidAmount: invoices.paidAmount,
        balanceAmount: invoices.balanceAmount,
        currency: invoices.currency,
        clientId: invoices.clientId,
        clientName: clients.name,
        clientEmail: clients.email,
        lastReminderAt: invoices.lastReminderAt,
      })
      .from(invoices)
      .innerJoin(clients, eq(invoices.clientId, clients.id))
      .where(
        and(
          sql`${invoices.dueDate} IN (${sql.join(
            reminderDates.map((d) => sql`${d}`),
            sql`, `
          )})`,
          sql`${invoices.balanceAmount}::numeric > 0`,
          sql`${invoices.status} IN ('sent', 'partially_paid')`,
          // Don't send duplicate reminders for the same due date milestone
          sql`(${invoices.lastReminderAt} IS NULL OR DATE(${invoices.lastReminderAt}) != DATE(NOW()))`
        )
      );

    // Send reminders
    const allInvoices = [...overdueInvoices, ...upcomingInvoices];

    for (const invoice of allInvoices) {
      if (!invoice.clientEmail) continue;

      try {
        const dueDate = new Date(invoice.dueDate);
        const daysOverdue = Math.floor(
          (new Date().getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        const isOverdue = daysOverdue > 0;

        await sendEmail({
          to: invoice.clientEmail,
          subject: isOverdue
            ? `Overdue Invoice ${invoice.invoiceNumber} - Payment Required`
            : `Payment Reminder - Invoice ${invoice.invoiceNumber} Due Soon`,
          react: PaymentReminderEmail({
            clientName: invoice.clientName || undefined,
            bookingReference: invoice.invoiceNumber,
            totalAmount: invoice.totalAmount || undefined,
            paidAmount: invoice.paidAmount || undefined,
            balanceAmount: invoice.balanceAmount || undefined,
            currency: invoice.currency || "USD",
            daysUntilTravel: isOverdue ? undefined : -daysOverdue,
          }),
        });

        // Update last reminder timestamp
        await db
          .update(invoices)
          .set({ lastReminderAt: new Date(), updatedAt: new Date() })
          .where(eq(invoices.id, invoice.id));

        results.remindersSent++;
      } catch (error) {
        const errorMsg = `Failed to send reminder for invoice ${invoice.invoiceNumber}: ${error instanceof Error ? error.message : "Unknown error"}`;
        console.error(errorMsg);
        results.errors.push(errorMsg);
      }
    }

    console.log(
      `Invoice overdue cron completed: ${results.markedOverdue} marked overdue, ${results.remindersSent} reminders sent`
    );

    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in invoice overdue cron:", error);
    return NextResponse.json(
      { error: "Failed to process overdue invoices" },
      { status: 500 }
    );
  }
}

// Also handle GET for manual testing
export async function GET(req: NextRequest) {
  return POST(req);
}
