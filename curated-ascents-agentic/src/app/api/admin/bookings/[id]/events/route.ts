import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bookingEvents, bookings } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET /api/admin/bookings/[id]/events - Get booking event history (audit trail)
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

    const events = await db
      .select()
      .from(bookingEvents)
      .where(eq(bookingEvents.bookingId, bookingId))
      .orderBy(desc(bookingEvents.createdAt));

    // Format events for display
    const formattedEvents = events.map(event => ({
      id: event.id,
      eventType: event.eventType,
      eventData: event.eventData,
      performedBy: event.performedBy,
      createdAt: event.createdAt,
      // Add human-readable description
      description: getEventDescription(event.eventType, event.eventData as Record<string, unknown>),
    }));

    return NextResponse.json({ success: true, events: formattedEvents });
  } catch (error) {
    console.error("Error fetching booking events:", error);
    return NextResponse.json(
      { error: "Failed to fetch booking events" },
      { status: 500 }
    );
  }
}

function getEventDescription(eventType: string, eventData: Record<string, unknown> | null): string {
  if (!eventData) {
    return formatEventType(eventType);
  }

  switch (eventType) {
    case "created":
      return "Booking created";

    case "status_changed":
      if (eventData.field === "operationsStatus") {
        return `Operations status changed to "${eventData.newValue}"`;
      }
      return `Booking status changed to "${eventData.newValue}"`;

    case "payment_received":
      if (eventData.action === "milestone_created") {
        return `Payment milestone created: ${eventData.milestoneType} ($${eventData.amount})`;
      }
      return `Payment received: $${eventData.paymentAmount} (Balance: $${eventData.newBalance})`;

    case "supplier_confirmed":
      if (eventData.action === "request_created") {
        return `Supplier confirmation request created for ${eventData.serviceName}`;
      }
      if (eventData.action === "request_sent") {
        return `Confirmation request sent to ${eventData.supplierName} for ${eventData.serviceName}`;
      }
      if (eventData.action === "supplier_confirmed") {
        return `${eventData.serviceName} confirmed${eventData.confirmationNumber ? ` (${eventData.confirmationNumber})` : ""}`;
      }
      return `Supplier confirmation updated for ${eventData.serviceName}`;

    case "briefing_sent":
      return `${eventData.briefingType === "24_hour" ? "24-hour" : "7-day"} trip briefing ${eventData.sent ? "sent" : "generated"}`;

    case "reminder_sent":
      return `Payment reminder sent (${eventData.reminderType || "due"})`;

    case "note_added":
      return "Operations note updated";

    default:
      return formatEventType(eventType);
  }
}

function formatEventType(eventType: string): string {
  return eventType
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
