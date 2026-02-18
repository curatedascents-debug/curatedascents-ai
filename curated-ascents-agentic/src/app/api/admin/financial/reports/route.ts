import { NextRequest, NextResponse } from "next/server";
import { getFinancialSummary } from "@/lib/financial/invoice-engine";
import { verifyAdminSession, adminUnauthorizedResponse } from "@/lib/auth/admin-api-auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/financial/reports
 * Get financial reports and summaries
 */
export async function GET(req: NextRequest) {
  const auth = verifyAdminSession(req);
  if (!auth.authenticated) return adminUnauthorizedResponse(auth.error);

  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "month"; // day, week, month, quarter, year
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const agencyId = searchParams.get("agencyId");

    let startDate: Date;
    let endDate: Date = new Date();

    // Calculate date range based on period
    if (startDateParam && endDateParam) {
      startDate = new Date(startDateParam);
      endDate = new Date(endDateParam);
    } else {
      const now = new Date();
      switch (period) {
        case "day":
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case "week":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case "quarter":
          const quarter = Math.floor(now.getMonth() / 3);
          startDate = new Date(now.getFullYear(), quarter * 3, 1);
          break;
        case "year":
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }
    }

    // Get current period summary
    const currentPeriod = await getFinancialSummary(
      startDate,
      endDate,
      agencyId ? parseInt(agencyId) : undefined
    );

    // Get previous period for comparison
    const periodLength = endDate.getTime() - startDate.getTime();
    const previousStart = new Date(startDate.getTime() - periodLength);
    const previousEnd = new Date(startDate.getTime() - 1);

    const previousPeriod = await getFinancialSummary(
      previousStart,
      previousEnd,
      agencyId ? parseInt(agencyId) : undefined
    );

    // Calculate percentage changes
    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const comparison = {
      invoiceAmount: calculateChange(
        currentPeriod.invoices.totalAmount,
        previousPeriod.invoices.totalAmount
      ),
      paymentsReceived: calculateChange(
        currentPeriod.payments.totalReceived,
        previousPeriod.payments.totalReceived
      ),
      invoiceCount: calculateChange(
        currentPeriod.invoices.total,
        previousPeriod.invoices.total
      ),
    };

    // Collection rate
    const collectionRate =
      currentPeriod.invoices.totalAmount > 0
        ? (currentPeriod.payments.totalReceived / currentPeriod.invoices.totalAmount) * 100
        : 0;

    return NextResponse.json({
      success: true,
      period: {
        type: period,
        start: currentPeriod.period.start,
        end: currentPeriod.period.end,
      },
      current: currentPeriod,
      previous: {
        period: previousPeriod.period,
        invoices: previousPeriod.invoices,
        payments: previousPeriod.payments,
      },
      comparison: {
        invoiceAmountChange: comparison.invoiceAmount.toFixed(1),
        paymentsReceivedChange: comparison.paymentsReceived.toFixed(1),
        invoiceCountChange: comparison.invoiceCount.toFixed(1),
      },
      metrics: {
        collectionRate: collectionRate.toFixed(1) + "%",
        avgInvoiceValue:
          currentPeriod.invoices.total > 0
            ? (currentPeriod.invoices.totalAmount / currentPeriod.invoices.total).toFixed(2)
            : 0,
        avgPaymentValue:
          currentPeriod.payments.total > 0
            ? (currentPeriod.payments.totalReceived / currentPeriod.payments.total).toFixed(2)
            : 0,
      },
    });
  } catch (error) {
    console.error("Error generating financial report:", error);
    return NextResponse.json(
      { error: "Failed to generate financial report" },
      { status: 500 }
    );
  }
}
