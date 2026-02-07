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

interface VerificationCodeEmailProps {
  code: string;
  name?: string;
}

export default function VerificationCodeEmail({
  code,
  name,
}: VerificationCodeEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={body}>
        <Container style={container}>
          <Text style={brand}>CuratedAscents</Text>
          <Hr style={hr} />

          <Text style={heading}>Your Verification Code</Text>

          {name && (
            <Text style={paragraph}>Hello {name},</Text>
          )}

          <Text style={paragraph}>
            Use the code below to sign in to your CuratedAscents portal. This code expires in 10 minutes.
          </Text>

          <Section style={codeBox}>
            <Text style={codeText}>{code}</Text>
          </Section>

          <Text style={paragraph}>
            If you didn&apos;t request this code, you can safely ignore this email.
          </Text>

          <Hr style={hr} />
          <Text style={footer}>
            This is an automated message from CuratedAscents. Please do not reply.
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

const codeBox: React.CSSProperties = {
  backgroundColor: "#0f172a",
  borderRadius: "12px",
  padding: "24px",
  margin: "24px 0",
  textAlign: "center" as const,
};

const codeText: React.CSSProperties = {
  fontSize: "36px",
  fontWeight: "bold",
  color: "#059669",
  letterSpacing: "8px",
  margin: "0",
  fontFamily: "monospace",
};

const footer: React.CSSProperties = {
  fontSize: "12px",
  color: "#9ca3af",
  textAlign: "center" as const,
  margin: "0",
};
