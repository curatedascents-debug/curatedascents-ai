/**
 * Invoice Engine - Invoice generation, payment processing, and reconciliation
 */

import { db } from "@/db";
import {
  invoices,
  invoiceItems,
  payments,
  paymentAllocations,
  bookings,
  clients,
  quotes,
  quoteItems,
  paymentMilestones,
} from "@/db/schema";
import { eq, sql, and, desc, gte, lte, isNull } from "drizzle-orm";

// ============================================
// CONSTANTS
// ============================================

// Nepal tax rates
export const TAX_RATES = {
  VAT: 13.0, // 13% VAT
  SERVICE_CHARGE: 10.0, // 10% service charge
} as const;

// Invoice number format: INV-YYYY-XXXXX
// Payment number format: PAY-YYYY-XXXXX
// Credit note format: CN-YYYY-XXXXX

export type InvoiceStatus =
  | "draft"
  | "sent"
  | "paid"
  | "partially_paid"
  | "overdue"
  | "cancelled"
  | "refunded";

export type PaymentMethod =
  | "bank_transfer"
  | "credit_card"
  | "debit_card"
  | "cash"
  | "check"
  | "paypal"
  | "stripe"
  | "wire_transfer"
  | "other";

// ============================================
// NUMBER GENERATION
// ============================================

/**
 * Generate next invoice number
 */
export async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;

  const [lastInvoice] = await db
    .select({ invoiceNumber: invoices.invoiceNumber })
    .from(invoices)
    .where(sql`${invoices.invoiceNumber} LIKE ${prefix + "%"}`)
    .orderBy(desc(invoices.invoiceNumber))
    .limit(1);

  let nextNumber = 1;
  if (lastInvoice?.invoiceNumber) {
    const lastNum = parseInt(lastInvoice.invoiceNumber.split("-").pop() || "0");
    nextNumber = lastNum + 1;
  }

  return `${prefix}${nextNumber.toString().padStart(5, "0")}`;
}

/**
 * Generate next payment number
 */
export async function generatePaymentNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `PAY-${year}-`;

  const [lastPayment] = await db
    .select({ paymentNumber: payments.paymentNumber })
    .from(payments)
    .where(sql`${payments.paymentNumber} LIKE ${prefix + "%"}`)
    .orderBy(desc(payments.paymentNumber))
    .limit(1);

  let nextNumber = 1;
  if (lastPayment?.paymentNumber) {
    const lastNum = parseInt(lastPayment.paymentNumber.split("-").pop() || "0");
    nextNumber = lastNum + 1;
  }

  return `${prefix}${nextNumber.toString().padStart(5, "0")}`;
}

// ============================================
// INVOICE MANAGEMENT
// ============================================

interface CreateInvoiceParams {
  bookingId: number;
  clientId: number;
  agencyId?: number;
  dueDate?: Date;
  applyTax?: boolean;
  applyServiceCharge?: boolean;
  discountAmount?: number;
  discountReason?: string;
  notes?: string;
}

/**
 * Create invoice from booking
 */
export async function createInvoiceFromBooking(
  params: CreateInvoiceParams
): Promise<{ invoiceId: number; invoiceNumber: string }> {
  const {
    bookingId,
    clientId,
    agencyId,
    dueDate,
    applyTax = true,
    applyServiceCharge = true,
    discountAmount = 0,
    discountReason,
    notes,
  } = params;

  // Get booking details
  const [booking] = await db
    .select()
    .from(bookings)
    .where(eq(bookings.id, bookingId))
    .limit(1);

  if (!booking) {
    throw new Error("Booking not found");
  }

  // Get quote items for line items
  let lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    serviceType?: string;
    quoteItemId?: number;
  }> = [];

  if (booking.quoteId) {
    const items = await db
      .select()
      .from(quoteItems)
      .where(eq(quoteItems.quoteId, booking.quoteId));

    lineItems = items.map((item) => ({
      description: item.serviceName || item.serviceType || "Service",
      quantity: item.quantity || 1,
      unitPrice: parseFloat(item.sellPrice || "0"),
      serviceType: item.serviceType || undefined,
      quoteItemId: item.id,
    }));
  }

  // If no quote items, create a single line item from booking total
  if (lineItems.length === 0 && booking.totalAmount) {
    lineItems = [
      {
        description: "Travel Package",
        quantity: 1,
        unitPrice: parseFloat(booking.totalAmount),
      },
    ];
  }

  // Calculate totals
  const subtotal = lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  const taxRate = applyTax ? TAX_RATES.VAT : 0;
  const taxAmount = (subtotal * taxRate) / 100;

  const serviceChargeRate = applyServiceCharge ? TAX_RATES.SERVICE_CHARGE : 0;
  const serviceChargeAmount = (subtotal * serviceChargeRate) / 100;

  const totalAmount = subtotal + taxAmount + serviceChargeAmount - discountAmount;
  const balanceAmount = totalAmount;

  // Generate invoice number
  const invoiceNumber = await generateInvoiceNumber();

  // Calculate due date (default: 7 days from now)
  const invoiceDate = new Date();
  const defaultDueDate = dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  // Create invoice
  const [invoice] = await db
    .insert(invoices)
    .values({
      agencyId,
      bookingId,
      clientId,
      invoiceNumber,
      invoiceDate: invoiceDate.toISOString().split("T")[0],
      dueDate: defaultDueDate.toISOString().split("T")[0],
      subtotal: subtotal.toFixed(2),
      taxRate: taxRate.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      serviceChargeRate: serviceChargeRate.toFixed(2),
      serviceChargeAmount: serviceChargeAmount.toFixed(2),
      discountAmount: discountAmount.toFixed(2),
      discountReason,
      totalAmount: totalAmount.toFixed(2),
      balanceAmount: balanceAmount.toFixed(2),
      currency: booking.currency || "USD",
      status: "draft",
      notes,
    })
    .returning({ id: invoices.id });

  // Create line items
  for (let i = 0; i < lineItems.length; i++) {
    const item = lineItems[i];
    await db.insert(invoiceItems).values({
      invoiceId: invoice.id,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice.toFixed(2),
      amount: (item.quantity * item.unitPrice).toFixed(2),
      serviceType: item.serviceType,
      quoteItemId: item.quoteItemId,
      sortOrder: i,
    });
  }

  return { invoiceId: invoice.id, invoiceNumber };
}

/**
 * Get invoice with full details
 */
export async function getInvoiceDetails(invoiceId: number) {
  const [invoice] = await db
    .select({
      id: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
      invoiceDate: invoices.invoiceDate,
      dueDate: invoices.dueDate,
      subtotal: invoices.subtotal,
      taxRate: invoices.taxRate,
      taxAmount: invoices.taxAmount,
      serviceChargeRate: invoices.serviceChargeRate,
      serviceChargeAmount: invoices.serviceChargeAmount,
      discountAmount: invoices.discountAmount,
      discountReason: invoices.discountReason,
      totalAmount: invoices.totalAmount,
      paidAmount: invoices.paidAmount,
      balanceAmount: invoices.balanceAmount,
      currency: invoices.currency,
      status: invoices.status,
      notes: invoices.notes,
      termsConditions: invoices.termsConditions,
      sentAt: invoices.sentAt,
      paidAt: invoices.paidAt,
      pdfUrl: invoices.pdfUrl,
      bookingId: invoices.bookingId,
      clientId: invoices.clientId,
      clientName: clients.name,
      clientEmail: clients.email,
      bookingReference: bookings.bookingReference,
      createdAt: invoices.createdAt,
    })
    .from(invoices)
    .innerJoin(clients, eq(invoices.clientId, clients.id))
    .leftJoin(bookings, eq(invoices.bookingId, bookings.id))
    .where(eq(invoices.id, invoiceId))
    .limit(1);

  if (!invoice) {
    return null;
  }

  // Get line items
  const items = await db
    .select()
    .from(invoiceItems)
    .where(eq(invoiceItems.invoiceId, invoiceId))
    .orderBy(invoiceItems.sortOrder);

  // Get payments
  const invoicePayments = await db
    .select()
    .from(payments)
    .where(eq(payments.invoiceId, invoiceId))
    .orderBy(desc(payments.paymentDate));

  return {
    ...invoice,
    items: items.map((item) => ({
      id: item.id,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      amount: item.amount,
      serviceType: item.serviceType,
    })),
    payments: invoicePayments.map((p) => ({
      id: p.id,
      paymentNumber: p.paymentNumber,
      paymentDate: p.paymentDate,
      amount: p.amount,
      paymentMethod: p.paymentMethod,
      status: p.status,
    })),
  };
}

/**
 * Update invoice status based on payments
 */
export async function updateInvoiceStatus(invoiceId: number): Promise<string> {
  const [invoice] = await db
    .select()
    .from(invoices)
    .where(eq(invoices.id, invoiceId))
    .limit(1);

  if (!invoice) {
    throw new Error("Invoice not found");
  }

  const totalAmount = parseFloat(invoice.totalAmount || "0");
  const paidAmount = parseFloat(invoice.paidAmount || "0");
  const dueDate = new Date(invoice.dueDate);
  const now = new Date();

  let newStatus: InvoiceStatus;

  if (paidAmount >= totalAmount) {
    newStatus = "paid";
  } else if (paidAmount > 0) {
    newStatus = now > dueDate ? "overdue" : "partially_paid";
  } else if (now > dueDate && invoice.status === "sent") {
    newStatus = "overdue";
  } else {
    newStatus = invoice.status as InvoiceStatus;
  }

  if (newStatus !== invoice.status) {
    await db
      .update(invoices)
      .set({
        status: newStatus,
        paidAt: newStatus === "paid" ? new Date() : invoice.paidAt,
        updatedAt: new Date(),
      })
      .where(eq(invoices.id, invoiceId));
  }

  return newStatus;
}

/**
 * Mark invoice as sent
 */
export async function markInvoiceSent(
  invoiceId: number,
  sentTo: string
): Promise<void> {
  await db
    .update(invoices)
    .set({
      status: "sent",
      sentAt: new Date(),
      sentTo,
      updatedAt: new Date(),
    })
    .where(eq(invoices.id, invoiceId));
}

// ============================================
// PAYMENT MANAGEMENT
// ============================================

interface RecordPaymentParams {
  invoiceId: number;
  clientId: number;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate?: Date;
  transactionReference?: string;
  bankName?: string;
  notes?: string;
  processedBy?: string;
  bookingId?: number;
  milestoneId?: number;
}

/**
 * Record a payment
 */
export async function recordPayment(
  params: RecordPaymentParams
): Promise<{ paymentId: number; paymentNumber: string; newInvoiceStatus: string }> {
  const {
    invoiceId,
    clientId,
    amount,
    paymentMethod,
    paymentDate = new Date(),
    transactionReference,
    bankName,
    notes,
    processedBy,
    bookingId,
    milestoneId,
  } = params;

  // Get invoice
  const [invoice] = await db
    .select()
    .from(invoices)
    .where(eq(invoices.id, invoiceId))
    .limit(1);

  if (!invoice) {
    throw new Error("Invoice not found");
  }

  // Generate payment number
  const paymentNumber = await generatePaymentNumber();

  // Create payment record
  const [payment] = await db
    .insert(payments)
    .values({
      invoiceId,
      bookingId: bookingId || invoice.bookingId,
      clientId,
      milestoneId,
      paymentNumber,
      paymentDate: paymentDate.toISOString().split("T")[0],
      amount: amount.toFixed(2),
      currency: invoice.currency || "USD",
      paymentMethod,
      transactionReference,
      bankName,
      notes,
      status: "completed",
      processedAt: new Date(),
      processedBy,
    })
    .returning({ id: payments.id });

  // Create payment allocation
  await db.insert(paymentAllocations).values({
    paymentId: payment.id,
    invoiceId,
    milestoneId,
    allocatedAmount: amount.toFixed(2),
  });

  // Update invoice paid amount
  const newPaidAmount = parseFloat(invoice.paidAmount || "0") + amount;
  const newBalanceAmount = parseFloat(invoice.totalAmount || "0") - newPaidAmount;

  await db
    .update(invoices)
    .set({
      paidAmount: newPaidAmount.toFixed(2),
      balanceAmount: Math.max(0, newBalanceAmount).toFixed(2),
      updatedAt: new Date(),
    })
    .where(eq(invoices.id, invoiceId));

  // Update invoice status
  const newStatus = await updateInvoiceStatus(invoiceId);

  // Update payment milestone if provided
  if (milestoneId) {
    await db
      .update(paymentMilestones)
      .set({
        status: "paid",
        paidDate: paymentDate.toISOString().split("T")[0],
        paidAmount: amount.toFixed(2),
        updatedAt: new Date(),
      })
      .where(eq(paymentMilestones.id, milestoneId));
  }

  return { paymentId: payment.id, paymentNumber, newInvoiceStatus: newStatus };
}

/**
 * Get payment history for an invoice
 */
export async function getInvoicePayments(invoiceId: number) {
  const invoicePayments = await db
    .select({
      id: payments.id,
      paymentNumber: payments.paymentNumber,
      paymentDate: payments.paymentDate,
      amount: payments.amount,
      currency: payments.currency,
      paymentMethod: payments.paymentMethod,
      transactionReference: payments.transactionReference,
      status: payments.status,
      processedAt: payments.processedAt,
      processedBy: payments.processedBy,
    })
    .from(payments)
    .where(eq(payments.invoiceId, invoiceId))
    .orderBy(desc(payments.paymentDate));

  return invoicePayments;
}

// ============================================
// FINANCIAL REPORTING
// ============================================

/**
 * Get financial summary for a period
 */
export async function getFinancialSummary(
  startDate: Date,
  endDate: Date,
  agencyId?: number
) {
  const startDateStr = startDate.toISOString().split("T")[0];
  const endDateStr = endDate.toISOString().split("T")[0];

  // Invoice stats
  const invoiceStats = await db
    .select({
      totalInvoices: sql<number>`COUNT(*)::int`,
      totalAmount: sql<number>`COALESCE(SUM(${invoices.totalAmount}::numeric), 0)::numeric`,
      paidAmount: sql<number>`COALESCE(SUM(${invoices.paidAmount}::numeric), 0)::numeric`,
      outstandingAmount: sql<number>`COALESCE(SUM(${invoices.balanceAmount}::numeric), 0)::numeric`,
    })
    .from(invoices)
    .where(
      and(
        gte(invoices.invoiceDate, startDateStr),
        lte(invoices.invoiceDate, endDateStr),
        agencyId ? eq(invoices.agencyId, agencyId) : sql`1=1`
      )
    );

  // Payment stats
  const paymentStats = await db
    .select({
      totalPayments: sql<number>`COUNT(*)::int`,
      totalReceived: sql<number>`COALESCE(SUM(${payments.amount}::numeric), 0)::numeric`,
    })
    .from(payments)
    .where(
      and(
        gte(payments.paymentDate, startDateStr),
        lte(payments.paymentDate, endDateStr),
        eq(payments.status, "completed")
      )
    );

  // Overdue invoices
  const today = new Date().toISOString().split("T")[0];
  const overdueStats = await db
    .select({
      count: sql<number>`COUNT(*)::int`,
      amount: sql<number>`COALESCE(SUM(${invoices.balanceAmount}::numeric), 0)::numeric`,
    })
    .from(invoices)
    .where(
      and(
        lte(invoices.dueDate, today),
        sql`${invoices.balanceAmount}::numeric > 0`,
        sql`${invoices.status} NOT IN ('paid', 'cancelled', 'refunded')`
      )
    );

  // Invoice status distribution
  const statusDistribution = await db
    .select({
      status: invoices.status,
      count: sql<number>`COUNT(*)::int`,
      amount: sql<number>`COALESCE(SUM(${invoices.totalAmount}::numeric), 0)::numeric`,
    })
    .from(invoices)
    .where(
      and(
        gte(invoices.invoiceDate, startDateStr),
        lte(invoices.invoiceDate, endDateStr)
      )
    )
    .groupBy(invoices.status);

  // Payment method breakdown
  const paymentMethodBreakdown = await db
    .select({
      method: payments.paymentMethod,
      count: sql<number>`COUNT(*)::int`,
      amount: sql<number>`COALESCE(SUM(${payments.amount}::numeric), 0)::numeric`,
    })
    .from(payments)
    .where(
      and(
        gte(payments.paymentDate, startDateStr),
        lte(payments.paymentDate, endDateStr),
        eq(payments.status, "completed")
      )
    )
    .groupBy(payments.paymentMethod);

  return {
    period: {
      start: startDateStr,
      end: endDateStr,
    },
    invoices: {
      total: invoiceStats[0]?.totalInvoices || 0,
      totalAmount: invoiceStats[0]?.totalAmount || 0,
      paidAmount: invoiceStats[0]?.paidAmount || 0,
      outstandingAmount: invoiceStats[0]?.outstandingAmount || 0,
    },
    payments: {
      total: paymentStats[0]?.totalPayments || 0,
      totalReceived: paymentStats[0]?.totalReceived || 0,
    },
    overdue: {
      count: overdueStats[0]?.count || 0,
      amount: overdueStats[0]?.amount || 0,
    },
    statusDistribution: statusDistribution.reduce(
      (acc, s) => ({
        ...acc,
        [s.status]: { count: s.count, amount: s.amount },
      }),
      {}
    ),
    paymentMethods: paymentMethodBreakdown.reduce(
      (acc, p) => ({
        ...acc,
        [p.method]: { count: p.count, amount: p.amount },
      }),
      {}
    ),
  };
}

/**
 * Get aging report (overdue invoices by age)
 */
export async function getAgingReport(agencyId?: number) {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  // Get all outstanding invoices
  const outstandingInvoices = await db
    .select({
      id: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
      clientId: invoices.clientId,
      clientName: clients.name,
      clientEmail: clients.email,
      dueDate: invoices.dueDate,
      totalAmount: invoices.totalAmount,
      balanceAmount: invoices.balanceAmount,
      currency: invoices.currency,
    })
    .from(invoices)
    .innerJoin(clients, eq(invoices.clientId, clients.id))
    .where(
      and(
        sql`${invoices.balanceAmount}::numeric > 0`,
        sql`${invoices.status} NOT IN ('paid', 'cancelled', 'refunded')`,
        agencyId ? eq(invoices.agencyId, agencyId) : sql`1=1`
      )
    )
    .orderBy(invoices.dueDate);

  // Categorize by age
  const aging = {
    current: [] as typeof outstandingInvoices,
    days1to30: [] as typeof outstandingInvoices,
    days31to60: [] as typeof outstandingInvoices,
    days61to90: [] as typeof outstandingInvoices,
    over90: [] as typeof outstandingInvoices,
  };

  for (const invoice of outstandingInvoices) {
    const dueDate = new Date(invoice.dueDate);
    const daysOverdue = Math.floor(
      (today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysOverdue <= 0) {
      aging.current.push(invoice);
    } else if (daysOverdue <= 30) {
      aging.days1to30.push(invoice);
    } else if (daysOverdue <= 60) {
      aging.days31to60.push(invoice);
    } else if (daysOverdue <= 90) {
      aging.days61to90.push(invoice);
    } else {
      aging.over90.push(invoice);
    }
  }

  const calculateTotal = (invoiceList: typeof outstandingInvoices) =>
    invoiceList.reduce((sum, inv) => sum + parseFloat(inv.balanceAmount || "0"), 0);

  return {
    summary: {
      current: {
        count: aging.current.length,
        amount: calculateTotal(aging.current),
      },
      days1to30: {
        count: aging.days1to30.length,
        amount: calculateTotal(aging.days1to30),
      },
      days31to60: {
        count: aging.days31to60.length,
        amount: calculateTotal(aging.days31to60),
      },
      days61to90: {
        count: aging.days61to90.length,
        amount: calculateTotal(aging.days61to90),
      },
      over90: {
        count: aging.over90.length,
        amount: calculateTotal(aging.over90),
      },
      total: {
        count: outstandingInvoices.length,
        amount: calculateTotal(outstandingInvoices),
      },
    },
    invoices: aging,
  };
}

/**
 * Check for overdue invoices and update status
 */
export async function processOverdueInvoices(): Promise<{
  processed: number;
  markedOverdue: number;
}> {
  const today = new Date().toISOString().split("T")[0];

  // Find invoices that are past due but not marked overdue
  const overdueInvoices = await db
    .select({ id: invoices.id })
    .from(invoices)
    .where(
      and(
        lte(invoices.dueDate, today),
        sql`${invoices.balanceAmount}::numeric > 0`,
        sql`${invoices.status} IN ('sent', 'partially_paid')`
      )
    );

  let markedOverdue = 0;

  for (const invoice of overdueInvoices) {
    await db
      .update(invoices)
      .set({
        status: "overdue",
        updatedAt: new Date(),
      })
      .where(eq(invoices.id, invoice.id));
    markedOverdue++;
  }

  return { processed: overdueInvoices.length, markedOverdue };
}
