/**
 * Nurture Sequence Engine
 * Manages automated email sequences for lead nurturing
 */

import { db } from "@/db";
import {
  nurtureSequences,
  nurtureEnrollments,
  leadScores,
  clients,
  quotes,
  bookings,
} from "@/db/schema";
import { eq, and, lt, lte, isNull, sql, desc, inArray } from "drizzle-orm";
import { sendEmail } from "@/lib/email/send-email";
import { recordLeadEvent } from "./scoring-engine";
import { createElement } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface NurtureEmailConfig {
  dayOffset: number; // Days after enrollment to send
  subject: string;
  templateId: string;
  conditions?: {
    minScore?: number;
    maxScore?: number;
    hasQuote?: boolean;
    status?: string[];
  };
}

interface TriggerConditions {
  minScore?: number;
  maxScore?: number;
  daysInactive?: number;
  hasQuote?: boolean;
  excludeStatuses?: string[];
}

type TriggerType = "new_lead" | "abandoned_conversation" | "post_quote" | "post_inquiry" | "high_value_lead";

interface EnrollmentResult {
  enrolled: boolean;
  enrollmentId?: number;
  reason?: string;
}

// ─── Sequence Management ──────────────────────────────────────────────────────

/**
 * Create a new nurture sequence
 */
export async function createNurtureSequence(params: {
  name: string;
  description?: string;
  triggerType: TriggerType;
  triggerConditions?: TriggerConditions;
  emails: NurtureEmailConfig[];
}) {
  const [sequence] = await db
    .insert(nurtureSequences)
    .values({
      name: params.name,
      description: params.description,
      triggerType: params.triggerType,
      triggerConditions: params.triggerConditions || {},
      emails: params.emails,
      totalEmails: params.emails.length,
      isActive: true,
    })
    .returning();

  return sequence;
}

/**
 * Get all active nurture sequences
 */
export async function getActiveSequences() {
  return db
    .select()
    .from(nurtureSequences)
    .where(eq(nurtureSequences.isActive, true));
}

/**
 * Update a nurture sequence
 */
export async function updateNurtureSequence(
  sequenceId: number,
  updates: {
    name?: string;
    description?: string;
    triggerConditions?: TriggerConditions;
    emails?: NurtureEmailConfig[];
    isActive?: boolean;
  }
) {
  const updateData: Record<string, unknown> = { updatedAt: new Date() };

  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.triggerConditions !== undefined) updateData.triggerConditions = updates.triggerConditions;
  if (updates.emails !== undefined) {
    updateData.emails = updates.emails;
    updateData.totalEmails = updates.emails.length;
  }
  if (updates.isActive !== undefined) updateData.isActive = updates.isActive;

  const [updated] = await db
    .update(nurtureSequences)
    .set(updateData)
    .where(eq(nurtureSequences.id, sequenceId))
    .returning();

  return updated;
}

// ─── Enrollment Management ────────────────────────────────────────────────────

/**
 * Enroll a client in a nurture sequence
 */
export async function enrollInSequence(
  clientId: number,
  sequenceId: number
): Promise<EnrollmentResult> {
  // Check if already enrolled in this sequence
  const existing = await db
    .select()
    .from(nurtureEnrollments)
    .where(
      and(
        eq(nurtureEnrollments.clientId, clientId),
        eq(nurtureEnrollments.sequenceId, sequenceId),
        inArray(nurtureEnrollments.status, ["active", "paused"])
      )
    )
    .limit(1);

  if (existing.length > 0) {
    return { enrolled: false, reason: "Already enrolled in this sequence" };
  }

  // Get sequence to calculate first email time
  const [sequence] = await db
    .select()
    .from(nurtureSequences)
    .where(eq(nurtureSequences.id, sequenceId))
    .limit(1);

  if (!sequence || !sequence.isActive) {
    return { enrolled: false, reason: "Sequence not found or inactive" };
  }

  const emails = sequence.emails as NurtureEmailConfig[];
  const firstEmail = emails[0];
  const nextEmailAt = new Date();
  nextEmailAt.setDate(nextEmailAt.getDate() + (firstEmail?.dayOffset || 0));

  const [enrollment] = await db
    .insert(nurtureEnrollments)
    .values({
      clientId,
      sequenceId,
      currentStep: 0,
      status: "active",
      emailsSent: 0,
      emailsOpened: 0,
      linksClicked: 0,
      enrolledAt: new Date(),
      nextEmailAt,
    })
    .returning();

  // Record lead event
  await recordLeadEvent(
    clientId,
    "conversation_continued",
    { reason: `Enrolled in nurture sequence: ${sequence.name}` },
    "system"
  );

  return { enrolled: true, enrollmentId: enrollment.id };
}

/**
 * Cancel an enrollment
 */
export async function cancelEnrollment(
  enrollmentId: number,
  reason: string
): Promise<boolean> {
  const [updated] = await db
    .update(nurtureEnrollments)
    .set({
      status: "cancelled",
      cancelledAt: new Date(),
      cancelReason: reason,
      updatedAt: new Date(),
    })
    .where(eq(nurtureEnrollments.id, enrollmentId))
    .returning();

  return !!updated;
}

/**
 * Pause an enrollment
 */
export async function pauseEnrollment(enrollmentId: number): Promise<boolean> {
  const [updated] = await db
    .update(nurtureEnrollments)
    .set({
      status: "paused",
      updatedAt: new Date(),
    })
    .where(eq(nurtureEnrollments.id, enrollmentId))
    .returning();

  return !!updated;
}

/**
 * Resume a paused enrollment
 */
export async function resumeEnrollment(enrollmentId: number): Promise<boolean> {
  const [enrollment] = await db
    .select()
    .from(nurtureEnrollments)
    .where(eq(nurtureEnrollments.id, enrollmentId))
    .limit(1);

  if (!enrollment || enrollment.status !== "paused") {
    return false;
  }

  // Recalculate next email time
  const [sequence] = await db
    .select()
    .from(nurtureSequences)
    .where(eq(nurtureSequences.id, enrollment.sequenceId))
    .limit(1);

  if (!sequence) return false;

  const emails = sequence.emails as NurtureEmailConfig[];
  const currentStep = enrollment.currentStep || 0;
  const nextEmail = emails[currentStep];

  const nextEmailAt = new Date();
  if (nextEmail) {
    nextEmailAt.setDate(nextEmailAt.getDate() + 1); // Send next day after resuming
  }

  const [updated] = await db
    .update(nurtureEnrollments)
    .set({
      status: "active",
      nextEmailAt,
      updatedAt: new Date(),
    })
    .where(eq(nurtureEnrollments.id, enrollmentId))
    .returning();

  return !!updated;
}

// ─── Trigger-Based Enrollment ─────────────────────────────────────────────────

/**
 * Check and auto-enroll clients based on trigger conditions
 */
export async function processAutoEnrollments(): Promise<{
  processed: number;
  enrolled: number;
  errors: string[];
}> {
  const results = {
    processed: 0,
    enrolled: 0,
    errors: [] as string[],
  };

  // Get all active sequences
  const sequences = await getActiveSequences();

  for (const sequence of sequences) {
    const triggerConditions = sequence.triggerConditions as TriggerConditions || {};

    try {
      // Build query based on trigger type
      let eligibleClients: Array<{ clientId: number; email: string; name: string | null }> = [];

      switch (sequence.triggerType) {
        case "new_lead": {
          // Clients with lead scores created in last 24 hours
          const cutoff = new Date();
          cutoff.setHours(cutoff.getHours() - 24);

          eligibleClients = await db
            .select({
              clientId: leadScores.clientId,
              email: clients.email,
              name: clients.name,
            })
            .from(leadScores)
            .innerJoin(clients, eq(leadScores.clientId, clients.id))
            .where(
              and(
                sql`${leadScores.firstActivityAt} > ${cutoff}`,
                sql`${leadScores.currentScore} >= ${triggerConditions.minScore || 0}`,
                sql`${leadScores.currentScore} <= ${triggerConditions.maxScore || 100}`
              )
            );
          break;
        }

        case "abandoned_conversation": {
          // Clients with no activity for X days
          const daysInactive = triggerConditions.daysInactive || 2;
          const cutoff = new Date();
          cutoff.setDate(cutoff.getDate() - daysInactive);

          eligibleClients = await db
            .select({
              clientId: leadScores.clientId,
              email: clients.email,
              name: clients.name,
            })
            .from(leadScores)
            .innerJoin(clients, eq(leadScores.clientId, clients.id))
            .where(
              and(
                lt(leadScores.lastActivityAt, cutoff),
                sql`${leadScores.status} NOT IN ('converted', 'lost', 'dormant')`,
                sql`${leadScores.currentScore} >= ${triggerConditions.minScore || 0}`,
                sql`${leadScores.currentScore} <= ${triggerConditions.maxScore || 100}`
              )
            );
          break;
        }

        case "post_quote": {
          // Clients who received a quote but haven't booked
          const cutoff = new Date();
          cutoff.setDate(cutoff.getDate() - 1); // Quotes from yesterday

          const quoteClients = await db
            .select({
              clientId: clients.id,
              email: clients.email,
              name: clients.name,
            })
            .from(quotes)
            .innerJoin(clients, eq(quotes.clientId, clients.id))
            .leftJoin(bookings, eq(quotes.id, bookings.quoteId))
            .where(
              and(
                sql`DATE(${quotes.createdAt}) = DATE(${cutoff})`,
                isNull(bookings.id) // No booking for this quote
              )
            );

          eligibleClients = quoteClients;
          break;
        }

        case "high_value_lead": {
          // High-value leads (score >= 80)
          eligibleClients = await db
            .select({
              clientId: leadScores.clientId,
              email: clients.email,
              name: clients.name,
            })
            .from(leadScores)
            .innerJoin(clients, eq(leadScores.clientId, clients.id))
            .where(
              and(
                eq(leadScores.isHighValue, true),
                sql`${leadScores.status} NOT IN ('converted', 'lost')`
              )
            );
          break;
        }

        case "post_inquiry": {
          // Clients who made an inquiry but score is still low
          const cutoff = new Date();
          cutoff.setHours(cutoff.getHours() - 48);

          eligibleClients = await db
            .select({
              clientId: leadScores.clientId,
              email: clients.email,
              name: clients.name,
            })
            .from(leadScores)
            .innerJoin(clients, eq(leadScores.clientId, clients.id))
            .where(
              and(
                sql`${leadScores.firstActivityAt} < ${cutoff}`,
                sql`${leadScores.currentScore} >= ${triggerConditions.minScore || 10}`,
                sql`${leadScores.currentScore} <= ${triggerConditions.maxScore || 40}`,
                sql`${leadScores.status} = 'browsing' OR ${leadScores.status} = 'comparing'`
              )
            );
          break;
        }
      }

      results.processed += eligibleClients.length;

      // Try to enroll each eligible client
      for (const client of eligibleClients) {
        if (!client.email) continue;

        const enrollResult = await enrollInSequence(client.clientId, sequence.id);
        if (enrollResult.enrolled) {
          results.enrolled++;
        }
      }
    } catch (error) {
      results.errors.push(
        `Error processing sequence ${sequence.id}: ${error instanceof Error ? error.message : "Unknown"}`
      );
    }
  }

  return results;
}

// ─── Email Processing ─────────────────────────────────────────────────────────

/**
 * Process and send due nurture emails
 */
export async function processDueEmails(): Promise<{
  processed: number;
  sent: number;
  skipped: number;
  completed: number;
  errors: string[];
}> {
  const results = {
    processed: 0,
    sent: 0,
    skipped: 0,
    completed: 0,
    errors: [] as string[],
  };

  const now = new Date();

  // Get all active enrollments with due emails
  const dueEnrollments = await db
    .select({
      enrollment: nurtureEnrollments,
      sequence: nurtureSequences,
      client: clients,
      leadScore: leadScores,
    })
    .from(nurtureEnrollments)
    .innerJoin(nurtureSequences, eq(nurtureEnrollments.sequenceId, nurtureSequences.id))
    .innerJoin(clients, eq(nurtureEnrollments.clientId, clients.id))
    .leftJoin(leadScores, eq(nurtureEnrollments.clientId, leadScores.clientId))
    .where(
      and(
        eq(nurtureEnrollments.status, "active"),
        lte(nurtureEnrollments.nextEmailAt, now)
      )
    );

  for (const { enrollment, sequence, client, leadScore } of dueEnrollments) {
    results.processed++;

    try {
      const emails = sequence.emails as NurtureEmailConfig[];
      const currentStep = enrollment.currentStep || 0;
      const currentEmail = emails[currentStep];

      if (!currentEmail) {
        // No more emails, mark as completed
        await db
          .update(nurtureEnrollments)
          .set({
            status: "completed",
            completedAt: now,
            updatedAt: now,
          })
          .where(eq(nurtureEnrollments.id, enrollment.id));
        results.completed++;
        continue;
      }

      // Check email conditions
      if (currentEmail.conditions) {
        const conditions = currentEmail.conditions;
        const score = leadScore?.currentScore || 0;
        const status = leadScore?.status || "new";

        // Check score conditions
        if (conditions.minScore !== undefined && score < conditions.minScore) {
          results.skipped++;
          await advanceToNextEmail(enrollment.id, sequence, currentStep, now);
          continue;
        }
        if (conditions.maxScore !== undefined && score > conditions.maxScore) {
          results.skipped++;
          await advanceToNextEmail(enrollment.id, sequence, currentStep, now);
          continue;
        }

        // Check status conditions
        if (conditions.status && !conditions.status.includes(status)) {
          results.skipped++;
          await advanceToNextEmail(enrollment.id, sequence, currentStep, now);
          continue;
        }
      }

      // Check if lead has converted - cancel sequence
      if (leadScore?.status === "converted") {
        await cancelEnrollment(enrollment.id, "Lead converted");
        results.skipped++;
        continue;
      }

      // Get email template content
      const emailContent = await renderNurtureEmail(currentEmail.templateId, {
        clientName: client.name || "Valued Traveler",
        destinations: leadScore?.detectedDestinations as string[] || [],
        budget: leadScore?.detectedBudget || undefined,
        travelDates: leadScore?.detectedTravelDates as { start?: string; end?: string } | undefined,
      });

      // Send email
      const emailResult = await sendEmail({
        to: client.email!,
        subject: personalizeSubject(currentEmail.subject, client.name || undefined),
        react: emailContent,
        logContext: {
          templateType: `nurture_${currentEmail.templateId}`,
          toName: client.name || undefined,
          clientId: client.id,
          metadata: {
            sequenceId: sequence.id,
            sequenceName: sequence.name,
            stepNumber: currentStep + 1,
            totalSteps: emails.length,
          },
        },
      });

      if (emailResult.sent) {
        results.sent++;

        // Record email sent event for scoring
        await recordLeadEvent(
          client.id,
          "email_opened", // This will be updated when they actually open
          { reason: `Nurture email sent: ${sequence.name} step ${currentStep + 1}` },
          "nurture"
        );

        await advanceToNextEmail(enrollment.id, sequence, currentStep, now);
      } else {
        results.errors.push(
          `Failed to send to ${client.email}: ${emailResult.error}`
        );
      }
    } catch (error) {
      results.errors.push(
        `Error processing enrollment ${enrollment.id}: ${error instanceof Error ? error.message : "Unknown"}`
      );
    }
  }

  return results;
}

/**
 * Advance enrollment to next email step
 */
async function advanceToNextEmail(
  enrollmentId: number,
  sequence: typeof nurtureSequences.$inferSelect,
  currentStep: number,
  now: Date
) {
  const emails = sequence.emails as NurtureEmailConfig[];
  const nextStep = currentStep + 1;

  if (nextStep >= emails.length) {
    // Sequence complete
    await db
      .update(nurtureEnrollments)
      .set({
        status: "completed",
        currentStep: nextStep,
        emailsSent: sql`${nurtureEnrollments.emailsSent} + 1`,
        lastEmailSentAt: now,
        completedAt: now,
        updatedAt: now,
      })
      .where(eq(nurtureEnrollments.id, enrollmentId));
  } else {
    // Calculate next email time
    const nextEmail = emails[nextStep];
    const nextEmailAt = new Date();
    nextEmailAt.setDate(nextEmailAt.getDate() + (nextEmail.dayOffset - emails[currentStep].dayOffset));

    await db
      .update(nurtureEnrollments)
      .set({
        currentStep: nextStep,
        emailsSent: sql`${nurtureEnrollments.emailsSent} + 1`,
        lastEmailSentAt: now,
        nextEmailAt,
        updatedAt: now,
      })
      .where(eq(nurtureEnrollments.id, enrollmentId));
  }
}

/**
 * Personalize email subject with client name
 */
function personalizeSubject(subject: string, clientName?: string): string {
  if (clientName) {
    return subject.replace("{name}", clientName);
  }
  return subject.replace("{name}, ", "").replace("{name}", "");
}

/**
 * Render nurture email template
 */
async function renderNurtureEmail(
  templateId: string,
  data: {
    clientName: string;
    destinations: string[];
    budget?: string;
    travelDates?: { start?: string; end?: string };
  }
) {
  // Return appropriate template based on templateId
  switch (templateId) {
    case "welcome_series_1":
      return createElement("div", {
        style: { fontFamily: "Arial, sans-serif", maxWidth: "600px", margin: "0 auto" },
        children: [
          createElement("h2", { key: "h2", style: { color: "#1a365d" } }, "Welcome to CuratedAscents!"),
          createElement("p", { key: "p1" }, `Dear ${data.clientName},`),
          createElement("p", { key: "p2" },
            "Thank you for your interest in exploring the Himalayas with us. We specialize in crafting extraordinary journeys to Nepal, Tibet, Bhutan, and India."
          ),
          createElement("p", { key: "p3" },
            "Our Expedition Architects are standing by to help you plan the adventure of a lifetime. Whether you're dreaming of:"
          ),
          createElement("ul", { key: "ul" }, [
            createElement("li", { key: "li1" }, "Trekking to Everest Base Camp"),
            createElement("li", { key: "li2" }, "Exploring ancient Bhutanese monasteries"),
            createElement("li", { key: "li3" }, "Witnessing the spiritual heart of Tibet"),
            createElement("li", { key: "li4" }, "Experiencing wildlife in Nepal's national parks"),
          ]),
          createElement("p", { key: "p4" },
            "Simply reply to this email or start a chat on our website to begin planning."
          ),
          createElement("p", { key: "p5" }, "Adventure awaits,"),
          createElement("p", { key: "p6", style: { fontWeight: "bold" } }, "The CuratedAscents Team"),
        ],
      });

    case "destination_inspiration":
      const destList = data.destinations.length > 0
        ? data.destinations.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(", ")
        : "the Himalayas";
      return createElement("div", {
        style: { fontFamily: "Arial, sans-serif", maxWidth: "600px", margin: "0 auto" },
        children: [
          createElement("h2", { key: "h2", style: { color: "#1a365d" } }, `Discover the Magic of ${destList}`),
          createElement("p", { key: "p1" }, `Dear ${data.clientName},`),
          createElement("p", { key: "p2" },
            `We noticed you've been exploring ${destList}. Let us share some insider tips that could make your journey truly unforgettable.`
          ),
          createElement("p", { key: "p3", style: { fontWeight: "bold" } },
            "Did you know?"
          ),
          createElement("ul", { key: "ul" }, [
            createElement("li", { key: "li1" }, "The best time for clear mountain views is October-November"),
            createElement("li", { key: "li2" }, "Spring (March-May) brings beautiful rhododendron blooms"),
            createElement("li", { key: "li3" }, "We can arrange private helicopter transfers for time-conscious travelers"),
          ]),
          createElement("p", { key: "p4" },
            "Ready to take the next step? Our team can create a personalized itinerary just for you."
          ),
          createElement("p", { key: "p5" }, "Best regards,"),
          createElement("p", { key: "p6", style: { fontWeight: "bold" } }, "The CuratedAscents Team"),
        ],
      });

    case "quote_followup":
      return createElement("div", {
        style: { fontFamily: "Arial, sans-serif", maxWidth: "600px", margin: "0 auto" },
        children: [
          createElement("h2", { key: "h2", style: { color: "#1a365d" } }, "Your Custom Quote is Ready"),
          createElement("p", { key: "p1" }, `Dear ${data.clientName},`),
          createElement("p", { key: "p2" },
            "We've prepared a detailed quote for your Himalayan adventure. We wanted to make sure you received it and see if you have any questions."
          ),
          createElement("div", {
            key: "highlight",
            style: {
              backgroundColor: "#f0f9ff",
              padding: "16px",
              borderRadius: "8px",
              margin: "16px 0",
            },
            children: createElement("p", { style: { margin: 0 } },
              "Our quotes are valid for 14 days, and prices may vary based on seasonal demand. Lock in your adventure today!"
            ),
          }),
          createElement("p", { key: "p3" },
            "Have questions about the itinerary, accommodations, or anything else? Simply reply to this email or chat with us online."
          ),
          createElement("p", { key: "p4" }, "Looking forward to your adventure,"),
          createElement("p", { key: "p5", style: { fontWeight: "bold" } }, "The CuratedAscents Team"),
        ],
      });

    case "last_chance":
      return createElement("div", {
        style: { fontFamily: "Arial, sans-serif", maxWidth: "600px", margin: "0 auto" },
        children: [
          createElement("h2", { key: "h2", style: { color: "#c53030" } }, "Don't Let This Opportunity Pass"),
          createElement("p", { key: "p1" }, `Dear ${data.clientName},`),
          createElement("p", { key: "p2" },
            "We haven't heard from you in a while, and we wanted to reach out one last time."
          ),
          createElement("p", { key: "p3" },
            "The Himalayan adventures you were exploring are still available, but availability can change quickly during peak seasons."
          ),
          createElement("div", {
            key: "offer",
            style: {
              backgroundColor: "#fffbeb",
              padding: "16px",
              borderLeft: "4px solid #f59e0b",
              margin: "16px 0",
            },
            children: createElement("p", { style: { margin: 0, fontWeight: "bold" } },
              "Reply today and receive a complimentary airport transfer with your booking."
            ),
          }),
          createElement("p", { key: "p4" },
            "If your plans have changed, no worries at all! We'd love to hear from you whenever you're ready to explore."
          ),
          createElement("p", { key: "p5" }, "Warm regards,"),
          createElement("p", { key: "p6", style: { fontWeight: "bold" } }, "The CuratedAscents Team"),
        ],
      });

    default:
      // Generic follow-up template
      return createElement("div", {
        style: { fontFamily: "Arial, sans-serif", maxWidth: "600px", margin: "0 auto" },
        children: [
          createElement("h2", { key: "h2", style: { color: "#1a365d" } }, "Still Dreaming of Adventure?"),
          createElement("p", { key: "p1" }, `Dear ${data.clientName},`),
          createElement("p", { key: "p2" },
            "We're here whenever you're ready to continue planning your Himalayan journey."
          ),
          createElement("p", { key: "p3" },
            "Feel free to reach out with any questions or start a new chat on our website."
          ),
          createElement("p", { key: "p4" }, "Best regards,"),
          createElement("p", { key: "p5", style: { fontWeight: "bold" } }, "The CuratedAscents Team"),
        ],
      });
  }
}

// ─── Conversion Tracking ──────────────────────────────────────────────────────

/**
 * Cancel all active nurture sequences when a lead converts
 */
export async function cancelOnConversion(clientId: number): Promise<number> {
  const activeEnrollments = await db
    .select()
    .from(nurtureEnrollments)
    .where(
      and(
        eq(nurtureEnrollments.clientId, clientId),
        eq(nurtureEnrollments.status, "active")
      )
    );

  for (const enrollment of activeEnrollments) {
    await cancelEnrollment(enrollment.id, "Lead converted to booking");
  }

  return activeEnrollments.length;
}

// ─── Statistics ───────────────────────────────────────────────────────────────

/**
 * Get nurture sequence statistics
 */
export async function getNurtureStats(sequenceId?: number) {
  const whereClause = sequenceId
    ? eq(nurtureEnrollments.sequenceId, sequenceId)
    : undefined;

  const stats = await db
    .select({
      sequenceId: nurtureEnrollments.sequenceId,
      totalEnrollments: sql<number>`count(*)`,
      activeEnrollments: sql<number>`count(*) filter (where ${nurtureEnrollments.status} = 'active')`,
      completedEnrollments: sql<number>`count(*) filter (where ${nurtureEnrollments.status} = 'completed')`,
      cancelledEnrollments: sql<number>`count(*) filter (where ${nurtureEnrollments.status} = 'cancelled')`,
      totalEmailsSent: sql<number>`sum(${nurtureEnrollments.emailsSent})`,
      totalEmailsOpened: sql<number>`sum(${nurtureEnrollments.emailsOpened})`,
      totalLinksClicked: sql<number>`sum(${nurtureEnrollments.linksClicked})`,
    })
    .from(nurtureEnrollments)
    .where(whereClause!)
    .groupBy(nurtureEnrollments.sequenceId);

  return stats;
}

/**
 * Get client's nurture enrollment history
 */
export async function getClientNurtureHistory(clientId: number) {
  return db
    .select({
      enrollment: nurtureEnrollments,
      sequence: nurtureSequences,
    })
    .from(nurtureEnrollments)
    .innerJoin(nurtureSequences, eq(nurtureEnrollments.sequenceId, nurtureSequences.id))
    .where(eq(nurtureEnrollments.clientId, clientId))
    .orderBy(desc(nurtureEnrollments.enrolledAt));
}
