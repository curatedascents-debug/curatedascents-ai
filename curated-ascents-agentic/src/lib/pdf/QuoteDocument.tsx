import React from "react";
import { Document, Page, Text, View } from "@react-pdf/renderer";
import { pdfStyles as styles } from "./styles";

interface QuoteData {
  quoteNumber: string;
  quoteName?: string;
  destination?: string;
  clientName?: string;
  clientEmail?: string;
  numberOfPax?: number;
  numberOfRooms?: number;
  startDate?: string;
  endDate?: string;
  validUntil?: string;
  totalSellPrice?: string;
  perPersonPrice?: string;
  currency?: string;
  inclusionsSummary?: string;
  exclusionsSummary?: string;
  termsConditions?: string;
  notes?: string;
  createdAt?: string;
}

interface QuoteItem {
  serviceName?: string;
  serviceType: string;
  description?: string;
  quantity?: number;
  days?: number;
  nights?: number;
  sellPrice?: string;
  notes?: string;
}

interface QuoteDocumentProps {
  quote: QuoteData;
  items: QuoteItem[];
}

export default function QuoteDocument({ quote, items }: QuoteDocumentProps) {
  const formatDate = (d?: string) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (val?: string) => {
    if (!val) return "$0";
    return `$${parseFloat(val).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandName}>CuratedAscents</Text>
            <Text style={styles.brandTagline}>Luxury Adventure Travel - Nepal | Tibet | Bhutan | India</Text>
          </View>
          <View style={styles.quoteInfo}>
            <Text style={styles.quoteNumber}>{quote.quoteNumber}</Text>
            <Text style={styles.quoteDate}>Date: {formatDate(quote.createdAt)}</Text>
            {quote.validUntil && (
              <Text style={styles.quoteDate}>Valid Until: {formatDate(quote.validUntil)}</Text>
            )}
          </View>
        </View>

        {/* Client & Trip Info */}
        <Text style={styles.sectionTitle}>Trip Details</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Client</Text>
            <Text style={styles.infoValue}>{quote.clientName || quote.clientEmail || "Walk-in"}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Destination</Text>
            <Text style={styles.infoValue}>{quote.destination || "-"}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Travelers</Text>
            <Text style={styles.infoValue}>{quote.numberOfPax || "-"} pax</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Travel Dates</Text>
            <Text style={styles.infoValue}>
              {quote.startDate && quote.endDate
                ? `${formatDate(quote.startDate)} - ${formatDate(quote.endDate)}`
                : "-"}
            </Text>
          </View>
          {quote.quoteName && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Trip Name</Text>
              <Text style={styles.infoValue}>{quote.quoteName}</Text>
            </View>
          )}
        </View>

        {/* Services Included */}
        <Text style={styles.sectionTitle}>Services Included</Text>
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={styles.colServiceHeader}>Service</Text>
            <Text style={styles.colTypeHeader}>Type</Text>
            <Text style={styles.colDescHeader}>Description</Text>
          </View>

          {/* Table Rows - No pricing shown to client */}
          {items.map((item, index) => {
            const qty = item.quantity || 1;
            const qtyText = qty > 1 ? ` (x${qty})` : "";

            // Build description from available fields
            let description = item.description || "";
            if (item.days) description += description ? ` - ${item.days} days` : `${item.days} days`;
            if (item.nights) description += description ? `, ${item.nights} nights` : `${item.nights} nights`;
            if (item.notes && item.notes !== item.description) {
              description += description ? ` | ${item.notes}` : item.notes;
            }

            return (
              <View key={index} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                <Text style={styles.colService}>
                  {(item.serviceName || "-") + qtyText}
                </Text>
                <Text style={styles.colType}>
                  {item.serviceType?.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()) || "-"}
                </Text>
                <Text style={styles.colDesc}>
                  {description || "-"}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Totals - Only grand total visible to client */}
        <View style={styles.totalsSection}>
          {quote.perPersonPrice && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Per Person:</Text>
              <Text style={styles.totalValue}>{formatCurrency(quote.perPersonPrice)}</Text>
            </View>
          )}
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Total ({quote.currency || "USD"}):</Text>
            <Text style={styles.grandTotalValue}>{formatCurrency(quote.totalSellPrice)}</Text>
          </View>
        </View>

        {/* Inclusions */}
        {quote.inclusionsSummary && (
          <>
            <Text style={styles.sectionTitle}>Inclusions</Text>
            <Text style={styles.textBlock}>{quote.inclusionsSummary}</Text>
          </>
        )}

        {/* Exclusions */}
        {quote.exclusionsSummary && (
          <>
            <Text style={styles.sectionTitle}>Exclusions</Text>
            <Text style={styles.textBlock}>{quote.exclusionsSummary}</Text>
          </>
        )}

        {/* Terms */}
        {quote.termsConditions && (
          <>
            <Text style={styles.sectionTitle}>Terms & Conditions</Text>
            <Text style={styles.textBlock}>{quote.termsConditions}</Text>
          </>
        )}

        {/* Notes */}
        {quote.notes && (
          <>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.textBlock}>{quote.notes}</Text>
          </>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            CuratedAscents | Luxury Adventure Travel | curatedascents.com
          </Text>
          <Text style={styles.footerText}>
            This quote is subject to availability. Prices may vary based on season and group size.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
