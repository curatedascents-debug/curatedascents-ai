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

type NotificationType = "new_quote" | "new_booking" | "payment_received" | "new_client" | "callback_request";

interface AdminNotificationEmailProps {
  notificationType: NotificationType;
  // Client info
  clientName?: string;
  clientEmail?: string;
  // Quote info
  quoteNumber?: string;
  quoteName?: string;
  destination?: string;
  totalAmount?: string;
  // Booking info
  bookingReference?: string;
  // Payment info
  paymentAmount?: string;
  paidAmount?: string;
  balanceAmount?: string;
  paymentStatus?: string;
  // Callback request info
  preferredTime?: string;
  callbackMessage?: string;
}

export default function AdminNotificationEmail({
  notificationType,
  clientName,
  clientEmail,
  quoteNumber,
  quoteName,
  destination,
  totalAmount,
  bookingReference,
  paymentAmount,
  paidAmount,
  balanceAmount,
  paymentStatus,
  preferredTime,
  callbackMessage,
}: AdminNotificationEmailProps) {
  const formatCurrency = (val?: string) => {
    if (!val) return "$0";
    return `$${parseFloat(val).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
  };

  const getTitle = () => {
    switch (notificationType) {
      case "new_quote":
        return "New Quote Created";
      case "new_booking":
        return "New Booking Confirmed";
      case "payment_received":
        return "Payment Received";
      case "new_client":
        return "New Client Registered";
      case "callback_request":
        return "Callback Requested";
      default:
        return "Admin Notification";
    }
  };

  const getEmoji = () => {
    switch (notificationType) {
      case "new_quote":
        return "📋";
      case "new_booking":
        return "✅";
      case "payment_received":
        return "💰";
      case "new_client":
        return "👤";
      case "callback_request":
        return "📞";
      default:
        return "📢";
    }
  };

  return (
    <Html>
      <Head />
      <Body style={body}>
        <Container style={container}>
          <Text style={brand}>CuratedAscents Admin</Text>
          <Hr style={hr} />

          <Text style={heading}>{getEmoji()} {getTitle()}</Text>

          <Section style={detailsBox}>
            {/* Client Info - always shown */}
            {(clientName || clientEmail) && (
              <>
                <Text style={detailLabel}>Client</Text>
                <Text style={detailValue}>
                  {clientName || "Unknown"} {clientEmail && `(${clientEmail})`}
                </Text>
              </>
            )}

            {/* Quote Info */}
            {notificationType === "new_quote" && (
              <>
                <Text style={detailLabel}>Quote Number</Text>
                <Text style={referenceText}>{quoteNumber || "-"}</Text>

                {(quoteName || destination) && (
                  <>
                    <Text style={detailLabel}>Trip / Destination</Text>
                    <Text style={detailValue}>{quoteName || destination}</Text>
                  </>
                )}

                <Text style={detailLabel}>Total Value</Text>
                <Text style={totalPrice}>{formatCurrency(totalAmount)}</Text>
              </>
            )}

            {/* Booking Info */}
            {notificationType === "new_booking" && (
              <>
                <Text style={detailLabel}>Booking Reference</Text>
                <Text style={referenceText}>{bookingReference || "-"}</Text>

                {(quoteName || destination) && (
                  <>
                    <Text style={detailLabel}>Trip / Destination</Text>
                    <Text style={detailValue}>{quoteName || destination}</Text>
                  </>
                )}

                <Text style={detailLabel}>Total Value</Text>
                <Text style={totalPrice}>{formatCurrency(totalAmount)}</Text>
              </>
            )}

            {/* Payment Info */}
            {notificationType === "payment_received" && (
              <>
                <Text style={detailLabel}>Booking Reference</Text>
                <Text style={referenceText}>{bookingReference || "-"}</Text>

                <Text style={detailLabel}>Payment Amount</Text>
                <Text style={totalPrice}>{formatCurrency(paymentAmount)}</Text>

                <Hr style={hrLight} />

                <Text style={detailLabel}>Total Paid</Text>
                <Text style={detailValue}>{formatCurrency(paidAmount)}</Text>

                <Text style={detailLabel}>Balance Due</Text>
                <Text style={detailValue}>{formatCurrency(balanceAmount)}</Text>

                <Text style={detailLabel}>Payment Status</Text>
                <Text style={statusBadge}>{paymentStatus?.toUpperCase() || "UNKNOWN"}</Text>
              </>
            )}

            {/* New Client Info */}
            {notificationType === "new_client" && (
              <>
                <Text style={detailLabel}>Email</Text>
                <Text style={detailValue}>{clientEmail || "-"}</Text>
                <Text style={detailLabel}>Source</Text>
                <Text style={detailValue}>Chat / Website</Text>
              </>
            )}

            {/* Callback Request Info */}
            {notificationType === "callback_request" && (
              <>
                <Text style={detailLabel}>Email</Text>
                <Text style={detailValue}>{clientEmail || "-"}</Text>
                {preferredTime && (
                  <>
                    <Text style={detailLabel}>Preferred Time</Text>
                    <Text style={detailValue}>{preferredTime}</Text>
                  </>
                )}
                {callbackMessage && (
                  <>
                    <Text style={detailLabel}>Message</Text>
                    <Text style={detailValue}>{callbackMessage}</Text>
                  </>
                )}
                <Hr style={hrLight} />
                <Text style={paragraph}>
                  <a href={`mailto:${clientEmail}?subject=CuratedAscents — Following up on your callback request`} style={link}>
                    Reply to Client →
                  </a>
                </Text>
              </>
            )}
          </Section>

          <Text style={paragraph}>
            <a href={`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/admin`} style={link}>
              View in Admin Dashboard →
            </a>
          </Text>

          <Hr style={hr} />
          <Text style={footer}>
            This is an automated notification from CuratedAscents.
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
  fontSize: "24px",
  fontWeight: "bold",
  color: "#1e293b",
  margin: "0 0 8px",
};

const hr: React.CSSProperties = { borderColor: "#e5e7eb", margin: "20px 0" };
const hrLight: React.CSSProperties = { borderColor: "#e5e7eb", margin: "12px 0" };

const heading: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: "bold",
  color: "#111827",
  margin: "0 0 16px",
};

const paragraph: React.CSSProperties = {
  fontSize: "14px",
  lineHeight: "1.6",
  color: "#374151",
  margin: "0 0 16px",
};

const detailsBox: React.CSSProperties = {
  backgroundColor: "#f8fafc",
  borderRadius: "8px",
  padding: "20px",
  margin: "16px 0",
  border: "1px solid #e2e8f0",
};

const detailLabel: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: "600",
  color: "#6b7280",
  textTransform: "uppercase" as const,
  margin: "0",
  letterSpacing: "0.5px",
};

const detailValue: React.CSSProperties = {
  fontSize: "15px",
  color: "#111827",
  margin: "0 0 12px",
};

const referenceText: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: "bold",
  color: "#0d5e3f",
  margin: "0 0 12px",
  fontFamily: "monospace",
};

const totalPrice: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: "bold",
  color: "#0d5e3f",
  margin: "0 0 12px",
};

const statusBadge: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: "bold",
  color: "#0d5e3f",
  backgroundColor: "#d1fae5",
  padding: "4px 8px",
  borderRadius: "4px",
  display: "inline-block",
  margin: "0",
};

const link: React.CSSProperties = {
  color: "#0d5e3f",
  textDecoration: "underline",
};

const footer: React.CSSProperties = {
  fontSize: "12px",
  color: "#9ca3af",
  textAlign: "center" as const,
  margin: "0",
};
