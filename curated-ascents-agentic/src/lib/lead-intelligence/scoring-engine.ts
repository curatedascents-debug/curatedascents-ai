import { db } from "@/db";
import { leadScores, leadEvents, clients } from "@/db/schema";
import { eq } from "drizzle-orm";

// Scoring rules based on AI Agents Roadmap
export const SCORING_RULES = {
  // Budget signals
  BUDGET_MENTIONED_10K_PLUS: 30,
  BUDGET_MENTIONED_5K_PLUS: 20,
  BUDGET_MENTIONED_ANY: 10,

  // Timeline signals
  SPECIFIC_DATES_MENTIONED: 25,
  MONTH_MENTIONED: 15,
  SEASON_MENTIONED: 10,

  // Intent signals
  ASKED_ABOUT_AVAILABILITY: 20,
  REQUESTED_QUOTE: 40,
  ASKED_ABOUT_BOOKING: 25,
  ASKED_ABOUT_PAYMENT: 30,

  // Engagement signals
  EMAIL_OPENED: 5,
  EMAIL_OPENED_3_PLUS: 15,
  LINK_CLICKED: 10,
  RETURN_VISIT_7_DAYS: 20,
  MULTIPLE_CONVERSATIONS: 15,

  // Negative signals
  NO_ACTIVITY_7_DAYS: -10,
  NO_ACTIVITY_14_DAYS: -20,
  QUOTE_EXPIRED_NO_ACTION: -15,
};

// HNW threshold
export const HNW_THRESHOLD = 80;

// Status thresholds
export const STATUS_THRESHOLDS = {
  browsing: { min: 0, max: 20 },
  comparing: { min: 21, max: 40 },
  interested: { min: 41, max: 60 },
  ready_to_book: { min: 61, max: 79 },
  qualified: { min: 80, max: 100 },
};

export type LeadEventType =
  | "budget_mentioned"
  | "dates_mentioned"
  | "destination_mentioned"
  | "pax_mentioned"
  | "availability_asked"
  | "quote_requested"
  | "quote_received"
  | "booking_asked"
  | "payment_asked"
  | "email_opened"
  | "link_clicked"
  | "conversation_started"
  | "conversation_continued"
  | "return_visit"
  | "inactivity"
  | "quote_expired"
  | "manual_adjustment";

interface ScoreEventData {
  amount?: number;
  currency?: string;
  dates?: { start?: string; end?: string };
  month?: string;
  season?: string;
  destinations?: string[];
  pax?: number;
  quoteId?: number;
  reason?: string;
  adjustment?: number;
}

/**
 * Get or create lead score record for a client
 */
export async function getOrCreateLeadScore(clientId: number) {
  const existing = await db
    .select()
    .from(leadScores)
    .where(eq(leadScores.clientId, clientId))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  // Get client info for initial data
  const [client] = await db
    .select()
    .from(clients)
    .where(eq(clients.id, clientId))
    .limit(1);

  // Create new lead score record
  const [newScore] = await db
    .insert(leadScores)
    .values({
      clientId,
      currentScore: 0,
      status: "new",
      source: client?.source || "chat",
      firstActivityAt: new Date(),
      lastActivityAt: new Date(),
    })
    .returning();

  return newScore;
}

/**
 * Record a lead event and update score
 */
export async function recordLeadEvent(
  clientId: number,
  eventType: LeadEventType,
  eventData: ScoreEventData = {},
  source: string = "system",
  conversationId?: string
): Promise<{ newScore: number; scoreChange: number; status: string }> {
  // Get current score
  const leadScore = await getOrCreateLeadScore(clientId);
  const currentScore = leadScore.currentScore;

  // Calculate score change based on event type
  let scoreChange = 0;
  const updates: Partial<typeof leadScore> = {
    lastActivityAt: new Date(),
    updatedAt: new Date(),
  };

  switch (eventType) {
    case "budget_mentioned":
      if (eventData.amount) {
        if (eventData.amount >= 10000) {
          scoreChange = SCORING_RULES.BUDGET_MENTIONED_10K_PLUS;
        } else if (eventData.amount >= 5000) {
          scoreChange = SCORING_RULES.BUDGET_MENTIONED_5K_PLUS;
        } else {
          scoreChange = SCORING_RULES.BUDGET_MENTIONED_ANY;
        }
        updates.detectedBudget = eventData.amount.toString();
        updates.budgetCurrency = eventData.currency || "USD";
        updates.budgetSignalScore = (leadScore.budgetSignalScore || 0) + scoreChange;
      }
      break;

    case "dates_mentioned":
      if (eventData.dates?.start) {
        scoreChange = SCORING_RULES.SPECIFIC_DATES_MENTIONED;
        updates.detectedTravelDates = eventData.dates;
        updates.timelineScore = (leadScore.timelineScore || 0) + scoreChange;
      } else if (eventData.month) {
        scoreChange = SCORING_RULES.MONTH_MENTIONED;
        updates.timelineScore = (leadScore.timelineScore || 0) + scoreChange;
      } else if (eventData.season) {
        scoreChange = SCORING_RULES.SEASON_MENTIONED;
        updates.timelineScore = (leadScore.timelineScore || 0) + scoreChange;
      }
      break;

    case "destination_mentioned":
      if (eventData.destinations) {
        scoreChange = 5 * eventData.destinations.length; // 5 points per destination
        const existing = (leadScore.detectedDestinations as string[]) || [];
        const newDestinations = [...new Set([...existing, ...eventData.destinations])];
        updates.detectedDestinations = newDestinations;
      }
      break;

    case "pax_mentioned":
      if (eventData.pax) {
        scoreChange = 5;
        updates.detectedPax = eventData.pax;
        // Larger groups = higher value
        if (eventData.pax >= 10) scoreChange += 10;
        else if (eventData.pax >= 4) scoreChange += 5;
      }
      break;

    case "availability_asked":
      scoreChange = SCORING_RULES.ASKED_ABOUT_AVAILABILITY;
      updates.intentScore = (leadScore.intentScore || 0) + scoreChange;
      break;

    case "quote_requested":
      scoreChange = SCORING_RULES.REQUESTED_QUOTE;
      updates.quotesRequested = (leadScore.quotesRequested || 0) + 1;
      updates.intentScore = (leadScore.intentScore || 0) + scoreChange;
      break;

    case "quote_received":
      updates.quotesReceived = (leadScore.quotesReceived || 0) + 1;
      scoreChange = 5; // Small bump for receiving quote
      break;

    case "booking_asked":
      scoreChange = SCORING_RULES.ASKED_ABOUT_BOOKING;
      updates.intentScore = (leadScore.intentScore || 0) + scoreChange;
      break;

    case "payment_asked":
      scoreChange = SCORING_RULES.ASKED_ABOUT_PAYMENT;
      updates.intentScore = (leadScore.intentScore || 0) + scoreChange;
      break;

    case "email_opened":
      const openCount = (leadScore.emailsOpened || 0) + 1;
      updates.emailsOpened = openCount;
      if (openCount >= 3) {
        scoreChange = SCORING_RULES.EMAIL_OPENED_3_PLUS;
      } else {
        scoreChange = SCORING_RULES.EMAIL_OPENED;
      }
      updates.engagementScore = (leadScore.engagementScore || 0) + scoreChange;
      break;

    case "link_clicked":
      updates.linksClicked = (leadScore.linksClicked || 0) + 1;
      scoreChange = SCORING_RULES.LINK_CLICKED;
      updates.engagementScore = (leadScore.engagementScore || 0) + scoreChange;
      break;

    case "conversation_started":
      updates.totalConversations = (leadScore.totalConversations || 0) + 1;
      updates.lastConversationAt = new Date();
      if ((leadScore.totalConversations || 0) > 0) {
        scoreChange = SCORING_RULES.MULTIPLE_CONVERSATIONS;
      }
      updates.engagementScore = (leadScore.engagementScore || 0) + Math.max(scoreChange, 5);
      break;

    case "conversation_continued":
      updates.totalMessages = (leadScore.totalMessages || 0) + 1;
      updates.lastConversationAt = new Date();
      // Small engagement bump for each message
      scoreChange = 1;
      updates.engagementScore = (leadScore.engagementScore || 0) + scoreChange;
      break;

    case "return_visit":
      scoreChange = SCORING_RULES.RETURN_VISIT_7_DAYS;
      updates.engagementScore = (leadScore.engagementScore || 0) + scoreChange;
      break;

    case "inactivity":
      if (eventData.reason === "7_days") {
        scoreChange = SCORING_RULES.NO_ACTIVITY_7_DAYS;
      } else if (eventData.reason === "14_days") {
        scoreChange = SCORING_RULES.NO_ACTIVITY_14_DAYS;
      }
      break;

    case "quote_expired":
      scoreChange = SCORING_RULES.QUOTE_EXPIRED_NO_ACTION;
      break;

    case "manual_adjustment":
      scoreChange = eventData.adjustment || 0;
      break;
  }

  // Calculate new score (bounded 0-100)
  const newScore = Math.max(0, Math.min(100, currentScore + scoreChange));

  // Determine new status
  let newStatus = leadScore.status;
  if (newScore >= HNW_THRESHOLD) {
    newStatus = "qualified";
    updates.isHighValue = true;
    updates.requiresHumanHandoff = true;
    updates.handoffReason = `Lead score reached ${newScore} (HNW threshold: ${HNW_THRESHOLD})`;
  } else if (newScore >= STATUS_THRESHOLDS.ready_to_book.min) {
    newStatus = "ready_to_book";
  } else if (newScore >= STATUS_THRESHOLDS.interested.min) {
    newStatus = "interested";
  } else if (newScore >= STATUS_THRESHOLDS.comparing.min) {
    newStatus = "comparing";
  } else if (newScore >= STATUS_THRESHOLDS.browsing.min) {
    newStatus = "browsing";
  }

  // Update lead score
  updates.currentScore = newScore;
  updates.status = newStatus;

  await db
    .update(leadScores)
    .set(updates)
    .where(eq(leadScores.clientId, clientId));

  // Log the event
  await db.insert(leadEvents).values({
    clientId,
    eventType,
    eventData,
    scoreChange,
    scoreBefore: currentScore,
    scoreAfter: newScore,
    source,
    conversationId,
  });

  return { newScore, scoreChange, status: newStatus };
}

/**
 * Analyze conversation text for scoring signals
 */
export function analyzeConversationForSignals(text: string): {
  events: Array<{ type: LeadEventType; data: ScoreEventData }>;
} {
  const events: Array<{ type: LeadEventType; data: ScoreEventData }> = [];
  const lowerText = text.toLowerCase();

  // Budget detection patterns
  const budgetPatterns = [
    /\$\s*([\d,]+)/g,
    /budget[:\s]*([\d,]+)/gi,
    /([\d,]+)\s*(?:usd|dollars?)/gi,
    /around\s*([\d,]+)/gi,
    /approximately\s*([\d,]+)/gi,
  ];

  for (const pattern of budgetPatterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const amount = parseInt(match[1].replace(/,/g, ""));
      if (amount >= 1000) {
        events.push({
          type: "budget_mentioned",
          data: { amount, currency: "USD" },
        });
        break; // Only count once
      }
    }
    if (events.some((e) => e.type === "budget_mentioned")) break;
  }

  // Date detection patterns
  const datePatterns = [
    /(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s*\d{1,2}(?:st|nd|rd|th)?(?:\s*,?\s*\d{4})?/gi,
    /\d{1,2}[-/]\d{1,2}[-/]\d{2,4}/g,
  ];

  for (const pattern of datePatterns) {
    if (pattern.test(text)) {
      events.push({
        type: "dates_mentioned",
        data: { dates: { start: "detected" } },
      });
      break;
    }
  }

  // Month/Season detection
  const months = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
  const seasons = ["spring", "summer", "fall", "autumn", "winter", "monsoon"];

  for (const month of months) {
    if (lowerText.includes(month)) {
      if (!events.some((e) => e.type === "dates_mentioned")) {
        events.push({
          type: "dates_mentioned",
          data: { month },
        });
      }
      break;
    }
  }

  for (const season of seasons) {
    if (lowerText.includes(season)) {
      if (!events.some((e) => e.type === "dates_mentioned")) {
        events.push({
          type: "dates_mentioned",
          data: { season },
        });
      }
      break;
    }
  }

  // Destination detection
  const destinations = [
    "nepal", "kathmandu", "pokhara", "everest", "annapurna", "chitwan", "lumbini",
    "bhutan", "paro", "thimphu", "punakha",
    "tibet", "lhasa", "shigatse",
    "india", "delhi", "agra", "jaipur", "varanasi", "darjeeling", "sikkim"
  ];

  const detectedDestinations: string[] = [];
  for (const dest of destinations) {
    if (lowerText.includes(dest)) {
      detectedDestinations.push(dest);
    }
  }
  if (detectedDestinations.length > 0) {
    events.push({
      type: "destination_mentioned",
      data: { destinations: detectedDestinations },
    });
  }

  // Pax detection
  const paxPatterns = [
    /(\d+)\s*(?:people|persons?|pax|travelers?|guests?)/gi,
    /(?:for|group of)\s*(\d+)/gi,
    /(\d+)\s*(?:of us|adults?)/gi,
  ];

  for (const pattern of paxPatterns) {
    const match = pattern.exec(text);
    if (match) {
      const pax = parseInt(match[1]);
      if (pax > 0 && pax <= 100) {
        events.push({
          type: "pax_mentioned",
          data: { pax },
        });
        break;
      }
    }
  }

  // Intent signals
  const availabilityKeywords = ["available", "availability", "open dates", "can you check"];
  const quoteKeywords = ["quote", "price", "cost", "how much", "pricing", "estimate"];
  const bookingKeywords = ["book", "booking", "reserve", "confirm", "proceed"];
  const paymentKeywords = ["pay", "payment", "deposit", "card", "transfer", "invoice"];

  if (availabilityKeywords.some((k) => lowerText.includes(k))) {
    events.push({ type: "availability_asked", data: {} });
  }

  if (quoteKeywords.some((k) => lowerText.includes(k))) {
    events.push({ type: "quote_requested", data: {} });
  }

  if (bookingKeywords.some((k) => lowerText.includes(k))) {
    events.push({ type: "booking_asked", data: {} });
  }

  if (paymentKeywords.some((k) => lowerText.includes(k))) {
    events.push({ type: "payment_asked", data: {} });
  }

  return { events };
}

/**
 * Process a conversation and update lead score
 */
export async function processConversationForScoring(
  clientId: number,
  messageText: string,
  conversationId?: string
): Promise<{ newScore: number; eventsRecorded: number }> {
  const { events } = analyzeConversationForSignals(messageText);

  let latestScore = 0;
  let eventsRecorded = 0;

  for (const event of events) {
    const result = await recordLeadEvent(
      clientId,
      event.type,
      event.data,
      "chat",
      conversationId
    );
    latestScore = result.newScore;
    eventsRecorded++;
  }

  // Always record conversation activity if no other events
  if (events.length === 0) {
    const result = await recordLeadEvent(
      clientId,
      "conversation_continued",
      {},
      "chat",
      conversationId
    );
    latestScore = result.newScore;
    eventsRecorded = 1;
  }

  return { newScore: latestScore, eventsRecorded };
}

/**
 * Mark a lead as converted (when they book)
 */
export async function markLeadConverted(
  clientId: number,
  bookingId?: number
): Promise<{ success: boolean; previousStatus: string }> {
  const leadScore = await getOrCreateLeadScore(clientId);
  const previousStatus = leadScore.status;

  // Update lead score to converted
  await db
    .update(leadScores)
    .set({
      status: "converted",
      currentScore: 100,
      isHighValue: true,
      convertedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(leadScores.clientId, clientId));

  // Log conversion event
  await db.insert(leadEvents).values({
    clientId,
    eventType: "manual_adjustment",
    eventData: { reason: "converted", bookingId },
    scoreChange: 100 - leadScore.currentScore,
    scoreBefore: leadScore.currentScore,
    scoreAfter: 100,
    source: "system",
  });

  // Cancel any active nurture sequences
  try {
    const { cancelOnConversion } = await import("./nurture-engine");
    await cancelOnConversion(clientId);
  } catch (error) {
    console.error("Failed to cancel nurture sequences on conversion:", error);
  }

  return { success: true, previousStatus };
}

/**
 * Mark a lead as lost
 */
export async function markLeadLost(
  clientId: number,
  reason: string
): Promise<{ success: boolean }> {
  const leadScore = await getOrCreateLeadScore(clientId);

  await db
    .update(leadScores)
    .set({
      status: "lost",
      lostReason: reason,
      updatedAt: new Date(),
    })
    .where(eq(leadScores.clientId, clientId));

  // Log lost event
  await db.insert(leadEvents).values({
    clientId,
    eventType: "manual_adjustment",
    eventData: { reason: "lost", lostReason: reason },
    scoreChange: 0,
    scoreBefore: leadScore.currentScore,
    scoreAfter: leadScore.currentScore,
    source: "system",
  });

  // Cancel any active nurture sequences
  try {
    const { cancelOnConversion } = await import("./nurture-engine");
    await cancelOnConversion(clientId);
  } catch (error) {
    console.error("Failed to cancel nurture sequences on lost:", error);
  }

  return { success: true };
}

/**
 * Get lead score summary for a client
 */
export async function getLeadScoreSummary(clientId: number) {
  const leadScore = await getOrCreateLeadScore(clientId);

  // Get recent events
  const recentEvents = await db
    .select()
    .from(leadEvents)
    .where(eq(leadEvents.clientId, clientId))
    .orderBy(leadEvents.createdAt)
    .limit(20);

  return {
    score: leadScore.currentScore,
    status: leadScore.status,
    isHighValue: leadScore.isHighValue,
    requiresHandoff: leadScore.requiresHumanHandoff,
    components: {
      budget: leadScore.budgetSignalScore || 0,
      timeline: leadScore.timelineScore || 0,
      engagement: leadScore.engagementScore || 0,
      intent: leadScore.intentScore || 0,
    },
    detected: {
      budget: leadScore.detectedBudget
        ? { amount: parseFloat(leadScore.detectedBudget), currency: leadScore.budgetCurrency }
        : null,
      travelDates: leadScore.detectedTravelDates,
      destinations: leadScore.detectedDestinations,
      pax: leadScore.detectedPax,
    },
    engagement: {
      totalConversations: leadScore.totalConversations || 0,
      totalMessages: leadScore.totalMessages || 0,
      quotesRequested: leadScore.quotesRequested || 0,
      emailsOpened: leadScore.emailsOpened || 0,
    },
    activity: {
      firstActivity: leadScore.firstActivityAt,
      lastActivity: leadScore.lastActivityAt,
      lastConversation: leadScore.lastConversationAt,
    },
    recentEvents: recentEvents.map((e) => ({
      type: e.eventType,
      scoreChange: e.scoreChange,
      timestamp: e.createdAt,
    })),
  };
}
