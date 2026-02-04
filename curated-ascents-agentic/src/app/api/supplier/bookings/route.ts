import { NextResponse } from "next/server";
import { db } from "@/db";
import { bookings, quotes, quoteItems, clients } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { requireSupplierContext, SupplierAuthError } from "@/lib/api/supplier-context";

export async function GET() {
  try {
    const ctx = await requireSupplierContext();
    const supplierId = ctx.supplierId;

    // Get all bookings that include this supplier's services
    // This requires looking at quote_items to find services linked to this supplier
    // For now, we'll return bookings where quote_items have serviceId matching supplier's services

    // A more complete implementation would join through all service tables
    // For now, we'll return a simplified list

    const supplierBookings = await db
      .select({
        id: bookings.id,
        bookingReference: bookings.bookingReference,
        status: bookings.status,
        paymentStatus: bookings.paymentStatus,
        totalAmount: bookings.totalAmount,
        currency: bookings.currency,
        createdAt: bookings.createdAt,
        quoteId: bookings.quoteId,
        destination: quotes.destination,
        quoteName: quotes.quoteName,
        numberOfPax: quotes.numberOfPax,
        startDate: quotes.startDate,
        clientName: clients.name,
      })
      .from(bookings)
      .leftJoin(quotes, eq(bookings.quoteId, quotes.id))
      .leftJoin(clients, eq(bookings.clientId, clients.id))
      .where(
        sql`EXISTS (
          SELECT 1 FROM quote_items qi
          WHERE qi.quote_id = ${bookings.quoteId}
          AND qi.service_id IN (
            SELECT id FROM hotels WHERE supplier_id = ${supplierId}
            UNION SELECT id FROM transportation WHERE supplier_id = ${supplierId}
            UNION SELECT id FROM guides WHERE supplier_id = ${supplierId}
            UNION SELECT id FROM porters WHERE supplier_id = ${supplierId}
            UNION SELECT id FROM flights_domestic WHERE supplier_id = ${supplierId}
            UNION SELECT id FROM helicopter_sharing WHERE supplier_id = ${supplierId}
            UNION SELECT id FROM helicopter_charter WHERE supplier_id = ${supplierId}
            UNION SELECT id FROM miscellaneous_services WHERE supplier_id = ${supplierId}
            UNION SELECT id FROM packages WHERE supplier_id = ${supplierId}
          )
        )`
      )
      .orderBy(sql`${bookings.createdAt} DESC`);

    return NextResponse.json({ bookings: supplierBookings });
  } catch (error) {
    if (error instanceof SupplierAuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Error fetching supplier bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
