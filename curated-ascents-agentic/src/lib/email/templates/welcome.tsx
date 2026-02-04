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

interface WelcomeEmailProps {
  clientName?: string;
}

export default function WelcomeEmail({ clientName }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={body}>
        <Container style={container}>
          <Text style={brand}>CuratedAscents</Text>
          <Text style={tagline}>Luxury Adventure Travel</Text>
          <Hr style={hr} />

          <Text style={heading}>Welcome to CuratedAscents!</Text>

          <Text style={paragraph}>
            Dear {clientName || "Traveler"},
          </Text>

          <Text style={paragraph}>
            Thank you for connecting with us! We specialize in crafting extraordinary
            luxury adventures across Nepal, Tibet, Bhutan, and India.
          </Text>

          <Section style={highlightBox}>
            <Text style={highlightText}>
              Our AI Expedition Architect is ready to help you plan your perfect journey.
              Continue your conversation to explore destinations, get personalized
              recommendations, and receive a custom quote.
            </Text>
          </Section>

          <Text style={paragraph}>
            <strong>What we offer:</strong>
          </Text>

          <Text style={listItem}>• Bespoke luxury itineraries tailored to your preferences</Text>
          <Text style={listItem}>• Exclusive access to premium hotels and experiences</Text>
          <Text style={listItem}>• Expert local guides and seamless logistics</Text>
          <Text style={listItem}>• 24/7 concierge support throughout your journey</Text>

          <Text style={paragraph}>
            Simply reply to this email or continue chatting with our AI assistant
            to start planning your adventure.
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
  color: "#0d5e3f",
  margin: "0 0 16px",
};

const paragraph: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: "1.6",
  color: "#374151",
  margin: "0 0 16px",
};

const highlightBox: React.CSSProperties = {
  backgroundColor: "#f0fdf4",
  borderRadius: "8px",
  padding: "20px",
  margin: "16px 0",
  border: "1px solid #bbf7d0",
};

const highlightText: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: "1.6",
  color: "#166534",
  margin: "0",
};

const listItem: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: "1.4",
  color: "#374151",
  margin: "0 0 8px",
  paddingLeft: "8px",
};

const footer: React.CSSProperties = {
  fontSize: "12px",
  color: "#9ca3af",
  textAlign: "center" as const,
  margin: "0",
};
