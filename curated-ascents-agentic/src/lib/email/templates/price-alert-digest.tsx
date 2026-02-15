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

interface PriceAlert {
  serviceName: string;
  alertType: string;
  currentPrice: number;
  previousPrice?: number;
  changePercent?: number;
  marketAverage?: number;
  recommendation: string;
  priority: string;
}

interface PriceAlertDigestEmailProps {
  alerts: Array<PriceAlert>;
  totalAlerts: number;
  highPriorityCount: number;
  dateRange: string;
}

export default function PriceAlertDigestEmail({
  alerts = [],
  totalAlerts = 0,
  highPriorityCount = 0,
  dateRange = "",
}: PriceAlertDigestEmailProps) {
  const formatCurrency = (val: number) => {
    return `$${val.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
  };

  const getPriorityOrder = (priority: string): number => {
    switch (priority.toLowerCase()) {
      case "high":
        return 0;
      case "medium":
        return 1;
      case "low":
        return 2;
      default:
        return 3;
    }
  };

  const getPriorityBadgeStyle = (priority: string): React.CSSProperties => {
    switch (priority.toLowerCase()) {
      case "high":
        return {
          ...badgeBase,
          backgroundColor: "#fee2e2",
          color: "#dc2626",
        };
      case "medium":
        return {
          ...badgeBase,
          backgroundColor: "#fef3c7",
          color: "#d97706",
        };
      case "low":
        return {
          ...badgeBase,
          backgroundColor: "#d1fae5",
          color: "#0d5e3f",
        };
      default:
        return {
          ...badgeBase,
          backgroundColor: "#e5e7eb",
          color: "#6b7280",
        };
    }
  };

  const getAlertTypeBadgeStyle = (alertType: string): React.CSSProperties => {
    const type = alertType.toLowerCase();
    if (type.includes("increase") || type.includes("spike")) {
      return {
        ...badgeBase,
        backgroundColor: "#fee2e2",
        color: "#dc2626",
      };
    }
    if (type.includes("decrease") || type.includes("drop")) {
      return {
        ...badgeBase,
        backgroundColor: "#d1fae5",
        color: "#0d5e3f",
      };
    }
    return {
      ...badgeBase,
      backgroundColor: "#fef3c7",
      color: "#d97706",
    };
  };

  const getChangeStyle = (changePercent?: number): React.CSSProperties => {
    if (!changePercent) return { ...changeText, color: "#6b7280" };
    if (changePercent > 0) return { ...changeText, color: "#dc2626" };
    return { ...changeText, color: "#0d5e3f" };
  };

  const formatChange = (changePercent?: number): string => {
    if (changePercent === undefined || changePercent === null) return "N/A";
    const sign = changePercent > 0 ? "+" : "";
    return `${sign}${changePercent.toFixed(1)}%`;
  };

  const sortedAlerts = [...alerts].sort(
    (a, b) => getPriorityOrder(a.priority) - getPriorityOrder(b.priority)
  );

  const groupedAlerts: Record<string, PriceAlert[]> = {};
  for (const alert of sortedAlerts) {
    const key = alert.priority.toLowerCase();
    if (!groupedAlerts[key]) {
      groupedAlerts[key] = [];
    }
    groupedAlerts[key].push(alert);
  }

  const priorityGroups = ["high", "medium", "low"].filter(
    (p) => groupedAlerts[p] && groupedAlerts[p].length > 0
  );

  const getPriorityLabel = (priority: string): string => {
    switch (priority) {
      case "high":
        return "High Priority";
      case "medium":
        return "Medium Priority";
      case "low":
        return "Low Priority";
      default:
        return "Other";
    }
  };

  return (
    <Html>
      <Head />
      <Body style={body}>
        <Container style={container}>
          <Text style={brand}>CuratedAscents Price Intelligence</Text>
          <Hr style={hr} />

          {/* Summary Section */}
          <Section style={summaryBox}>
            <Text style={summaryHeading}>
              {totalAlerts} price alert{totalAlerts !== 1 ? "s" : ""} detected
              {highPriorityCount > 0 && (
                <span style={highPriorityText}>
                  {" "}({highPriorityCount} high priority)
                </span>
              )}
            </Text>
            {dateRange && (
              <Text style={dateRangeText}>Report period: {dateRange}</Text>
            )}
          </Section>

          {/* Alert Groups */}
          {priorityGroups.map((priority) => (
            <Section key={priority} style={groupSection}>
              <Text style={groupHeading}>{getPriorityLabel(priority)}</Text>

              {groupedAlerts[priority].map((alert, index) => (
                <Section key={index} style={alertCard}>
                  {/* Service Name & Badges */}
                  <Text style={serviceName}>{alert.serviceName}</Text>
                  <Text style={badgeRow}>
                    <span style={getAlertTypeBadgeStyle(alert.alertType)}>
                      {alert.alertType}
                    </span>
                    <span style={{ display: "inline-block", width: "6px" }} />
                    <span style={getPriorityBadgeStyle(alert.priority)}>
                      {alert.priority.toUpperCase()}
                    </span>
                  </Text>

                  {/* Price Comparison */}
                  <Section style={priceRow}>
                    <Text style={priceLabel}>Current Price</Text>
                    <Text style={priceValue}>
                      {formatCurrency(alert.currentPrice)}
                    </Text>
                  </Section>

                  {alert.previousPrice !== undefined && (
                    <Section style={priceRow}>
                      <Text style={priceLabel}>Previous Price</Text>
                      <Text style={priceValue}>
                        {formatCurrency(alert.previousPrice)}
                        {alert.changePercent !== undefined && (
                          <span style={getChangeStyle(alert.changePercent)}>
                            {" "}({formatChange(alert.changePercent)})
                          </span>
                        )}
                      </Text>
                    </Section>
                  )}

                  {alert.marketAverage !== undefined && (
                    <Section style={priceRow}>
                      <Text style={priceLabel}>Market Average</Text>
                      <Text style={priceValue}>
                        {formatCurrency(alert.marketAverage)}
                      </Text>
                    </Section>
                  )}

                  {/* Recommendation */}
                  <Section style={recommendationBox}>
                    <Text style={recommendationLabel}>Recommendation</Text>
                    <Text style={recommendationText}>
                      {alert.recommendation}
                    </Text>
                  </Section>

                  {index < groupedAlerts[priority].length - 1 && (
                    <Hr style={hrLight} />
                  )}
                </Section>
              ))}
            </Section>
          ))}

          {/* Call to Action */}
          <Text style={paragraph}>
            <a
              href={`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/admin`}
              style={ctaButton}
            >
              Review in Admin Dashboard
            </a>
          </Text>

          <Hr style={hr} />
          <Text style={footer}>
            Automated Price Intelligence Report — CuratedAscents
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const body: React.CSSProperties = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
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
const hrLight: React.CSSProperties = {
  borderColor: "#e5e7eb",
  margin: "16px 0",
};

const summaryBox: React.CSSProperties = {
  backgroundColor: "#f0fdf4",
  borderRadius: "8px",
  padding: "20px",
  margin: "16px 0",
  border: "1px solid #bbf7d0",
};

const summaryHeading: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: "bold",
  color: "#111827",
  margin: "0",
};

const highPriorityText: React.CSSProperties = {
  color: "#dc2626",
  fontWeight: "bold",
};

const dateRangeText: React.CSSProperties = {
  fontSize: "13px",
  color: "#6b7280",
  margin: "8px 0 0",
};

const groupSection: React.CSSProperties = {
  margin: "24px 0",
};

const groupHeading: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: "bold",
  color: "#6b7280",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
  margin: "0 0 12px",
  borderBottom: "2px solid #e5e7eb",
  paddingBottom: "8px",
};

const alertCard: React.CSSProperties = {
  backgroundColor: "#f8fafc",
  borderRadius: "8px",
  padding: "16px",
  margin: "0 0 12px",
  border: "1px solid #e2e8f0",
};

const serviceName: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: "bold",
  color: "#111827",
  margin: "0 0 8px",
};

const badgeRow: React.CSSProperties = {
  margin: "0 0 12px",
  fontSize: "0",
};

const badgeBase: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: "bold",
  padding: "3px 8px",
  borderRadius: "4px",
  display: "inline-block",
  textTransform: "uppercase" as const,
  letterSpacing: "0.3px",
};

const priceRow: React.CSSProperties = {
  margin: "0 0 4px",
};

const priceLabel: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: "600",
  color: "#6b7280",
  textTransform: "uppercase" as const,
  margin: "0",
  letterSpacing: "0.5px",
};

const priceValue: React.CSSProperties = {
  fontSize: "15px",
  color: "#111827",
  fontWeight: "600",
  margin: "0 0 8px",
};

const changeText: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: "bold",
};

const recommendationBox: React.CSSProperties = {
  backgroundColor: "#fffbeb",
  borderRadius: "6px",
  padding: "10px 12px",
  marginTop: "8px",
  border: "1px solid #fde68a",
};

const recommendationLabel: React.CSSProperties = {
  fontSize: "10px",
  fontWeight: "bold",
  color: "#d97706",
  textTransform: "uppercase" as const,
  margin: "0 0 4px",
  letterSpacing: "0.5px",
};

const recommendationText: React.CSSProperties = {
  fontSize: "13px",
  color: "#92400e",
  margin: "0",
  lineHeight: "1.5",
};

const paragraph: React.CSSProperties = {
  fontSize: "14px",
  lineHeight: "1.6",
  color: "#374151",
  margin: "24px 0 16px",
  textAlign: "center" as const,
};

const ctaButton: React.CSSProperties = {
  backgroundColor: "#0d5e3f",
  color: "#ffffff",
  padding: "12px 24px",
  borderRadius: "6px",
  textDecoration: "none",
  fontWeight: "bold",
  fontSize: "14px",
  display: "inline-block",
};

const footer: React.CSSProperties = {
  fontSize: "12px",
  color: "#9ca3af",
  textAlign: "center" as const,
  margin: "0",
};
