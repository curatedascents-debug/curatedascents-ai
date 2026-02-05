import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { supplierCommunications } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import {
  sendSupplierCommunication,
  logIncomingCommunication,
} from "@/lib/suppliers/supplier-relations-engine";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/suppliers/[id]/communications
 * Get communication history with a supplier
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supplierId = parseInt(params.id);
    if (isNaN(supplierId)) {
      return NextResponse.json(
        { error: "Invalid supplier ID" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const communicationType = searchParams.get("type");

    let whereConditions = [eq(supplierCommunications.supplierId, supplierId)];

    if (communicationType) {
      whereConditions.push(eq(supplierCommunications.communicationType, communicationType));
    }

    const communications = await db
      .select()
      .from(supplierCommunications)
      .where(and(...whereConditions))
      .orderBy(desc(supplierCommunications.createdAt))
      .limit(limit);

    // Get stats
    const stats = {
      total: communications.length,
      outbound: communications.filter((c) => c.direction === "outbound").length,
      inbound: communications.filter((c) => c.direction === "inbound").length,
      pendingResponse: communications.filter(
        (c) => c.responseRequired && !c.hasResponse
      ).length,
    };

    return NextResponse.json({
      success: true,
      communications,
      stats,
    });
  } catch (error) {
    console.error("Error fetching supplier communications:", error);
    return NextResponse.json(
      { error: "Failed to fetch communications" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/suppliers/[id]/communications
 * Send a new communication to supplier
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supplierId = parseInt(params.id);
    if (isNaN(supplierId)) {
      return NextResponse.json(
        { error: "Invalid supplier ID" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const {
      communicationType,
      subject,
      message,
      channel,
      bookingId,
      quoteId,
      confirmationRequestId,
      responseRequired,
      responseDeadline,
      attachments,
      agencyId,
      sentBy,
      direction, // For logging incoming
    } = body;

    if (!communicationType || !message) {
      return NextResponse.json(
        { error: "communicationType and message are required" },
        { status: 400 }
      );
    }

    // Handle incoming communication logging
    if (direction === "inbound") {
      const result = await logIncomingCommunication({
        supplierId,
        communicationType,
        subject,
        message,
        channel: channel || "email",
        bookingId,
        confirmationRequestId,
        senderEmail: body.senderEmail,
        senderName: body.senderName,
        agencyId,
      });

      return NextResponse.json({
        success: true,
        communicationId: result.communicationId,
        message: "Incoming communication logged",
      });
    }

    // Send outbound communication
    const result = await sendSupplierCommunication({
      supplierId,
      communicationType,
      subject: subject || `Message from CuratedAscents`,
      message,
      channel,
      bookingId,
      quoteId,
      confirmationRequestId,
      responseRequired,
      responseDeadline: responseDeadline ? new Date(responseDeadline) : undefined,
      attachments,
      agencyId,
      sentBy,
    });

    if (result.sent) {
      return NextResponse.json({
        success: true,
        communicationId: result.communicationId,
        message: "Communication sent successfully",
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          communicationId: result.communicationId,
          error: result.error || "Failed to send communication",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error sending supplier communication:", error);
    return NextResponse.json(
      { error: "Failed to send communication" },
      { status: 500 }
    );
  }
}
