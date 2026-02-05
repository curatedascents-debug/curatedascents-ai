import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { supplierRateRequests, suppliers } from "@/db/schema";
import { eq, desc, and, or } from "drizzle-orm";
import {
  createRateRequest,
  sendRateRequestReminder,
} from "@/lib/suppliers/supplier-relations-engine";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/supplier-requests
 * List all rate requests
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const supplierId = searchParams.get("supplierId");
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");

    let whereConditions = [];

    if (supplierId) {
      whereConditions.push(eq(supplierRateRequests.supplierId, parseInt(supplierId)));
    }

    if (status) {
      whereConditions.push(eq(supplierRateRequests.status, status));
    }

    const requests = await db
      .select({
        id: supplierRateRequests.id,
        supplierId: supplierRateRequests.supplierId,
        supplierName: suppliers.name,
        requestType: supplierRateRequests.requestType,
        serviceTypes: supplierRateRequests.serviceTypes,
        validFrom: supplierRateRequests.validFrom,
        validTo: supplierRateRequests.validTo,
        status: supplierRateRequests.status,
        priority: supplierRateRequests.priority,
        sentAt: supplierRateRequests.sentAt,
        sentTo: supplierRateRequests.sentTo,
        receivedAt: supplierRateRequests.receivedAt,
        ratesReceived: supplierRateRequests.ratesReceived,
        reminderCount: supplierRateRequests.reminderCount,
        lastReminderAt: supplierRateRequests.lastReminderAt,
        createdAt: supplierRateRequests.createdAt,
      })
      .from(supplierRateRequests)
      .leftJoin(suppliers, eq(supplierRateRequests.supplierId, suppliers.id))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(desc(supplierRateRequests.createdAt))
      .limit(limit);

    // Get stats
    const stats = {
      total: requests.length,
      pending: requests.filter((r) => r.status === "pending").length,
      sent: requests.filter((r) => r.status === "sent").length,
      received: requests.filter((r) => r.status === "received").length,
      processed: requests.filter((r) => r.status === "processed").length,
    };

    return NextResponse.json({
      success: true,
      requests,
      stats,
    });
  } catch (error) {
    console.error("Error fetching rate requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch rate requests" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/supplier-requests
 * Create and send a new rate request
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      supplierId,
      requestType,
      serviceTypes,
      validFrom,
      validTo,
      priority,
      agencyId,
      sentBy,
    } = body;

    if (!supplierId || !requestType || !serviceTypes || !validFrom || !validTo) {
      return NextResponse.json(
        { error: "supplierId, requestType, serviceTypes, validFrom, and validTo are required" },
        { status: 400 }
      );
    }

    const result = await createRateRequest({
      supplierId,
      requestType,
      serviceTypes,
      validFrom: new Date(validFrom),
      validTo: new Date(validTo),
      priority,
      agencyId,
      sentBy,
    });

    if (result.sent) {
      return NextResponse.json({
        success: true,
        requestId: result.requestId,
        message: "Rate request sent successfully",
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          requestId: result.requestId,
          error: result.error || "Failed to send rate request",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error creating rate request:", error);
    return NextResponse.json(
      { error: "Failed to create rate request" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/supplier-requests
 * Update rate request status or send reminder
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { requestId, action, status, responseNotes, ratesReceived } = body;

    if (!requestId) {
      return NextResponse.json(
        { error: "requestId is required" },
        { status: 400 }
      );
    }

    // Handle reminder action
    if (action === "send_reminder") {
      const result = await sendRateRequestReminder(requestId);

      if (result.sent) {
        return NextResponse.json({
          success: true,
          message: "Reminder sent successfully",
        });
      } else {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 400 }
        );
      }
    }

    // Update status
    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    if (status) {
      updateData.status = status;
      if (status === "received") {
        updateData.receivedAt = new Date();
      } else if (status === "processed") {
        updateData.ratesProcessedAt = new Date();
      }
    }

    if (responseNotes !== undefined) {
      updateData.responseNotes = responseNotes;
    }

    if (ratesReceived !== undefined) {
      updateData.ratesReceived = ratesReceived;
    }

    await db
      .update(supplierRateRequests)
      .set(updateData)
      .where(eq(supplierRateRequests.id, requestId));

    return NextResponse.json({
      success: true,
      message: "Rate request updated successfully",
    });
  } catch (error) {
    console.error("Error updating rate request:", error);
    return NextResponse.json(
      { error: "Failed to update rate request" },
      { status: 500 }
    );
  }
}
