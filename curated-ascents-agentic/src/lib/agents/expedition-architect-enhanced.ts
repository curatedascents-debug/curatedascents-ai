/**
 * Enhanced Expedition Architect
 * Advanced AI capabilities for personalized trip planning
 */

import { db } from "@/db";
import {
  clients,
  clientContentPreferences,
  leadScores,
  quotes,
  quoteItems,
  bookings,
  inventoryHolds,
  permitsFees,
  destinations,
} from "@/db/schema";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";

// ============================================
// TYPES
// ============================================

export interface ClientProfile {
  id: number;
  email: string | null;
  name: string | null;
  preferences: {
    travelStyle?: string;
    interests?: string[];
    dietaryRestrictions?: string[];
    accessibilityNeeds?: string[];
    preferredLanguage?: string;
    formalityLevel?: string;
    communicationStyle?: string;
    specialOccasions?: Array<{ type: string; date: string }>;
  };
  leadScore?: {
    score: number;
    status: string;
    detectedBudget?: string;
    detectedDestinations?: string[];
    detectedTravelDates?: string;
    detectedGroupSize?: number;
  };
  pastTrips: Array<{
    destination: string;
    date: string;
    type: string;
  }>;
  activeQuotes: Array<{
    id: number;
    name: string;
    destination: string;
    status: string;
    totalPrice: string;
  }>;
}

export interface ConversationMemory {
  recentMessages: Array<{
    role: string;
    content: string;
    timestamp: string;
  }>;
  extractedContext: {
    mentionedDestinations: string[];
    mentionedDates: string[];
    mentionedBudget?: string;
    travelersCount?: number;
    tripType?: string;
    interests: string[];
  };
}

export interface AvailabilityResult {
  available: boolean;
  serviceType: string;
  serviceName: string;
  requestedDate: string;
  reason?: string;
  alternatives?: string[];
}

export interface AcclimatizationCheck {
  valid: boolean;
  issues: string[];
  recommendations: string[];
  maxAltitudeReached: number;
  dailyAltitudeGains: Array<{ day: number; gain: number; altitude: number }>;
}

export interface PermitValidation {
  valid: boolean;
  permits: Array<{
    name: string;
    required: boolean;
    leadTimeDays: number;
    available: boolean;
    issue?: string;
  }>;
  overallIssue?: string;
}

export interface UpsellSuggestion {
  type: string;
  title: string;
  description: string;
  relevanceScore: number;
  priceRange?: string;
}

// ============================================
// CLIENT PROFILE LOADING
// ============================================

/**
 * Load complete client profile for personalization
 */
export async function loadClientProfile(clientId: number): Promise<ClientProfile | null> {
  try {
    // Get basic client info
    const clientResult = await db
      .select({
        id: clients.id,
        email: clients.email,
        name: clients.name,
        preferences: clients.preferences,
      })
      .from(clients)
      .where(eq(clients.id, clientId))
      .limit(1);

    if (clientResult.length === 0) return null;

    const client = clientResult[0];

    // Get detailed preferences
    const prefsResult = await db
      .select()
      .from(clientContentPreferences)
      .where(eq(clientContentPreferences.clientId, clientId))
      .limit(1);

    // Get lead score
    const scoreResult = await db
      .select({
        score: leadScores.currentScore,
        status: leadScores.status,
        detectedBudget: leadScores.detectedBudget,
        detectedDestinations: leadScores.detectedDestinations,
        detectedTravelDates: leadScores.detectedTravelDates,
        detectedPax: leadScores.detectedPax,
      })
      .from(leadScores)
      .where(eq(leadScores.clientId, clientId))
      .limit(1);

    // Get past bookings
    const pastBookings = await db
      .select({
        destination: quotes.destination,
        startDate: quotes.startDate,
        quoteName: quotes.quoteName,
      })
      .from(bookings)
      .innerJoin(quotes, eq(bookings.quoteId, quotes.id))
      .where(
        and(
          eq(bookings.clientId, clientId),
          eq(bookings.status, "completed")
        )
      )
      .orderBy(desc(quotes.startDate))
      .limit(5);

    // Get active quotes
    const activeQuotes = await db
      .select({
        id: quotes.id,
        name: quotes.quoteName,
        destination: quotes.destination,
        status: quotes.status,
        totalPrice: quotes.totalSellPrice,
      })
      .from(quotes)
      .where(
        and(
          eq(quotes.clientId, clientId),
          sql`${quotes.status} IN ('draft', 'sent', 'viewed')`
        )
      )
      .orderBy(desc(quotes.createdAt))
      .limit(3);

    const prefs = prefsResult[0];
    const score = scoreResult[0];

    return {
      id: client.id,
      email: client.email,
      name: client.name,
      preferences: {
        travelStyle: prefs?.travelStyle || (client.preferences as any)?.travelStyle,
        interests: prefs?.interests as string[] || [],
        dietaryRestrictions: prefs?.dietaryRestrictions as string[] || [],
        accessibilityNeeds: prefs?.accessibilityNeeds as string[] || [],
        preferredLanguage: prefs?.preferredLanguage || "en",
        formalityLevel: prefs?.formalityLevel || "professional",
        communicationStyle: prefs?.communicationStyle || "detailed",
        specialOccasions: prefs?.specialOccasions as any[] || [],
      },
      leadScore: score ? {
        score: score.score || 0,
        status: score.status || "new",
        detectedBudget: score.detectedBudget || undefined,
        detectedDestinations: score.detectedDestinations as string[] || [],
        detectedTravelDates: JSON.stringify(score.detectedTravelDates) || undefined,
        detectedGroupSize: score.detectedPax || undefined,
      } : undefined,
      pastTrips: pastBookings.map(b => ({
        destination: b.destination || "Unknown",
        date: b.startDate || "",
        type: b.quoteName || "Trip",
      })),
      activeQuotes: activeQuotes.map(q => ({
        id: q.id,
        name: q.name || "Untitled Quote",
        destination: q.destination || "Unknown",
        status: q.status || "draft",
        totalPrice: q.totalPrice || "0",
      })),
    };
  } catch (error) {
    console.error("Error loading client profile:", error);
    return null;
  }
}

// ============================================
// CONVERSATION MEMORY
// ============================================

/**
 * Load and analyze recent conversation history
 */
export async function loadConversationMemory(
  clientId: number,
  currentConversationId?: string
): Promise<ConversationMemory> {
  try {
    // Get conversation history from client record
    const clientResult = await db
      .select({ conversationHistory: clients.conversationHistory })
      .from(clients)
      .where(eq(clients.id, clientId))
      .limit(1);

    const history = clientResult[0]?.conversationHistory as any[] || [];

    // Get last 20 messages
    const recentMessages = history.slice(-20).map((msg: any) => ({
      role: msg.role || "user",
      content: msg.content || "",
      timestamp: msg.timestamp || new Date().toISOString(),
    }));

    // Extract context from messages
    const extractedContext = extractConversationContext(recentMessages);

    return {
      recentMessages,
      extractedContext,
    };
  } catch (error) {
    console.error("Error loading conversation memory:", error);
    return {
      recentMessages: [],
      extractedContext: {
        mentionedDestinations: [],
        mentionedDates: [],
        interests: [],
      },
    };
  }
}

/**
 * Extract key context from conversation messages
 */
function extractConversationContext(messages: Array<{ role: string; content: string }>) {
  const context = {
    mentionedDestinations: [] as string[],
    mentionedDates: [] as string[],
    mentionedBudget: undefined as string | undefined,
    travelersCount: undefined as number | undefined,
    tripType: undefined as string | undefined,
    interests: [] as string[],
  };

  const destinationPatterns = [
    /\b(everest|annapurna|langtang|manaslu|mustang|dolpo)\b/gi,
    /\b(kathmandu|pokhara|chitwan|lumbini|nagarkot)\b/gi,
    /\b(bhutan|paro|thimphu|punakha)\b/gi,
    /\b(tibet|lhasa|shigatse)\b/gi,
    /\b(nepal|india|darjeeling|sikkim)\b/gi,
  ];

  const datePatterns = [
    /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s*\d{0,4}\b/gi,
    /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/g,
    /\b(spring|summer|fall|autumn|winter)\s*\d{0,4}\b/gi,
    /\b(next\s+)?(week|month|year)\b/gi,
  ];

  const budgetPatterns = [
    /\$\s*[\d,]+(?:\s*-\s*\$?\s*[\d,]+)?/g,
    /budget\s*(?:of|around|is)?\s*\$?\s*[\d,]+/gi,
    /[\d,]+\s*(?:usd|dollars?)/gi,
  ];

  const travelersPatterns = [
    /(\d+)\s*(?:people|persons?|travelers?|pax|of us)/gi,
    /(?:group of|party of|family of)\s*(\d+)/gi,
    /(?:couple|two of us|just me|solo)/gi,
  ];

  const interestPatterns = [
    /\b(trekking|hiking|climbing|mountaineering)\b/gi,
    /\b(cultural?|heritage|temples?|monasteries?)\b/gi,
    /\b(wildlife|safari|jungle|nature)\b/gi,
    /\b(photography|adventure|relaxation|spa)\b/gi,
    /\b(luxury|budget|mid-range|comfortable)\b/gi,
  ];

  for (const msg of messages) {
    if (msg.role !== "user") continue;
    const text = msg.content;

    // Extract destinations
    for (const pattern of destinationPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        context.mentionedDestinations.push(
          ...matches.map(m => m.toLowerCase())
        );
      }
    }

    // Extract dates
    for (const pattern of datePatterns) {
      const matches = text.match(pattern);
      if (matches) {
        context.mentionedDates.push(...matches);
      }
    }

    // Extract budget
    for (const pattern of budgetPatterns) {
      const match = text.match(pattern);
      if (match && !context.mentionedBudget) {
        context.mentionedBudget = match[0];
      }
    }

    // Extract travelers count
    for (const pattern of travelersPatterns) {
      const match = pattern.exec(text);
      if (match) {
        if (match[1]) {
          context.travelersCount = parseInt(match[1]);
        } else if (/couple|two of us/i.test(match[0])) {
          context.travelersCount = 2;
        } else if (/just me|solo/i.test(match[0])) {
          context.travelersCount = 1;
        }
      }
    }

    // Extract interests
    for (const pattern of interestPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        context.interests.push(...matches.map(m => m.toLowerCase()));
      }
    }
  }

  // Deduplicate
  context.mentionedDestinations = [...new Set(context.mentionedDestinations)];
  context.mentionedDates = [...new Set(context.mentionedDates)];
  context.interests = [...new Set(context.interests)];

  return context;
}

/**
 * Save conversation to client's history
 */
export async function saveConversationMessage(
  clientId: number,
  message: { role: string; content: string }
): Promise<void> {
  try {
    const clientResult = await db
      .select({ conversationHistory: clients.conversationHistory })
      .from(clients)
      .where(eq(clients.id, clientId))
      .limit(1);

    const history = (clientResult[0]?.conversationHistory as any[]) || [];

    // Add new message with timestamp
    history.push({
      ...message,
      timestamp: new Date().toISOString(),
    });

    // Keep last 100 messages
    const trimmedHistory = history.slice(-100);

    await db
      .update(clients)
      .set({ conversationHistory: trimmedHistory })
      .where(eq(clients.id, clientId));
  } catch (error) {
    console.error("Error saving conversation message:", error);
  }
}

// ============================================
// AVAILABILITY CHECKING
// ============================================

/**
 * Check real-time availability for a service
 */
export async function checkAvailability(
  serviceType: string,
  serviceId: number,
  startDate: string,
  endDate: string,
  quantity: number = 1
): Promise<AvailabilityResult> {
  try {
    // Check inventory holds for the date range
    // inventoryHolds uses holdDate (single date per hold), so we check if any holds
    // fall within our requested date range
    const holds = await db
      .select({
        quantity: inventoryHolds.quantity,
        status: inventoryHolds.status,
        holdDate: inventoryHolds.holdDate,
      })
      .from(inventoryHolds)
      .where(
        and(
          eq(inventoryHolds.serviceType, serviceType),
          eq(inventoryHolds.serviceId, serviceId),
          sql`${inventoryHolds.status} IN ('active', 'confirmed')`,
          sql`${inventoryHolds.holdDate} >= ${startDate}`,
          sql`${inventoryHolds.holdDate} <= ${endDate}`,
          eq(inventoryHolds.isExpired, false)
        )
      );

    const totalHeld = holds.reduce((sum, h) => sum + (h.quantity || 0), 0);

    // For simplicity, assume base capacity of 10 for most services
    // In production, this would come from the service's actual capacity
    const baseCapacity = 10;
    const availableCapacity = baseCapacity - totalHeld;

    if (availableCapacity >= quantity) {
      return {
        available: true,
        serviceType,
        serviceName: `Service #${serviceId}`,
        requestedDate: startDate,
      };
    } else {
      return {
        available: false,
        serviceType,
        serviceName: `Service #${serviceId}`,
        requestedDate: startDate,
        reason: `Only ${availableCapacity} units available (${quantity} requested)`,
        alternatives: [
          "Consider alternative dates",
          "Check similar services in the area",
        ],
      };
    }
  } catch (error) {
    console.error("Error checking availability:", error);
    return {
      available: true, // Default to available on error
      serviceType,
      serviceName: `Service #${serviceId}`,
      requestedDate: startDate,
      reason: "Could not verify availability - please confirm with our team",
    };
  }
}

// ============================================
// ALTITUDE ACCLIMATIZATION
// ============================================

// Altitude data for common destinations
const ALTITUDE_DATA: Record<string, number> = {
  kathmandu: 1400,
  lukla: 2860,
  namche_bazaar: 3440,
  tengboche: 3867,
  dingboche: 4410,
  lobuche: 4940,
  gorak_shep: 5164,
  everest_base_camp: 5364,
  kala_patthar: 5545,
  pokhara: 822,
  jomsom: 2720,
  muktinath: 3800,
  thorong_la: 5416,
  manang: 3540,
  poon_hill: 3210,
  annapurna_base_camp: 4130,
  langtang_village: 3430,
  kyanjin_gompa: 3870,
  tserko_ri: 4984,
  lhasa: 3650,
  shigatse: 3840,
  rongbuk: 5000,
  paro: 2200,
  thimphu: 2320,
  punakha: 1200,
  bumthang: 2600,
};

/**
 * Validate trek itinerary for proper altitude acclimatization
 */
export function validateAcclimatization(
  itinerary: Array<{ day: number; location: string; overnightAltitude?: number }>
): AcclimatizationCheck {
  const result: AcclimatizationCheck = {
    valid: true,
    issues: [],
    recommendations: [],
    maxAltitudeReached: 0,
    dailyAltitudeGains: [],
  };

  let previousAltitude = 0;
  let consecutiveHighGains = 0;

  for (const day of itinerary) {
    // Get altitude for location
    const locationKey = day.location.toLowerCase().replace(/\s+/g, "_");
    const altitude = day.overnightAltitude || ALTITUDE_DATA[locationKey] || 0;

    if (altitude === 0) continue;

    result.maxAltitudeReached = Math.max(result.maxAltitudeReached, altitude);

    const gain = altitude - previousAltitude;
    result.dailyAltitudeGains.push({
      day: day.day,
      gain,
      altitude,
    });

    // Rule 1: Don't gain more than 500m sleeping altitude per day above 3000m
    if (previousAltitude >= 3000 && gain > 500) {
      result.valid = false;
      result.issues.push(
        `Day ${day.day}: Altitude gain of ${gain}m exceeds recommended 500m/day above 3000m`
      );
    }

    // Rule 2: Every 1000m above 3000m, include a rest day
    if (altitude >= 4000 && gain > 0) {
      consecutiveHighGains++;
      if (consecutiveHighGains >= 3) {
        result.recommendations.push(
          `Consider adding a rest day around Day ${day.day} for acclimatization`
        );
        consecutiveHighGains = 0;
      }
    } else if (gain <= 0) {
      consecutiveHighGains = 0;
    }

    // Rule 3: Don't jump directly to high altitude
    if (previousAltitude < 2500 && altitude > 3500) {
      result.valid = false;
      result.issues.push(
        `Day ${day.day}: Jumping from ${previousAltitude}m to ${altitude}m is too rapid`
      );
    }

    previousAltitude = altitude;
  }

  // General recommendations
  if (result.maxAltitudeReached > 5000) {
    result.recommendations.push(
      "Consider carrying Diamox (Acetazolamide) for altitudes above 5000m"
    );
    result.recommendations.push(
      "Ensure adequate hydration (3-4 liters/day at high altitude)"
    );
  }

  if (result.maxAltitudeReached > 4000) {
    result.recommendations.push(
      "Climb high, sleep low when possible"
    );
  }

  return result;
}

// ============================================
// PERMIT VALIDATION
// ============================================

// Permit requirements database
const PERMIT_REQUIREMENTS: Record<string, {
  permits: Array<{
    name: string;
    leadTimeDays: number;
    restrictions?: string;
  }>;
}> = {
  tibet: {
    permits: [
      { name: "Tibet Travel Permit", leadTimeDays: 30, restrictions: "Chinese group visa required" },
      { name: "Alien Travel Permit", leadTimeDays: 30 },
      { name: "Military Permit (for border areas)", leadTimeDays: 45 },
    ],
  },
  everest: {
    permits: [
      { name: "Sagarmatha National Park Entry", leadTimeDays: 1 },
      { name: "TIMS Card", leadTimeDays: 1 },
    ],
  },
  annapurna: {
    permits: [
      { name: "Annapurna Conservation Area Permit (ACAP)", leadTimeDays: 1 },
      { name: "TIMS Card", leadTimeDays: 1 },
    ],
  },
  mustang: {
    permits: [
      { name: "Upper Mustang Restricted Area Permit", leadTimeDays: 7 },
      { name: "ACAP", leadTimeDays: 1 },
      { name: "TIMS Card", leadTimeDays: 1 },
    ],
  },
  dolpo: {
    permits: [
      { name: "Dolpo Restricted Area Permit", leadTimeDays: 14 },
      { name: "Shey Phoksundo National Park Entry", leadTimeDays: 1 },
    ],
  },
  manaslu: {
    permits: [
      { name: "Manaslu Restricted Area Permit", leadTimeDays: 7 },
      { name: "Manaslu Conservation Area Permit", leadTimeDays: 1 },
      { name: "TIMS Card", leadTimeDays: 1 },
    ],
  },
  bhutan: {
    permits: [
      { name: "Bhutan Visa", leadTimeDays: 14 },
      { name: "Sustainable Development Fee (SDF)", leadTimeDays: 7 },
    ],
  },
};

/**
 * Validate permit requirements for a destination
 */
export async function validatePermits(
  destinationRegion: string,
  tripStartDate: string,
  nationality?: string
): Promise<PermitValidation> {
  const today = new Date();
  const startDate = new Date(tripStartDate);
  const daysUntilTrip = Math.ceil(
    (startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  const region = destinationRegion.toLowerCase();
  const requirements = PERMIT_REQUIREMENTS[region];

  if (!requirements) {
    return {
      valid: true,
      permits: [],
    };
  }

  const result: PermitValidation = {
    valid: true,
    permits: [],
  };

  for (const permit of requirements.permits) {
    const available = daysUntilTrip >= permit.leadTimeDays;

    result.permits.push({
      name: permit.name,
      required: true,
      leadTimeDays: permit.leadTimeDays,
      available,
      issue: available
        ? undefined
        : `Requires ${permit.leadTimeDays} days lead time (only ${daysUntilTrip} days available)`,
    });

    if (!available) {
      result.valid = false;
    }
  }

  if (!result.valid) {
    result.overallIssue = `Some permits cannot be obtained in time. Consider postponing the trip start date.`;
  }

  return result;
}

// ============================================
// UPSELLING SUGGESTIONS
// ============================================

/**
 * Generate contextual upselling suggestions based on trip and client profile
 */
export function generateUpsellSuggestions(
  tripType: string,
  destination: string,
  clientProfile?: ClientProfile,
  currentServices?: string[]
): UpsellSuggestion[] {
  const suggestions: UpsellSuggestion[] = [];
  const current = currentServices?.map(s => s.toLowerCase()) || [];
  const travelStyle = clientProfile?.preferences.travelStyle || "comfort";
  const interests = clientProfile?.preferences.interests || [];

  // Helicopter flight suggestions for trek clients
  if (tripType.includes("trek") && !current.includes("helicopter")) {
    suggestions.push({
      type: "helicopter",
      title: "Scenic Helicopter Return",
      description: "Skip the return trek with a breathtaking helicopter flight back to Lukla or Kathmandu. Save 3-4 days while enjoying panoramic Himalayan views.",
      relevanceScore: 85,
      priceRange: "$350-500/person",
    });
  }

  // Luxury upgrade for comfort/luxury travelers
  if (["luxury", "comfort"].includes(travelStyle) && !current.includes("upgrade")) {
    suggestions.push({
      type: "accommodation_upgrade",
      title: "Premium Lodge Upgrade",
      description: "Upgrade to premium lodges with private bathrooms, heating, and gourmet meals for enhanced comfort during your trek.",
      relevanceScore: 80,
      priceRange: "+$50-100/night",
    });
  }

  // Photography add-on for photography enthusiasts
  if (interests.includes("photography") && !current.includes("photography")) {
    suggestions.push({
      type: "photography",
      title: "Professional Photography Package",
      description: "Add a professional photographer to capture your journey, including edited photos and a photo book.",
      relevanceScore: 75,
      priceRange: "$200-400",
    });
  }

  // Spa & wellness for luxury travelers
  if (travelStyle === "luxury" && destination.includes("kathmandu")) {
    suggestions.push({
      type: "wellness",
      title: "Post-Trek Spa Recovery",
      description: "Treat yourself to a rejuvenating spa day at a 5-star hotel after your trek. Includes massage, steam, and wellness treatments.",
      relevanceScore: 70,
      priceRange: "$100-200",
    });
  }

  // Cultural add-ons
  if (interests.includes("cultural") || interests.includes("heritage")) {
    suggestions.push({
      type: "cultural",
      title: "Private Cultural Guide",
      description: "Add a cultural expert guide for in-depth exploration of temples, monasteries, and local traditions.",
      relevanceScore: 65,
      priceRange: "$50-80/day",
    });
  }

  // Wildlife extension
  if (interests.includes("wildlife") && !destination.includes("chitwan")) {
    suggestions.push({
      type: "extension",
      title: "Chitwan Wildlife Safari Extension",
      description: "Add 2-3 days at Chitwan National Park for jungle safaris, elephant encounters, and bird watching.",
      relevanceScore: 60,
      priceRange: "$300-500",
    });
  }

  // Sort by relevance
  return suggestions.sort((a, b) => b.relevanceScore - a.relevanceScore);
}

// ============================================
// PERSONALIZED SYSTEM PROMPT BUILDER
// ============================================

/**
 * Build an enhanced system prompt with client personalization
 */
export function buildPersonalizedSystemPrompt(
  basePrompt: string,
  clientProfile?: ClientProfile | null,
  conversationMemory?: ConversationMemory | null
): string {
  let prompt = basePrompt;

  // Add client context section
  if (clientProfile) {
    prompt += `\n\n## CLIENT CONTEXT
You are speaking with ${clientProfile.name || "a returning client"}.`;

    // Add preferences
    if (clientProfile.preferences.travelStyle) {
      prompt += `\n- Travel Style: ${clientProfile.preferences.travelStyle}`;
    }
    if (clientProfile.preferences.interests?.length) {
      prompt += `\n- Interests: ${clientProfile.preferences.interests.join(", ")}`;
    }
    if (clientProfile.preferences.communicationStyle) {
      prompt += `\n- Communication Preference: ${clientProfile.preferences.communicationStyle}`;
    }
    if (clientProfile.preferences.dietaryRestrictions?.length) {
      prompt += `\n- Dietary Restrictions: ${clientProfile.preferences.dietaryRestrictions.join(", ")}`;
    }
    if (clientProfile.preferences.accessibilityNeeds?.length) {
      prompt += `\n- Accessibility Needs: ${clientProfile.preferences.accessibilityNeeds.join(", ")}`;
    }

    // Add special occasions
    const upcomingOccasions = clientProfile.preferences.specialOccasions?.filter(o => {
      const occasionDate = new Date(o.date);
      const now = new Date();
      const monthsDiff = (occasionDate.getFullYear() - now.getFullYear()) * 12 +
                         (occasionDate.getMonth() - now.getMonth());
      return monthsDiff >= 0 && monthsDiff <= 3;
    });
    if (upcomingOccasions?.length) {
      prompt += `\n- Upcoming Special Occasions: ${upcomingOccasions.map(o => `${o.type} on ${o.date}`).join(", ")}`;
    }

    // Add past trip context
    if (clientProfile.pastTrips.length > 0) {
      prompt += `\n- Past Trips: ${clientProfile.pastTrips.map(t => `${t.destination} (${t.date})`).join(", ")}`;
    }

    // Add active quotes
    if (clientProfile.activeQuotes.length > 0) {
      prompt += `\n- Active Quotes: ${clientProfile.activeQuotes.map(q => `${q.name} - ${q.status}`).join(", ")}`;
    }

    // Add lead score context for behavior adjustment
    if (clientProfile.leadScore) {
      const score = clientProfile.leadScore;
      if (score.status === "ready_to_book" || score.status === "qualified") {
        prompt += `\n\n**Note: This client shows high purchase intent. Be direct about next steps and booking.**`;
      }
      if (score.detectedBudget) {
        prompt += `\n- Detected Budget Interest: around ${score.detectedBudget}`;
      }
      if (score.detectedGroupSize) {
        prompt += `\n- Group Size: ${score.detectedGroupSize} travelers`;
      }
    }
  }

  // Add conversation memory context
  if (conversationMemory?.extractedContext) {
    const ctx = conversationMemory.extractedContext;
    prompt += `\n\n## CONVERSATION CONTEXT (from previous messages)`;

    if (ctx.mentionedDestinations.length > 0) {
      prompt += `\n- Destinations mentioned: ${ctx.mentionedDestinations.join(", ")}`;
    }
    if (ctx.mentionedDates.length > 0) {
      prompt += `\n- Dates discussed: ${ctx.mentionedDates.join(", ")}`;
    }
    if (ctx.mentionedBudget) {
      prompt += `\n- Budget mentioned: ${ctx.mentionedBudget}`;
    }
    if (ctx.travelersCount) {
      prompt += `\n- Number of travelers: ${ctx.travelersCount}`;
    }
    if (ctx.interests.length > 0) {
      prompt += `\n- Interests expressed: ${ctx.interests.join(", ")}`;
    }
  }

  return prompt;
}
