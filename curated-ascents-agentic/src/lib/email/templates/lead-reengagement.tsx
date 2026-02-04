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

interface LeadReengagementEmailProps {
  clientName?: string;
  lastDestination?: string;
  daysSinceActivity: number;
  personalizedMessage?: string;
}

export default function LeadReengagementEmail({
  clientName = "Traveler",
  lastDestination,
  daysSinceActivity,
  personalizedMessage,
}: LeadReengagementEmailProps) {
  // Dynamic subject line options based on context
  const getHeadline = () => {
    if (lastDestination) {
      return `Still dreaming of ${lastDestination}?`;
    }
    if (daysSinceActivity <= 3) {
      return "We noticed you were exploring adventure options...";
    }
    return "Your Himalayan adventure awaits";
  };

  return (
    <Html>
      <Head />
      <Preview>
        {lastDestination
          ? `Your ${lastDestination} adventure is waiting - Let's make it happen`
          : "Continue planning your luxury Himalayan adventure"}
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
          <Section style={content}>
            <Heading style={heading}>{getHeadline()}</Heading>

            <Text style={paragraph}>Dear {clientName},</Text>

            {personalizedMessage ? (
              <Text style={paragraph}>{personalizedMessage}</Text>
            ) : (
              <>
                <Text style={paragraph}>
                  We noticed you were recently exploring {lastDestination ? `trips to ${lastDestination}` : "our luxury adventure experiences"}, and we wanted to reach out personally.
                </Text>

                <Text style={paragraph}>
                  Planning the perfect Himalayan journey takes time, and we&apos;re here to help whenever you&apos;re ready. Whether you have questions about itineraries, want to discuss timing, or need help customizing your experience &mdash; our expedition architects are at your service.
                </Text>
              </>
            )}
          </Section>

          {/* Highlights Section */}
          <Section style={highlightsSection}>
            <Heading as="h2" style={subheading}>
              Why Travel With Us?
            </Heading>
            <table style={highlightsTable}>
              <tbody>
                <tr>
                  <td style={highlightIcon}>&#9733;</td>
                  <td style={highlightText}>
                    <strong>28+ Years of Expertise</strong> - Deep local knowledge across Nepal, Tibet, Bhutan &amp; India
                  </td>
                </tr>
                <tr>
                  <td style={highlightIcon}>&#9733;</td>
                  <td style={highlightText}>
                    <strong>Bespoke Itineraries</strong> - Every journey crafted to your preferences
                  </td>
                </tr>
                <tr>
                  <td style={highlightIcon}>&#9733;</td>
                  <td style={highlightText}>
                    <strong>White-Glove Service</strong> - Personal expedition architect from inquiry to return
                  </td>
                </tr>
                <tr>
                  <td style={highlightIcon}>&#9733;</td>
                  <td style={highlightText}>
                    <strong>Handpicked Partners</strong> - Only the finest hotels, guides, and experiences
                  </td>
                </tr>
              </tbody>
            </table>
          </Section>

          {/* CTA Section */}
          <Section style={ctaSection}>
            <Text style={ctaText}>Ready to continue planning?</Text>
            <Link href="https://curated-ascents-agentic.vercel.app" style={ctaButton}>
              Resume Your Journey
            </Link>
            <Text style={ctaSubtext}>
              Or simply reply to this email &mdash; we&apos;d love to hear from you.
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Destinations Teaser */}
          <Section style={destinationsSection}>
            <Text style={destinationsTitle}>Popular Experiences</Text>
            <table style={destinationsTable}>
              <tbody>
                <tr>
                  <td style={destinationCell}>
                    <Text style={destinationName}>Everest Base Camp</Text>
                    <Text style={destinationDesc}>Classic trek to the roof of the world</Text>
                  </td>
                  <td style={destinationCell}>
                    <Text style={destinationName}>Bhutan Cultural</Text>
                    <Text style={destinationDesc}>Tiger&apos;s Nest and beyond</Text>
                  </td>
                </tr>
                <tr>
                  <td style={destinationCell}>
                    <Text style={destinationName}>Tibet Explorer</Text>
                    <Text style={destinationDesc}>Lhasa, monasteries &amp; plateaus</Text>
                  </td>
                  <td style={destinationCell}>
                    <Text style={destinationName}>Nepal Luxury</Text>
                    <Text style={destinationDesc}>Heritage hotels &amp; heli tours</Text>
                  </td>
                </tr>
              </tbody>
            </table>
          </Section>

          {/* Contact Section */}
          <Section style={contactSection}>
            <Text style={contactTitle}>Questions? We&apos;re Here to Help</Text>
            <Text style={contactText}>
              Email: <Link href="mailto:curatedascents@gmail.com" style={link}>curatedascents@gmail.com</Link>
            </Text>
            <Text style={contactText}>
              WhatsApp: +977-9851-000000
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
                Update preferences
              </Link>
              {" | "}
              <Link href="#" style={unsubscribeLink}>
                Unsubscribe
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

const highlightsSection = {
  padding: "25px 40px",
  backgroundColor: "#f0fdf4",
};

const highlightsTable = {
  width: "100%",
};

const highlightIcon = {
  width: "30px",
  fontSize: "16px",
  color: "#10b981",
  verticalAlign: "top",
  paddingTop: "3px",
};

const highlightText = {
  fontSize: "14px",
  color: "#475569",
  paddingBottom: "12px",
  lineHeight: "1.5",
};

const ctaSection = {
  padding: "30px 40px",
  backgroundColor: "#ffffff",
  textAlign: "center" as const,
};

const ctaText = {
  fontSize: "16px",
  color: "#1e293b",
  margin: "0 0 20px 0",
  fontWeight: "500",
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

const ctaSubtext = {
  fontSize: "13px",
  color: "#64748b",
  margin: "15px 0 0 0",
};

const destinationsSection = {
  padding: "25px 40px",
  backgroundColor: "#f8fafc",
};

const destinationsTitle = {
  fontSize: "14px",
  fontWeight: "bold",
  color: "#64748b",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
  margin: "0 0 15px 0",
  textAlign: "center" as const,
};

const destinationsTable = {
  width: "100%",
};

const destinationCell = {
  width: "50%",
  padding: "10px",
  textAlign: "center" as const,
};

const destinationName = {
  fontSize: "14px",
  fontWeight: "bold",
  color: "#1e293b",
  margin: "0 0 4px 0",
};

const destinationDesc = {
  fontSize: "12px",
  color: "#64748b",
  margin: "0",
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

const unsubscribe = {
  fontSize: "11px",
  color: "#94a3b8",
  margin: "15px 0 0 0",
};

const unsubscribeLink = {
  color: "#94a3b8",
  textDecoration: "underline",
};
