import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Hr,
  Button,
} from "@react-email/components";
import * as React from "react";

interface InvoiceSentEmailProps {
  clientName?: string;
  invoiceNumber: string;
  invoiceDate?: string;
  dueDate?: string;
  totalAmount?: string;
  currency?: string;
  bookingReference?: string;
  destination?: string;
  items?: Array<{
    description: string;
    quantity: number;
    amount: string;
  }>;
  subtotal?: string;
  taxAmount?: string;
  serviceChargeAmount?: string;
  invoiceUrl?: string;
}

export default function InvoiceSentEmail({
  clientName,
  invoiceNumber,
  invoiceDate,
  dueDate,
  totalAmount,
  currency = "USD",
  bookingReference,
  destination,
  items = [],
  subtotal,
  taxAmount,
  serviceChargeAmount,
  invoiceUrl,
}: InvoiceSentEmailProps) {
  const formatDate = (d?: string) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (val?: string) => {
    if (!val) return "$0.00";
    return `$${parseFloat(val).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
  };

  return (
    <Html>
      <Head />
      <Body style={body}>
        <Container style={container}>
          <Text style={brand}>CuratedAscents</Text>
          <Text style={tagline}>Luxury Adventure Travel</Text>
          <Hr style={hr} />

          <Text style={heading}>Invoice {invoiceNumber}</Text>

          <Text style={paragraph}>
            Dear {clientName || "Valued Client"},
          </Text>

          <Text style={paragraph}>
            Please find attached your invoice for your upcoming adventure with CuratedAscents.
            We appreciate your trust in us for your travel experience.
          </Text>

          <Section style={detailsBox}>
            <Text style={detailLabel}>Invoice Number</Text>
            <Text style={referenceText}>{invoiceNumber}</Text>

            {bookingReference && (
              <>
                <Text style={detailLabel}>Booking Reference</Text>
                <Text style={detailValue}>{bookingReference}</Text>
              </>
            )}

            {destination && (
              <>
                <Text style={detailLabel}>Destination</Text>
                <Text style={detailValue}>{destination}</Text>
              </>
            )}

            <Hr style={hrLight} />

            <Text style={detailLabel}>Invoice Date</Text>
            <Text style={detailValue}>{formatDate(invoiceDate)}</Text>

            <Text style={detailLabel}>Due Date</Text>
            <Text style={dueDateText}>{formatDate(dueDate)}</Text>
          </Section>

          {items.length > 0 && (
            <Section style={itemsSection}>
              <Text style={sectionTitle}>Invoice Items</Text>
              {items.map((item, index) => (
                <Section key={index} style={itemRow}>
                  <Text style={itemDescription}>
                    {item.description} (x{item.quantity})
                  </Text>
                  <Text style={itemAmount}>{formatCurrency(item.amount)}</Text>
                </Section>
              ))}
              <Hr style={hrLight} />
              {subtotal && (
                <Section style={totalsRow}>
                  <Text style={totalsLabel}>Subtotal</Text>
                  <Text style={totalsValue}>{formatCurrency(subtotal)}</Text>
                </Section>
              )}
              {taxAmount && parseFloat(taxAmount) > 0 && (
                <Section style={totalsRow}>
                  <Text style={totalsLabel}>VAT (13%)</Text>
                  <Text style={totalsValue}>{formatCurrency(taxAmount)}</Text>
                </Section>
              )}
              {serviceChargeAmount && parseFloat(serviceChargeAmount) > 0 && (
                <Section style={totalsRow}>
                  <Text style={totalsLabel}>Service Charge (10%)</Text>
                  <Text style={totalsValue}>{formatCurrency(serviceChargeAmount)}</Text>
                </Section>
              )}
            </Section>
          )}

          <Section style={totalBox}>
            <Text style={totalLabel}>Total Amount ({currency})</Text>
            <Text style={totalAmount as React.CSSProperties}>{formatCurrency(totalAmount)}</Text>
          </Section>

          {invoiceUrl && (
            <Section style={buttonSection}>
              <Button style={viewButton} href={invoiceUrl}>
                View Full Invoice
              </Button>
            </Section>
          )}

          <Text style={paragraph}>
            <strong>Payment Methods:</strong>
          </Text>
          <Text style={paragraph}>
            We accept credit cards (Stripe), international bank transfers (SWIFT), and cash on arrival for the remaining balance after deposit.
            Please include your invoice number ({invoiceNumber}) as the payment reference.
          </Text>

          <Text style={paragraph}>
            If you have any questions about this invoice, please don&apos;t hesitate
            to contact our team.
          </Text>

          <Hr style={hr} />
          <Text style={footer}>
            CuratedAscents | Luxury Adventure Travel | Nepal | Tibet | Bhutan | India
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const body: React.CSSProperties = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
};

const container: React.CSSProperties = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px 30px",
  maxWidth: "600px",
};

const brand: React.CSSProperties = {
  fontSize: "28px",
  fontWeight: "bold",
  color: "#0d5e3f",
  margin: "0",
};

const tagline: React.CSSProperties = {
  fontSize: "14px",
  color: "#6b7280",
  margin: "0 0 16px",
};

const hr: React.CSSProperties = { borderColor: "#e5e7eb", margin: "20px 0" };
const hrLight: React.CSSProperties = { borderColor: "#e5e7eb", margin: "12px 0" };

const heading: React.CSSProperties = {
  fontSize: "22px",
  fontWeight: "bold",
  color: "#0d5e3f",
  margin: "0 0 16px",
};

const paragraph: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: "1.6",
  color: "#374151",
  margin: "0 0 16px",
};

const detailsBox: React.CSSProperties = {
  backgroundColor: "#f0fdf4",
  borderRadius: "8px",
  padding: "20px",
  margin: "16px 0",
  border: "1px solid #bbf7d0",
};

const detailLabel: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: "600",
  color: "#6b7280",
  textTransform: "uppercase" as const,
  margin: "0",
};

const detailValue: React.CSSProperties = {
  fontSize: "16px",
  color: "#111827",
  margin: "0 0 12px",
};

const referenceText: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: "bold",
  color: "#0d5e3f",
  margin: "0 0 12px",
  letterSpacing: "1px",
};

const dueDateText: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#b45309",
  margin: "0 0 12px",
};

const itemsSection: React.CSSProperties = {
  margin: "16px 0",
};

const sectionTitle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#374151",
  margin: "0 0 12px",
};

const itemRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  padding: "8px 0",
  borderBottom: "1px solid #e5e7eb",
};

const itemDescription: React.CSSProperties = {
  fontSize: "14px",
  color: "#374151",
  margin: "0",
  flex: "1",
};

const itemAmount: React.CSSProperties = {
  fontSize: "14px",
  color: "#374151",
  margin: "0",
  fontWeight: "500",
};

const totalsRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  padding: "4px 0",
};

const totalsLabel: React.CSSProperties = {
  fontSize: "14px",
  color: "#6b7280",
  margin: "0",
};

const totalsValue: React.CSSProperties = {
  fontSize: "14px",
  color: "#374151",
  margin: "0",
};

const totalBox: React.CSSProperties = {
  backgroundColor: "#0d5e3f",
  borderRadius: "8px",
  padding: "20px",
  margin: "16px 0",
  textAlign: "center" as const,
};

const totalLabel: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: "600",
  color: "#bbf7d0",
  textTransform: "uppercase" as const,
  margin: "0 0 4px",
};

const buttonSection: React.CSSProperties = {
  textAlign: "center" as const,
  margin: "24px 0",
};

const viewButton: React.CSSProperties = {
  backgroundColor: "#0d5e3f",
  borderRadius: "6px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  padding: "12px 24px",
  textDecoration: "none",
};

const footer: React.CSSProperties = {
  fontSize: "12px",
  color: "#9ca3af",
  textAlign: "center" as const,
  margin: "0",
};
