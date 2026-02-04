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

interface AllSuppliersConfirmedEmailProps {
  clientName?: string;
  bookingReference: string;
  startDate?: string;
  endDate?: string;
}

export default function AllSuppliersConfirmedEmail({
  clientName,
  bookingReference,
  startDate,
  endDate,
}: AllSuppliersConfirmedEmailProps) {
  const formatDate = (d?: string) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Html>
      <Head />
      <Body style={body}>
        <Container style={container}>
          <Text style={brand}>CuratedAscents</Text>
          <Text style={tagline}>Luxury Adventure Travel</Text>
          <Hr style={hr} />

          <Section style={successBanner}>
            <Text style={successIcon}>✓</Text>
            <Text style={successText}>All Services Confirmed!</Text>
          </Section>

          <Text style={paragraph}>
            Dear {clientName || "Traveler"},
          </Text>
          <Text style={paragraph}>
            Great news! All services for your upcoming trip have been confirmed by our suppliers.
            Your adventure is fully secured and ready to go.
          </Text>

          <Section style={detailsBox}>
            <Text style={detailLabel}>Booking Reference</Text>
            <Text style={referenceText}>{bookingReference}</Text>

            {startDate && (
              <>
                <Text style={detailLabel}>Travel Dates</Text>
                <Text style={detailValue}>
                  {endDate
                    ? `${formatDate(startDate)} — ${formatDate(endDate)}`
                    : formatDate(startDate)}
                </Text>
              </>
            )}

            <Hr style={hrLight} />

            <Text style={statusText}>
              <span style={checkmark}>✓</span> Hotels confirmed
            </Text>
            <Text style={statusText}>
              <span style={checkmark}>✓</span> Transportation arranged
            </Text>
            <Text style={statusText}>
              <span style={checkmark}>✓</span> Activities & tours booked
            </Text>
            <Text style={statusText}>
              <span style={checkmark}>✓</span> All permits secured
            </Text>
          </Section>

          <Text style={sectionHeading}>What&apos;s Next?</Text>
          <Section style={nextStepsBox}>
            <Text style={nextStepItem}>
              <strong>7 days before travel:</strong> You&apos;ll receive a detailed trip briefing
              with all the information you need for your adventure.
            </Text>
            <Text style={nextStepItem}>
              <strong>24 hours before:</strong> Final confirmation with emergency contacts
              and last-minute details.
            </Text>
          </Section>

          <Text style={paragraph}>
            If you have any questions or need to make changes to your booking,
            please don&apos;t hesitate to reach out. We&apos;re here to ensure your trip
            is absolutely perfect.
          </Text>

          <Text style={paragraph}>
            We can&apos;t wait for you to experience this incredible journey!
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
const hrLight: React.CSSProperties = { borderColor: "#bbf7d0", margin: "16px 0" };

const successBanner: React.CSSProperties = {
  backgroundColor: "#0d5e3f",
  borderRadius: "8px",
  padding: "24px",
  margin: "16px 0",
  textAlign: "center" as const,
};

const successIcon: React.CSSProperties = {
  fontSize: "48px",
  color: "#ffffff",
  margin: "0",
};

const successText: React.CSSProperties = {
  fontSize: "22px",
  fontWeight: "bold",
  color: "#ffffff",
  margin: "8px 0 0",
};

const sectionHeading: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: "bold",
  color: "#374151",
  margin: "24px 0 12px",
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

const nextStepsBox: React.CSSProperties = {
  backgroundColor: "#eff6ff",
  borderRadius: "8px",
  padding: "16px",
  margin: "8px 0",
  border: "1px solid #bfdbfe",
};

const nextStepItem: React.CSSProperties = {
  fontSize: "14px",
  color: "#374151",
  margin: "0 0 12px",
  lineHeight: "1.5",
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

const statusText: React.CSSProperties = {
  fontSize: "15px",
  color: "#059669",
  margin: "0 0 8px",
};

const checkmark: React.CSSProperties = {
  color: "#059669",
  fontWeight: "bold",
  marginRight: "8px",
};

const footer: React.CSSProperties = {
  fontSize: "12px",
  color: "#9ca3af",
  textAlign: "center" as const,
  margin: "0",
};
