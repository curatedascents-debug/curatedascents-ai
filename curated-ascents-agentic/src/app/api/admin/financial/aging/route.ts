import { NextRequest, NextResponse } from "next/server";
import { getAgingReport } from "@/lib/financial/invoice-engine";
import { verifyAdminSession, adminUnauthorizedResponse } from "@/lib/auth/admin-api-auth";
import { handleApiError } from "@/lib/api/error-handler";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/financial/aging
 * Get accounts receivable aging report
 */
export async function GET(req: NextRequest) {
  const auth = verifyAdminSession(req);
  if (!auth.authenticated) return adminUnauthorizedResponse(auth.error);

  try {
    const { searchParams } = new URL(req.url);
    const agencyId = searchParams.get("agencyId");

    const agingReport = await getAgingReport(
      agencyId ? parseInt(agencyId) : undefined
    );

    // Calculate percentages
    const total = agingReport.summary.total.amount;
    const withPercentages = {
      current: {
        ...agingReport.summary.current,
        percentage: total > 0
          ? ((agingReport.summary.current.amount / total) * 100).toFixed(1) + "%"
          : "0%",
      },
      days1to30: {
        ...agingReport.summary.days1to30,
        percentage: total > 0
          ? ((agingReport.summary.days1to30.amount / total) * 100).toFixed(1) + "%"
          : "0%",
      },
      days31to60: {
        ...agingReport.summary.days31to60,
        percentage: total > 0
          ? ((agingReport.summary.days31to60.amount / total) * 100).toFixed(1) + "%"
          : "0%",
      },
      days61to90: {
        ...agingReport.summary.days61to90,
        percentage: total > 0
          ? ((agingReport.summary.days61to90.amount / total) * 100).toFixed(1) + "%"
          : "0%",
      },
      over90: {
        ...agingReport.summary.over90,
        percentage: total > 0
          ? ((agingReport.summary.over90.amount / total) * 100).toFixed(1) + "%"
          : "0%",
      },
      total: agingReport.summary.total,
    };

    // Calculate overdue total
    const overdueAmount =
      agingReport.summary.days1to30.amount +
      agingReport.summary.days31to60.amount +
      agingReport.summary.days61to90.amount +
      agingReport.summary.over90.amount;

    const overdueCount =
      agingReport.summary.days1to30.count +
      agingReport.summary.days31to60.count +
      agingReport.summary.days61to90.count +
      agingReport.summary.over90.count;

    return NextResponse.json({
      success: true,
      summary: withPercentages,
      overdue: {
        count: overdueCount,
        amount: overdueAmount,
        percentage: total > 0
          ? ((overdueAmount / total) * 100).toFixed(1) + "%"
          : "0%",
      },
      invoices: {
        current: agingReport.invoices.current.map(formatInvoice),
        days1to30: agingReport.invoices.days1to30.map(formatInvoice),
        days31to60: agingReport.invoices.days31to60.map(formatInvoice),
        days61to90: agingReport.invoices.days61to90.map(formatInvoice),
        over90: agingReport.invoices.over90.map(formatInvoice),
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return handleApiError(error, "admin-financial-aging-get");
  }
}

function formatInvoice(invoice: {
  id: number;
  invoiceNumber: string;
  clientId: number;
  clientName: string | null;
  clientEmail: string;
  dueDate: string;
  totalAmount: string | null;
  balanceAmount: string | null;
  currency: string | null;
}) {
  const dueDate = new Date(invoice.dueDate);
  const today = new Date();
  const daysOverdue = Math.floor(
    (today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return {
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    clientId: invoice.clientId,
    clientName: invoice.clientName || invoice.clientEmail,
    dueDate: invoice.dueDate,
    daysOverdue: Math.max(0, daysOverdue),
    totalAmount: invoice.totalAmount,
    balanceAmount: invoice.balanceAmount,
    currency: invoice.currency || "USD",
  };
}
