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

interface BlogDraftNotificationProps {
  postTitle: string;
  contentType: string;
  destination: string;
  excerpt: string;
  adminUrl: string;
}

export default function BlogDraftNotificationEmail({
  postTitle,
  contentType,
  destination,
  excerpt,
  adminUrl,
}: BlogDraftNotificationProps) {
  return (
    <Html>
      <Head />
      <Body style={body}>
        <Container style={container}>
          <Text style={brand}>CuratedAscents Admin</Text>
          <Hr style={hr} />

          <Text style={heading}>New AI Blog Draft Ready for Review</Text>

          <Section style={detailsBox}>
            <Text style={detailLabel}>Title</Text>
            <Text style={titleText}>{postTitle}</Text>

            <Text style={detailLabel}>Content Type</Text>
            <Text style={detailValue}>{contentType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</Text>

            <Text style={detailLabel}>Destination</Text>
            <Text style={detailValue}>{destination}</Text>

            {excerpt && (
              <>
                <Text style={detailLabel}>Excerpt</Text>
                <Text style={excerptText}>{excerpt}</Text>
              </>
            )}
          </Section>

          <Text style={paragraph}>
            An AI-generated blog draft has been created and is ready for your review.
            Please review, edit, and publish when ready.
          </Text>

          <Text style={paragraph}>
            <a href={adminUrl} style={link}>
              Review in Admin Dashboard &rarr;
            </a>
          </Text>

          <Hr style={hr} />
          <Text style={footer}>
            This is an automated notification from CuratedAscents content generation system.
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

const detailsBox: React.CSSProperties = {
  backgroundColor: "#f8fafc",
  borderRadius: "8px",
  padding: "20px",
  margin: "16px 0",
  border: "1px solid #e2e8f0",
};

const detailLabel: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: "600",
  color: "#6b7280",
  textTransform: "uppercase" as const,
  margin: "0",
  letterSpacing: "0.5px",
};

const detailValue: React.CSSProperties = {
  fontSize: "15px",
  color: "#111827",
  margin: "0 0 12px",
};

const titleText: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: "bold",
  color: "#0d5e3f",
  margin: "0 0 12px",
};

const excerptText: React.CSSProperties = {
  fontSize: "14px",
  color: "#374151",
  fontStyle: "italic",
  margin: "0 0 12px",
  lineHeight: "1.5",
};

const link: React.CSSProperties = {
  color: "#0d5e3f",
  textDecoration: "underline",
};

const footer: React.CSSProperties = {
  fontSize: "12px",
  color: "#9ca3af",
  textAlign: "center" as const,
  margin: "0",
};
