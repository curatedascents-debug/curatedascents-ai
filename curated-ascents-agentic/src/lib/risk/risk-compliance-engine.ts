/**
 * Risk & Compliance Engine
 * Handles travel advisories, weather monitoring, compliance checks, and risk assessments
 */

import { db } from "@/db";
import {
  travelAdvisories,
  weatherAlerts,
  complianceRequirements,
  bookingComplianceChecks,
  emergencyContacts,
  bookingRiskAssessments,
  riskAlertNotifications,
  bookings,
  clients,
  quotes,
  destinations,
} from "@/db/schema";
import { eq, and, gte, lte, or, isNull, desc, sql } from "drizzle-orm";
import { sendEmail } from "@/lib/email/send-email";
import { createElement } from "react";

// ============================================
// TYPES
// ============================================

export type AdvisoryLevel = "level_1_exercise_caution" | "level_2_increased_caution" | "level_3_reconsider_travel" | "level_4_do_not_travel";
export type RiskLevel = "low" | "moderate" | "elevated" | "high" | "critical";
export type AlertSeverity = "watch" | "warning" | "advisory" | "emergency";

export interface RiskFactor {
  factor: string;
  severity: RiskLevel;
  description: string;
  mitigation?: string;
}

export interface RiskAssessmentResult {
  bookingId: number;
  overallRiskScore: number;
  riskLevel: RiskLevel;
  weatherRiskScore: number;
  securityRiskScore: number;
  healthRiskScore: number;
  operationalRiskScore: number;
  complianceRiskScore: number;
  riskFactors: RiskFactor[];
  activeAdvisories: number[];
  activeWeatherAlerts: number[];
  pendingRequirements: number[];
  recommendations: Array<{ action: string; priority: string; description: string }>;
}

// ============================================
// CONSTANTS
// ============================================

const ADVISORY_LEVEL_SCORES: Record<AdvisoryLevel, number> = {
  level_1_exercise_caution: 20,
  level_2_increased_caution: 40,
  level_3_reconsider_travel: 70,
  level_4_do_not_travel: 95,
};

const ALERT_SEVERITY_SCORES: Record<AlertSeverity, number> = {
  watch: 20,
  advisory: 40,
  warning: 70,
  emergency: 95,
};

// ============================================
// TRAVEL ADVISORIES
// ============================================

/**
 * Create or update a travel advisory
 */
export async function createTravelAdvisory(params: {
  country: string;
  region?: string;
  destinationId?: number;
  advisoryLevel: AdvisoryLevel;
  advisoryTitle: string;
  advisoryDescription?: string;
  advisoryType: string;
  source?: string;
  sourceUrl?: string;
  effectiveFrom: Date;
  effectiveTo?: Date;
  impactLevel?: string;
  affectedServices?: string[];
  agencyId?: number;
  createdBy?: string;
}): Promise<{ advisoryId: number }> {
  const [advisory] = await db
    .insert(travelAdvisories)
    .values({
      country: params.country,
      region: params.region,
      destinationId: params.destinationId,
      advisoryLevel: params.advisoryLevel,
      advisoryTitle: params.advisoryTitle,
      advisoryDescription: params.advisoryDescription,
      advisoryType: params.advisoryType,
      source: params.source,
      sourceUrl: params.sourceUrl,
      effectiveFrom: params.effectiveFrom.toISOString().split("T")[0],
      effectiveTo: params.effectiveTo?.toISOString().split("T")[0],
      impactLevel: params.impactLevel || "moderate",
      affectedServices: params.affectedServices,
      isActive: true,
      agencyId: params.agencyId,
      createdBy: params.createdBy,
    })
    .returning({ id: travelAdvisories.id });

  return { advisoryId: advisory.id };
}

/**
 * Get active advisories for a destination
 */
export async function getActiveAdvisories(params: {
  country?: string;
  destinationId?: number;
  date?: Date;
}): Promise<Array<{
  id: number;
  country: string;
  region: string | null;
  advisoryLevel: string;
  advisoryTitle: string;
  advisoryType: string;
  effectiveFrom: string;
  effectiveTo: string | null;
}>> {
  const dateStr = (params.date || new Date()).toISOString().split("T")[0];

  const whereConditions = [
    eq(travelAdvisories.isActive, true),
    lte(travelAdvisories.effectiveFrom, dateStr),
    or(isNull(travelAdvisories.effectiveTo), gte(travelAdvisories.effectiveTo, dateStr))!,
  ];

  if (params.country) {
    whereConditions.push(eq(travelAdvisories.country, params.country));
  }
  if (params.destinationId) {
    whereConditions.push(
      or(
        isNull(travelAdvisories.destinationId),
        eq(travelAdvisories.destinationId, params.destinationId)
      )!
    );
  }

  const advisories = await db
    .select({
      id: travelAdvisories.id,
      country: travelAdvisories.country,
      region: travelAdvisories.region,
      advisoryLevel: travelAdvisories.advisoryLevel,
      advisoryTitle: travelAdvisories.advisoryTitle,
      advisoryType: travelAdvisories.advisoryType,
      effectiveFrom: travelAdvisories.effectiveFrom,
      effectiveTo: travelAdvisories.effectiveTo,
    })
    .from(travelAdvisories)
    .where(and(...whereConditions))
    .orderBy(desc(travelAdvisories.effectiveFrom));

  return advisories;
}

// ============================================
// WEATHER ALERTS
// ============================================

/**
 * Create a weather alert
 */
export async function createWeatherAlert(params: {
  country: string;
  region?: string;
  destinationId?: number;
  alertType: string;
  severity: AlertSeverity;
  alertTitle: string;
  alertDescription?: string;
  weatherData?: Record<string, unknown>;
  expectedStart?: Date;
  expectedEnd?: Date;
  source?: string;
  agencyId?: number;
}): Promise<{ alertId: number }> {
  const [alert] = await db
    .insert(weatherAlerts)
    .values({
      country: params.country,
      region: params.region,
      destinationId: params.destinationId,
      alertType: params.alertType,
      severity: params.severity,
      alertTitle: params.alertTitle,
      alertDescription: params.alertDescription,
      weatherData: params.weatherData,
      expectedStart: params.expectedStart,
      expectedEnd: params.expectedEnd,
      source: params.source,
      isActive: true,
      agencyId: params.agencyId,
    })
    .returning({ id: weatherAlerts.id });

  return { alertId: alert.id };
}

/**
 * Get active weather alerts
 */
export async function getActiveWeatherAlerts(params: {
  country?: string;
  destinationId?: number;
}): Promise<Array<{
  id: number;
  country: string;
  alertType: string;
  severity: string;
  alertTitle: string;
  expectedStart: Date | null;
  expectedEnd: Date | null;
}>> {
  const whereConditions = [eq(weatherAlerts.isActive, true)];

  if (params.country) {
    whereConditions.push(eq(weatherAlerts.country, params.country));
  }
  if (params.destinationId) {
    whereConditions.push(
      or(isNull(weatherAlerts.destinationId), eq(weatherAlerts.destinationId, params.destinationId))!
    );
  }

  const alerts = await db
    .select({
      id: weatherAlerts.id,
      country: weatherAlerts.country,
      alertType: weatherAlerts.alertType,
      severity: weatherAlerts.severity,
      alertTitle: weatherAlerts.alertTitle,
      expectedStart: weatherAlerts.expectedStart,
      expectedEnd: weatherAlerts.expectedEnd,
    })
    .from(weatherAlerts)
    .where(and(...whereConditions))
    .orderBy(desc(weatherAlerts.createdAt));

  return alerts;
}

// ============================================
// COMPLIANCE REQUIREMENTS
// ============================================

/**
 * Create a compliance requirement
 */
export async function createComplianceRequirement(params: {
  country?: string;
  destinationId?: number;
  serviceType?: string;
  requirementType: string;
  requirementName: string;
  description?: string;
  processingDays?: number;
  costEstimate?: number;
  requiredDocuments?: string[];
  applicationProcess?: string;
  issuingAuthority?: string;
  isMandatory?: boolean;
  agencyId?: number;
}): Promise<{ requirementId: number }> {
  const [requirement] = await db
    .insert(complianceRequirements)
    .values({
      country: params.country,
      destinationId: params.destinationId,
      serviceType: params.serviceType,
      requirementType: params.requirementType,
      requirementName: params.requirementName,
      description: params.description,
      processingDays: params.processingDays,
      costEstimate: params.costEstimate?.toString(),
      requiredDocuments: params.requiredDocuments,
      applicationProcess: params.applicationProcess,
      issuingAuthority: params.issuingAuthority,
      isMandatory: params.isMandatory !== false,
      isActive: true,
      agencyId: params.agencyId,
    })
    .returning({ id: complianceRequirements.id });

  return { requirementId: requirement.id };
}

/**
 * Get compliance requirements for a destination
 */
export async function getComplianceRequirements(params: {
  country?: string;
  destinationId?: number;
  requirementType?: string;
}): Promise<Array<{
  id: number;
  requirementType: string;
  requirementName: string;
  description: string | null;
  processingDays: number | null;
  isMandatory: boolean | null;
}>> {
  const whereConditions = [eq(complianceRequirements.isActive, true)];

  if (params.country) {
    whereConditions.push(
      or(isNull(complianceRequirements.country), eq(complianceRequirements.country, params.country))!
    );
  }
  if (params.destinationId) {
    whereConditions.push(
      or(
        isNull(complianceRequirements.destinationId),
        eq(complianceRequirements.destinationId, params.destinationId)
      )!
    );
  }
  if (params.requirementType) {
    whereConditions.push(eq(complianceRequirements.requirementType, params.requirementType));
  }

  const requirements = await db
    .select({
      id: complianceRequirements.id,
      requirementType: complianceRequirements.requirementType,
      requirementName: complianceRequirements.requirementName,
      description: complianceRequirements.description,
      processingDays: complianceRequirements.processingDays,
      isMandatory: complianceRequirements.isMandatory,
    })
    .from(complianceRequirements)
    .where(and(...whereConditions));

  return requirements;
}

/**
 * Create compliance checks for a booking
 */
export async function createBookingComplianceChecks(
  bookingId: number,
  country: string,
  destinationId?: number
): Promise<{ created: number }> {
  // Get applicable requirements
  const requirements = await getComplianceRequirements({ country, destinationId });

  if (requirements.length === 0) {
    return { created: 0 };
  }

  // Get booking details
  const [booking] = await db
    .select({ clientId: bookings.clientId })
    .from(bookings)
    .where(eq(bookings.id, bookingId))
    .limit(1);

  // Create checks
  await db.insert(bookingComplianceChecks).values(
    requirements.map((req) => ({
      bookingId,
      requirementId: req.id,
      clientId: booking?.clientId,
      status: "pending",
    }))
  );

  return { created: requirements.length };
}

/**
 * Update compliance check status
 */
export async function updateComplianceCheck(
  checkId: number,
  params: {
    status?: string;
    documentProvided?: boolean;
    documentName?: string;
    documentReference?: string;
    documentExpiryDate?: Date;
    verifiedBy?: string;
    verificationNotes?: string;
  }
): Promise<{ success: boolean }> {
  const updateData: Record<string, unknown> = { updatedAt: new Date() };

  if (params.status) updateData.status = params.status;
  if (params.documentProvided !== undefined) updateData.documentProvided = params.documentProvided;
  if (params.documentName) updateData.documentName = params.documentName;
  if (params.documentReference) updateData.documentReference = params.documentReference;
  if (params.documentExpiryDate)
    updateData.documentExpiryDate = params.documentExpiryDate.toISOString().split("T")[0];
  if (params.verifiedBy) {
    updateData.verifiedBy = params.verifiedBy;
    updateData.verifiedAt = new Date();
  }
  if (params.verificationNotes) updateData.verificationNotes = params.verificationNotes;

  await db.update(bookingComplianceChecks).set(updateData).where(eq(bookingComplianceChecks.id, checkId));

  return { success: true };
}

// ============================================
// EMERGENCY CONTACTS
// ============================================

/**
 * Get emergency contacts for a location
 */
export async function getEmergencyContacts(params: {
  country: string;
  region?: string;
  destinationId?: number;
  contactType?: string;
}): Promise<Array<{
  id: number;
  contactType: string;
  contactName: string;
  organization: string | null;
  phoneNumber: string | null;
  email: string | null;
  availability: string | null;
  priority: number | null;
}>> {
  const whereConditions = [
    eq(emergencyContacts.country, params.country),
    eq(emergencyContacts.isActive, true),
  ];

  if (params.region) {
    whereConditions.push(
      or(isNull(emergencyContacts.region), eq(emergencyContacts.region, params.region))!
    );
  }
  if (params.destinationId) {
    whereConditions.push(
      or(isNull(emergencyContacts.destinationId), eq(emergencyContacts.destinationId, params.destinationId))!
    );
  }
  if (params.contactType) {
    whereConditions.push(eq(emergencyContacts.contactType, params.contactType));
  }

  const contacts = await db
    .select({
      id: emergencyContacts.id,
      contactType: emergencyContacts.contactType,
      contactName: emergencyContacts.contactName,
      organization: emergencyContacts.organization,
      phoneNumber: emergencyContacts.phoneNumber,
      email: emergencyContacts.email,
      availability: emergencyContacts.availability,
      priority: emergencyContacts.priority,
    })
    .from(emergencyContacts)
    .where(and(...whereConditions))
    .orderBy(emergencyContacts.priority);

  return contacts;
}

// ============================================
// RISK ASSESSMENT
// ============================================

/**
 * Generate comprehensive risk assessment for a booking
 */
export async function generateRiskAssessment(bookingId: number): Promise<RiskAssessmentResult> {
  // Get booking details
  const [booking] = await db
    .select({
      id: bookings.id,
      quoteId: bookings.quoteId,
      startDate: bookings.startDate,
      endDate: bookings.endDate,
      status: bookings.status,
    })
    .from(bookings)
    .where(eq(bookings.id, bookingId))
    .limit(1);

  if (!booking) {
    throw new Error("Booking not found");
  }

  // Get destination info from quote
  let country: string | undefined;
  let destination: string | undefined;

  if (booking.quoteId) {
    const [quote] = await db
      .select({ destination: quotes.destination })
      .from(quotes)
      .where(eq(quotes.id, booking.quoteId))
      .limit(1);

    destination = quote?.destination || undefined;

    // Try to determine country from destination
    if (destination) {
      const destLower = destination.toLowerCase();
      if (destLower.includes("nepal") || destLower.includes("kathmandu") || destLower.includes("everest")) {
        country = "Nepal";
      } else if (destLower.includes("tibet") || destLower.includes("lhasa")) {
        country = "Tibet";
      } else if (destLower.includes("bhutan") || destLower.includes("paro")) {
        country = "Bhutan";
      } else if (destLower.includes("india") || destLower.includes("delhi")) {
        country = "India";
      }
    }
  }

  const riskFactors: RiskFactor[] = [];
  const recommendations: Array<{ action: string; priority: string; description: string }> = [];
  let activeAdvisoryIds: number[] = [];
  let activeAlertIds: number[] = [];
  let pendingRequirementIds: number[] = [];

  // Get active advisories
  const advisories = country
    ? await getActiveAdvisories({ country, date: booking.startDate ? new Date(booking.startDate) : undefined })
    : [];

  activeAdvisoryIds = advisories.map((a) => a.id);

  // Calculate security risk from advisories
  let securityRiskScore = 0;
  for (const advisory of advisories) {
    const level = advisory.advisoryLevel as AdvisoryLevel;
    const score = ADVISORY_LEVEL_SCORES[level] || 0;
    securityRiskScore = Math.max(securityRiskScore, score);

    riskFactors.push({
      factor: `Travel Advisory: ${advisory.advisoryTitle}`,
      severity: score >= 70 ? "high" : score >= 40 ? "moderate" : "low",
      description: `${advisory.advisoryType} advisory for ${advisory.country}`,
      mitigation: "Review advisory details and consider travel insurance",
    });
  }

  // Get active weather alerts
  const weatherAlertsList = country ? await getActiveWeatherAlerts({ country }) : [];
  activeAlertIds = weatherAlertsList.map((a) => a.id);

  // Calculate weather risk
  let weatherRiskScore = 0;
  for (const alert of weatherAlertsList) {
    const severity = alert.severity as AlertSeverity;
    const score = ALERT_SEVERITY_SCORES[severity] || 0;
    weatherRiskScore = Math.max(weatherRiskScore, score);

    riskFactors.push({
      factor: `Weather Alert: ${alert.alertTitle}`,
      severity: score >= 70 ? "high" : score >= 40 ? "moderate" : "low",
      description: `${alert.alertType} ${alert.severity} for ${alert.country}`,
      mitigation: "Monitor weather updates and have contingency plans",
    });
  }

  // Get compliance status
  const complianceChecks = await db
    .select({
      id: bookingComplianceChecks.id,
      status: bookingComplianceChecks.status,
      requirementId: bookingComplianceChecks.requirementId,
    })
    .from(bookingComplianceChecks)
    .where(eq(bookingComplianceChecks.bookingId, bookingId));

  const pendingChecks = complianceChecks.filter((c) => c.status === "pending" || c.status === "in_progress");
  pendingRequirementIds = pendingChecks.map((c) => c.requirementId);

  // Calculate compliance risk
  const complianceRiskScore = complianceChecks.length > 0
    ? (pendingChecks.length / complianceChecks.length) * 80
    : 0;

  if (pendingChecks.length > 0) {
    riskFactors.push({
      factor: `Incomplete Compliance: ${pendingChecks.length} pending`,
      severity: pendingChecks.length > 3 ? "high" : pendingChecks.length > 1 ? "moderate" : "low",
      description: `${pendingChecks.length} compliance requirements pending`,
      mitigation: "Complete required documentation and permits",
    });

    recommendations.push({
      action: "Complete compliance documentation",
      priority: "high",
      description: `${pendingChecks.length} requirements need attention before travel`,
    });
  }

  // Health risk (base level for adventure travel)
  const healthRiskScore = country === "Nepal" ? 30 : country === "Tibet" ? 40 : 20; // Altitude considerations

  // Operational risk (based on booking status and timing)
  let operationalRiskScore = 10;
  if (booking.startDate) {
    const daysUntilTrip = Math.ceil(
      (new Date(booking.startDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    if (daysUntilTrip < 7 && pendingChecks.length > 0) {
      operationalRiskScore = 50;
      recommendations.push({
        action: "Expedite preparations",
        priority: "high",
        description: "Trip starts soon with pending items",
      });
    }
  }

  // Calculate overall risk score
  const weights = {
    weather: 0.25,
    security: 0.25,
    health: 0.15,
    operational: 0.15,
    compliance: 0.20,
  };

  const overallRiskScore =
    weatherRiskScore * weights.weather +
    securityRiskScore * weights.security +
    healthRiskScore * weights.health +
    operationalRiskScore * weights.operational +
    complianceRiskScore * weights.compliance;

  // Determine risk level
  let riskLevel: RiskLevel;
  if (overallRiskScore >= 80) riskLevel = "critical";
  else if (overallRiskScore >= 60) riskLevel = "high";
  else if (overallRiskScore >= 40) riskLevel = "elevated";
  else if (overallRiskScore >= 20) riskLevel = "moderate";
  else riskLevel = "low";

  // Add general recommendations
  if (riskLevel !== "low") {
    recommendations.push({
      action: "Review travel insurance",
      priority: riskLevel === "critical" || riskLevel === "high" ? "high" : "medium",
      description: "Ensure adequate coverage for trip risks",
    });
  }

  // Save assessment
  await db.insert(bookingRiskAssessments).values({
    bookingId,
    assessmentDate: new Date().toISOString().split("T")[0],
    overallRiskScore: overallRiskScore.toFixed(2),
    riskLevel,
    weatherRiskScore: weatherRiskScore.toFixed(2),
    securityRiskScore: securityRiskScore.toFixed(2),
    healthRiskScore: healthRiskScore.toFixed(2),
    operationalRiskScore: operationalRiskScore.toFixed(2),
    complianceRiskScore: complianceRiskScore.toFixed(2),
    riskFactors,
    activeAdvisories: activeAdvisoryIds,
    activeWeatherAlerts: activeAlertIds,
    complianceComplete: pendingChecks.length === 0,
    pendingRequirements: pendingRequirementIds,
    recommendations,
    assessedBy: "system",
  });

  return {
    bookingId,
    overallRiskScore,
    riskLevel,
    weatherRiskScore,
    securityRiskScore,
    healthRiskScore,
    operationalRiskScore,
    complianceRiskScore,
    riskFactors,
    activeAdvisories: activeAdvisoryIds,
    activeWeatherAlerts: activeAlertIds,
    pendingRequirements: pendingRequirementIds,
    recommendations,
  };
}

/**
 * Get latest risk assessment for a booking
 */
export async function getBookingRiskAssessment(bookingId: number) {
  const [assessment] = await db
    .select()
    .from(bookingRiskAssessments)
    .where(eq(bookingRiskAssessments.bookingId, bookingId))
    .orderBy(desc(bookingRiskAssessments.assessmentDate))
    .limit(1);

  return assessment;
}

// ============================================
// NOTIFICATIONS
// ============================================

/**
 * Send risk alert to client
 */
export async function sendRiskAlert(params: {
  bookingId: number;
  alertType: string;
  sourceType?: string;
  sourceId?: number;
  subject: string;
  message: string;
}): Promise<{ sent: boolean; notificationId: number }> {
  const { bookingId, alertType, sourceType, sourceId, subject, message } = params;

  // Get booking and client info
  const [booking] = await db
    .select({
      clientId: bookings.clientId,
      bookingReference: bookings.bookingReference,
    })
    .from(bookings)
    .where(eq(bookings.id, bookingId))
    .limit(1);

  if (!booking || !booking.clientId) {
    // Create notification record but mark as failed
    const [notification] = await db
      .insert(riskAlertNotifications)
      .values({
        alertType,
        sourceType,
        sourceId,
        bookingId,
        notificationChannel: "email",
        subject,
        message,
        status: "failed",
        failureReason: "No client associated with booking",
      })
      .returning({ id: riskAlertNotifications.id });

    return { sent: false, notificationId: notification.id };
  }

  const [client] = await db
    .select({ email: clients.email, name: clients.name })
    .from(clients)
    .where(eq(clients.id, booking.clientId))
    .limit(1);

  if (!client?.email) {
    const [notification] = await db
      .insert(riskAlertNotifications)
      .values({
        alertType,
        sourceType,
        sourceId,
        bookingId,
        clientId: booking.clientId,
        notificationChannel: "email",
        subject,
        message,
        status: "failed",
        failureReason: "No email for client",
      })
      .returning({ id: riskAlertNotifications.id });

    return { sent: false, notificationId: notification.id };
  }

  // Create notification record
  const [notification] = await db
    .insert(riskAlertNotifications)
    .values({
      alertType,
      sourceType,
      sourceId,
      bookingId,
      clientId: booking.clientId,
      notificationChannel: "email",
      subject,
      message,
      status: "pending",
    })
    .returning({ id: riskAlertNotifications.id });

  // Send email
  try {
    await sendEmail({
      to: client.email,
      subject: `${subject} — ${booking.bookingReference}`,
      react: createElement("div", {
        style: { fontFamily: "Arial, sans-serif", maxWidth: "600px", margin: "0 auto" },
        children: [
          createElement("h2", { key: "h2", style: { color: "#dc2626" } }, subject),
          createElement("p", { key: "p1" }, `Dear ${client.name || "Valued Customer"},`),
          createElement("div", {
            key: "content",
            style: { backgroundColor: "#fef2f2", padding: "16px", borderLeft: "4px solid #dc2626", margin: "16px 0" },
            dangerouslySetInnerHTML: { __html: message.replace(/\n/g, "<br>") },
          }),
          createElement("p", { key: "p2" }, "Please contact us if you have any concerns or questions."),
          createElement("p", { key: "p3" }, "Best regards,"),
          createElement("p", { key: "p4", style: { fontWeight: "bold" } }, "CuratedAscents Team"),
        ],
      }),
      logContext: {
        templateType: "risk_alert",
        toName: client.name || undefined,
        clientId: booking.clientId,
        bookingId,
        metadata: { alertType, sourceType, sourceId },
      },
    });

    await db
      .update(riskAlertNotifications)
      .set({ status: "sent", sentAt: new Date() })
      .where(eq(riskAlertNotifications.id, notification.id));

    return { sent: true, notificationId: notification.id };
  } catch (error) {
    await db
      .update(riskAlertNotifications)
      .set({
        status: "failed",
        failureReason: error instanceof Error ? error.message : "Unknown error",
      })
      .where(eq(riskAlertNotifications.id, notification.id));

    return { sent: false, notificationId: notification.id };
  }
}

/**
 * Process risk assessments for upcoming trips
 */
export async function processUpcomingTripRisks(daysAhead: number = 30): Promise<{
  processed: number;
  highRiskCount: number;
  alertsSent: number;
}> {
  const today = new Date();
  const futureDate = new Date(today.getTime() + daysAhead * 24 * 60 * 60 * 1000);

  // Get bookings starting within the period
  const upcomingBookings = await db
    .select({ id: bookings.id, bookingReference: bookings.bookingReference })
    .from(bookings)
    .where(
      and(
        gte(bookings.startDate, today.toISOString().split("T")[0]),
        lte(bookings.startDate, futureDate.toISOString().split("T")[0]),
        sql`${bookings.status} NOT IN ('cancelled', 'completed')`
      )
    );

  let processed = 0;
  let highRiskCount = 0;
  let alertsSent = 0;

  for (const booking of upcomingBookings) {
    try {
      const assessment = await generateRiskAssessment(booking.id);
      processed++;

      if (assessment.riskLevel === "high" || assessment.riskLevel === "critical") {
        highRiskCount++;

        // Send alert for high risk
        const result = await sendRiskAlert({
          bookingId: booking.id,
          alertType: "risk_assessment",
          subject: `Important: Risk Alert for Your Upcoming Trip`,
          message: `Our risk assessment has identified elevated concerns for your upcoming trip (${booking.bookingReference}).

Risk Level: ${assessment.riskLevel.toUpperCase()}

Key Factors:
${assessment.riskFactors.map((f) => `• ${f.factor}: ${f.description}`).join("\n")}

Recommendations:
${assessment.recommendations.map((r) => `• ${r.action}: ${r.description}`).join("\n")}

Please contact our team to discuss these concerns and any adjustments to your itinerary.`,
        });

        if (result.sent) alertsSent++;
      }
    } catch (error) {
      console.error(`Error processing risk for booking ${booking.id}:`, error);
    }
  }

  return { processed, highRiskCount, alertsSent };
}
