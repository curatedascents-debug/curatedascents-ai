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

interface SupplierConfirmationRequestEmailProps {
  supplierName: string;
  bookingReference: string;
  serviceName: string;
  serviceType: string;
  serviceDetails?: Record<string, unknown>;
  startDate?: string;
  endDate?: string;
}

export default function SupplierConfirmationRequestEmail({
  supplierName,
  bookingReference,
  serviceName,
  serviceType,
  serviceDetails,
  startDate,
  endDate,
}: SupplierConfirmationRequestEmailProps) {
  const formatDate = (d?: string) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatServiceType = (type: string) => {
    return type
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <Html>
      <Head />
      <Body style={body}>
        <Container style={container}>
          <Text style={brand}>CuratedAscents</Text>
          <Text style={tagline}>Luxury Adventure Travel</Text>
          <Hr style={hr} />

          <Text style={heading}>Booking Confirmation Request</Text>

          <Text style={paragraph}>
            Dear {supplierName},
          </Text>
          <Text style={paragraph}>
            We have a new booking that requires your confirmation. Please review the details below
            and confirm availability and pricing at your earliest convenience.
          </Text>

          <Section style={detailsBox}>
            <Text style={detailLabel}>Our Booking Reference</Text>
            <Text style={referenceText}>{bookingReference}</Text>

            <Text style={detailLabel}>Service Required</Text>
            <Text style={serviceNameStyle}>{serviceName}</Text>
            <Text style={serviceTypeStyle}>{formatServiceType(serviceType)}</Text>

            {startDate && (
              <>
                <Text style={detailLabel}>Service Date(s)</Text>
                <Text style={detailValue}>
                  {endDate
                    ? `${formatDate(startDate)} — ${formatDate(endDate)}`
                    : formatDate(startDate)}
                </Text>
              </>
            )}

            {serviceDetails && Object.keys(serviceDetails).length > 0 && (
              <>
                <Hr style={hrLight} />
                <Text style={detailLabel}>Additional Details</Text>
                {serviceDetails.quantity && (
                  <Text style={detailValue}>Quantity: {String(serviceDetails.quantity)}</Text>
                )}
                {serviceDetails.nights && (
                  <Text style={detailValue}>Nights: {String(serviceDetails.nights)}</Text>
                )}
                {serviceDetails.days && (
                  <Text style={detailValue}>Days: {String(serviceDetails.days)}</Text>
                )}
                {serviceDetails.notes && (
                  <Text style={notesText}>Notes: {String(serviceDetails.notes)}</Text>
                )}
              </>
            )}
          </Section>

          <Section style={actionBox}>
            <Text style={actionHeading}>Please Confirm</Text>
            <Text style={actionText}>
              Kindly reply to this email with:
            </Text>
            <Text style={actionItem}>1. Confirmation of availability for the requested dates</Text>
            <Text style={actionItem}>2. Your confirmation/booking reference number</Text>
            <Text style={actionItem}>3. Any special notes or requirements</Text>
          </Section>

          <Text style={paragraph}>
            If you have any questions or need clarification, please don&apos;t hesitate to reach out.
            We appreciate your prompt response.
          </Text>

          <Text style={paragraph}>
            Thank you for your continued partnership.
          </Text>

          <Text style={signoff}>
            Best regards,<br />
            <strong>CuratedAscents Operations Team</strong>
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
  color: "#1e40af",
  margin: "0 0 16px",
};

const paragraph: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: "1.6",
  color: "#374151",
  margin: "0 0 16px",
};

const detailsBox: React.CSSProperties = {
  backgroundColor: "#eff6ff",
  borderRadius: "8px",
  padding: "20px",
  margin: "16px 0",
  border: "1px solid #bfdbfe",
};

const actionBox: React.CSSProperties = {
  backgroundColor: "#fef3c7",
  borderRadius: "8px",
  padding: "20px",
  margin: "16px 0",
  border: "1px solid #fcd34d",
};

const actionHeading: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: "bold",
  color: "#92400e",
  margin: "0 0 8px",
};

const actionText: React.CSSProperties = {
  fontSize: "14px",
  color: "#374151",
  margin: "0 0 12px",
};

const actionItem: React.CSSProperties = {
  fontSize: "14px",
  color: "#374151",
  margin: "0 0 4px",
  paddingLeft: "8px",
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
  color: "#1e40af",
  margin: "0 0 12px",
  letterSpacing: "1px",
};

const serviceNameStyle: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: "bold",
  color: "#111827",
  margin: "0",
};

const serviceTypeStyle: React.CSSProperties = {
  fontSize: "14px",
  color: "#6b7280",
  margin: "2px 0 12px",
};

const notesText: React.CSSProperties = {
  fontSize: "14px",
  color: "#4b5563",
  margin: "0 0 8px",
  fontStyle: "italic",
};

const signoff: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: "1.6",
  color: "#374151",
  margin: "24px 0 16px",
};

const footer: React.CSSProperties = {
  fontSize: "12px",
  color: "#9ca3af",
  textAlign: "center" as const,
  margin: "0",
};
