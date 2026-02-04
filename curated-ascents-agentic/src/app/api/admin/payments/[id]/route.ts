import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { payments, invoices, clients, paymentAllocations } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/payments/[id]
 * Get payment details
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const paymentId = parseInt(id);

    const [payment] = await db
      .select({
        id: payments.id,
        paymentNumber: payments.paymentNumber,
        paymentDate: payments.paymentDate,
        amount: payments.amount,
        currency: payments.currency,
        paymentMethod: payments.paymentMethod,
        transactionReference: payments.transactionReference,
        bankName: payments.bankName,
        status: payments.status,
        notes: payments.notes,
        invoiceId: payments.invoiceId,
        invoiceNumber: invoices.invoiceNumber,
        clientId: payments.clientId,
        clientName: clients.name,
        clientEmail: clients.email,
        processedAt: payments.processedAt,
        processedBy: payments.processedBy,
        createdAt: payments.createdAt,
      })
      .from(payments)
      .innerJoin(clients, eq(payments.clientId, clients.id))
      .leftJoin(invoices, eq(payments.invoiceId, invoices.id))
      .where(eq(payments.id, paymentId))
      .limit(1);

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Get allocations
    const allocations = await db
      .select({
        id: paymentAllocations.id,
        invoiceId: paymentAllocations.invoiceId,
        invoiceNumber: invoices.invoiceNumber,
        allocatedAmount: paymentAllocations.allocatedAmount,
        createdAt: paymentAllocations.createdAt,
      })
      .from(paymentAllocations)
      .leftJoin(invoices, eq(paymentAllocations.invoiceId, invoices.id))
      .where(eq(paymentAllocations.paymentId, paymentId));

    return NextResponse.json({
      success: true,
      payment: {
        ...payment,
        allocations,
      },
    });
  } catch (error) {
    console.error("Error fetching payment:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/payments/[id]
 * Update payment details (limited fields)
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const paymentId = parseInt(id);
    const body = await req.json();

    const [existing] = await db
      .select()
      .from(payments)
      .where(eq(payments.id, paymentId))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Only allow updating certain fields
    const { transactionReference, bankName, notes, status } = body;

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (transactionReference !== undefined) {
      updateData.transactionReference = transactionReference;
    }
    if (bankName !== undefined) {
      updateData.bankName = bankName;
    }
    if (notes !== undefined) {
      updateData.notes = notes;
    }
    if (status && ["completed", "pending", "failed", "refunded"].includes(status)) {
      updateData.status = status;
    }

    await db
      .update(payments)
      .set(updateData)
      .where(eq(payments.id, paymentId));

    return NextResponse.json({
      success: true,
      message: "Payment updated successfully",
    });
  } catch (error) {
    console.error("Error updating payment:", error);
    return NextResponse.json(
      { error: "Failed to update payment" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/payments/[id]
 * Void/delete a payment (only pending payments can be deleted)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const paymentId = parseInt(id);

    const [existing] = await db
      .select()
      .from(payments)
      .where(eq(payments.id, paymentId))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Only allow deleting pending payments
    if (existing.status !== "pending") {
      return NextResponse.json(
        { error: "Can only delete pending payments. Mark completed payments as refunded instead." },
        { status: 400 }
      );
    }

    // Delete allocations first
    await db
      .delete(paymentAllocations)
      .where(eq(paymentAllocations.paymentId, paymentId));

    // Delete payment
    await db.delete(payments).where(eq(payments.id, paymentId));

    return NextResponse.json({
      success: true,
      message: "Payment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting payment:", error);
    return NextResponse.json(
      { error: "Failed to delete payment" },
      { status: 500 }
    );
  }
}
