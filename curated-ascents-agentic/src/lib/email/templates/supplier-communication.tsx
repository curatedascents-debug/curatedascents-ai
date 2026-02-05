import * as React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Hr,
  Preview,
} from "@react-email/components";

interface SupplierCommunicationEmailProps {
  recipientName: string;
  subject: string;
  message: string;
  senderName?: string;
}

export const SupplierCommunicationEmail: React.FC<
  SupplierCommunicationEmailProps
> = ({
  recipientName,
  subject,
  message,
  senderName = "CuratedAscents Team",
}) => {
  return (
    <Html>
      <Head />
      <Preview>{subject}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>CuratedAscents</Text>
          </Section>

          <Section style={content}>
            <Text style={greeting}>Dear {recipientName},</Text>

            {message.split("\n").map((paragraph, index) => (
              <Text key={index} style={text}>
                {paragraph
                  .replace(/<strong>/g, "")
                  .replace(/<\/strong>/g, "")
                  .replace(/<br>/g, "")}
              </Text>
            ))}

            <Hr style={divider} />

            <Text style={text}>Best regards,</Text>
            <Text style={signature}>{senderName}</Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              CuratedAscents - Luxury Adventure Travel
            </Text>
            <Text style={footerText}>
              This email was sent to you as part of our business partnership.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default SupplierCommunicationEmail;

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  maxWidth: "600px",
};

const header = {
  padding: "20px 30px",
  backgroundColor: "#1a365d",
};

const logo = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "bold" as const,
  margin: "0",
};

const content = {
  padding: "30px",
};

const greeting = {
  color: "#333333",
  fontSize: "16px",
  lineHeight: "24px",
  marginBottom: "20px",
};

const text = {
  color: "#333333",
  fontSize: "14px",
  lineHeight: "24px",
  marginBottom: "12px",
};

const divider = {
  borderColor: "#e6ebf1",
  margin: "30px 0",
};

const signature = {
  color: "#1a365d",
  fontSize: "14px",
  fontWeight: "bold" as const,
};

const footer = {
  padding: "20px 30px",
  backgroundColor: "#f6f9fc",
};

const footerText = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  margin: "4px 0",
};
