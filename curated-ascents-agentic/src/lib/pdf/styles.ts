import { StyleSheet } from "@react-pdf/renderer";

export const pdfStyles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#1e293b",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: "#10b981",
    paddingBottom: 15,
  },
  brandName: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: "#10b981",
  },
  brandTagline: {
    fontSize: 9,
    color: "#64748b",
    marginTop: 4,
  },
  quoteInfo: {
    textAlign: "right" as const,
  },
  quoteNumber: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#1e293b",
  },
  quoteDate: {
    fontSize: 9,
    color: "#64748b",
    marginTop: 3,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: "#1e293b",
    marginBottom: 8,
    marginTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 4,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 0,
    marginBottom: 10,
  },
  infoItem: {
    width: "50%",
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 8,
    color: "#94a3b8",
    textTransform: "uppercase" as const,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 10,
    color: "#1e293b",
  },
  table: {
    marginTop: 10,
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1e293b",
    color: "#ffffff",
    padding: 8,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
  },
  tableRow: {
    flexDirection: "row",
    padding: 8,
    fontSize: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  tableRowAlt: {
    flexDirection: "row",
    padding: 8,
    fontSize: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
  },
  // Table header columns (white text on dark background)
  colServiceHeader: { width: "35%", color: "#ffffff" },
  colTypeHeader: { width: "20%", color: "#ffffff" },
  colDescHeader: { width: "45%", color: "#ffffff" },
  // Table body columns
  colService: { width: "35%", color: "#1e293b" },
  colType: { width: "20%", color: "#64748b", textTransform: "capitalize" as const },
  colDesc: { width: "45%", color: "#475569", fontSize: 8 },
  // Legacy columns (for backwards compatibility)
  colServiceWide: { width: "35%", color: "#1e293b" },
  colTypeWide: { width: "20%", color: "#64748b" },
  colDescWide: { width: "45%", color: "#475569" },
  totalsSection: {
    marginTop: 15,
    alignItems: "flex-end" as const,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 250,
    paddingVertical: 3,
  },
  totalLabel: {
    fontSize: 10,
    color: "#64748b",
  },
  totalValue: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#1e293b",
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 250,
    paddingVertical: 6,
    borderTopWidth: 2,
    borderTopColor: "#10b981",
    marginTop: 4,
  },
  grandTotalLabel: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: "#1e293b",
  },
  grandTotalValue: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: "#10b981",
  },
  textBlock: {
    fontSize: 9,
    color: "#475569",
    lineHeight: 1.5,
    marginBottom: 5,
  },
  footer: {
    position: "absolute" as const,
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center" as const,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 10,
  },
  footerText: {
    fontSize: 8,
    color: "#94a3b8",
  },
});
