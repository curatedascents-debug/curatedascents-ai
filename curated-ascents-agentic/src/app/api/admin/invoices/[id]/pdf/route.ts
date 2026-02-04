import { NextRequest, NextResponse } from "next/server";
import { getInvoiceDetails } from "@/lib/financial/invoice-engine";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/invoices/[id]/pdf
 * Generate invoice PDF (returns HTML that can be printed/converted to PDF)
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

    const formatDate = (d: string | null) => {
      if (!d) return "";
      return new Date(d).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    const formatCurrency = (val: string | null, currency: string = "USD") => {
      if (!val) return "$0.00";
      const num = parseFloat(val);
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
      }).format(num);
    };

    // Generate HTML invoice
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice ${invoice.invoiceNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      color: #333;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .logo { font-size: 28px; font-weight: bold; color: #0d5e3f; }
    .tagline { font-size: 12px; color: #6b7280; }
    .invoice-title { font-size: 32px; font-weight: bold; color: #374151; text-align: right; }
    .invoice-number { font-size: 16px; color: #6b7280; text-align: right; }
    .status {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      margin-top: 8px;
    }
    .status-draft { background: #e5e7eb; color: #374151; }
    .status-sent { background: #dbeafe; color: #1d4ed8; }
    .status-paid { background: #d1fae5; color: #059669; }
    .status-partially_paid { background: #fef3c7; color: #d97706; }
    .status-overdue { background: #fee2e2; color: #dc2626; }
    .info-section { display: flex; justify-content: space-between; margin-bottom: 30px; }
    .info-block { flex: 1; }
    .info-block h3 { font-size: 12px; text-transform: uppercase; color: #6b7280; margin-bottom: 8px; }
    .info-block p { margin: 2px 0; }
    .info-block .name { font-weight: 600; font-size: 16px; }
    .dates-block { text-align: right; }
    .dates-block .date-row { margin: 4px 0; }
    .dates-block .label { color: #6b7280; }
    table { width: 100%; border-collapse: collapse; margin: 30px 0; }
    th {
      background: #f9fafb;
      border-bottom: 2px solid #e5e7eb;
      padding: 12px;
      text-align: left;
      font-size: 12px;
      text-transform: uppercase;
      color: #6b7280;
    }
    th:last-child { text-align: right; }
    td {
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
    }
    td:last-child { text-align: right; }
    .totals { margin-left: auto; width: 300px; }
    .totals-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
    .totals-row.total { font-weight: bold; font-size: 18px; border-top: 2px solid #374151; border-bottom: none; }
    .totals-row.balance { color: #dc2626; }
    .payment-history { margin: 30px 0; }
    .payment-history h3 { font-size: 14px; font-weight: 600; margin-bottom: 10px; }
    .payment-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
    .notes { margin: 30px 0; padding: 20px; background: #f9fafb; border-radius: 8px; }
    .notes h3 { font-size: 14px; font-weight: 600; margin-bottom: 8px; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px; }
    @media print {
      body { padding: 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">CuratedAscents</div>
      <div class="tagline">Luxury Adventure Travel</div>
    </div>
    <div>
      <div class="invoice-title">INVOICE</div>
      <div class="invoice-number">${invoice.invoiceNumber}</div>
      <div class="status status-${invoice.status}">${invoice.status.replace("_", " ")}</div>
    </div>
  </div>

  <div class="info-section">
    <div class="info-block">
      <h3>Bill To</h3>
      <p class="name">${invoice.clientName || "Client"}</p>
      <p>${invoice.clientEmail || ""}</p>
      ${invoice.bookingReference ? `<p style="margin-top: 8px; color: #6b7280;">Booking: ${invoice.bookingReference}</p>` : ""}
    </div>
    <div class="info-block dates-block">
      <div class="date-row">
        <span class="label">Invoice Date:</span> ${formatDate(invoice.invoiceDate)}
      </div>
      <div class="date-row">
        <span class="label">Due Date:</span> ${formatDate(invoice.dueDate)}
      </div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 50%">Description</th>
        <th style="width: 15%">Service Type</th>
        <th style="width: 10%">Qty</th>
        <th style="width: 10%">Unit Price</th>
        <th style="width: 15%">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${invoice.items
        .map(
          (item) => `
        <tr>
          <td>${item.description}</td>
          <td>${item.serviceType || "-"}</td>
          <td>${item.quantity}</td>
          <td>${formatCurrency(item.unitPrice, invoice.currency || "USD")}</td>
          <td>${formatCurrency(item.amount, invoice.currency || "USD")}</td>
        </tr>
      `
        )
        .join("")}
    </tbody>
  </table>

  <div class="totals">
    <div class="totals-row">
      <span>Subtotal</span>
      <span>${formatCurrency(invoice.subtotal, invoice.currency || "USD")}</span>
    </div>
    ${
      parseFloat(invoice.taxAmount || "0") > 0
        ? `
    <div class="totals-row">
      <span>VAT (${invoice.taxRate}%)</span>
      <span>${formatCurrency(invoice.taxAmount, invoice.currency || "USD")}</span>
    </div>
    `
        : ""
    }
    ${
      parseFloat(invoice.serviceChargeAmount || "0") > 0
        ? `
    <div class="totals-row">
      <span>Service Charge (${invoice.serviceChargeRate}%)</span>
      <span>${formatCurrency(invoice.serviceChargeAmount, invoice.currency || "USD")}</span>
    </div>
    `
        : ""
    }
    ${
      parseFloat(invoice.discountAmount || "0") > 0
        ? `
    <div class="totals-row">
      <span>Discount${invoice.discountReason ? ` (${invoice.discountReason})` : ""}</span>
      <span>-${formatCurrency(invoice.discountAmount, invoice.currency || "USD")}</span>
    </div>
    `
        : ""
    }
    <div class="totals-row total">
      <span>Total</span>
      <span>${formatCurrency(invoice.totalAmount, invoice.currency || "USD")}</span>
    </div>
    ${
      parseFloat(invoice.paidAmount || "0") > 0
        ? `
    <div class="totals-row">
      <span>Paid</span>
      <span style="color: #059669">-${formatCurrency(invoice.paidAmount, invoice.currency || "USD")}</span>
    </div>
    `
        : ""
    }
    ${
      parseFloat(invoice.balanceAmount || "0") > 0
        ? `
    <div class="totals-row balance">
      <span>Balance Due</span>
      <span>${formatCurrency(invoice.balanceAmount, invoice.currency || "USD")}</span>
    </div>
    `
        : ""
    }
  </div>

  ${
    invoice.payments && invoice.payments.length > 0
      ? `
  <div class="payment-history">
    <h3>Payment History</h3>
    ${invoice.payments
      .map(
        (payment) => `
      <div class="payment-item">
        <div>
          <span style="font-weight: 500">${payment.paymentNumber}</span>
          <span style="color: #6b7280; margin-left: 8px">${payment.paymentMethod.replace("_", " ")}</span>
        </div>
        <div>
          <span style="color: #6b7280">${formatDate(payment.paymentDate)}</span>
          <span style="margin-left: 16px; color: #059669">${formatCurrency(payment.amount, invoice.currency || "USD")}</span>
        </div>
      </div>
    `
      )
      .join("")}
  </div>
  `
      : ""
  }

  ${
    invoice.notes
      ? `
  <div class="notes">
    <h3>Notes</h3>
    <p>${invoice.notes}</p>
  </div>
  `
      : ""
  }

  ${
    invoice.termsConditions
      ? `
  <div class="notes">
    <h3>Terms & Conditions</h3>
    <p>${invoice.termsConditions}</p>
  </div>
  `
      : ""
  }

  <div class="footer">
    <p>CuratedAscents | Luxury Adventure Travel</p>
    <p>Nepal | Tibet | Bhutan | India</p>
    <p style="margin-top: 8px">Thank you for choosing CuratedAscents</p>
  </div>
</body>
</html>
`;

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `inline; filename="invoice-${invoice.invoiceNumber}.html"`,
      },
    });
  } catch (error) {
    console.error("Error generating invoice PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate invoice PDF" },
      { status: 500 }
    );
  }
}
