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

interface BookingConfirmationEmailProps {
  clientName?: string;
  bookingReference: string;
  destination?: string;
  quoteName?: string;
  startDate?: string;
  endDate?: string;
  totalAmount?: string;
  currency?: string;
}

export default function BookingConfirmationEmail({
  clientName,
  bookingReference,
  destination,
  quoteName,
  startDate,
  endDate,
  totalAmount,
  currency = "USD",
}: BookingConfirmationEmailProps) {
  const formatDate = (d?: string) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (val?: string) => {
    if (!val) return "$0";
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

          <Text style={heading}>Booking Confirmed!</Text>

          <Text style={paragraph}>
            Dear {clientName || "Traveler"},
          </Text>
          <Text style={paragraph}>
            Your booking has been confirmed. Here are your booking details:
          </Text>

          <Section style={detailsBox}>
            <Text style={detailLabel}>Booking Reference</Text>
            <Text style={referenceText}>{bookingReference}</Text>

            {(quoteName || destination) && (
              <>
                <Text style={detailLabel}>Trip</Text>
                <Text style={detailValue}>{quoteName || destination}</Text>
              </>
            )}

            {destination && quoteName && (
              <>
                <Text style={detailLabel}>Destination</Text>
                <Text style={detailValue}>{destination}</Text>
              </>
            )}

            {startDate && endDate && (
              <>
                <Text style={detailLabel}>Travel Dates</Text>
                <Text style={detailValue}>
                  {formatDate(startDate)} &ndash; {formatDate(endDate)}
                </Text>
              </>
            )}

            <Hr style={hrLight} />

            <Text style={detailLabel}>Total Amount ({currency})</Text>
            <Text style={totalPrice}>{formatCurrency(totalAmount)}</Text>
          </Section>

          <Text style={paragraph}>
            <strong>Payment Instructions:</strong> Our team will reach out with payment details shortly. If you have any questions, simply reply to this email.
          </Text>

          <Text style={paragraph}>
            We look forward to creating an unforgettable adventure for you!
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
  fontSize: "22px",
  fontWeight: "bold",
  color: "#0d5e3f",
  margin: "0 0 12px",
  letterSpacing: "1px",
};

const totalPrice: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#0d5e3f",
  margin: "0 0 12px",
};

const footer: React.CSSProperties = {
  fontSize: "12px",
  color: "#9ca3af",
  textAlign: "center" as const,
  margin: "0",
};
