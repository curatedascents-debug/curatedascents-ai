/**
 * Feedback Engine - Trip Check-ins, Surveys, and NPS Management
 */

import { db } from "@/db";
import {
  tripCheckins,
  feedbackSurveys,
  clientMilestones,
  bookings,
  clients,
  quotes,
} from "@/db/schema";
import { eq, and, gte, lte, isNull, sql } from "drizzle-orm";
import { addPoints, POINTS_RULES } from "./loyalty-engine";

// ============================================
// CONSTANTS
// ============================================

export const CHECKIN_SCHEDULE = {
  pre_departure: -1, // 1 day before trip starts
  day_1: 0, // Day trip starts
  mid_trip: 0.5, // Halfway through (calculated based on trip length)
  post_trip: 1, // 1 day after trip ends
} as const;

export const SURVEY_SCHEDULE = {
  DAYS_AFTER_TRIP: 3, // Send survey 3 days after trip ends
  REMINDER_DAYS: 5, // Send reminder 5 days after first email
} as const;

export const NPS_CATEGORIES = {
  PROMOTER: { min: 9, max: 10, label: "Promoter" },
  PASSIVE: { min: 7, max: 8, label: "Passive" },
  DETRACTOR: { min: 0, max: 6, label: "Detractor" },
} as const;

export type CheckinType = "pre_departure" | "day_1" | "mid_trip" | "post_trip";
export type SurveyType = "post_trip" | "nps" | "review_request" | "quick_feedback";

// ============================================
// TRIP CHECK-IN MANAGEMENT
// ============================================

/**
 * Schedule check-ins for a booking
 */
export async function scheduleBookingCheckins(
  bookingId: number,
  clientId: number,
  startDate: Date,
  endDate: Date
): Promise<{ scheduled: number }> {
  const tripLength = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const checkinsToSchedule: Array<{
    type: CheckinType;
    scheduledAt: Date;
  }> = [];

  // Pre-departure: 1 day before
  const preDeparture = new Date(startDate);
  preDeparture.setDate(preDeparture.getDate() - 1);
  preDeparture.setHours(9, 0, 0, 0); // 9 AM
  checkinsToSchedule.push({ type: "pre_departure", scheduledAt: preDeparture });

  // Day 1: Morning of first day
  const day1 = new Date(startDate);
  day1.setHours(18, 0, 0, 0); // 6 PM (end of first day)
  checkinsToSchedule.push({ type: "day_1", scheduledAt: day1 });

  // Mid-trip: Only for trips longer than 3 days
  if (tripLength > 3) {
    const midTrip = new Date(startDate);
    midTrip.setDate(midTrip.getDate() + Math.floor(tripLength / 2));
    midTrip.setHours(18, 0, 0, 0);
    checkinsToSchedule.push({ type: "mid_trip", scheduledAt: midTrip });
  }

  // Post-trip: 1 day after trip ends
  const postTrip = new Date(endDate);
  postTrip.setDate(postTrip.getDate() + 1);
  postTrip.setHours(10, 0, 0, 0); // 10 AM
  checkinsToSchedule.push({ type: "post_trip", scheduledAt: postTrip });

  // Insert check-ins (skip if already exist)
  for (const checkin of checkinsToSchedule) {
    const existing = await db
      .select()
      .from(tripCheckins)
      .where(
        and(
          eq(tripCheckins.bookingId, bookingId),
          eq(tripCheckins.checkinType, checkin.type)
        )
      )
      .limit(1);

    if (existing.length === 0) {
      await db.insert(tripCheckins).values({
        bookingId,
        clientId,
        checkinType: checkin.type,
        scheduledAt: checkin.scheduledAt,
      });
    }
  }

  return { scheduled: checkinsToSchedule.length };
}

/**
 * Get pending check-ins that need to be sent
 */
export async function getPendingCheckins(
  windowMinutes: number = 60
): Promise<
  Array<{
    id: number;
    bookingId: number;
    clientId: number;
    clientEmail: string;
    clientName: string | null;
    checkinType: string;
    bookingReference: string | null;
    destination: string | null;
  }>
> {
  const now = new Date();
  const windowEnd = new Date(now.getTime() + windowMinutes * 60 * 1000);

  const pending = await db
    .select({
      id: tripCheckins.id,
      bookingId: tripCheckins.bookingId,
      clientId: tripCheckins.clientId,
      clientEmail: clients.email,
      clientName: clients.name,
      checkinType: tripCheckins.checkinType,
      bookingReference: bookings.bookingReference,
      destination: quotes.destination,
    })
    .from(tripCheckins)
    .innerJoin(clients, eq(tripCheckins.clientId, clients.id))
    .innerJoin(bookings, eq(tripCheckins.bookingId, bookings.id))
    .leftJoin(quotes, eq(bookings.quoteId, quotes.id))
    .where(
      and(
        isNull(tripCheckins.sentAt),
        lte(tripCheckins.scheduledAt, windowEnd),
        gte(tripCheckins.scheduledAt, new Date(now.getTime() - 24 * 60 * 60 * 1000)) // Not older than 24h
      )
    );

  return pending;
}

/**
 * Mark a check-in as sent
 */
export async function markCheckinSent(
  checkinId: number,
  emailId?: string
): Promise<void> {
  await db
    .update(tripCheckins)
    .set({
      sentAt: new Date(),
      emailId,
      updatedAt: new Date(),
    })
    .where(eq(tripCheckins.id, checkinId));
}

/**
 * Record a check-in response
 */
export async function recordCheckinResponse(
  checkinId: number,
  rating: number,
  notes?: string,
  requiresFollowup: boolean = false
): Promise<void> {
  await db
    .update(tripCheckins)
    .set({
      responseReceived: true,
      responseAt: new Date(),
      responseRating: rating,
      responseNotes: notes,
      requiresFollowup,
      updatedAt: new Date(),
    })
    .where(eq(tripCheckins.id, checkinId));
}

// ============================================
// FEEDBACK SURVEY MANAGEMENT
// ============================================

/**
 * Schedule a post-trip survey
 */
export async function schedulePostTripSurvey(
  bookingId: number,
  clientId: number,
  tripEndDate: Date
): Promise<{ surveyId: number; scheduledFor: Date }> {
  const surveyDate = new Date(tripEndDate);
  surveyDate.setDate(surveyDate.getDate() + SURVEY_SCHEDULE.DAYS_AFTER_TRIP);
  surveyDate.setHours(10, 0, 0, 0);

  // Check if survey already exists
  const existing = await db
    .select()
    .from(feedbackSurveys)
    .where(
      and(
        eq(feedbackSurveys.bookingId, bookingId),
        eq(feedbackSurveys.surveyType, "post_trip")
      )
    )
    .limit(1);

  if (existing.length > 0) {
    return { surveyId: existing[0].id, scheduledFor: surveyDate };
  }

  const [survey] = await db
    .insert(feedbackSurveys)
    .values({
      bookingId,
      clientId,
      surveyType: "post_trip",
    })
    .returning({ id: feedbackSurveys.id });

  return { surveyId: survey.id, scheduledFor: surveyDate };
}

/**
 * Get surveys that need to be sent
 */
export async function getPendingSurveys(): Promise<
  Array<{
    id: number;
    bookingId: number;
    clientId: number;
    clientEmail: string;
    clientName: string | null;
    surveyType: string;
    bookingReference: string | null;
    destination: string | null;
    tripEndDate: string | null;
  }>
> {
  const now = new Date();

  // Get surveys for bookings that ended SURVEY_SCHEDULE.DAYS_AFTER_TRIP days ago
  const cutoffDate = new Date(now);
  cutoffDate.setDate(cutoffDate.getDate() - SURVEY_SCHEDULE.DAYS_AFTER_TRIP);

  const pending = await db
    .select({
      id: feedbackSurveys.id,
      bookingId: feedbackSurveys.bookingId,
      clientId: feedbackSurveys.clientId,
      clientEmail: clients.email,
      clientName: clients.name,
      surveyType: feedbackSurveys.surveyType,
      bookingReference: bookings.bookingReference,
      destination: quotes.destination,
      tripEndDate: bookings.endDate,
    })
    .from(feedbackSurveys)
    .innerJoin(clients, eq(feedbackSurveys.clientId, clients.id))
    .innerJoin(bookings, eq(feedbackSurveys.bookingId, bookings.id))
    .leftJoin(quotes, eq(bookings.quoteId, quotes.id))
    .where(
      and(
        isNull(feedbackSurveys.sentAt),
        isNull(feedbackSurveys.completedAt),
        lte(bookings.endDate, cutoffDate.toISOString().split('T')[0])
      )
    );

  return pending;
}

/**
 * Mark survey as sent
 */
export async function markSurveySent(surveyId: number): Promise<void> {
  await db
    .update(feedbackSurveys)
    .set({
      sentAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(feedbackSurveys.id, surveyId));
}

/**
 * Submit survey response
 */
export async function submitSurveyResponse(
  surveyId: number,
  response: {
    npsScore?: number;
    overallRating?: number;
    responses?: Record<string, unknown>;
    testimonial?: string;
    canUseAsTestimonial?: boolean;
  }
): Promise<{ pointsAwarded: number }> {
  // Get survey details
  const [survey] = await db
    .select()
    .from(feedbackSurveys)
    .where(eq(feedbackSurveys.id, surveyId))
    .limit(1);

  if (!survey) {
    throw new Error("Survey not found");
  }

  // Update survey
  await db
    .update(feedbackSurveys)
    .set({
      completedAt: new Date(),
      npsScore: response.npsScore,
      overallRating: response.overallRating,
      responses: response.responses,
      testimonial: response.testimonial,
      canUseAsTestimonial: response.canUseAsTestimonial,
      pointsAwarded: POINTS_RULES.SURVEY_COMPLETED,
      updatedAt: new Date(),
    })
    .where(eq(feedbackSurveys.id, surveyId));

  // Award points
  await addPoints(
    survey.clientId,
    POINTS_RULES.SURVEY_COMPLETED,
    "earned_survey",
    "Thank you for completing our feedback survey!",
    "survey",
    surveyId
  );

  return { pointsAwarded: POINTS_RULES.SURVEY_COMPLETED };
}

/**
 * Get NPS score categorization
 */
export function categorizeNPS(score: number): {
  category: "Promoter" | "Passive" | "Detractor";
  description: string;
} {
  if (score >= NPS_CATEGORIES.PROMOTER.min) {
    return {
      category: "Promoter",
      description: "Likely to recommend and return",
    };
  }
  if (score >= NPS_CATEGORIES.PASSIVE.min) {
    return {
      category: "Passive",
      description: "Satisfied but not enthusiastic",
    };
  }
  return {
    category: "Detractor",
    description: "May share negative experiences",
  };
}

/**
 * Calculate NPS score for a period
 */
export async function calculateNPS(
  startDate?: Date,
  endDate?: Date
): Promise<{
  nps: number;
  promoters: number;
  passives: number;
  detractors: number;
  total: number;
}> {
  let query = db
    .select({
      npsScore: feedbackSurveys.npsScore,
    })
    .from(feedbackSurveys)
    .where(sql`${feedbackSurveys.npsScore} IS NOT NULL`);

  const surveys = await query;

  let promoters = 0;
  let passives = 0;
  let detractors = 0;

  for (const survey of surveys) {
    if (survey.npsScore === null) continue;
    if (survey.npsScore >= NPS_CATEGORIES.PROMOTER.min) promoters++;
    else if (survey.npsScore >= NPS_CATEGORIES.PASSIVE.min) passives++;
    else detractors++;
  }

  const total = promoters + passives + detractors;
  const nps = total > 0 ? Math.round(((promoters - detractors) / total) * 100) : 0;

  return { nps, promoters, passives, detractors, total };
}

// ============================================
// MILESTONE MANAGEMENT
// ============================================

/**
 * Create a booking anniversary milestone
 */
export async function createBookingAnniversary(
  clientId: number,
  bookingId: number,
  tripName: string,
  tripEndDate: Date
): Promise<{ milestoneId: number }> {
  // Calculate 1-year anniversary
  const anniversaryDate = new Date(tripEndDate);
  anniversaryDate.setFullYear(anniversaryDate.getFullYear() + 1);

  // Schedule notification for 7 days before anniversary
  const notificationDate = new Date(anniversaryDate);
  notificationDate.setDate(notificationDate.getDate() - 7);

  const [milestone] = await db
    .insert(clientMilestones)
    .values({
      clientId,
      milestoneType: "booking_anniversary",
      milestoneName: `1 Year Anniversary: ${tripName}`,
      milestoneDate: anniversaryDate.toISOString().split("T")[0],
      relatedBookingId: bookingId,
      notificationScheduledAt: notificationDate,
    })
    .returning({ id: clientMilestones.id });

  return { milestoneId: milestone.id };
}

/**
 * Get upcoming milestones that need notifications
 */
export async function getUpcomingMilestones(
  daysAhead: number = 7
): Promise<
  Array<{
    id: number;
    clientId: number;
    clientEmail: string;
    clientName: string | null;
    milestoneType: string;
    milestoneName: string;
    milestoneDate: string;
    relatedBookingId: number | null;
  }>
> {
  const now = new Date();
  const futureDate = new Date(now);
  futureDate.setDate(futureDate.getDate() + daysAhead);

  const milestones = await db
    .select({
      id: clientMilestones.id,
      clientId: clientMilestones.clientId,
      clientEmail: clients.email,
      clientName: clients.name,
      milestoneType: clientMilestones.milestoneType,
      milestoneName: clientMilestones.milestoneName,
      milestoneDate: clientMilestones.milestoneDate,
      relatedBookingId: clientMilestones.relatedBookingId,
    })
    .from(clientMilestones)
    .innerJoin(clients, eq(clientMilestones.clientId, clients.id))
    .where(
      and(
        isNull(clientMilestones.notificationSentAt),
        lte(clientMilestones.notificationScheduledAt, futureDate),
        gte(clientMilestones.notificationScheduledAt, now)
      )
    );

  return milestones;
}

/**
 * Mark milestone notification as sent
 */
export async function markMilestoneNotified(
  milestoneId: number,
  bonusPoints: number = POINTS_RULES.ANNIVERSARY_BONUS,
  specialOfferCode?: string
): Promise<void> {
  // Get milestone
  const [milestone] = await db
    .select()
    .from(clientMilestones)
    .where(eq(clientMilestones.id, milestoneId))
    .limit(1);

  if (!milestone) return;

  // Award bonus points
  if (bonusPoints > 0) {
    await addPoints(
      milestone.clientId,
      bonusPoints,
      "earned_bonus",
      `Anniversary celebration: ${milestone.milestoneName}`,
      "milestone",
      milestoneId
    );
  }

  // Update milestone
  const specialOfferExpiry = specialOfferCode
    ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    : null;

  await db
    .update(clientMilestones)
    .set({
      notificationSentAt: new Date(),
      bonusPointsAwarded: bonusPoints,
      specialOfferCode,
      specialOfferExpiry,
    })
    .where(eq(clientMilestones.id, milestoneId));
}

// ============================================
// TESTIMONIAL MANAGEMENT
// ============================================

/**
 * Get pending testimonials for approval
 */
export async function getPendingTestimonials(): Promise<
  Array<{
    id: number;
    clientId: number;
    clientName: string | null;
    bookingId: number;
    destination: string | null;
    testimonial: string | null;
    overallRating: number | null;
    npsScore: number | null;
    completedAt: Date | null;
  }>
> {
  const testimonials = await db
    .select({
      id: feedbackSurveys.id,
      clientId: feedbackSurveys.clientId,
      clientName: clients.name,
      bookingId: feedbackSurveys.bookingId,
      destination: quotes.destination,
      testimonial: feedbackSurveys.testimonial,
      overallRating: feedbackSurveys.overallRating,
      npsScore: feedbackSurveys.npsScore,
      completedAt: feedbackSurveys.completedAt,
    })
    .from(feedbackSurveys)
    .leftJoin(clients, eq(feedbackSurveys.clientId, clients.id))
    .leftJoin(bookings, eq(feedbackSurveys.bookingId, bookings.id))
    .leftJoin(quotes, eq(bookings.quoteId, quotes.id))
    .where(
      and(
        eq(feedbackSurveys.canUseAsTestimonial, true),
        eq(feedbackSurveys.testimonialApproved, false),
        sql`${feedbackSurveys.testimonial} IS NOT NULL`
      )
    )
    .orderBy(sql`${feedbackSurveys.completedAt} DESC`);

  return testimonials;
}

/**
 * Approve or reject a testimonial
 */
export async function approveTestimonial(
  surveyId: number,
  approved: boolean
): Promise<{ success: boolean }> {
  if (approved) {
    await db
      .update(feedbackSurveys)
      .set({ testimonialApproved: true, updatedAt: new Date() })
      .where(eq(feedbackSurveys.id, surveyId));
  } else {
    // If rejected, mark canUseAsTestimonial as false
    await db
      .update(feedbackSurveys)
      .set({ canUseAsTestimonial: false, updatedAt: new Date() })
      .where(eq(feedbackSurveys.id, surveyId));
  }

  return { success: true };
}

/**
 * Get approved testimonials for display
 */
export async function getApprovedTestimonials(params?: {
  limit?: number;
  destination?: string;
}): Promise<
  Array<{
    id: number;
    clientName: string | null;
    destination: string | null;
    testimonial: string | null;
    overallRating: number | null;
    completedAt: Date | null;
  }>
> {
  const conditions = [
    eq(feedbackSurveys.testimonialApproved, true),
    sql`${feedbackSurveys.testimonial} IS NOT NULL`,
  ];

  if (params?.destination) {
    conditions.push(sql`${quotes.destination} ILIKE ${'%' + params.destination + '%'}`);
  }

  const testimonials = await db
    .select({
      id: feedbackSurveys.id,
      clientName: clients.name,
      destination: quotes.destination,
      testimonial: feedbackSurveys.testimonial,
      overallRating: feedbackSurveys.overallRating,
      completedAt: feedbackSurveys.completedAt,
    })
    .from(feedbackSurveys)
    .leftJoin(clients, eq(feedbackSurveys.clientId, clients.id))
    .leftJoin(bookings, eq(feedbackSurveys.bookingId, bookings.id))
    .leftJoin(quotes, eq(bookings.quoteId, quotes.id))
    .where(and(...conditions))
    .orderBy(sql`${feedbackSurveys.completedAt} DESC`)
    .limit(params?.limit || 20);

  return testimonials;
}

/**
 * Get survey for client to complete
 */
export async function getSurveyForCompletion(surveyId: number) {
  const [survey] = await db
    .select({
      id: feedbackSurveys.id,
      surveyType: feedbackSurveys.surveyType,
      completedAt: feedbackSurveys.completedAt,
      bookingId: feedbackSurveys.bookingId,
      destination: quotes.destination,
      clientName: clients.name,
    })
    .from(feedbackSurveys)
    .leftJoin(bookings, eq(feedbackSurveys.bookingId, bookings.id))
    .leftJoin(quotes, eq(bookings.quoteId, quotes.id))
    .leftJoin(clients, eq(feedbackSurveys.clientId, clients.id))
    .where(eq(feedbackSurveys.id, surveyId))
    .limit(1);

  if (!survey) {
    return null;
  }

  return {
    id: survey.id,
    surveyType: survey.surveyType,
    isCompleted: !!survey.completedAt,
    destination: survey.destination,
    clientName: survey.clientName,
  };
}
