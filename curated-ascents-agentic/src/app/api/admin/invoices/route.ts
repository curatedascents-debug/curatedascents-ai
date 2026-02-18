import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { invoices, clients, bookings } from "@/db/schema";
import { eq, desc, sql, and, gte, lte } from "drizzle-orm";
import { createInvoiceFromBooking } from "@/lib/financial/invoice-engine";
import { verifyAdminSession, adminUnauthorizedResponse } from "@/lib/auth/admin-api-auth";
import { handleApiError } from "@/lib/api/error-handler";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/invoices
 * List all invoices with filters
 */
export async function GET(req: NextRequest) {
  const auth = verifyAdminSession(req);
  if (!auth.authenticated) return adminUnauthorizedResponse(auth.error);

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const clientId = searchParams.get("clientId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    let whereConditions = [];

    if (status) {
      whereConditions.push(eq(invoices.status, status));
    }
    if (clientId) {
      whereConditions.push(eq(invoices.clientId, parseInt(clientId)));
    }
    if (startDate) {
      whereConditions.push(gte(invoices.invoiceDate, startDate));
    }
    if (endDate) {
      whereConditions.push(lte(invoices.invoiceDate, endDate));
    }

    const invoiceList = await db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        invoiceDate: invoices.invoiceDate,
        dueDate: invoices.dueDate,
        totalAmount: invoices.totalAmount,
        paidAmount: invoices.paidAmount,
        balanceAmount: invoices.balanceAmount,
        currency: invoices.currency,
        status: invoices.status,
        clientId: invoices.clientId,
        clientName: clients.name,
        clientEmail: clients.email,
        bookingId: invoices.bookingId,
        bookingReference: bookings.bookingReference,
        sentAt: invoices.sentAt,
        paidAt: invoices.paidAt,
        createdAt: invoices.createdAt,
      })
      .from(invoices)
      .innerJoin(clients, eq(invoices.clientId, clients.id))
      .leftJoin(bookings, eq(invoices.bookingId, bookings.id))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(desc(invoices.createdAt))
      .limit(limit)
      .offset(offset);

    // Get summary stats
    const stats = await db
      .select({
        total: sql<number>`COUNT(*)::int`,
        totalAmount: sql<number>`COALESCE(SUM(${invoices.totalAmount}::numeric), 0)::numeric`,
        paidAmount: sql<number>`COALESCE(SUM(${invoices.paidAmount}::numeric), 0)::numeric`,
        outstandingAmount: sql<number>`COALESCE(SUM(${invoices.balanceAmount}::numeric), 0)::numeric`,
      })
      .from(invoices);

    // Status counts
    const statusCounts = await db
      .select({
        status: invoices.status,
        count: sql<number>`COUNT(*)::int`,
      })
      .from(invoices)
      .groupBy(invoices.status);

    return NextResponse.json({
      success: true,
      invoices: invoiceList,
      stats: {
        total: stats[0]?.total || 0,
        totalAmount: stats[0]?.totalAmount || 0,
        paidAmount: stats[0]?.paidAmount || 0,
        outstandingAmount: stats[0]?.outstandingAmount || 0,
        byStatus: statusCounts.reduce(
          (acc, s) => ({ ...acc, [s.status]: s.count }),
          {}
        ),
      },
      pagination: {
        limit,
        offset,
        hasMore: invoiceList.length === limit,
      },
    });
  } catch (error) {
    return handleApiError(error, "admin-invoices-get");
  }
}

/**
 * POST /api/admin/invoices
 * Create new invoice from booking
 */
export async function POST(req: NextRequest) {
  const auth = verifyAdminSession(req);
  if (!auth.authenticated) return adminUnauthorizedResponse(auth.error);

  try {
    const body = await req.json();
    const {
      bookingId,
      clientId,
      agencyId,
      dueDate,
      applyTax = true,
      applyServiceCharge = true,
      discountAmount,
      discountReason,
      notes,
    } = body;

    if (!bookingId || !clientId) {
      return NextResponse.json(
        { error: "bookingId and clientId are required" },
        { status: 400 }
      );
    }

    const result = await createInvoiceFromBooking({
      bookingId,
      clientId,
      agencyId,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      applyTax,
      applyServiceCharge,
      discountAmount,
      discountReason,
      notes,
    });

    return NextResponse.json({
      success: true,
      invoiceId: result.invoiceId,
      invoiceNumber: result.invoiceNumber,
      message: `Invoice ${result.invoiceNumber} created successfully`,
    });
  } catch (error) {
    return handleApiError(error, "admin-invoices-post");
  }
}
