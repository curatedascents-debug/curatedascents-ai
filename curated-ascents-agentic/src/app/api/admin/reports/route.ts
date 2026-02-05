import { NextResponse } from "next/server";
import { db } from "@/db";
import { quotes, bookings, clients, quoteItems } from "@/db/schema";
import { sql, eq, gte, and, count, sum } from "drizzle-orm";

// Disable caching
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    // Use params or default to 90 days ago
    const startDate = startDateParam ? new Date(startDateParam) : (() => {
      const d = new Date();
      d.setDate(d.getDate() - 90);
      return d;
    })();
    const endDate = endDateParam ? new Date(endDateParam) : new Date();

    // === QUOTE METRICS ===
    const quoteStats = await db
      .select({
        status: quotes.status,
        count: count(),
        totalValue: sum(quotes.totalSellPrice),
        totalMargin: sum(quotes.totalMargin),
      })
      .from(quotes)
      .groupBy(quotes.status);

    // Quote funnel
    const quoteFunnel = {
      draft: 0,
      sent: 0,
      accepted: 0,
      expired: 0,
      totalValue: {
        draft: 0,
        sent: 0,
        accepted: 0,
        expired: 0,
      },
    };

    let totalQuoteValue = 0;
    let totalMargin = 0;

    quoteStats.forEach((stat) => {
      const status = stat.status || "draft";
      const countVal = Number(stat.count) || 0;
      const value = parseFloat(stat.totalValue || "0");
      const margin = parseFloat(stat.totalMargin || "0");

      if (status in quoteFunnel) {
        (quoteFunnel as any)[status] = countVal;
        (quoteFunnel.totalValue as any)[status] = value;
      }
      totalQuoteValue += value;
      totalMargin += margin;
    });

    // Conversion rate: accepted / (sent + accepted)
    const sentAndAccepted = quoteFunnel.sent + quoteFunnel.accepted;
    const conversionRate = sentAndAccepted > 0
      ? ((quoteFunnel.accepted / sentAndAccepted) * 100).toFixed(1)
      : "0";

    // === BOOKING METRICS ===
    const bookingStats = await db
      .select({
        status: bookings.status,
        paymentStatus: bookings.paymentStatus,
        count: count(),
        totalAmount: sum(bookings.totalAmount),
        paidAmount: sum(bookings.paidAmount),
        balanceAmount: sum(bookings.balanceAmount),
      })
      .from(bookings)
      .groupBy(bookings.status, bookings.paymentStatus);

    let totalBookings = 0;
    let totalRevenue = 0;
    let totalPaid = 0;
    let totalBalance = 0;
    const bookingsByStatus: Record<string, number> = {};
    const bookingsByPayment: Record<string, number> = {};

    bookingStats.forEach((stat) => {
      const countVal = Number(stat.count) || 0;
      totalBookings += countVal;
      totalRevenue += parseFloat(stat.totalAmount || "0");
      totalPaid += parseFloat(stat.paidAmount || "0");
      totalBalance += parseFloat(stat.balanceAmount || "0");

      const status = stat.status || "confirmed";
      const payStatus = stat.paymentStatus || "pending";

      bookingsByStatus[status] = (bookingsByStatus[status] || 0) + countVal;
      bookingsByPayment[payStatus] = (bookingsByPayment[payStatus] || 0) + countVal;
    });

    const collectionRate = totalRevenue > 0
      ? ((totalPaid / totalRevenue) * 100).toFixed(1)
      : "0";

    // === CLIENT METRICS ===
    const totalClients = await db
      .select({ count: count() })
      .from(clients);

    const clientsBySource = await db
      .select({
        source: clients.source,
        count: count(),
      })
      .from(clients)
      .groupBy(clients.source);

    const newClientsThisMonth = await db
      .select({ count: count() })
      .from(clients)
      .where(
        gte(clients.createdAt, new Date(new Date().getFullYear(), new Date().getMonth(), 1))
      );

    // === MONTHLY TRENDS (last 6 months) ===
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Quote trends by month
    const quoteTrends = await db
      .select({
        month: sql<string>`to_char(${quotes.createdAt}, 'YYYY-MM')`,
        count: count(),
        value: sum(quotes.totalSellPrice),
      })
      .from(quotes)
      .where(gte(quotes.createdAt, sixMonthsAgo))
      .groupBy(sql`to_char(${quotes.createdAt}, 'YYYY-MM')`)
      .orderBy(sql`to_char(${quotes.createdAt}, 'YYYY-MM')`);

    // Booking trends by month
    const bookingTrends = await db
      .select({
        month: sql<string>`to_char(${bookings.createdAt}, 'YYYY-MM')`,
        count: count(),
        revenue: sum(bookings.totalAmount),
        collected: sum(bookings.paidAmount),
      })
      .from(bookings)
      .where(gte(bookings.createdAt, sixMonthsAgo))
      .groupBy(sql`to_char(${bookings.createdAt}, 'YYYY-MM')`)
      .orderBy(sql`to_char(${bookings.createdAt}, 'YYYY-MM')`);

    // Client trends by month
    const clientTrends = await db
      .select({
        month: sql<string>`to_char(${clients.createdAt}, 'YYYY-MM')`,
        count: count(),
      })
      .from(clients)
      .where(gte(clients.createdAt, sixMonthsAgo))
      .groupBy(sql`to_char(${clients.createdAt}, 'YYYY-MM')`)
      .orderBy(sql`to_char(${clients.createdAt}, 'YYYY-MM')`);

    // === TOP DESTINATIONS ===
    const topDestinations = await db
      .select({
        destination: quotes.destination,
        count: count(),
        value: sum(quotes.totalSellPrice),
      })
      .from(quotes)
      .where(and(
        sql`${quotes.destination} IS NOT NULL`,
        sql`${quotes.destination} != ''`
      ))
      .groupBy(quotes.destination)
      .orderBy(sql`count(*) DESC`)
      .limit(5);

    // === SERVICE TYPE POPULARITY ===
    const servicePopularity = await db
      .select({
        serviceType: quoteItems.serviceType,
        count: count(),
        value: sum(quoteItems.sellPrice),
      })
      .from(quoteItems)
      .groupBy(quoteItems.serviceType)
      .orderBy(sql`count(*) DESC`);

    return NextResponse.json({
      success: true,
      data: {
        // KPI Summary
        kpis: {
          totalRevenue: totalRevenue.toFixed(2),
          totalPaid: totalPaid.toFixed(2),
          totalBalance: totalBalance.toFixed(2),
          collectionRate: parseFloat(collectionRate),
          totalQuoteValue: totalQuoteValue.toFixed(2),
          totalMargin: totalMargin.toFixed(2),
          conversionRate: parseFloat(conversionRate),
          totalBookings,
          totalClients: Number(totalClients[0]?.count) || 0,
          newClientsThisMonth: Number(newClientsThisMonth[0]?.count) || 0,
        },
        // Quote Funnel
        quoteFunnel,
        // Booking breakdown
        bookingsByStatus,
        bookingsByPayment,
        // Clients by source
        clientsBySource: clientsBySource.map((c) => ({
          source: c.source || "unknown",
          count: Number(c.count),
        })),
        // Monthly trends
        trends: {
          quotes: quoteTrends.map((t) => ({
            month: t.month,
            count: Number(t.count),
            value: parseFloat(t.value || "0"),
          })),
          bookings: bookingTrends.map((t) => ({
            month: t.month,
            count: Number(t.count),
            revenue: parseFloat(t.revenue || "0"),
            collected: parseFloat(t.collected || "0"),
          })),
          clients: clientTrends.map((t) => ({
            month: t.month,
            count: Number(t.count),
          })),
        },
        // Top destinations
        topDestinations: topDestinations.map((d) => ({
          destination: d.destination || "Unknown",
          count: Number(d.count),
          value: parseFloat(d.value || "0"),
        })),
        // Service popularity
        servicePopularity: servicePopularity.map((s) => ({
          serviceType: s.serviceType,
          count: Number(s.count),
          value: parseFloat(s.value || "0"),
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
