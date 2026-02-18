import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { quotes, quoteItems, clients } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { verifyAdminSession, adminUnauthorizedResponse } from "@/lib/auth/admin-api-auth";

export async function GET(req: NextRequest) {
  const auth = verifyAdminSession(req);
  if (!auth.authenticated) return adminUnauthorizedResponse(auth.error);

  try {
    const result = await db
      .select({
        id: quotes.id,
        quoteNumber: quotes.quoteNumber,
        quoteName: quotes.quoteName,
        destination: quotes.destination,
        clientId: quotes.clientId,
        clientName: clients.name,
        clientEmail: clients.email,
        numberOfPax: quotes.numberOfPax,
        totalSellPrice: quotes.totalSellPrice,
        totalCostPrice: quotes.totalCostPrice,
        totalMargin: quotes.totalMargin,
        marginPercent: quotes.marginPercent,
        currency: quotes.currency,
        status: quotes.status,
        validUntil: quotes.validUntil,
        pdfUrl: quotes.pdfUrl,
        createdAt: quotes.createdAt,
        updatedAt: quotes.updatedAt,
      })
      .from(quotes)
      .leftJoin(clients, eq(quotes.clientId, clients.id))
      .orderBy(desc(quotes.createdAt));

    return NextResponse.json({ success: true, quotes: result });
  } catch (error) {
    console.error("Error fetching quotes:", error);
    return NextResponse.json({ error: "Failed to fetch quotes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Generate quote number: QT-YYYY-NNNN
    const year = new Date().getFullYear();
    const countResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(quotes);
    const nextNum = (Number(countResult[0]?.count) || 0) + 1;
    const quoteNumber = `QT-${year}-${String(nextNum).padStart(4, "0")}`;

    // Calculate totals from line items
    const items = body.items || [];
    let totalSell = 0;
    let totalCost = 0;
    for (const item of items) {
      totalSell += parseFloat(item.sellPrice || "0") * (item.quantity || 1);
      totalCost += parseFloat(item.costPrice || "0") * (item.quantity || 1);
    }
    const totalMargin = totalSell - totalCost;
    const marginPercent = totalCost > 0 ? ((totalMargin / totalCost) * 100).toFixed(2) : "0";

    // Insert quote
    const quoteResult = await db
      .insert(quotes)
      .values({
        quoteNumber,
        clientId: body.clientId || null,
        quoteName: body.quoteName || null,
        destination: body.destination || null,
        startDate: body.startDate || null,
        endDate: body.endDate || null,
        numberOfPax: body.numberOfPax || null,
        numberOfRooms: body.numberOfRooms || null,
        totalSellPrice: totalSell.toFixed(2),
        totalCostPrice: totalCost.toFixed(2),
        totalMargin: totalMargin.toFixed(2),
        marginPercent,
        perPersonPrice: body.numberOfPax ? (totalSell / body.numberOfPax).toFixed(2) : null,
        currency: body.currency || "USD",
        isMICE: body.isMICE || false,
        status: "draft",
        validUntil: body.validUntil || null,
        inclusionsSummary: body.inclusionsSummary || null,
        exclusionsSummary: body.exclusionsSummary || null,
        termsConditions: body.termsConditions || null,
        notes: body.notes || null,
      })
      .returning();

    const quote = quoteResult[0];

    // Insert line items
    if (items.length > 0) {
      const itemValues = items.map((item: any) => ({
        quoteId: quote.id,
        serviceType: item.serviceType || "miscellaneous",
        serviceId: item.serviceId || null,
        serviceName: item.serviceName || null,
        description: item.description || null,
        quantity: item.quantity || 1,
        days: item.days || null,
        nights: item.nights || null,
        costPrice: item.costPrice || null,
        sellPrice: item.sellPrice || null,
        margin: item.costPrice && item.sellPrice
          ? (parseFloat(item.sellPrice) - parseFloat(item.costPrice)).toFixed(2)
          : null,
        currency: item.currency || "USD",
        notes: item.notes || null,
      }));

      await db.insert(quoteItems).values(itemValues);
    }

    return NextResponse.json({
      success: true,
      message: "Quote created successfully",
      quote,
    });
  } catch (error) {
    console.error("Error creating quote:", error);
    return NextResponse.json(
      { error: "Failed to create quote", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
