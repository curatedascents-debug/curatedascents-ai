import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Hr,
  Link,
} from "@react-email/components";
import * as React from "react";

interface QuoteExpiredEmailProps {
  clientName?: string;
  quoteNumber: string;
  destination?: string;
  appUrl?: string;
}

export default function QuoteExpiredEmail({
  clientName,
  quoteNumber,
  destination,
  appUrl,
}: QuoteExpiredEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={body}>
        <Container style={container}>
          <Text style={brand}>CuratedAscents</Text>
          <Text style={tagline}>Luxury Adventure Travel</Text>
          <Hr style={hr} />

          <Text style={heading}>Quote Expired</Text>

          <Text style={paragraph}>
            Dear {clientName || "Traveler"},
          </Text>
          <Text style={paragraph}>
            Your quote <strong>{quoteNumber}</strong>
            {destination ? ` for ${destination}` : ""} has expired.
          </Text>
          <Text style={paragraph}>
            Rates and availability may have changed since this quote was issued. If you are still interested in this trip, we would be happy to prepare an updated quote for you.
          </Text>

          <Text style={paragraph}>
            {appUrl ? (
              <>
                <Link href={appUrl} style={link}>Chat with our Expedition Architect</Link>{" "}
                to get a fresh quote, or simply reply to this email.
              </>
            ) : (
              "Simply reply to this email to request a new quote."
            )}
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

const link: React.CSSProperties = { color: "#0d5e3f", textDecoration: "underline" };

const footer: React.CSSProperties = {
  fontSize: "12px",
  color: "#9ca3af",
  textAlign: "center" as const,
  margin: "0",
};
