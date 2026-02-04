import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Hr,
} from "@react-email/components";
import * as React from "react";

interface PaymentReceivedEmailProps {
  clientName?: string;
  bookingReference: string;
  paymentAmount: string;
  totalPaid: string;
  totalAmount: string;
  balanceAmount: string;
  paymentStatus: string;
  currency?: string;
}

export default function PaymentReceivedEmail({
  clientName,
  bookingReference,
  paymentAmount,
  totalPaid,
  totalAmount,
  balanceAmount,
  paymentStatus,
  currency = "USD",
}: PaymentReceivedEmailProps) {
  const formatCurrency = (val?: string) => {
    if (!val) return "$0";
    return `$${parseFloat(val).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
  };

  const isPaidInFull = paymentStatus === "paid";

  return (
    <Html>
      <Head />
      <Body style={body}>
        <Container style={container}>
          <Text style={brand}>CuratedAscents</Text>
          <Text style={tagline}>Luxury Adventure Travel</Text>
          <Hr style={hr} />

          <Text style={heading}>Payment Received</Text>

          <Text style={paragraph}>
            Dear {clientName || "Traveler"},
          </Text>
          <Text style={paragraph}>
            We have received your payment for booking <strong>{bookingReference}</strong>. Here is your payment summary:
          </Text>

          <Section style={detailsBox}>
            <Text style={detailLabel}>Payment Received</Text>
            <Text style={amountText}>{formatCurrency(paymentAmount)}</Text>

            <Hr style={hrLight} />

            <Text style={detailLabel}>Total Paid</Text>
            <Text style={detailValue}>{formatCurrency(totalPaid)}</Text>

            <Text style={detailLabel}>Total Amount</Text>
            <Text style={detailValue}>{formatCurrency(totalAmount)}</Text>

            <Text style={detailLabel}>Remaining Balance ({currency})</Text>
            <Text style={isPaidInFull ? balancePaid : balanceRemaining}>
              {formatCurrency(balanceAmount)}
            </Text>

            <Text style={detailLabel}>Payment Status</Text>
            <Text style={statusText}>
              {isPaidInFull ? "Paid in Full" : paymentStatus === "partial" ? "Partial Payment" : paymentStatus}
            </Text>
          </Section>

          {isPaidInFull ? (
            <Text style={paragraph}>
              Your booking is now fully paid. Our operations team will be in touch with your final travel documents and itinerary details.
            </Text>
          ) : (
            <Text style={paragraph}>
              Please note the remaining balance above. If you have any questions about payment, reply to this email.
            </Text>
          )}

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
  color: "#111827",
  margin: "0 0 16px",
};

const paragraph: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: "1.6",
  color: "#374151",
  margin: "0 0 16px",
};

const detailsBox: React.CSSProperties = {
  backgroundColor: "#f9fafb",
  borderRadius: "8px",
  padding: "20px",
  margin: "16px 0",
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

const amountText: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#0d5e3f",
  margin: "0 0 12px",
};

const balancePaid: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: "bold",
  color: "#16a34a",
  margin: "0 0 12px",
};

const balanceRemaining: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: "bold",
  color: "#d97706",
  margin: "0 0 12px",
};

const statusText: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#111827",
  margin: "0 0 12px",
  textTransform: "capitalize" as const,
};

const footer: React.CSSProperties = {
  fontSize: "12px",
  color: "#9ca3af",
  textAlign: "center" as const,
  margin: "0",
};
