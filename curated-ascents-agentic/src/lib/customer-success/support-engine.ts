/**
 * Support Engine - Customer Support Ticket Management
 */

import { db } from "@/db";
import {
  supportTickets,
  supportMessages,
  clients,
  bookings,
} from "@/db/schema";
import { eq, and, desc, sql, or, gte, lte, isNull } from "drizzle-orm";
import { nanoid } from "nanoid";
import { sendEmail } from "@/lib/email/send-email";
import { createElement } from "react";

// ============================================
// TYPES
// ============================================

export type TicketCategory =
  | "booking_issue"
  | "payment"
  | "itinerary_change"
  | "emergency"
  | "feedback"
  | "general";

export type TicketPriority = "low" | "normal" | "high" | "urgent";
export type TicketStatus = "open" | "in_progress" | "waiting_client" | "resolved" | "closed";

// SLA times in hours
const SLA_RESPONSE_TIMES: Record<TicketPriority, number> = {
  urgent: 1,
  high: 4,
  normal: 24,
  low: 48,
};

// ============================================
// TICKET MANAGEMENT
// ============================================

/**
 * Generate unique ticket number
 */
function generateTicketNumber(): string {
  const date = new Date();
  const prefix = `TKT${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}`;
  return `${prefix}-${nanoid(6).toUpperCase()}`;
}

/**
 * Create a new support ticket
 */
export async function createSupportTicket(params: {
  clientId: number;
  bookingId?: number;
  subject: string;
  description?: string;
  category: TicketCategory;
  priority?: TicketPriority;
  isInTrip?: boolean;
  tripLocation?: string;
  agencyId?: number;
}): Promise<{ ticketId: number; ticketNumber: string }> {
  const ticketNumber = generateTicketNumber();

  // Auto-elevate priority for in-trip issues
  let priority = params.priority || "normal";
  if (params.isInTrip && priority === "normal") {
    priority = "high";
  }
  if (params.category === "emergency") {
    priority = "urgent";
  }

  const [ticket] = await db
    .insert(supportTickets)
    .values({
      ticketNumber,
      clientId: params.clientId,
      bookingId: params.bookingId,
      subject: params.subject,
      description: params.description,
      category: params.category,
      priority,
      isInTrip: params.isInTrip || false,
      tripLocation: params.tripLocation,
      agencyId: params.agencyId,
      status: "open",
    })
    .returning({ id: supportTickets.id, ticketNumber: supportTickets.ticketNumber });

  // Add initial message if description provided
  if (params.description) {
    await addTicketMessage({
      ticketId: ticket.id,
      senderType: "client",
      senderId: params.clientId,
      message: params.description,
    });
  }

  return { ticketId: ticket.id, ticketNumber: ticket.ticketNumber };
}

/**
 * Get ticket details with messages
 */
export async function getTicketDetails(ticketId: number) {
  const [ticket] = await db
    .select({
      id: supportTickets.id,
      ticketNumber: supportTickets.ticketNumber,
      clientId: supportTickets.clientId,
      clientName: clients.name,
      clientEmail: clients.email,
      bookingId: supportTickets.bookingId,
      subject: supportTickets.subject,
      description: supportTickets.description,
      category: supportTickets.category,
      priority: supportTickets.priority,
      status: supportTickets.status,
      assignedTo: supportTickets.assignedTo,
      isInTrip: supportTickets.isInTrip,
      tripLocation: supportTickets.tripLocation,
      resolution: supportTickets.resolution,
      resolvedAt: supportTickets.resolvedAt,
      firstResponseAt: supportTickets.firstResponseAt,
      slaBreached: supportTickets.slaBreached,
      satisfactionRating: supportTickets.satisfactionRating,
      tags: supportTickets.tags,
      createdAt: supportTickets.createdAt,
    })
    .from(supportTickets)
    .leftJoin(clients, eq(supportTickets.clientId, clients.id))
    .where(eq(supportTickets.id, ticketId))
    .limit(1);

  if (!ticket) {
    return null;
  }

  const messages = await db
    .select()
    .from(supportMessages)
    .where(eq(supportMessages.ticketId, ticketId))
    .orderBy(supportMessages.createdAt);

  return { ...ticket, messages };
}

/**
 * List tickets with filters
 */
export async function listTickets(params: {
  clientId?: number;
  status?: TicketStatus | TicketStatus[];
  category?: TicketCategory;
  priority?: TicketPriority;
  isInTrip?: boolean;
  assignedTo?: string;
  limit?: number;
  offset?: number;
}) {
  const conditions = [];

  if (params.clientId) {
    conditions.push(eq(supportTickets.clientId, params.clientId));
  }
  if (params.status) {
    if (Array.isArray(params.status)) {
      conditions.push(
        or(...params.status.map((s) => eq(supportTickets.status, s)))
      );
    } else {
      conditions.push(eq(supportTickets.status, params.status));
    }
  }
  if (params.category) {
    conditions.push(eq(supportTickets.category, params.category));
  }
  if (params.priority) {
    conditions.push(eq(supportTickets.priority, params.priority));
  }
  if (params.isInTrip !== undefined) {
    conditions.push(eq(supportTickets.isInTrip, params.isInTrip));
  }
  if (params.assignedTo) {
    conditions.push(eq(supportTickets.assignedTo, params.assignedTo));
  }

  const query = db
    .select({
      id: supportTickets.id,
      ticketNumber: supportTickets.ticketNumber,
      clientName: clients.name,
      subject: supportTickets.subject,
      category: supportTickets.category,
      priority: supportTickets.priority,
      status: supportTickets.status,
      isInTrip: supportTickets.isInTrip,
      assignedTo: supportTickets.assignedTo,
      slaBreached: supportTickets.slaBreached,
      createdAt: supportTickets.createdAt,
      updatedAt: supportTickets.updatedAt,
    })
    .from(supportTickets)
    .leftJoin(clients, eq(supportTickets.clientId, clients.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(
      sql`CASE ${supportTickets.priority} WHEN 'urgent' THEN 1 WHEN 'high' THEN 2 WHEN 'normal' THEN 3 ELSE 4 END`,
      desc(supportTickets.createdAt)
    )
    .limit(params.limit || 50)
    .offset(params.offset || 0);

  return query;
}

/**
 * Update ticket status
 */
export async function updateTicketStatus(
  ticketId: number,
  status: TicketStatus,
  updatedBy?: string
): Promise<{ success: boolean }> {
  const updates: Record<string, unknown> = {
    status,
    updatedAt: new Date(),
  };

  if (status === "resolved" || status === "closed") {
    updates.resolvedAt = new Date();
    updates.resolvedBy = updatedBy;
  }

  await db.update(supportTickets).set(updates).where(eq(supportTickets.id, ticketId));

  return { success: true };
}

/**
 * Assign ticket to agent
 */
export async function assignTicket(
  ticketId: number,
  assignedTo: string
): Promise<{ success: boolean }> {
  await db
    .update(supportTickets)
    .set({
      assignedTo,
      assignedAt: new Date(),
      status: "in_progress",
      updatedAt: new Date(),
    })
    .where(eq(supportTickets.id, ticketId));

  return { success: true };
}

/**
 * Add resolution to ticket
 */
export async function resolveTicket(
  ticketId: number,
  resolution: string,
  resolvedBy: string
): Promise<{ success: boolean }> {
  await db
    .update(supportTickets)
    .set({
      status: "resolved",
      resolution,
      resolvedBy,
      resolvedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(supportTickets.id, ticketId));

  // Add system message
  await addTicketMessage({
    ticketId,
    senderType: "system",
    senderName: "System",
    message: `Ticket resolved by ${resolvedBy}: ${resolution}`,
  });

  return { success: true };
}

/**
 * Record satisfaction rating
 */
export async function rateSatisfaction(
  ticketId: number,
  rating: number,
  feedback?: string
): Promise<{ success: boolean }> {
  await db
    .update(supportTickets)
    .set({
      satisfactionRating: rating,
      satisfactionFeedback: feedback,
      status: "closed",
      updatedAt: new Date(),
    })
    .where(eq(supportTickets.id, ticketId));

  return { success: true };
}

// ============================================
// MESSAGES
// ============================================

/**
 * Add a message to a ticket
 */
export async function addTicketMessage(params: {
  ticketId: number;
  senderType: "client" | "agent" | "system";
  senderId?: number;
  senderName?: string;
  message: string;
  attachments?: Array<{ name: string; url: string; type: string }>;
}): Promise<{ messageId: number }> {
  // Get sender name if not provided
  let senderName = params.senderName;
  if (!senderName && params.senderId && params.senderType === "client") {
    const [client] = await db
      .select({ name: clients.name })
      .from(clients)
      .where(eq(clients.id, params.senderId))
      .limit(1);
    senderName = client?.name || "Customer";
  }

  const [message] = await db
    .insert(supportMessages)
    .values({
      ticketId: params.ticketId,
      senderType: params.senderType,
      senderId: params.senderId,
      senderName: senderName || "Unknown",
      message: params.message,
      attachments: params.attachments,
    })
    .returning({ id: supportMessages.id });

  // Update ticket
  const updates: Record<string, unknown> = { updatedAt: new Date() };

  // Record first response time for agent responses
  if (params.senderType === "agent") {
    const [ticket] = await db
      .select({ firstResponseAt: supportTickets.firstResponseAt })
      .from(supportTickets)
      .where(eq(supportTickets.id, params.ticketId))
      .limit(1);

    if (!ticket?.firstResponseAt) {
      updates.firstResponseAt = new Date();
    }

    // Change status to waiting for client
    updates.status = "waiting_client";
  }

  // If client responds, change status back to open/in_progress
  if (params.senderType === "client") {
    const [ticket] = await db
      .select({ assignedTo: supportTickets.assignedTo })
      .from(supportTickets)
      .where(eq(supportTickets.id, params.ticketId))
      .limit(1);

    updates.status = ticket?.assignedTo ? "in_progress" : "open";
  }

  await db.update(supportTickets).set(updates).where(eq(supportTickets.id, params.ticketId));

  return { messageId: message.id };
}

/**
 * Mark messages as read
 */
export async function markMessagesRead(
  ticketId: number,
  readerType: "client" | "agent"
): Promise<{ updated: number }> {
  const senderTypeToMark = readerType === "client" ? "agent" : "client";

  const result = await db
    .update(supportMessages)
    .set({ isRead: true, readAt: new Date() })
    .where(
      and(
        eq(supportMessages.ticketId, ticketId),
        eq(supportMessages.senderType, senderTypeToMark),
        eq(supportMessages.isRead, false)
      )
    );

  return { updated: 0 }; // Drizzle doesn't return affected rows easily
}

// ============================================
// SLA MONITORING
// ============================================

/**
 * Check and mark SLA breaches
 */
export async function checkSLABreaches(): Promise<{
  checked: number;
  breached: number;
}> {
  const openTickets = await db
    .select({
      id: supportTickets.id,
      priority: supportTickets.priority,
      createdAt: supportTickets.createdAt,
      firstResponseAt: supportTickets.firstResponseAt,
      slaBreached: supportTickets.slaBreached,
    })
    .from(supportTickets)
    .where(
      and(
        or(eq(supportTickets.status, "open"), eq(supportTickets.status, "in_progress")),
        eq(supportTickets.slaBreached, false),
        isNull(supportTickets.firstResponseAt)
      )
    );

  let breached = 0;

  for (const ticket of openTickets) {
    const slaHours = SLA_RESPONSE_TIMES[ticket.priority as TicketPriority] || 24;
    const slaDeadline = new Date(ticket.createdAt!);
    slaDeadline.setHours(slaDeadline.getHours() + slaHours);

    if (new Date() > slaDeadline) {
      await db
        .update(supportTickets)
        .set({ slaBreached: true, updatedAt: new Date() })
        .where(eq(supportTickets.id, ticket.id));
      breached++;
    }
  }

  return { checked: openTickets.length, breached };
}

// ============================================
// STATS
// ============================================

/**
 * Get support ticket statistics
 */
export async function getSupportStats(params: {
  startDate?: Date;
  endDate?: Date;
  agencyId?: number;
}) {
  const conditions = [];

  if (params.startDate) {
    conditions.push(gte(supportTickets.createdAt, params.startDate));
  }
  if (params.endDate) {
    conditions.push(lte(supportTickets.createdAt, params.endDate));
  }
  if (params.agencyId) {
    conditions.push(eq(supportTickets.agencyId, params.agencyId));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Get counts by status
  const statusCounts = await db
    .select({
      status: supportTickets.status,
      count: sql<number>`count(*)::int`,
    })
    .from(supportTickets)
    .where(whereClause)
    .groupBy(supportTickets.status);

  // Get counts by category
  const categoryCounts = await db
    .select({
      category: supportTickets.category,
      count: sql<number>`count(*)::int`,
    })
    .from(supportTickets)
    .where(whereClause)
    .groupBy(supportTickets.category);

  // Get average satisfaction rating
  const [satisfaction] = await db
    .select({
      avgRating: sql<number>`COALESCE(AVG(${supportTickets.satisfactionRating}), 0)`,
      totalRated: sql<number>`COUNT(${supportTickets.satisfactionRating})::int`,
    })
    .from(supportTickets)
    .where(whereClause);

  // Get SLA breach count
  const [slaStats] = await db
    .select({
      total: sql<number>`count(*)::int`,
      breached: sql<number>`SUM(CASE WHEN ${supportTickets.slaBreached} THEN 1 ELSE 0 END)::int`,
    })
    .from(supportTickets)
    .where(whereClause);

  // Get in-trip ticket count
  const [inTripStats] = await db
    .select({
      count: sql<number>`SUM(CASE WHEN ${supportTickets.isInTrip} THEN 1 ELSE 0 END)::int`,
    })
    .from(supportTickets)
    .where(whereClause);

  return {
    byStatus: Object.fromEntries(statusCounts.map((s) => [s.status, s.count])),
    byCategory: Object.fromEntries(categoryCounts.map((c) => [c.category, c.count])),
    satisfaction: {
      averageRating: Number(satisfaction?.avgRating || 0).toFixed(1),
      totalRated: satisfaction?.totalRated || 0,
    },
    sla: {
      total: slaStats?.total || 0,
      breached: slaStats?.breached || 0,
      complianceRate:
        slaStats?.total > 0
          ? (((slaStats.total - slaStats.breached) / slaStats.total) * 100).toFixed(1)
          : "100.0",
    },
    inTripTickets: inTripStats?.count || 0,
  };
}
