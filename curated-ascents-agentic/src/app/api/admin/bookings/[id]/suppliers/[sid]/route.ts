import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { supplierConfirmationRequests, bookings, bookingEvents, clients } from "@/db/schema";
import { eq, and, ne } from "drizzle-orm";
import React from "react";
import { sendEmail } from "@/lib/email/send-email";
import AllSuppliersConfirmedEmail from "@/lib/email/templates/all-suppliers-confirmed";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// PUT /api/admin/bookings/[id]/suppliers/[sid] - Update confirmation status
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; sid: string }> }
) {
  try {
    const { id, sid } = await params;
    const bookingId = parseInt(id);
    const confirmationId = parseInt(sid);
    const body = await req.json();

    // Verify confirmation exists and belongs to booking
    const confirmationResult = await db
      .select()
      .from(supplierConfirmationRequests)
      .where(eq(supplierConfirmationRequests.id, confirmationId))
      .limit(1);

    if (confirmationResult.length === 0) {
      return NextResponse.json({ error: "Confirmation request not found" }, { status: 404 });
    }

    const confirmation = confirmationResult[0];
    if (confirmation.bookingId !== bookingId) {
      return NextResponse.json({ error: "Confirmation does not belong to this booking" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    // Handle status updates
    if (body.status) {
      updateData.status = body.status;

      if (body.status === "confirmed") {
        updateData.confirmedAt = new Date();
      }
    }

    if (body.confirmationNumber) {
      updateData.confirmationNumber = body.confirmationNumber;
    }
    if (body.responseNotes !== undefined) {
      updateData.responseNotes = body.responseNotes;
    }
    if (body.internalNotes !== undefined) {
      updateData.internalNotes = body.internalNotes;
    }

    const result = await db
      .update(supplierConfirmationRequests)
      .set(updateData)
      .where(eq(supplierConfirmationRequests.id, confirmationId))
      .returning();

    // Log event
    await db.insert(bookingEvents).values({
      bookingId,
      eventType: "supplier_confirmed",
      eventData: {
        action: body.status === "confirmed" ? "supplier_confirmed" : "status_updated",
        confirmationId,
        newStatus: body.status,
        confirmationNumber: body.confirmationNumber,
        serviceName: confirmation.serviceName,
      },
      performedBy: "admin",
    });

    // If this was a confirmation, check if all suppliers are now confirmed
    if (body.status === "confirmed") {
      const pendingConfirmations = await db
        .select({ id: supplierConfirmationRequests.id })
        .from(supplierConfirmationRequests)
        .where(
          and(
            eq(supplierConfirmationRequests.bookingId, bookingId),
            ne(supplierConfirmationRequests.status, "confirmed"),
            ne(supplierConfirmationRequests.status, "cancelled")
          )
        );

      if (pendingConfirmations.length === 0) {
        // All suppliers confirmed! Update booking operations status
        await db
          .update(bookings)
          .set({
            operationsStatus: "all_confirmed",
            updatedAt: new Date(),
          })
          .where(eq(bookings.id, bookingId));

        // Log event
        await db.insert(bookingEvents).values({
          bookingId,
          eventType: "status_changed",
          eventData: {
            field: "operationsStatus",
            oldValue: "suppliers_contacted",
            newValue: "all_confirmed",
          },
          performedBy: "system",
        });

        // Send notification to client
        const bookingResult = await db
          .select()
          .from(bookings)
          .where(eq(bookings.id, bookingId))
          .limit(1);

        if (bookingResult.length > 0) {
          const booking = bookingResult[0];

          if (booking.clientId) {
            const clientResult = await db
              .select({ email: clients.email, name: clients.name })
              .from(clients)
              .where(eq(clients.id, booking.clientId))
              .limit(1);

            if (clientResult.length > 0 && clientResult[0].email) {
              await sendEmail({
                to: clientResult[0].email,
                subject: `All Services Confirmed: ${booking.bookingReference} — CuratedAscents`,
                react: React.createElement(AllSuppliersConfirmedEmail, {
                  clientName: clientResult[0].name || undefined,
                  bookingReference: booking.bookingReference || `Booking #${bookingId}`,
                  startDate: booking.startDate || undefined,
                  endDate: booking.endDate || undefined,
                }),
                logContext: {
                  templateType: "all_suppliers_confirmed",
                  toName: clientResult[0].name || undefined,
                  clientId: booking.clientId,
                  bookingId,
                },
              });
            }
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Supplier confirmation updated",
      confirmation: result[0],
    });
  } catch (error) {
    console.error("Error updating supplier confirmation:", error);
    return NextResponse.json(
      { error: "Failed to update supplier confirmation", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
