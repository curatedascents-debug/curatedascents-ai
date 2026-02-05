/**
 * Narrative Generator
 * Transforms structured itinerary and quote data into compelling narrative prose
 */

import { db } from "@/db";
import {
  quotes,
  quoteItems,
  clients,
  destinations,
  hotels,
  packages,
} from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import {
  getDestinationContent,
  getCachedContent,
  cacheGeneratedContent,
  getClientPreferences,
} from "./content-engine";

// ─── Types ────────────────────────────────────────────────────────────────────

interface NarrativeOptions {
  style?: "luxury" | "adventure" | "cultural" | "romantic" | "family";
  tone?: "formal" | "professional" | "casual" | "enthusiastic";
  length?: "brief" | "standard" | "detailed";
  includeHighlights?: boolean;
  includeTips?: boolean;
  language?: string;
}

interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  activities: string[];
  meals?: string[];
  accommodation?: string;
  highlights?: string[];
}

interface QuoteNarrative {
  introduction: string;
  destinationOverview: string;
  itinerarySummary: string;
  dayByDayNarrative?: ItineraryDay[];
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  travelTips?: string[];
  closingStatement: string;
}

// ─── Style Configurations ─────────────────────────────────────────────────────

const STYLE_PHRASES = {
  luxury: {
    intro: ["Indulge in", "Experience the pinnacle of", "Discover unparalleled"],
    adj: ["exquisite", "opulent", "world-class", "refined", "exclusive"],
    closing: "where every moment is crafted to exceed your expectations",
  },
  adventure: {
    intro: ["Embark on", "Conquer", "Push your limits with"],
    adj: ["thrilling", "exhilarating", "challenging", "awe-inspiring", "epic"],
    closing: "creating memories that will last a lifetime",
  },
  cultural: {
    intro: ["Immerse yourself in", "Discover the rich heritage of", "Connect with"],
    adj: ["ancient", "authentic", "vibrant", "sacred", "traditional"],
    closing: "and return home with a deeper understanding of the world",
  },
  romantic: {
    intro: ["Create magical moments", "Celebrate your love in", "Escape together to"],
    adj: ["enchanting", "intimate", "breathtaking", "romantic", "serene"],
    closing: "making memories you'll treasure forever",
  },
  family: {
    intro: ["Create lasting memories with", "Bond with your loved ones through", "Discover together"],
    adj: ["exciting", "memorable", "safe", "engaging", "fun-filled"],
    closing: "bringing your family closer through shared adventures",
  },
};

const TONE_MODIFIERS = {
  formal: {
    greeting: "It is our pleasure to present",
    transition: "Furthermore,",
    closing: "We look forward to the privilege of hosting you.",
  },
  professional: {
    greeting: "We are delighted to present",
    transition: "Additionally,",
    closing: "We look forward to creating an unforgettable journey for you.",
  },
  casual: {
    greeting: "Get ready for",
    transition: "Plus,",
    closing: "Can't wait to make this happen for you!",
  },
  enthusiastic: {
    greeting: "You're going to love this!",
    transition: "And that's not all!",
    closing: "This is going to be absolutely incredible!",
  },
};

// ─── Narrative Generation ─────────────────────────────────────────────────────

/**
 * Generate a complete quote narrative
 */
export async function generateQuoteNarrative(
  quoteId: number,
  options: NarrativeOptions = {}
): Promise<QuoteNarrative> {
  // Check cache first
  const cached = await getCachedContent(
    "quote_narrative",
    "quote",
    quoteId,
    options.language || "en"
  );

  if (cached) {
    return JSON.parse(cached.content);
  }

  // Get quote details
  const [quote] = await db
    .select()
    .from(quotes)
    .where(eq(quotes.id, quoteId))
    .limit(1);

  if (!quote) {
    throw new Error("Quote not found");
  }

  // Get client preferences if available
  let clientPrefs = null;
  if (quote.clientId) {
    clientPrefs = await getClientPreferences(quote.clientId);
  }

  // Get quote items
  const items = await db
    .select()
    .from(quoteItems)
    .where(eq(quoteItems.quoteId, quoteId));

  // Determine style based on options or client preferences
  const style = options.style ||
    (clientPrefs?.travelStyle as keyof typeof STYLE_PHRASES) ||
    "luxury";
  const tone = options.tone ||
    (clientPrefs?.formalityLevel === "casual" ? "casual" : "professional");
  const length = options.length ||
    (clientPrefs?.communicationStyle === "brief" ? "brief" : "standard");

  // Get client name for personalization
  let clientName = "Traveler";
  if (quote.clientId) {
    const [client] = await db
      .select()
      .from(clients)
      .where(eq(clients.id, quote.clientId))
      .limit(1);
    if (client?.name) {
      clientName = client.name.split(" ")[0]; // First name only
    }
  }

  // Extract destinations from quote
  const destinationNames = extractDestinations(items);
  const primaryDestination = destinationNames[0] || "the Himalayas";

  // Generate narrative sections
  const narrative: QuoteNarrative = {
    introduction: generateIntroduction(clientName, primaryDestination, style, tone, quote),
    destinationOverview: await generateDestinationOverview(destinationNames, style, options.language),
    itinerarySummary: generateItinerarySummary(items, quote, style),
    highlights: generateHighlights(items, style),
    inclusions: generateInclusions(items),
    exclusions: generateExclusions(items),
    closingStatement: generateClosing(clientName, style, tone),
  };

  if (options.includeTips) {
    narrative.travelTips = await generateTravelTips(destinationNames, options.language);
  }

  if (length === "detailed") {
    narrative.dayByDayNarrative = await generateDayByDay(items, style);
  }

  // Cache the generated narrative
  await cacheGeneratedContent({
    contentType: "quote_narrative",
    contextType: "quote",
    contextId: quoteId,
    language: options.language || "en",
    inputData: { options, style, tone },
    content: JSON.stringify(narrative),
    metadata: { style, tone, length },
  });

  return narrative;
}

/**
 * Generate introduction paragraph
 */
function generateIntroduction(
  clientName: string,
  destination: string,
  style: keyof typeof STYLE_PHRASES,
  tone: keyof typeof TONE_MODIFIERS,
  quote: typeof quotes.$inferSelect
): string {
  const styleConfig = STYLE_PHRASES[style];
  const toneConfig = TONE_MODIFIERS[tone];
  const intro = styleConfig.intro[Math.floor(Math.random() * styleConfig.intro.length)];
  const adj = styleConfig.adj[Math.floor(Math.random() * styleConfig.adj.length)];

  const duration = quote.validUntil
    ? `${Math.ceil((new Date(quote.validUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days`
    : "your journey";

  return `Dear ${clientName},

${toneConfig.greeting} your personalized journey to ${destination}. ${intro} an ${adj} adventure that has been carefully crafted with your preferences in mind.

This exclusive itinerary encompasses the very best of what ${destination} has to offer, ${styleConfig.closing}.`;
}

/**
 * Generate destination overview
 */
async function generateDestinationOverview(
  destinationNames: string[],
  style: keyof typeof STYLE_PHRASES,
  language?: string
): Promise<string> {
  const overviews: string[] = [];
  const styleConfig = STYLE_PHRASES[style];

  for (const dest of destinationNames.slice(0, 3)) {
    // Try to get content from database
    const destRecord = await db
      .select()
      .from(destinations)
      .where(eq(destinations.city, dest))
      .limit(1);

    if (destRecord[0]) {
      const content = await getDestinationContent(
        destRecord[0].id,
        "destination_overview",
        language || "en"
      );

      if (content) {
        overviews.push(content.content);
        continue;
      }
    }

    // Fallback to generated description
    overviews.push(generateFallbackDestinationText(dest, style));
  }

  return overviews.join("\n\n");
}

/**
 * Generate fallback destination text
 */
function generateFallbackDestinationText(
  destination: string,
  style: keyof typeof STYLE_PHRASES
): string {
  const styleConfig = STYLE_PHRASES[style];
  const adj = styleConfig.adj[Math.floor(Math.random() * styleConfig.adj.length)];

  const descriptions: Record<string, string> = {
    nepal: `Nepal, the land of the Himalayas, offers ${adj} experiences from ancient temples to towering peaks.`,
    kathmandu: `Kathmandu, the vibrant capital of Nepal, blends ${adj} cultural heritage with modern energy.`,
    pokhara: `Pokhara, the lakeside paradise, provides ${adj} views of the Annapurna range and serene natural beauty.`,
    everest: `The Everest region represents the ${adj} pinnacle of mountain adventure and Sherpa culture.`,
    bhutan: `Bhutan, the Land of the Thunder Dragon, preserves ${adj} traditions in stunning Himalayan landscapes.`,
    tibet: `Tibet, the roof of the world, offers ${adj} spiritual experiences and breathtaking high-altitude scenery.`,
    india: `India presents an ${adj} tapestry of cultures, cuisines, and landscapes waiting to be discovered.`,
  };

  const key = Object.keys(descriptions).find((k) =>
    destination.toLowerCase().includes(k)
  );

  return key
    ? descriptions[key]
    : `${destination} offers ${adj} experiences that will create lasting memories.`;
}

/**
 * Generate itinerary summary
 */
function generateItinerarySummary(
  items: Array<typeof quoteItems.$inferSelect>,
  quote: typeof quotes.$inferSelect,
  style: keyof typeof STYLE_PHRASES
): string {
  const styleConfig = STYLE_PHRASES[style];
  const adj = styleConfig.adj[Math.floor(Math.random() * styleConfig.adj.length)];

  // Count service types
  const serviceTypes = new Map<string, number>();
  items.forEach((item) => {
    const type = item.serviceType || "service";
    serviceTypes.set(type, (serviceTypes.get(type) || 0) + 1);
  });

  const services: string[] = [];
  if (serviceTypes.get("hotel")) services.push("carefully selected accommodations");
  if (serviceTypes.get("transportation")) services.push("private transportation");
  if (serviceTypes.get("guide")) services.push("expert local guides");
  if (serviceTypes.get("flightsDomestic")) services.push("domestic flights");
  if (serviceTypes.get("helicopter")) services.push("helicopter transfers");
  if (serviceTypes.get("package")) services.push("curated experiences");

  const totalNights = quote.notes?.includes("nights")
    ? quote.notes.match(/(\d+)\s*nights?/i)?.[1] || "several"
    : "several";

  return `Your ${adj} ${totalNights}-night journey includes ${services.slice(0, 3).join(", ")}${services.length > 3 ? ", and more" : ""}. Every detail has been thoughtfully arranged to ensure a seamless and memorable experience.`;
}

/**
 * Generate highlights list
 */
function generateHighlights(
  items: Array<typeof quoteItems.$inferSelect>,
  style: keyof typeof STYLE_PHRASES
): string[] {
  const highlights: string[] = [];

  items.forEach((item) => {
    if (item.serviceType === "hotel") {
      highlights.push(`Stay at ${item.description || "premium accommodation"}`);
    } else if (item.serviceType === "guide") {
      highlights.push(`Expert-guided exploration with local specialists`);
    } else if (item.serviceType === "helicopter") {
      highlights.push(`Scenic helicopter experience with breathtaking views`);
    } else if (item.serviceType === "package") {
      highlights.push(`${item.description || "Curated experience package"}`);
    }
  });

  // Add style-specific highlights
  const styleHighlights: Record<string, string[]> = {
    luxury: ["VIP treatment throughout", "Exclusive access to hidden gems"],
    adventure: ["Challenge yourself with unique activities", "Off-the-beaten-path discoveries"],
    cultural: ["Deep cultural immersion experiences", "Meet local artisans and communities"],
    romantic: ["Private romantic moments", "Sunset experiences in stunning locations"],
    family: ["Activities for all ages", "Educational and fun experiences for kids"],
  };

  return [...highlights, ...(styleHighlights[style] || [])].slice(0, 6);
}

/**
 * Generate inclusions list
 */
function generateInclusions(items: Array<typeof quoteItems.$inferSelect>): string[] {
  const inclusions: string[] = [];

  const hasType = (type: string) => items.some((i) => i.serviceType === type);

  if (hasType("hotel")) inclusions.push("Accommodation as per itinerary");
  if (hasType("transportation")) inclusions.push("Private ground transportation");
  if (hasType("guide")) inclusions.push("Professional English-speaking guide");
  if (hasType("flightsDomestic")) inclusions.push("Domestic flights as mentioned");
  if (hasType("helicopter")) inclusions.push("Helicopter services as specified");
  if (hasType("permitsFees")) inclusions.push("All permits and entrance fees");
  if (hasType("miscellaneous")) inclusions.push("Airport transfers");

  inclusions.push("24/7 on-ground support");
  inclusions.push("Personalized trip documentation");

  return inclusions;
}

/**
 * Generate exclusions list
 */
function generateExclusions(items: Array<typeof quoteItems.$inferSelect>): string[] {
  return [
    "International airfare",
    "Travel insurance (highly recommended)",
    "Personal expenses and tips",
    "Meals not mentioned in the itinerary",
    "Optional activities not included in the package",
    "Visa fees (if applicable)",
    "Items of personal nature",
  ];
}

/**
 * Generate travel tips
 */
async function generateTravelTips(
  destinationNames: string[],
  language?: string
): Promise<string[]> {
  const tips: string[] = [
    "Pack layers as mountain weather can change quickly",
    "Carry a refillable water bottle and water purification tablets",
    "Respect local customs and dress modestly at religious sites",
    "Carry cash in local currency for remote areas",
    "Keep copies of important documents in a separate bag",
  ];

  // Try to get destination-specific tips
  for (const dest of destinationNames) {
    const destRecord = await db
      .select()
      .from(destinations)
      .where(eq(destinations.city, dest))
      .limit(1);

    if (destRecord[0]) {
      const content = await getDestinationContent(
        destRecord[0].id,
        "travel_tips",
        language || "en"
      );

      if (content?.highlights) {
        tips.push(...(content.highlights as string[]).slice(0, 3));
      }
    }
  }

  return tips.slice(0, 8);
}

/**
 * Generate day-by-day narrative
 */
async function generateDayByDay(
  items: Array<typeof quoteItems.$inferSelect>,
  style: keyof typeof STYLE_PHRASES
): Promise<ItineraryDay[]> {
  // Group items by day (simplified - in reality would need more structure)
  const days: ItineraryDay[] = [];
  const styleConfig = STYLE_PHRASES[style];

  // This is a simplified implementation
  // In production, would parse actual itinerary data
  items.forEach((item, index) => {
    if (item.serviceType === "package" || item.serviceType === "hotel") {
      const adj = styleConfig.adj[index % styleConfig.adj.length];
      days.push({
        day: index + 1,
        title: item.description || `Day ${index + 1}`,
        description: `Experience an ${adj} day of discovery and adventure.`,
        activities: ["Morning activities", "Afternoon exploration", "Evening relaxation"],
        accommodation: item.serviceType === "hotel" ? (item.description || undefined) : undefined,
      });
    }
  });

  return days.length > 0 ? days : [{
    day: 1,
    title: "Arrival Day",
    description: "Welcome to your adventure. Settle in and prepare for the journey ahead.",
    activities: ["Airport pickup", "Hotel check-in", "Welcome briefing"],
  }];
}

/**
 * Generate closing statement
 */
function generateClosing(
  clientName: string,
  style: keyof typeof STYLE_PHRASES,
  tone: keyof typeof TONE_MODIFIERS
): string {
  const styleConfig = STYLE_PHRASES[style];
  const toneConfig = TONE_MODIFIERS[tone];

  return `${clientName}, this journey has been designed with you in mind, ${styleConfig.closing}.

${toneConfig.closing}

Warm regards,
The CuratedAscents Team`;
}

/**
 * Extract destination names from quote items
 */
function extractDestinations(items: Array<typeof quoteItems.$inferSelect>): string[] {
  const destinations = new Set<string>();

  items.forEach((item) => {
    // Try to extract from description
    const desc = item.description?.toLowerCase() || "";

    ["nepal", "kathmandu", "pokhara", "everest", "annapurna", "chitwan",
     "bhutan", "paro", "thimphu", "punakha",
     "tibet", "lhasa",
     "india", "darjeeling", "sikkim"].forEach((dest) => {
      if (desc.includes(dest)) {
        destinations.add(dest.charAt(0).toUpperCase() + dest.slice(1));
      }
    });
  });

  return Array.from(destinations);
}

// ─── Email Content Generation ─────────────────────────────────────────────────

/**
 * Generate personalized email content
 */
export async function generatePersonalizedEmail(
  clientId: number,
  templateType: string,
  context: Record<string, unknown>
): Promise<{ subject: string; body: string }> {
  const prefs = await getClientPreferences(clientId);
  const language = prefs.preferredLanguage || "en";
  const formality = prefs.formalityLevel || "professional";

  // Get client info
  const [client] = await db
    .select()
    .from(clients)
    .where(eq(clients.id, clientId))
    .limit(1);

  const clientName = client?.name?.split(" ")[0] || "Traveler";

  const toneConfig = TONE_MODIFIERS[formality as keyof typeof TONE_MODIFIERS] || TONE_MODIFIERS.professional;

  // Generate based on template type
  switch (templateType) {
    case "quote_ready":
      return {
        subject: `Your Custom ${context.destination || "Himalayan"} Adventure Awaits`,
        body: `Dear ${clientName},

${toneConfig.greeting} your personalized travel proposal!

${context.summary || "Your customized itinerary is ready for review."}

${toneConfig.transition} our team is standing by to answer any questions and make adjustments to ensure this journey is exactly what you've been dreaming of.

${toneConfig.closing}

Warm regards,
The CuratedAscents Team`,
      };

    case "booking_confirmed":
      return {
        subject: `Your ${context.destination || "Adventure"} is Confirmed!`,
        body: `Dear ${clientName},

Wonderful news! Your booking has been confirmed.

${context.summary || "All arrangements are in place for your upcoming journey."}

We'll be in touch soon with your detailed travel documents and pre-departure information.

${toneConfig.closing}

Warm regards,
The CuratedAscents Team`,
      };

    default:
      return {
        subject: `Update from CuratedAscents`,
        body: `Dear ${clientName},

${context.message || "We have an update regarding your travel plans."}

${toneConfig.closing}

Warm regards,
The CuratedAscents Team`,
      };
  }
}
