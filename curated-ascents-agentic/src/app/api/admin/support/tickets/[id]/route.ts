/**
 * Single Support Ticket API
 * GET /api/admin/support/tickets/[id] - Get ticket details
 * PUT /api/admin/support/tickets/[id] - Update ticket
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getTicketDetails,
  updateTicketStatus,
  assignTicket,
  resolveTicket,
  rateSatisfaction,
  addTicketMessage,
  markMessagesRead,
  TicketStatus,
} from "@/lib/customer-success/support-engine";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ticketId = parseInt(id);

    const ticket = await getTicketDetails(ticketId);

    if (!ticket) {
      return NextResponse.json(
        { error: "Ticket not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ticket });
  } catch (error) {
    console.error("Error fetching ticket:", error);
    return NextResponse.json(
      { error: "Failed to fetch ticket" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ticketId = parseInt(id);
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "update_status": {
        const { status, updatedBy } = body;
        await updateTicketStatus(ticketId, status as TicketStatus, updatedBy);
        return NextResponse.json({ success: true });
      }

      case "assign": {
        const { assignedTo } = body;
        if (!assignedTo) {
          return NextResponse.json(
            { error: "assignedTo is required" },
            { status: 400 }
          );
        }
        await assignTicket(ticketId, assignedTo);
        return NextResponse.json({ success: true });
      }

      case "resolve": {
        const { resolution, resolvedBy } = body;
        if (!resolution || !resolvedBy) {
          return NextResponse.json(
            { error: "resolution and resolvedBy are required" },
            { status: 400 }
          );
        }
        await resolveTicket(ticketId, resolution, resolvedBy);
        return NextResponse.json({ success: true });
      }

      case "rate": {
        const { rating, feedback } = body;
        if (rating === undefined || rating < 1 || rating > 5) {
          return NextResponse.json(
            { error: "rating (1-5) is required" },
            { status: 400 }
          );
        }
        await rateSatisfaction(ticketId, rating, feedback);
        return NextResponse.json({ success: true });
      }

      case "add_message": {
        const { senderType, senderId, senderName, message, attachments } = body;
        if (!senderType || !message) {
          return NextResponse.json(
            { error: "senderType and message are required" },
            { status: 400 }
          );
        }
        const result = await addTicketMessage({
          ticketId,
          senderType,
          senderId,
          senderName,
          message,
          attachments,
        });
        return NextResponse.json({ success: true, messageId: result.messageId });
      }

      case "mark_read": {
        const { readerType } = body;
        if (!readerType) {
          return NextResponse.json(
            { error: "readerType is required" },
            { status: 400 }
          );
        }
        await markMessagesRead(ticketId, readerType);
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error updating ticket:", error);
    return NextResponse.json(
      { error: "Failed to update ticket" },
      { status: 500 }
    );
  }
}
