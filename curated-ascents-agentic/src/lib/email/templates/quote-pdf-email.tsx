import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface QuotePdfEmailProps {
  clientName?: string;
  quoteNumber: string;
  quoteName?: string;
  destination?: string;
  startDate?: string;
  endDate?: string;
  totalAmount?: string;
  validUntil?: string;
  personalMessage?: string;
}

export default function QuotePdfEmail({
  clientName = "Valued Guest",
  quoteNumber,
  quoteName,
  destination,
  startDate,
  endDate,
  totalAmount,
  validUntil,
  personalMessage,
}: QuotePdfEmailProps) {
  const formatDate = (d?: string) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Html>
      <Head />
      <Preview>Your personalized travel proposal from CuratedAscents - {quoteNumber}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={brandName}>CuratedAscents</Heading>
            <Text style={tagline}>Luxury Adventure Travel</Text>
          </Section>

          <Hr style={divider} />

          {/* Greeting */}
          <Section style={content}>
            <Heading style={heading}>Your Travel Proposal</Heading>
            <Text style={paragraph}>Dear {clientName},</Text>
            <Text style={paragraph}>
              Thank you for your interest in traveling with CuratedAscents. We are delighted to
              present your personalized travel proposal for your upcoming adventure.
            </Text>

            {personalMessage && (
              <Section style={messageBox}>
                <Text style={messageText}>{personalMessage}</Text>
              </Section>
            )}
          </Section>

          {/* Quote Summary */}
          <Section style={summarySection}>
            <Heading as="h2" style={subheading}>
              Proposal Summary
            </Heading>
            <table style={summaryTable}>
              <tbody>
                <tr>
                  <td style={labelCell}>Quote Reference:</td>
                  <td style={valueCell}>{quoteNumber}</td>
                </tr>
                {quoteName && (
                  <tr>
                    <td style={labelCell}>Trip Name:</td>
                    <td style={valueCell}>{quoteName}</td>
                  </tr>
                )}
                {destination && (
                  <tr>
                    <td style={labelCell}>Destination:</td>
                    <td style={valueCell}>{destination}</td>
                  </tr>
                )}
                {startDate && endDate && (
                  <tr>
                    <td style={labelCell}>Travel Dates:</td>
                    <td style={valueCell}>
                      {formatDate(startDate)} - {formatDate(endDate)}
                    </td>
                  </tr>
                )}
                {totalAmount && (
                  <tr>
                    <td style={labelCell}>Total Investment:</td>
                    <td style={valueCellHighlight}>${parseFloat(totalAmount).toLocaleString()}</td>
                  </tr>
                )}
                {validUntil && (
                  <tr>
                    <td style={labelCell}>Valid Until:</td>
                    <td style={valueCell}>{formatDate(validUntil)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </Section>

          {/* Attachment Notice */}
          <Section style={attachmentNotice}>
            <Text style={attachmentText}>
              📎 Please find your detailed proposal attached as a PDF document.
            </Text>
          </Section>

          {/* Next Steps */}
          <Section style={content}>
            <Heading as="h2" style={subheading}>
              Next Steps
            </Heading>
            <Text style={paragraph}>
              1. <strong>Review</strong> - Please review the attached proposal carefully
            </Text>
            <Text style={paragraph}>
              2. <strong>Questions</strong> - We&apos;re here to clarify any details or make adjustments
            </Text>
            <Text style={paragraph}>
              3. <strong>Confirm</strong> - Reply to this email to confirm your booking
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Contact */}
          <Section style={contactSection}>
            <Text style={contactTitle}>Have Questions?</Text>
            <Text style={contactText}>
              Simply reply to this email or reach us at:
            </Text>
            <Text style={contactText}>
              Email: <Link href="mailto:curatedascents@gmail.com" style={link}>curatedascents@gmail.com</Link>
            </Text>
            <Text style={contactText}>
              Website: <Link href="https://curatedascents.com" style={link}>curatedascents.com</Link>
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              CuratedAscents | Luxury Adventure Travel
            </Text>
            <Text style={footerText}>
              Nepal • Tibet • Bhutan • India
            </Text>
            <Text style={disclaimer}>
              This proposal is subject to availability. Prices may vary based on season and group size.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: "#f8fafc",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0",
  maxWidth: "600px",
};

const header = {
  textAlign: "center" as const,
  padding: "30px 20px",
};

const brandName = {
  fontSize: "28px",
  fontWeight: "bold",
  color: "#10b981",
  margin: "0",
};

const tagline = {
  fontSize: "14px",
  color: "#64748b",
  margin: "8px 0 0 0",
};

const divider = {
  borderColor: "#e2e8f0",
  margin: "0",
};

const content = {
  padding: "30px 40px",
  backgroundColor: "#ffffff",
};

const heading = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#1e293b",
  margin: "0 0 20px 0",
};

const subheading = {
  fontSize: "18px",
  fontWeight: "bold",
  color: "#1e293b",
  margin: "0 0 15px 0",
};

const paragraph = {
  fontSize: "15px",
  lineHeight: "1.6",
  color: "#475569",
  margin: "0 0 15px 0",
};

const messageBox = {
  backgroundColor: "#f0fdf4",
  borderLeft: "4px solid #10b981",
  padding: "15px 20px",
  margin: "20px 0",
  borderRadius: "0 4px 4px 0",
};

const messageText = {
  fontSize: "14px",
  color: "#166534",
  margin: "0",
  fontStyle: "italic" as const,
};

const summarySection = {
  padding: "25px 40px",
  backgroundColor: "#f8fafc",
};

const summaryTable = {
  width: "100%",
  borderCollapse: "collapse" as const,
};

const labelCell = {
  padding: "10px 15px",
  fontSize: "14px",
  color: "#64748b",
  width: "40%",
  borderBottom: "1px solid #e2e8f0",
};

const valueCell = {
  padding: "10px 15px",
  fontSize: "14px",
  color: "#1e293b",
  fontWeight: "500",
  borderBottom: "1px solid #e2e8f0",
};

const valueCellHighlight = {
  ...valueCell,
  color: "#10b981",
  fontSize: "16px",
  fontWeight: "bold",
};

const attachmentNotice = {
  padding: "20px 40px",
  backgroundColor: "#fef3c7",
  textAlign: "center" as const,
};

const attachmentText = {
  fontSize: "14px",
  color: "#92400e",
  margin: "0",
  fontWeight: "500",
};

const contactSection = {
  padding: "25px 40px",
  backgroundColor: "#ffffff",
  textAlign: "center" as const,
};

const contactTitle = {
  fontSize: "16px",
  fontWeight: "bold",
  color: "#1e293b",
  margin: "0 0 10px 0",
};

const contactText = {
  fontSize: "14px",
  color: "#475569",
  margin: "5px 0",
};

const link = {
  color: "#10b981",
  textDecoration: "none",
};

const footer = {
  padding: "30px 40px",
  textAlign: "center" as const,
};

const footerText = {
  fontSize: "12px",
  color: "#94a3b8",
  margin: "5px 0",
};

const disclaimer = {
  fontSize: "11px",
  color: "#94a3b8",
  margin: "15px 0 0 0",
  fontStyle: "italic" as const,
};
