/**
 * Support Tickets API
 * GET /api/admin/support/tickets - List tickets
 * POST /api/admin/support/tickets - Create ticket
 */

import { NextRequest, NextResponse } from "next/server";
import {
  createSupportTicket,
  listTickets,
  getSupportStats,
  checkSLABreaches,
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from "@/lib/customer-success/support-engine";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const clientId = searchParams.get("clientId")
      ? parseInt(searchParams.get("clientId")!)
      : undefined;
    const status = searchParams.get("status") as TicketStatus | undefined;
    const category = searchParams.get("category") as TicketCategory | undefined;
    const priority = searchParams.get("priority") as TicketPriority | undefined;
    const isInTrip = searchParams.get("isInTrip") === "true" ? true : undefined;
    const assignedTo = searchParams.get("assignedTo") || undefined;
    const includeStats = searchParams.get("includeStats") === "true";
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 50;
    const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!) : 0;

    const tickets = await listTickets({
      clientId,
      status: status ? status : undefined,
      category,
      priority,
      isInTrip,
      assignedTo,
      limit,
      offset,
    });

    let stats = null;
    if (includeStats) {
      stats = await getSupportStats({});
      // Also check for SLA breaches
      await checkSLABreaches();
    }

    return NextResponse.json({ tickets, stats });
  } catch (error) {
    console.error("Error fetching support tickets:", error);
    return NextResponse.json(
      { error: "Failed to fetch support tickets" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      clientId,
      bookingId,
      subject,
      description,
      category,
      priority,
      isInTrip,
      tripLocation,
      agencyId,
    } = body;

    // Validate required fields
    if (!clientId || !subject || !category) {
      return NextResponse.json(
        { error: "Missing required fields: clientId, subject, category" },
        { status: 400 }
      );
    }

    const result = await createSupportTicket({
      clientId,
      bookingId,
      subject,
      description,
      category,
      priority,
      isInTrip,
      tripLocation,
      agencyId,
    });

    return NextResponse.json({
      success: true,
      ticketId: result.ticketId,
      ticketNumber: result.ticketNumber,
    });
  } catch (error) {
    console.error("Error creating support ticket:", error);
    return NextResponse.json(
      { error: "Failed to create support ticket" },
      { status: 500 }
    );
  }
}
