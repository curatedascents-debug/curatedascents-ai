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

interface FeedbackRequestEmailProps {
  clientName?: string;
  destination: string;
  bookingReference: string;
  surveyId: number;
}

export default function FeedbackRequestEmail({
  clientName = "Traveler",
  destination,
  bookingReference,
  surveyId,
}: FeedbackRequestEmailProps) {
  const surveyUrl = `https://curated-ascents-agentic.vercel.app/feedback/${surveyId}`;

  return (
    <Html>
      <Head />
      <Preview>
        Share your {destination} experience and earn 50 loyalty points!
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
            <Heading style={heading}>
              How was your {destination} adventure?
            </Heading>

            <Text style={paragraph}>Dear {clientName},</Text>

            <Text style={paragraph}>
              We hope you had an incredible journey! Your experience matters to
              us, and we&apos;d love to hear your thoughts. Your feedback helps us
              continue to craft extraordinary adventures for travelers like you.
            </Text>

            <Text style={paragraph}>
              As a thank you for sharing your experience, you&apos;ll earn{" "}
              <strong>50 loyalty points</strong> when you complete our short
              survey.
            </Text>

            {/* Survey CTA */}
            <Section style={ctaSection}>
              <Link href={surveyUrl} style={ctaButton}>
                Share Your Feedback
              </Link>
              <Text style={ctaSubtext}>Takes less than 3 minutes</Text>
            </Section>

            {/* What we'll ask */}
            <Section style={topicsSection}>
              <Text style={topicsTitle}>What we&apos;ll ask about:</Text>
              <table style={topicsTable}>
                <tbody>
                  <tr>
                    <td style={topicIcon}>&#9733;</td>
                    <td style={topicText}>Your overall experience</td>
                  </tr>
                  <tr>
                    <td style={topicIcon}>&#9733;</td>
                    <td style={topicText}>
                      Accommodation &amp; service quality
                    </td>
                  </tr>
                  <tr>
                    <td style={topicIcon}>&#9733;</td>
                    <td style={topicText}>
                      Our guides and local partners
                    </td>
                  </tr>
                  <tr>
                    <td style={topicIcon}>&#9733;</td>
                    <td style={topicText}>
                      What we could improve
                    </td>
                  </tr>
                </tbody>
              </table>
            </Section>

            {/* Testimonial option */}
            <Section style={testimonialSection}>
              <Text style={testimonialText}>
                <strong>Share your story?</strong> If you&apos;d like, you can
                also share a testimonial that we may feature on our website
                (with your permission, of course!).
              </Text>
            </Section>

            {/* Booking Reference */}
            <Section style={referenceSection}>
              <Text style={referenceLabel}>Booking Reference</Text>
              <Text style={referenceNumber}>{bookingReference}</Text>
            </Section>
          </Section>

          <Hr style={divider} />

          {/* Points reminder */}
          <Section style={pointsSection}>
            <Text style={pointsTitle}>Don&apos;t forget your points!</Text>
            <Text style={pointsText}>
              Complete this survey to earn <strong>50 loyalty points</strong>.
              Your points can be redeemed for discounts on future adventures!
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              CuratedAscents | Luxury Adventure Travel
            </Text>
            <Text style={footerText}>
              Nepal &bull; Tibet &bull; Bhutan &bull; India
            </Text>
            <Text style={unsubscribe}>
              <Link href="#" style={unsubscribeLink}>
                Unsubscribe from feedback requests
              </Link>
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

const ctaSection = {
  textAlign: "center" as const,
  padding: "25px 0",
};

const ctaButton = {
  display: "inline-block",
  padding: "16px 40px",
  backgroundColor: "#10b981",
  color: "#ffffff",
  fontSize: "18px",
  fontWeight: "bold",
  textDecoration: "none",
  borderRadius: "8px",
};

const ctaSubtext = {
  fontSize: "13px",
  color: "#64748b",
  margin: "12px 0 0 0",
};

const topicsSection = {
  backgroundColor: "#f8fafc",
  padding: "20px",
  borderRadius: "8px",
  margin: "20px 0",
};

const topicsTitle = {
  fontSize: "14px",
  fontWeight: "bold",
  color: "#1e293b",
  margin: "0 0 15px 0",
};

const topicsTable = {
  width: "100%",
};

const topicIcon = {
  width: "25px",
  fontSize: "14px",
  color: "#10b981",
  verticalAlign: "top",
  paddingTop: "2px",
};

const topicText = {
  fontSize: "14px",
  color: "#475569",
  paddingBottom: "8px",
};

const testimonialSection = {
  backgroundColor: "#fef3c7",
  padding: "15px 20px",
  borderRadius: "8px",
  margin: "20px 0",
  borderLeft: "4px solid #f59e0b",
};

const testimonialText = {
  fontSize: "14px",
  color: "#92400e",
  margin: "0",
  lineHeight: "1.5",
};

const referenceSection = {
  textAlign: "center" as const,
  padding: "15px",
  backgroundColor: "#f1f5f9",
  borderRadius: "8px",
  margin: "20px 0 0 0",
};

const referenceLabel = {
  fontSize: "11px",
  color: "#64748b",
  margin: "0 0 4px 0",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
};

const referenceNumber = {
  fontSize: "16px",
  fontWeight: "bold",
  color: "#1e293b",
  margin: "0",
  fontFamily: "monospace",
};

const pointsSection = {
  padding: "25px 40px",
  backgroundColor: "#ecfdf5",
  textAlign: "center" as const,
};

const pointsTitle = {
  fontSize: "16px",
  fontWeight: "bold",
  color: "#166534",
  margin: "0 0 8px 0",
};

const pointsText = {
  fontSize: "14px",
  color: "#166534",
  margin: "0",
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

const unsubscribe = {
  fontSize: "11px",
  color: "#94a3b8",
  margin: "15px 0 0 0",
};

const unsubscribeLink = {
  color: "#94a3b8",
  textDecoration: "underline",
};
