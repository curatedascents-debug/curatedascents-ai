import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { supplierConfirmationRequests, bookings, bookingEvents, suppliers } from "@/db/schema";
import { eq } from "drizzle-orm";
import React from "react";
import { sendEmail } from "@/lib/email/send-email";
import SupplierConfirmationRequestEmail from "@/lib/email/templates/supplier-confirmation-request";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET /api/admin/bookings/[id]/suppliers - List supplier confirmation requests
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bookingId = parseInt(id);

    // Verify booking exists
    const bookingResult = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (bookingResult.length === 0) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const confirmations = await db
      .select({
        id: supplierConfirmationRequests.id,
        bookingId: supplierConfirmationRequests.bookingId,
        supplierId: supplierConfirmationRequests.supplierId,
        supplierName: suppliers.name,
        quoteItemId: supplierConfirmationRequests.quoteItemId,
        serviceType: supplierConfirmationRequests.serviceType,
        serviceName: supplierConfirmationRequests.serviceName,
        serviceDetails: supplierConfirmationRequests.serviceDetails,
        status: supplierConfirmationRequests.status,
        confirmationNumber: supplierConfirmationRequests.confirmationNumber,
        requestedAt: supplierConfirmationRequests.requestedAt,
        sentAt: supplierConfirmationRequests.sentAt,
        confirmedAt: supplierConfirmationRequests.confirmedAt,
        responseNotes: supplierConfirmationRequests.responseNotes,
        internalNotes: supplierConfirmationRequests.internalNotes,
        createdAt: supplierConfirmationRequests.createdAt,
      })
      .from(supplierConfirmationRequests)
      .leftJoin(suppliers, eq(supplierConfirmationRequests.supplierId, suppliers.id))
      .where(eq(supplierConfirmationRequests.bookingId, bookingId));

    return NextResponse.json({ success: true, confirmations });
  } catch (error) {
    console.error("Error fetching supplier confirmations:", error);
    return NextResponse.json(
      { error: "Failed to fetch supplier confirmations" },
      { status: 500 }
    );
  }
}

// POST /api/admin/bookings/[id]/suppliers - Create a supplier confirmation request or send request email
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bookingId = parseInt(id);
    const body = await req.json();

    // Verify booking exists
    const bookingResult = await db
      .select({
        id: bookings.id,
        bookingReference: bookings.bookingReference,
        startDate: bookings.startDate,
        endDate: bookings.endDate,
      })
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (bookingResult.length === 0) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const booking = bookingResult[0];

    // If sending request to existing confirmation
    if (body.confirmationId && body.action === "send") {
      const confirmationResult = await db
        .select()
        .from(supplierConfirmationRequests)
        .where(eq(supplierConfirmationRequests.id, body.confirmationId))
        .limit(1);

      if (confirmationResult.length === 0) {
        return NextResponse.json({ error: "Confirmation request not found" }, { status: 404 });
      }

      const confirmation = confirmationResult[0];

      // Get supplier details
      if (confirmation.supplierId) {
        const supplierResult = await db
          .select()
          .from(suppliers)
          .where(eq(suppliers.id, confirmation.supplierId))
          .limit(1);

        if (supplierResult.length > 0) {
          const supplier = supplierResult[0];
          const supplierEmail = supplier.reservationEmail || supplier.salesEmail;

          if (supplierEmail) {
            await sendEmail({
              to: supplierEmail,
              subject: `Booking Confirmation Request: ${booking.bookingReference} — CuratedAscents`,
              react: React.createElement(SupplierConfirmationRequestEmail, {
                supplierName: supplier.name,
                bookingReference: booking.bookingReference || `Booking #${bookingId}`,
                serviceName: confirmation.serviceName,
                serviceType: confirmation.serviceType,
                serviceDetails: confirmation.serviceDetails as Record<string, unknown>,
                startDate: booking.startDate || undefined,
                endDate: booking.endDate || undefined,
              }),
              logContext: {
                templateType: "supplier_confirmation_request",
                toName: supplier.name,
                bookingId,
                metadata: { confirmationId: confirmation.id, supplierId: supplier.id },
              },
            });

            // Update confirmation status
            await db
              .update(supplierConfirmationRequests)
              .set({
                status: "sent",
                sentAt: new Date(),
                updatedAt: new Date(),
              })
              .where(eq(supplierConfirmationRequests.id, confirmation.id));

            // Log event
            await db.insert(bookingEvents).values({
              bookingId,
              eventType: "supplier_confirmed",
              eventData: {
                action: "request_sent",
                confirmationId: confirmation.id,
                supplierId: supplier.id,
                supplierName: supplier.name,
                serviceName: confirmation.serviceName,
              },
              performedBy: "admin",
            });
          }
        }
      }

      return NextResponse.json({
        success: true,
        message: "Confirmation request sent to supplier",
      });
    }

    // Create new confirmation request
    const { supplierId, quoteItemId, serviceType, serviceName, serviceDetails } = body;

    if (!serviceType || !serviceName) {
      return NextResponse.json(
        { error: "serviceType and serviceName are required" },
        { status: 400 }
      );
    }

    const result = await db
      .insert(supplierConfirmationRequests)
      .values({
        bookingId,
        supplierId: supplierId || null,
        quoteItemId: quoteItemId || null,
        serviceType,
        serviceName,
        serviceDetails: serviceDetails || null,
        status: "pending",
        requestedAt: new Date(),
      })
      .returning();

    // Log event
    await db.insert(bookingEvents).values({
      bookingId,
      eventType: "supplier_confirmed",
      eventData: {
        action: "request_created",
        confirmationId: result[0].id,
        supplierId,
        serviceType,
        serviceName,
      },
      performedBy: "admin",
    });

    return NextResponse.json({
      success: true,
      message: "Supplier confirmation request created",
      confirmation: result[0],
    });
  } catch (error) {
    console.error("Error creating supplier confirmation:", error);
    return NextResponse.json(
      { error: "Failed to create supplier confirmation", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
