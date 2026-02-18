import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { payments, invoices, clients } from "@/db/schema";
import { eq, desc, sql, and, gte, lte } from "drizzle-orm";
import { recordPayment, PaymentMethod } from "@/lib/financial/invoice-engine";
import { verifyAdminSession, adminUnauthorizedResponse } from "@/lib/auth/admin-api-auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/payments
 * List all payments with filters
 */
export async function GET(req: NextRequest) {
  const auth = verifyAdminSession(req);
  if (!auth.authenticated) return adminUnauthorizedResponse(auth.error);

  try {
    const { searchParams } = new URL(req.url);
    const invoiceId = searchParams.get("invoiceId");
    const clientId = searchParams.get("clientId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const paymentMethod = searchParams.get("paymentMethod");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    let whereConditions = [];

    if (invoiceId) {
      whereConditions.push(eq(payments.invoiceId, parseInt(invoiceId)));
    }
    if (clientId) {
      whereConditions.push(eq(payments.clientId, parseInt(clientId)));
    }
    if (startDate) {
      whereConditions.push(gte(payments.paymentDate, startDate));
    }
    if (endDate) {
      whereConditions.push(lte(payments.paymentDate, endDate));
    }
    if (paymentMethod) {
      whereConditions.push(eq(payments.paymentMethod, paymentMethod));
    }

    const paymentList = await db
      .select({
        id: payments.id,
        paymentNumber: payments.paymentNumber,
        paymentDate: payments.paymentDate,
        amount: payments.amount,
        currency: payments.currency,
        paymentMethod: payments.paymentMethod,
        transactionReference: payments.transactionReference,
        status: payments.status,
        invoiceId: payments.invoiceId,
        invoiceNumber: invoices.invoiceNumber,
        clientId: payments.clientId,
        clientName: clients.name,
        clientEmail: clients.email,
        processedAt: payments.processedAt,
        processedBy: payments.processedBy,
        createdAt: payments.createdAt,
      })
      .from(payments)
      .innerJoin(clients, eq(payments.clientId, clients.id))
      .leftJoin(invoices, eq(payments.invoiceId, invoices.id))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(desc(payments.paymentDate))
      .limit(limit)
      .offset(offset);

    // Get summary stats
    const stats = await db
      .select({
        total: sql<number>`COUNT(*)::int`,
        totalAmount: sql<number>`COALESCE(SUM(${payments.amount}::numeric), 0)::numeric`,
      })
      .from(payments)
      .where(eq(payments.status, "completed"));

    // Payment method breakdown
    const methodBreakdown = await db
      .select({
        method: payments.paymentMethod,
        count: sql<number>`COUNT(*)::int`,
        amount: sql<number>`COALESCE(SUM(${payments.amount}::numeric), 0)::numeric`,
      })
      .from(payments)
      .where(eq(payments.status, "completed"))
      .groupBy(payments.paymentMethod);

    return NextResponse.json({
      success: true,
      payments: paymentList,
      stats: {
        total: stats[0]?.total || 0,
        totalAmount: stats[0]?.totalAmount || 0,
        byMethod: methodBreakdown.reduce(
          (acc, m) => ({
            ...acc,
            [m.method]: { count: m.count, amount: m.amount },
          }),
          {}
        ),
      },
      pagination: {
        limit,
        offset,
        hasMore: paymentList.length === limit,
      },
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/payments
 * Record a new payment
 */
export async function POST(req: NextRequest) {
  const auth = verifyAdminSession(req);
  if (!auth.authenticated) return adminUnauthorizedResponse(auth.error);

  try {
    const body = await req.json();
    const {
      invoiceId,
      clientId,
      amount,
      paymentMethod,
      paymentDate,
      transactionReference,
      bankName,
      notes,
      processedBy,
      bookingId,
      milestoneId,
    } = body;

    if (!invoiceId || !clientId || !amount || !paymentMethod) {
      return NextResponse.json(
        { error: "invoiceId, clientId, amount, and paymentMethod are required" },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
        { status: 400 }
      );
    }

    const result = await recordPayment({
      invoiceId,
      clientId,
      amount,
      paymentMethod: paymentMethod as PaymentMethod,
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      transactionReference,
      bankName,
      notes,
      processedBy,
      bookingId,
      milestoneId,
    });

    return NextResponse.json({
      success: true,
      paymentId: result.paymentId,
      paymentNumber: result.paymentNumber,
      newInvoiceStatus: result.newInvoiceStatus,
      message: `Payment ${result.paymentNumber} recorded successfully`,
    });
  } catch (error) {
    console.error("Error recording payment:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to record payment" },
      { status: 500 }
    );
  }
}
