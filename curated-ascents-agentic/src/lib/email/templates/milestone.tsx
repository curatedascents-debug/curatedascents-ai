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

interface MilestoneEmailProps {
  clientName?: string;
  milestoneType: string;
  milestoneName: string;
  milestoneDate: string;
  bonusPoints?: number;
  specialOfferCode?: string;
  specialOfferDiscount?: number;
}

export default function MilestoneEmail({
  clientName = "Valued Member",
  milestoneType,
  milestoneName,
  milestoneDate,
  bonusPoints = 0,
  specialOfferCode,
  specialOfferDiscount = 0,
}: MilestoneEmailProps) {
  const isAnniversary =
    milestoneType === "booking_anniversary" ||
    milestoneType === "membership_anniversary";

  const isTierUpgrade =
    milestoneType === "tier_upgrade" || milestoneType === "vip_status";

  return (
    <Html>
      <Head />
      <Preview>
        {isAnniversary
          ? `Celebrating your anniversary with CuratedAscents!`
          : isTierUpgrade
          ? `Congratulations on your loyalty upgrade!`
          : `You've reached a milestone with CuratedAscents!`}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={brandName}>CuratedAscents</Heading>
            <Text style={tagline}>Luxury Adventure Travel</Text>
          </Section>

          <Hr style={divider} />

          {/* Celebration Banner */}
          <Section style={celebrationBanner}>
            <Text style={celebrationEmoji}>&#127881;</Text>
            <Heading style={celebrationHeading}>
              {isAnniversary
                ? "Happy Anniversary!"
                : isTierUpgrade
                ? "Congratulations!"
                : "You Did It!"}
            </Heading>
          </Section>

          {/* Main Content */}
          <Section style={contentSection}>
            <Text style={paragraph}>Dear {clientName},</Text>

            {isAnniversary && (
              <>
                <Text style={paragraph}>
                  It's been a whole year since your incredible journey, and we
                  wanted to take a moment to celebrate this special milestone
                  with you.
                </Text>
                <Section style={milestoneBox}>
                  <Text style={milestoneLabel}>Celebrating</Text>
                  <Text style={milestoneValue}>{milestoneName}</Text>
                  <Text style={milestoneDate2}>
                    {new Date(milestoneDate).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </Text>
                </Section>
                <Text style={paragraph}>
                  We hope the memories from that adventure still bring you joy.
                  Thank you for choosing CuratedAscents to be part of your
                  story.
                </Text>
              </>
            )}

            {isTierUpgrade && (
              <>
                <Text style={paragraph}>
                  Your loyalty and trust in CuratedAscents have been
                  extraordinary. We're thrilled to announce that you've been
                  upgraded to a new tier!
                </Text>
                <Section style={milestoneBox}>
                  <Text style={milestoneLabel}>New Status</Text>
                  <Text style={milestoneValue}>{milestoneName}</Text>
                </Section>
                <Text style={paragraph}>
                  As a {milestoneName} member, you now enjoy enhanced benefits
                  including priority support, exclusive offers, and special
                  discounts on all bookings.
                </Text>
              </>
            )}

            {!isAnniversary && !isTierUpgrade && (
              <>
                <Text style={paragraph}>
                  You've reached an amazing milestone with CuratedAscents, and
                  we couldn't be more grateful for your continued support.
                </Text>
                <Section style={milestoneBox}>
                  <Text style={milestoneLabel}>Achievement Unlocked</Text>
                  <Text style={milestoneValue}>{milestoneName}</Text>
                </Section>
              </>
            )}

            {/* Rewards Section */}
            {(bonusPoints > 0 || specialOfferCode) && (
              <Section style={rewardsSection}>
                <Heading as="h2" style={rewardsHeading}>
                  Your Celebration Rewards
                </Heading>

                {bonusPoints > 0 && (
                  <Section style={rewardItem}>
                    <Text style={rewardIcon}>&#127873;</Text>
                    <Text style={rewardText}>
                      <strong>{bonusPoints} Bonus Points</strong>
                      <br />
                      <span style={rewardSubtext}>
                        Added to your loyalty account
                      </span>
                    </Text>
                  </Section>
                )}

                {specialOfferCode && (
                  <Section style={offerBox}>
                    <Text style={offerLabel}>Special Anniversary Offer</Text>
                    <Text style={offerDiscount}>
                      {specialOfferDiscount}% OFF
                    </Text>
                    <Text style={offerText}>Your next booking</Text>
                    <Section style={codeBox}>
                      <Text style={codeLabel}>Use code:</Text>
                      <Text style={codeValue}>{specialOfferCode}</Text>
                    </Section>
                    <Text style={offerExpiry}>
                      Valid for 30 days from today
                    </Text>
                  </Section>
                )}
              </Section>
            )}
          </Section>

          {/* CTA Section */}
          <Section style={ctaSection}>
            <Text style={ctaText}>Ready for your next adventure?</Text>
            <Link
              href="https://curated-ascents-agentic.vercel.app"
              style={ctaButton}
            >
              Start Planning
            </Link>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              CuratedAscents | Luxury Adventure Travel
            </Text>
            <Text style={footerText}>
              Nepal &bull; Tibet &bull; Bhutan &bull; India
            </Text>
            <Text style={footerText}>
              Thank you for being part of our journey.
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

const celebrationBanner = {
  backgroundColor: "#fef3c7",
  padding: "30px 40px",
  textAlign: "center" as const,
};

const celebrationEmoji = {
  fontSize: "48px",
  margin: "0 0 10px 0",
};

const celebrationHeading = {
  fontSize: "28px",
  fontWeight: "bold",
  color: "#92400e",
  margin: "0",
};

const contentSection = {
  padding: "30px 40px",
  backgroundColor: "#ffffff",
};

const paragraph = {
  fontSize: "15px",
  lineHeight: "1.6",
  color: "#475569",
  margin: "0 0 15px 0",
};

const milestoneBox = {
  backgroundColor: "#f0fdf4",
  padding: "25px",
  borderRadius: "12px",
  textAlign: "center" as const,
  margin: "25px 0",
  border: "2px solid #86efac",
};

const milestoneLabel = {
  fontSize: "12px",
  color: "#166534",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
  margin: "0 0 8px 0",
};

const milestoneValue = {
  fontSize: "22px",
  fontWeight: "bold",
  color: "#166534",
  margin: "0",
};

const milestoneDate2 = {
  fontSize: "14px",
  color: "#166534",
  margin: "8px 0 0 0",
};

const rewardsSection = {
  backgroundColor: "#fafaf9",
  padding: "25px",
  borderRadius: "12px",
  margin: "25px 0 0 0",
};

const rewardsHeading = {
  fontSize: "18px",
  fontWeight: "bold",
  color: "#1e293b",
  margin: "0 0 20px 0",
  textAlign: "center" as const,
};

const rewardItem = {
  display: "flex",
  alignItems: "center",
  margin: "0 0 15px 0",
};

const rewardIcon = {
  fontSize: "24px",
  margin: "0 15px 0 0",
};

const rewardText = {
  fontSize: "15px",
  color: "#1e293b",
  margin: "0",
  lineHeight: "1.4",
};

const rewardSubtext = {
  color: "#64748b",
  fontSize: "13px",
};

const offerBox = {
  backgroundColor: "#ffffff",
  padding: "25px",
  borderRadius: "8px",
  textAlign: "center" as const,
  border: "2px dashed #f59e0b",
  margin: "15px 0 0 0",
};

const offerLabel = {
  fontSize: "12px",
  color: "#92400e",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
  margin: "0 0 8px 0",
};

const offerDiscount = {
  fontSize: "36px",
  fontWeight: "bold",
  color: "#d97706",
  margin: "0",
};

const offerText = {
  fontSize: "16px",
  color: "#92400e",
  margin: "5px 0 15px 0",
};

const codeBox = {
  backgroundColor: "#fef3c7",
  padding: "12px 20px",
  borderRadius: "6px",
  display: "inline-block",
};

const codeLabel = {
  fontSize: "11px",
  color: "#92400e",
  margin: "0",
  textTransform: "uppercase" as const,
};

const codeValue = {
  fontSize: "20px",
  fontWeight: "bold",
  color: "#92400e",
  margin: "4px 0 0 0",
  fontFamily: "monospace",
  letterSpacing: "2px",
};

const offerExpiry = {
  fontSize: "12px",
  color: "#a8a29e",
  margin: "15px 0 0 0",
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

const footer = {
  padding: "30px 40px",
  textAlign: "center" as const,
};

const footerText = {
  fontSize: "12px",
  color: "#94a3b8",
  margin: "5px 0",
};
