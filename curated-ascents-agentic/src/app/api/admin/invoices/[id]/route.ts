import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { invoices } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getInvoiceDetails, updateInvoiceStatus } from "@/lib/financial/invoice-engine";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/invoices/[id]
 * Get invoice details with items and payments
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const invoiceId = parseInt(id);

    const invoice = await getInvoiceDetails(invoiceId);

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      invoice,
    });
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoice" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/invoices/[id]
 * Update invoice
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const invoiceId = parseInt(id);
    const body = await req.json();

    // Verify invoice exists
    const [existing] = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, invoiceId))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Only allow updates to draft invoices (except status changes)
    if (existing.status !== "draft" && !body.status) {
      return NextResponse.json(
        { error: "Can only update draft invoices" },
        { status: 400 }
      );
    }

    const {
      dueDate,
      notes,
      termsConditions,
      internalNotes,
      status,
    } = body;

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (dueDate) updateData.dueDate = dueDate;
    if (notes !== undefined) updateData.notes = notes;
    if (termsConditions !== undefined) updateData.termsConditions = termsConditions;
    if (internalNotes !== undefined) updateData.internalNotes = internalNotes;

    // Handle status changes
    if (status) {
      if (status === "cancelled" && existing.status !== "draft") {
        // Check if any payments exist
        if (parseFloat(existing.paidAmount || "0") > 0) {
          return NextResponse.json(
            { error: "Cannot cancel invoice with payments. Issue a credit note instead." },
            { status: 400 }
          );
        }
      }
      updateData.status = status;
    }

    await db
      .update(invoices)
      .set(updateData)
      .where(eq(invoices.id, invoiceId));

    // If status wasn't explicitly set, recalculate it
    if (!status) {
      await updateInvoiceStatus(invoiceId);
    }

    const updated = await getInvoiceDetails(invoiceId);

    return NextResponse.json({
      success: true,
      invoice: updated,
    });
  } catch (error) {
    console.error("Error updating invoice:", error);
    return NextResponse.json(
      { error: "Failed to update invoice" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/invoices/[id]
 * Delete draft invoice
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const invoiceId = parseInt(id);

    // Verify invoice exists and is draft
    const [existing] = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, invoiceId))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    if (existing.status !== "draft") {
      return NextResponse.json(
        { error: "Can only delete draft invoices" },
        { status: 400 }
      );
    }

    await db.delete(invoices).where(eq(invoices.id, invoiceId));

    return NextResponse.json({
      success: true,
      message: "Invoice deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting invoice:", error);
    return NextResponse.json(
      { error: "Failed to delete invoice" },
      { status: 500 }
    );
  }
}
