import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Hr,
  Link,
} from "@react-email/components";
import * as React from "react";

interface QuoteSentEmailProps {
  clientName?: string;
  quoteNumber: string;
  destination?: string;
  startDate?: string;
  endDate?: string;
  numberOfPax?: number;
  totalSellPrice?: string;
  currency?: string;
  validUntil?: string;
  appUrl?: string;
}

export default function QuoteSentEmail({
  clientName,
  quoteNumber,
  destination,
  startDate,
  endDate,
  numberOfPax,
  totalSellPrice,
  currency = "USD",
  validUntil,
  appUrl,
}: QuoteSentEmailProps) {
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

          <Text style={heading}>Your Travel Quote</Text>

          <Text style={paragraph}>
            Dear {clientName || "Traveler"},
          </Text>
          <Text style={paragraph}>
            Thank you for your interest in traveling with CuratedAscents. Please find your personalized quote details below, with the full PDF attached.
          </Text>

          <Section style={detailsBox}>
            <Text style={detailLabel}>Quote Number</Text>
            <Text style={detailValue}>{quoteNumber}</Text>

            {destination && (
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

            {numberOfPax && (
              <>
                <Text style={detailLabel}>Travelers</Text>
                <Text style={detailValue}>{numberOfPax} pax</Text>
              </>
            )}

            <Hr style={hrLight} />

            <Text style={detailLabel}>Total Price ({currency})</Text>
            <Text style={totalPrice}>{formatCurrency(totalSellPrice)}</Text>

            {validUntil && (
              <>
                <Text style={detailLabel}>Valid Until</Text>
                <Text style={detailValue}>{formatDate(validUntil)}</Text>
              </>
            )}
          </Section>

          <Text style={paragraph}>
            The detailed PDF quote is attached to this email. If you have any questions or would like to customize your itinerary, simply reply to this email or{" "}
            {appUrl ? (
              <Link href={appUrl} style={link}>chat with our Expedition Architect</Link>
            ) : (
              "contact us"
            )}.
          </Text>

          <Hr style={hr} />
          <Text style={footer}>
            CuratedAscents | Luxury Adventure Travel | Nepal | Tibet | Bhutan | India
          </Text>
          <Text style={footerSmall}>
            This quote is subject to availability. Prices may vary based on season and group size.
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

const totalPrice: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#0d5e3f",
  margin: "0 0 12px",
};

const link: React.CSSProperties = { color: "#0d5e3f", textDecoration: "underline" };

const footer: React.CSSProperties = {
  fontSize: "12px",
  color: "#9ca3af",
  textAlign: "center" as const,
  margin: "0",
};

const footerSmall: React.CSSProperties = {
  fontSize: "11px",
  color: "#9ca3af",
  textAlign: "center" as const,
  margin: "4px 0 0",
};
