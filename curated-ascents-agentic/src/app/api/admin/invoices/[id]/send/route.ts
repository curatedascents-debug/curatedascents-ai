import { NextRequest, NextResponse } from "next/server";
import { getInvoiceDetails, markInvoiceSent } from "@/lib/financial/invoice-engine";
import { sendEmail } from "@/lib/email/send-email";
import InvoiceSentEmail from "@/lib/email/templates/invoice-sent";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/invoices/[id]/send
 * Send invoice to client via email
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const invoiceId = parseInt(id);
    const body = await req.json().catch(() => ({}));
    const { recipientEmail } = body;

    const invoice = await getInvoiceDetails(invoiceId);

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const toEmail = recipientEmail || invoice.clientEmail;

    if (!toEmail) {
      return NextResponse.json(
        { error: "No recipient email address available" },
        { status: 400 }
      );
    }

    // Check if invoice can be sent
    if (invoice.status === "cancelled" || invoice.status === "refunded") {
      return NextResponse.json(
        { error: "Cannot send cancelled or refunded invoices" },
        { status: 400 }
      );
    }

    // Build invoice URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const invoiceUrl = `${baseUrl}/api/admin/invoices/${invoiceId}/pdf`;

    // Send email
    const result = await sendEmail({
      to: toEmail,
      subject: `Invoice ${invoice.invoiceNumber} from CuratedAscents`,
      react: InvoiceSentEmail({
        clientName: invoice.clientName || undefined,
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: invoice.invoiceDate || undefined,
        dueDate: invoice.dueDate || undefined,
        totalAmount: invoice.totalAmount || undefined,
        currency: invoice.currency || "USD",
        bookingReference: invoice.bookingReference || undefined,
        items: invoice.items.map((item) => ({
          description: item.description || "Service",
          quantity: item.quantity || 1,
          amount: item.amount || "0",
        })),
        subtotal: invoice.subtotal || undefined,
        taxAmount: invoice.taxAmount || undefined,
        serviceChargeAmount: invoice.serviceChargeAmount || undefined,
        invoiceUrl,
      }),
    });

    if (!result.sent) {
      console.error("Failed to send invoice email:", result.error);
      return NextResponse.json(
        { error: "Failed to send invoice email" },
        { status: 500 }
      );
    }

    // Mark invoice as sent
    await markInvoiceSent(invoiceId, toEmail);

    return NextResponse.json({
      success: true,
      message: `Invoice ${invoice.invoiceNumber} sent to ${toEmail}`,
      emailLogId: result.emailLogId,
      sentAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error sending invoice:", error);
    return NextResponse.json(
      { error: "Failed to send invoice" },
      { status: 500 }
    );
  }
}
