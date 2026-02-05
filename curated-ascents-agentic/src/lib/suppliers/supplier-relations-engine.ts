/**
 * Supplier Relations Engine
 * Handles automated supplier communications, performance tracking, and ranking management
 */

import { db } from "@/db";
import {
  suppliers,
  supplierPerformance,
  supplierCommunications,
  supplierRateRequests,
  supplierIssues,
  supplierRankings,
  supplierConfirmationRequests,
  bookings,
  destinations,
} from "@/db/schema";
import { eq, and, gte, lte, sql, desc, isNull, or } from "drizzle-orm";
import { sendEmail } from "@/lib/email/send-email";
import { SupplierCommunicationEmail } from "@/lib/email/templates/supplier-communication";
import { createElement } from "react";

// ============================================
// TYPES
// ============================================

export interface SupplierPerformanceMetrics {
  supplierId: number;
  totalRequests: number;
  respondedRequests: number;
  confirmedRequests: number;
  declinedRequests: number;
  avgResponseTimeHours: number;
  confirmationRate: number;
  onTimeDeliveryRate: number;
  performanceScore: number;
  reliabilityScore: number;
  qualityScore: number;
  overallScore: number;
  performanceTier: "premium" | "standard" | "probation";
}

export interface CommunicationRequest {
  supplierId: number;
  communicationType: string;
  subject: string;
  message: string;
  channel?: string;
  bookingId?: number;
  quoteId?: number;
  confirmationRequestId?: number;
  responseRequired?: boolean;
  responseDeadline?: Date;
  attachments?: Array<{ name: string; url: string; type: string }>;
  agencyId?: number;
  sentBy?: string;
}

export interface RateRequestParams {
  supplierId: number;
  requestType: string;
  serviceTypes: string[];
  validFrom: Date;
  validTo: Date;
  priority?: string;
  agencyId?: number;
  sentBy?: string;
}

// ============================================
// CONSTANTS
// ============================================

const PERFORMANCE_WEIGHTS = {
  responseTime: 0.25,
  confirmationRate: 0.25,
  onTimeDelivery: 0.20,
  issueRate: 0.15,
  reliability: 0.15,
};

const TIER_THRESHOLDS = {
  premium: 85,
  standard: 60,
  probation: 0,
};

// ============================================
// PERFORMANCE CALCULATION
// ============================================

/**
 * Calculate supplier performance metrics for a period
 */
export async function calculateSupplierPerformance(
  supplierId: number,
  periodStart: Date,
  periodEnd: Date,
  agencyId?: number
): Promise<SupplierPerformanceMetrics> {
  const startStr = periodStart.toISOString().split("T")[0];
  const endStr = periodEnd.toISOString().split("T")[0];

  // Get confirmation requests in period
  const confirmationRequests = await db
    .select()
    .from(supplierConfirmationRequests)
    .innerJoin(bookings, eq(supplierConfirmationRequests.bookingId, bookings.id))
    .where(
      and(
        eq(supplierConfirmationRequests.supplierId, supplierId),
        gte(supplierConfirmationRequests.createdAt, periodStart),
        lte(supplierConfirmationRequests.createdAt, periodEnd)
      )
    );

  const totalRequests = confirmationRequests.length;
  const respondedRequests = confirmationRequests.filter(
    (r) => r.supplier_confirmation_requests.status !== "pending"
  ).length;
  const confirmedRequests = confirmationRequests.filter(
    (r) => r.supplier_confirmation_requests.status === "confirmed"
  ).length;
  const declinedRequests = confirmationRequests.filter(
    (r) => r.supplier_confirmation_requests.status === "declined"
  ).length;

  // Calculate response times
  const responseTimes = confirmationRequests
    .filter((r) => r.supplier_confirmation_requests.sentAt && r.supplier_confirmation_requests.confirmedAt)
    .map((r) => {
      const sent = new Date(r.supplier_confirmation_requests.sentAt!);
      const confirmed = new Date(r.supplier_confirmation_requests.confirmedAt!);
      return (confirmed.getTime() - sent.getTime()) / (1000 * 60 * 60); // hours
    });

  const avgResponseTimeHours =
    responseTimes.length > 0
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : 0;

  // Calculate rates
  const confirmationRate = totalRequests > 0 ? (confirmedRequests / totalRequests) * 100 : 0;

  // Get issues in period
  const [issueStats] = await db
    .select({
      total: sql<number>`COUNT(*)::int`,
      resolved: sql<number>`COUNT(*) FILTER (WHERE status = 'resolved' OR status = 'closed')::int`,
    })
    .from(supplierIssues)
    .where(
      and(
        eq(supplierIssues.supplierId, supplierId),
        gte(supplierIssues.createdAt, periodStart),
        lte(supplierIssues.createdAt, periodEnd)
      )
    );

  const issueRate = totalRequests > 0 ? ((issueStats?.total || 0) / totalRequests) * 100 : 0;

  // Calculate scores (0-100)
  // Response time score: faster = better (24hr = 100, 72hr = 50, 168hr+ = 0)
  const responseTimeScore = Math.max(0, Math.min(100, 100 - (avgResponseTimeHours / 168) * 100));

  // Confirmation rate score: direct percentage
  const confirmationRateScore = confirmationRate;

  // Issue rate score: lower = better (0% = 100, 10% = 0)
  const issueRateScore = Math.max(0, 100 - issueRate * 10);

  // On-time delivery (assume 90% for now, would need actual data)
  const onTimeDeliveryRate = 90;
  const onTimeDeliveryScore = onTimeDeliveryRate;

  // Reliability score based on response consistency
  const reliabilityScore =
    totalRequests > 0 ? (respondedRequests / totalRequests) * 100 : 50;

  // Calculate weighted scores
  const performanceScore =
    responseTimeScore * PERFORMANCE_WEIGHTS.responseTime +
    confirmationRateScore * PERFORMANCE_WEIGHTS.confirmationRate +
    onTimeDeliveryScore * PERFORMANCE_WEIGHTS.onTimeDelivery +
    issueRateScore * PERFORMANCE_WEIGHTS.issueRate +
    reliabilityScore * PERFORMANCE_WEIGHTS.reliability;

  const qualityScore = (issueRateScore + onTimeDeliveryScore) / 2;
  const overallScore = performanceScore;

  // Determine tier
  let performanceTier: "premium" | "standard" | "probation";
  if (overallScore >= TIER_THRESHOLDS.premium) {
    performanceTier = "premium";
  } else if (overallScore >= TIER_THRESHOLDS.standard) {
    performanceTier = "standard";
  } else {
    performanceTier = "probation";
  }

  return {
    supplierId,
    totalRequests,
    respondedRequests,
    confirmedRequests,
    declinedRequests,
    avgResponseTimeHours,
    confirmationRate,
    onTimeDeliveryRate,
    performanceScore,
    reliabilityScore,
    qualityScore,
    overallScore,
    performanceTier,
  };
}

/**
 * Save supplier performance metrics to database
 */
export async function saveSupplierPerformance(
  metrics: SupplierPerformanceMetrics,
  periodStart: Date,
  periodEnd: Date,
  agencyId?: number
): Promise<{ performanceId: number }> {
  const [existing] = await db
    .select()
    .from(supplierPerformance)
    .where(
      and(
        eq(supplierPerformance.supplierId, metrics.supplierId),
        eq(supplierPerformance.periodStart, periodStart.toISOString().split("T")[0]),
        eq(supplierPerformance.periodEnd, periodEnd.toISOString().split("T")[0]),
        agencyId ? eq(supplierPerformance.agencyId, agencyId) : isNull(supplierPerformance.agencyId)
      )
    )
    .limit(1);

  const data = {
    totalRequests: metrics.totalRequests,
    respondedRequests: metrics.respondedRequests,
    confirmedRequests: metrics.confirmedRequests,
    declinedRequests: metrics.declinedRequests,
    avgResponseTimeHours: metrics.avgResponseTimeHours.toString(),
    confirmationRate: metrics.confirmationRate.toString(),
    onTimeDeliveryRate: metrics.onTimeDeliveryRate.toString(),
    performanceScore: metrics.performanceScore.toString(),
    reliabilityScore: metrics.reliabilityScore.toString(),
    qualityScore: metrics.qualityScore.toString(),
    overallScore: metrics.overallScore.toString(),
    performanceTier: metrics.performanceTier,
    calculatedAt: new Date(),
    updatedAt: new Date(),
  };

  if (existing) {
    await db
      .update(supplierPerformance)
      .set(data)
      .where(eq(supplierPerformance.id, existing.id));
    return { performanceId: existing.id };
  } else {
    const [result] = await db
      .insert(supplierPerformance)
      .values({
        supplierId: metrics.supplierId,
        periodStart: periodStart.toISOString().split("T")[0],
        periodEnd: periodEnd.toISOString().split("T")[0],
        agencyId,
        ...data,
      })
      .returning({ id: supplierPerformance.id });
    return { performanceId: result.id };
  }
}

/**
 * Get supplier performance for display
 */
export async function getSupplierPerformance(
  supplierId: number,
  agencyId?: number
): Promise<{
  current: SupplierPerformanceMetrics | null;
  history: Array<{ periodStart: string; periodEnd: string; overallScore: number; tier: string }>;
}> {
  // Get most recent performance record
  const [current] = await db
    .select()
    .from(supplierPerformance)
    .where(
      and(
        eq(supplierPerformance.supplierId, supplierId),
        agencyId ? eq(supplierPerformance.agencyId, agencyId) : sql`1=1`
      )
    )
    .orderBy(desc(supplierPerformance.periodEnd))
    .limit(1);

  // Get history (last 12 periods)
  const history = await db
    .select({
      periodStart: supplierPerformance.periodStart,
      periodEnd: supplierPerformance.periodEnd,
      overallScore: supplierPerformance.overallScore,
      tier: supplierPerformance.performanceTier,
    })
    .from(supplierPerformance)
    .where(
      and(
        eq(supplierPerformance.supplierId, supplierId),
        agencyId ? eq(supplierPerformance.agencyId, agencyId) : sql`1=1`
      )
    )
    .orderBy(desc(supplierPerformance.periodEnd))
    .limit(12);

  return {
    current: current
      ? {
          supplierId: current.supplierId,
          totalRequests: current.totalRequests || 0,
          respondedRequests: current.respondedRequests || 0,
          confirmedRequests: current.confirmedRequests || 0,
          declinedRequests: current.declinedRequests || 0,
          avgResponseTimeHours: parseFloat(current.avgResponseTimeHours || "0"),
          confirmationRate: parseFloat(current.confirmationRate || "0"),
          onTimeDeliveryRate: parseFloat(current.onTimeDeliveryRate || "0"),
          performanceScore: parseFloat(current.performanceScore || "0"),
          reliabilityScore: parseFloat(current.reliabilityScore || "0"),
          qualityScore: parseFloat(current.qualityScore || "0"),
          overallScore: parseFloat(current.overallScore || "0"),
          performanceTier: (current.performanceTier as "premium" | "standard" | "probation") || "standard",
        }
      : null,
    history: history.map((h) => ({
      periodStart: h.periodStart,
      periodEnd: h.periodEnd,
      overallScore: parseFloat(h.overallScore || "0"),
      tier: h.tier || "standard",
    })),
  };
}

// ============================================
// SUPPLIER COMMUNICATIONS
// ============================================

/**
 * Send communication to supplier and log it
 */
export async function sendSupplierCommunication(
  params: CommunicationRequest
): Promise<{ communicationId: number; sent: boolean; error?: string }> {
  const {
    supplierId,
    communicationType,
    subject,
    message,
    channel = "email",
    bookingId,
    quoteId,
    confirmationRequestId,
    responseRequired = false,
    responseDeadline,
    attachments,
    agencyId,
    sentBy,
  } = params;

  // Get supplier details
  const [supplier] = await db
    .select()
    .from(suppliers)
    .where(eq(suppliers.id, supplierId))
    .limit(1);

  if (!supplier) {
    return { communicationId: 0, sent: false, error: "Supplier not found" };
  }

  // Determine recipient email based on communication type
  let recipientEmail = supplier.reservationEmail || supplier.salesEmail;
  let recipientName = supplier.name;

  if (communicationType === "rate_request") {
    recipientEmail = supplier.salesEmail || supplier.reservationEmail;
  } else if (communicationType === "booking_request" || communicationType === "confirmation_request") {
    recipientEmail = supplier.reservationEmail || supplier.salesEmail;
  }

  if (!recipientEmail) {
    // Try to get from contacts
    const contacts = supplier.contacts as Array<{
      name: string;
      email: string;
      isPrimary: boolean;
    }> | null;

    if (contacts && contacts.length > 0) {
      const primaryContact = contacts.find((c) => c.isPrimary) || contacts[0];
      recipientEmail = primaryContact.email;
      recipientName = primaryContact.name;
    }
  }

  if (!recipientEmail) {
    return { communicationId: 0, sent: false, error: "No email address found for supplier" };
  }

  // Create communication record
  const [communication] = await db
    .insert(supplierCommunications)
    .values({
      supplierId,
      communicationType,
      bookingId,
      quoteId,
      confirmationRequestId,
      subject,
      message,
      channel,
      direction: "outbound",
      status: "draft",
      recipientEmail,
      recipientName,
      responseRequired,
      responseDeadline,
      attachments,
      agencyId,
      sentBy,
    })
    .returning({ id: supplierCommunications.id });

  // Send email if channel is email
  if (channel === "email") {
    try {
      const result = await sendEmail({
        to: recipientEmail,
        subject,
        react: createElement(SupplierCommunicationEmail, {
          recipientName,
          subject,
          message,
        }),
      });

      if (result.sent) {
        await db
          .update(supplierCommunications)
          .set({
            status: "sent",
            sentAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(supplierCommunications.id, communication.id));

        return { communicationId: communication.id, sent: true };
      } else {
        await db
          .update(supplierCommunications)
          .set({
            status: "failed",
            updatedAt: new Date(),
          })
          .where(eq(supplierCommunications.id, communication.id));

        return { communicationId: communication.id, sent: false, error: result.error };
      }
    } catch (error) {
      await db
        .update(supplierCommunications)
        .set({
          status: "failed",
          updatedAt: new Date(),
        })
        .where(eq(supplierCommunications.id, communication.id));

      return {
        communicationId: communication.id,
        sent: false,
        error: error instanceof Error ? error.message : "Failed to send email",
      };
    }
  }

  return { communicationId: communication.id, sent: true };
}

/**
 * Log incoming supplier communication
 */
export async function logIncomingCommunication(params: {
  supplierId: number;
  communicationType: string;
  subject?: string;
  message: string;
  channel: string;
  bookingId?: number;
  confirmationRequestId?: number;
  senderEmail?: string;
  senderName?: string;
  agencyId?: number;
}): Promise<{ communicationId: number }> {
  const [communication] = await db
    .insert(supplierCommunications)
    .values({
      supplierId: params.supplierId,
      communicationType: params.communicationType,
      bookingId: params.bookingId,
      confirmationRequestId: params.confirmationRequestId,
      subject: params.subject,
      message: params.message,
      channel: params.channel,
      direction: "inbound",
      status: "delivered",
      recipientEmail: params.senderEmail,
      recipientName: params.senderName,
      agencyId: params.agencyId,
    })
    .returning({ id: supplierCommunications.id });

  return { communicationId: communication.id };
}

// ============================================
// RATE REQUESTS
// ============================================

/**
 * Create and send a rate request to supplier
 */
export async function createRateRequest(
  params: RateRequestParams
): Promise<{ requestId: number; sent: boolean; error?: string }> {
  const {
    supplierId,
    requestType,
    serviceTypes,
    validFrom,
    validTo,
    priority = "normal",
    agencyId,
    sentBy,
  } = params;

  // Get supplier
  const [supplier] = await db
    .select()
    .from(suppliers)
    .where(eq(suppliers.id, supplierId))
    .limit(1);

  if (!supplier) {
    return { requestId: 0, sent: false, error: "Supplier not found" };
  }

  const recipientEmail = supplier.salesEmail || supplier.reservationEmail;
  if (!recipientEmail) {
    return { requestId: 0, sent: false, error: "No email address found for supplier" };
  }

  // Create rate request record
  const [request] = await db
    .insert(supplierRateRequests)
    .values({
      supplierId,
      requestType,
      serviceTypes,
      validFrom: validFrom.toISOString().split("T")[0],
      validTo: validTo.toISOString().split("T")[0],
      status: "pending",
      priority,
      agencyId,
      sentBy,
    })
    .returning({ id: supplierRateRequests.id });

  // Send email
  const subject = `Rate Request: ${requestType.replace(/_/g, " ")} for ${validFrom.toLocaleDateString()} - ${validTo.toLocaleDateString()}`;
  const message = `
We would like to request your rates for the following:

<strong>Rate Type:</strong> ${requestType.replace(/_/g, " ")}
<strong>Service Types:</strong> ${serviceTypes.join(", ")}
<strong>Valid Period:</strong> ${validFrom.toLocaleDateString()} to ${validTo.toLocaleDateString()}
<strong>Priority:</strong> ${priority}

Please provide us with your updated rates at your earliest convenience.

If you have any questions, please don't hesitate to reach out.
  `.trim();

  const commResult = await sendSupplierCommunication({
    supplierId,
    communicationType: "rate_request",
    subject,
    message,
    responseRequired: true,
    responseDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    agencyId,
    sentBy,
  });

  if (commResult.sent) {
    await db
      .update(supplierRateRequests)
      .set({
        status: "sent",
        sentAt: new Date(),
        sentTo: recipientEmail,
        updatedAt: new Date(),
      })
      .where(eq(supplierRateRequests.id, request.id));
  }

  return {
    requestId: request.id,
    sent: commResult.sent,
    error: commResult.error,
  };
}

/**
 * Send reminder for pending rate request
 */
export async function sendRateRequestReminder(
  requestId: number
): Promise<{ sent: boolean; error?: string }> {
  const [request] = await db
    .select()
    .from(supplierRateRequests)
    .where(eq(supplierRateRequests.id, requestId))
    .limit(1);

  if (!request) {
    return { sent: false, error: "Rate request not found" };
  }

  if (request.status !== "sent") {
    return { sent: false, error: "Rate request not in sent status" };
  }

  const [supplier] = await db
    .select()
    .from(suppliers)
    .where(eq(suppliers.id, request.supplierId))
    .limit(1);

  if (!supplier) {
    return { sent: false, error: "Supplier not found" };
  }

  const subject = `Reminder: Rate Request Pending - ${request.requestType?.replace(/_/g, " ")}`;
  const message = `
This is a friendly reminder about our rate request sent on ${request.sentAt?.toLocaleDateString()}.

<strong>Rate Type:</strong> ${request.requestType?.replace(/_/g, " ")}
<strong>Valid Period:</strong> ${request.validFrom} to ${request.validTo}

We would appreciate your response at your earliest convenience.
  `.trim();

  const result = await sendSupplierCommunication({
    supplierId: request.supplierId,
    communicationType: "followup",
    subject,
    message,
    agencyId: request.agencyId || undefined,
  });

  if (result.sent) {
    await db
      .update(supplierRateRequests)
      .set({
        reminderCount: (request.reminderCount || 0) + 1,
        lastReminderAt: new Date(),
        nextReminderAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
        updatedAt: new Date(),
      })
      .where(eq(supplierRateRequests.id, requestId));
  }

  return { sent: result.sent, error: result.error };
}

// ============================================
// SUPPLIER ISSUES
// ============================================

/**
 * Report a supplier issue
 */
export async function reportSupplierIssue(params: {
  supplierId: number;
  issueType: string;
  severity: string;
  description: string;
  bookingId?: number;
  confirmationRequestId?: number;
  financialImpact?: number;
  clientImpacted?: boolean;
  reportedBy?: string;
  agencyId?: number;
}): Promise<{ issueId: number }> {
  const [issue] = await db
    .insert(supplierIssues)
    .values({
      supplierId: params.supplierId,
      issueType: params.issueType,
      severity: params.severity,
      description: params.description,
      bookingId: params.bookingId,
      confirmationRequestId: params.confirmationRequestId,
      financialImpact: params.financialImpact?.toString(),
      clientImpacted: params.clientImpacted || false,
      reportedBy: params.reportedBy,
      agencyId: params.agencyId,
      status: "open",
    })
    .returning({ id: supplierIssues.id });

  return { issueId: issue.id };
}

/**
 * Resolve a supplier issue
 */
export async function resolveSupplierIssue(
  issueId: number,
  resolution: string,
  compensationProvided?: boolean,
  compensationAmount?: number,
  resolvedBy?: string
): Promise<{ success: boolean }> {
  await db
    .update(supplierIssues)
    .set({
      status: "resolved",
      resolution,
      compensationProvided: compensationProvided || false,
      compensationAmount: compensationAmount?.toString(),
      resolvedAt: new Date(),
      resolvedBy,
      updatedAt: new Date(),
    })
    .where(eq(supplierIssues.id, issueId));

  return { success: true };
}

// ============================================
// SUPPLIER RANKINGS
// ============================================

/**
 * Update supplier rankings for a service type
 */
export async function updateSupplierRankings(
  serviceType: string,
  destinationId?: number,
  agencyId?: number
): Promise<{ rankingId: number }> {
  // Get all suppliers that provide this service type
  const suppliersList = await db
    .select({
      id: suppliers.id,
      name: suppliers.name,
      type: suppliers.type,
    })
    .from(suppliers)
    .where(eq(suppliers.type, serviceType));

  // Get performance scores for each supplier
  const rankedSuppliers: Array<{
    supplierId: number;
    rank: number;
    score: number;
    name: string;
  }> = [];

  for (const supplier of suppliersList) {
    const performance = await getSupplierPerformance(supplier.id, agencyId);
    const score = performance.current?.overallScore || 50; // Default score

    rankedSuppliers.push({
      supplierId: supplier.id,
      rank: 0, // Will be set after sorting
      score,
      name: supplier.name,
    });
  }

  // Sort by score descending and assign ranks
  rankedSuppliers.sort((a, b) => b.score - a.score);
  rankedSuppliers.forEach((s, index) => {
    s.rank = index + 1;
  });

  // Check if ranking exists
  const [existing] = await db
    .select()
    .from(supplierRankings)
    .where(
      and(
        eq(supplierRankings.serviceType, serviceType),
        destinationId
          ? eq(supplierRankings.destinationId, destinationId)
          : isNull(supplierRankings.destinationId),
        agencyId
          ? eq(supplierRankings.agencyId, agencyId)
          : isNull(supplierRankings.agencyId)
      )
    )
    .limit(1);

  if (existing) {
    await db
      .update(supplierRankings)
      .set({
        rankedSuppliers,
        lastCalculatedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(supplierRankings.id, existing.id));
    return { rankingId: existing.id };
  } else {
    const [ranking] = await db
      .insert(supplierRankings)
      .values({
        serviceType,
        destinationId,
        agencyId,
        rankedSuppliers,
        isAutoCalculated: true,
        lastCalculatedAt: new Date(),
      })
      .returning({ id: supplierRankings.id });
    return { rankingId: ranking.id };
  }
}

/**
 * Get ranked suppliers for a service type
 */
export async function getRankedSuppliers(
  serviceType: string,
  destinationId?: number,
  agencyId?: number
): Promise<Array<{ supplierId: number; rank: number; score: number; name: string }>> {
  const [ranking] = await db
    .select()
    .from(supplierRankings)
    .where(
      and(
        eq(supplierRankings.serviceType, serviceType),
        destinationId
          ? eq(supplierRankings.destinationId, destinationId)
          : isNull(supplierRankings.destinationId),
        agencyId
          ? eq(supplierRankings.agencyId, agencyId)
          : isNull(supplierRankings.agencyId)
      )
    )
    .limit(1);

  if (!ranking) {
    return [];
  }

  return (ranking.rankedSuppliers as Array<{
    supplierId: number;
    rank: number;
    score: number;
    name: string;
  }>) || [];
}

// ============================================
// BULK OPERATIONS
// ============================================

/**
 * Calculate performance for all active suppliers
 */
export async function calculateAllSupplierPerformance(
  periodStart: Date,
  periodEnd: Date,
  agencyId?: number
): Promise<{ processed: number; errors: number }> {
  const suppliersList = await db.select({ id: suppliers.id }).from(suppliers);

  let processed = 0;
  let errors = 0;

  for (const supplier of suppliersList) {
    try {
      const metrics = await calculateSupplierPerformance(
        supplier.id,
        periodStart,
        periodEnd,
        agencyId
      );
      await saveSupplierPerformance(metrics, periodStart, periodEnd, agencyId);
      processed++;
    } catch (error) {
      console.error(`Error calculating performance for supplier ${supplier.id}:`, error);
      errors++;
    }
  }

  return { processed, errors };
}

/**
 * Send follow-up for pending confirmation requests
 */
export async function sendPendingConfirmationFollowups(
  olderThanHours: number = 48
): Promise<{ sent: number; errors: number }> {
  const cutoff = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);

  const pendingRequests = await db
    .select()
    .from(supplierConfirmationRequests)
    .innerJoin(bookings, eq(supplierConfirmationRequests.bookingId, bookings.id))
    .where(
      and(
        eq(supplierConfirmationRequests.status, "sent"),
        lte(supplierConfirmationRequests.sentAt, cutoff)
      )
    );

  let sent = 0;
  let errors = 0;

  for (const request of pendingRequests) {
    if (!request.supplier_confirmation_requests.supplierId) continue;

    try {
      const result = await sendSupplierCommunication({
        supplierId: request.supplier_confirmation_requests.supplierId,
        communicationType: "followup",
        subject: `Follow-up: Confirmation Required - ${request.supplier_confirmation_requests.serviceName}`,
        message: `
We are following up on our confirmation request for:

<strong>Service:</strong> ${request.supplier_confirmation_requests.serviceName}
<strong>Booking Reference:</strong> ${request.bookings.bookingReference}

Please confirm availability at your earliest convenience.
        `.trim(),
        bookingId: request.supplier_confirmation_requests.bookingId,
        confirmationRequestId: request.supplier_confirmation_requests.id,
        responseRequired: true,
      });

      if (result.sent) {
        sent++;
      } else {
        errors++;
      }
    } catch (error) {
      errors++;
    }
  }

  return { sent, errors };
}
