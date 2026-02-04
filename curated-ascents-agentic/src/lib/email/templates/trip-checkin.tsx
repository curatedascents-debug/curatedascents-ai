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

interface TripCheckinEmailProps {
  clientName?: string;
  destination: string;
  checkinType: "pre_departure" | "day_1" | "mid_trip" | "post_trip";
  bookingReference: string;
}

const checkinContent = {
  pre_departure: {
    headline: "Your adventure begins tomorrow!",
    message:
      "We're excited that your journey is about to begin. Here's a quick reminder of everything you need to know before you depart.",
    tips: [
      "Double-check your travel documents (passport, visas, permits)",
      "Confirm your flight times and airport transfer",
      "Pack layers - mountain weather can be unpredictable",
      "Bring your sense of adventure!",
    ],
    cta: "View Your Itinerary",
  },
  day_1: {
    headline: "How's your first day going?",
    message:
      "We hope you've arrived safely and are settling in well. First impressions matter, and we want to make sure everything is perfect.",
    tips: [
      "Our local team is available 24/7 if you need anything",
      "Don't forget to stay hydrated at altitude",
      "Take it easy today to acclimatize properly",
    ],
    cta: "Contact Support",
  },
  mid_trip: {
    headline: "Checking in on your adventure",
    message:
      "You're halfway through your journey! We hope you're having an incredible experience. Is there anything we can do to make the rest of your trip even better?",
    tips: [
      "Share your favorite moments with us!",
      "Let us know if there's anything you'd like to adjust",
      "Remember to take lots of photos",
    ],
    cta: "Share Your Experience",
  },
  post_trip: {
    headline: "Welcome back!",
    message:
      "We hope your journey was everything you dreamed of and more. Your adventure may be over, but the memories will last a lifetime.",
    tips: [
      "We'd love to hear about your experience",
      "Share your photos on social media and tag us",
      "Start planning your next adventure with us",
    ],
    cta: "Share Your Feedback",
  },
};

export default function TripCheckinEmail({
  clientName = "Traveler",
  destination,
  checkinType,
  bookingReference,
}: TripCheckinEmailProps) {
  const content = checkinContent[checkinType];

  return (
    <Html>
      <Head />
      <Preview>
        {checkinType === "pre_departure"
          ? `Your ${destination} adventure begins tomorrow!`
          : checkinType === "post_trip"
          ? `Welcome back from ${destination}!`
          : `How's your ${destination} adventure going?`}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={brandName}>CuratedAscents</Heading>
            <Text style={tagline}>Luxury Adventure Travel</Text>
          </Section>

          <Hr style={divider} />

          {/* Main Content */}
          <Section style={contentSection}>
            <Heading style={heading}>{content.headline}</Heading>

            <Text style={paragraph}>Dear {clientName},</Text>

            <Text style={paragraph}>{content.message}</Text>

            {/* Tips Section */}
            <Section style={tipsSection}>
              <Text style={tipsTitle}>
                {checkinType === "pre_departure"
                  ? "Pre-departure checklist"
                  : checkinType === "post_trip"
                  ? "What's next?"
                  : "Tips for you"}
              </Text>
              <ul style={tipsList}>
                {content.tips.map((tip, index) => (
                  <li key={index} style={tipItem}>
                    {tip}
                  </li>
                ))}
              </ul>
            </Section>

            {/* Booking Reference */}
            <Section style={referenceSection}>
              <Text style={referenceLabel}>Your Booking Reference</Text>
              <Text style={referenceNumber}>{bookingReference}</Text>
            </Section>
          </Section>

          {/* CTA Section */}
          <Section style={ctaSection}>
            <Link
              href={`https://curated-ascents-agentic.vercel.app`}
              style={ctaButton}
            >
              {content.cta}
            </Link>
          </Section>

          <Hr style={divider} />

          {/* Support Section */}
          <Section style={supportSection}>
            <Text style={supportTitle}>Need Assistance?</Text>
            <Text style={supportText}>
              Our team is here for you 24/7. Reach out anytime:
            </Text>
            <Text style={supportText}>
              Email:{" "}
              <Link href="mailto:curatedascents@gmail.com" style={link}>
                curatedascents@gmail.com
              </Link>
            </Text>
            <Text style={supportText}>WhatsApp: +977-9851-000000</Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              CuratedAscents | Luxury Adventure Travel
            </Text>
            <Text style={footerText}>
              Nepal &bull; Tibet &bull; Bhutan &bull; India
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
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
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

const contentSection = {
  padding: "30px 40px",
  backgroundColor: "#ffffff",
};

const heading = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#1e293b",
  margin: "0 0 20px 0",
};

const paragraph = {
  fontSize: "15px",
  lineHeight: "1.6",
  color: "#475569",
  margin: "0 0 15px 0",
};

const tipsSection = {
  backgroundColor: "#f0fdf4",
  padding: "20px",
  borderRadius: "8px",
  margin: "20px 0",
};

const tipsTitle = {
  fontSize: "14px",
  fontWeight: "bold",
  color: "#166534",
  margin: "0 0 10px 0",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
};

const tipsList = {
  margin: "0",
  padding: "0 0 0 20px",
};

const tipItem = {
  fontSize: "14px",
  color: "#475569",
  marginBottom: "8px",
  lineHeight: "1.5",
};

const referenceSection = {
  textAlign: "center" as const,
  padding: "20px",
  backgroundColor: "#f1f5f9",
  borderRadius: "8px",
  margin: "20px 0 0 0",
};

const referenceLabel = {
  fontSize: "12px",
  color: "#64748b",
  margin: "0 0 5px 0",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
};

const referenceNumber = {
  fontSize: "20px",
  fontWeight: "bold",
  color: "#1e293b",
  margin: "0",
  fontFamily: "monospace",
};

const ctaSection = {
  padding: "30px 40px",
  backgroundColor: "#ffffff",
  textAlign: "center" as const,
};

const ctaButton = {
  display: "inline-block",
  padding: "14px 32px",
  backgroundColor: "#10b981",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  borderRadius: "6px",
};

const supportSection = {
  padding: "25px 40px",
  backgroundColor: "#f8fafc",
  textAlign: "center" as const,
};

const supportTitle = {
  fontSize: "16px",
  fontWeight: "bold",
  color: "#1e293b",
  margin: "0 0 10px 0",
};

const supportText = {
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
