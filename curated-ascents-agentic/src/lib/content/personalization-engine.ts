/**
 * Personalization Engine
 * Handles client-specific content customization and dynamic personalization
 */

import { db } from "@/db";
import {
  clients,
  clientContentPreferences,
  leadScores,
  bookings,
  quotes,
  feedbackSurveys,
  loyaltyAccounts,
} from "@/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { getClientPreferences, updateClientPreferences } from "./content-engine";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ClientProfile {
  id: number;
  name: string;
  email: string;
  preferences: {
    language: string;
    formalityLevel: string;
    communicationStyle: string;
    interests: string[];
    preferredActivities: string[];
    travelStyle: string;
    dietaryRestrictions: string[];
    accessibilityNeeds: string[];
    specialOccasions: Record<string, string>;
  };
  engagement: {
    leadScore: number;
    leadStatus: string;
    totalBookings: number;
    totalSpent: number;
    loyaltyTier: string;
    loyaltyPoints: number;
    npsScore: number | null;
    lastBookingDate: Date | null;
    averageRating: number | null;
  };
  history: {
    destinations: string[];
    activities: string[];
    accommodationPreferences: string[];
    travelCompanions: string;
    averageTripLength: number;
  };
  marketing: {
    emailOptOut: boolean;
    smsOptOut: boolean;
    marketingOptOut: boolean;
    preferredChannels: string[];
    bestContactTime: string | null;
  };
}

export interface PersonalizationContext {
  clientId: number;
  context: "quote" | "booking" | "email" | "website" | "chat";
  occasion?: string; // birthday, anniversary, holiday
  referenceId?: number; // quoteId, bookingId, etc.
}

export interface PersonalizedContent {
  greeting: string;
  salutation: string;
  recommendations: string[];
  callToAction: string;
  tone: "formal" | "professional" | "casual" | "enthusiastic";
  specialMessages: string[];
}

// ─── Client Profile Building ──────────────────────────────────────────────────

/**
 * Build a comprehensive client profile for personalization
 */
export async function buildClientProfile(clientId: number): Promise<ClientProfile | null> {
  // Get client basic info
  const [client] = await db
    .select()
    .from(clients)
    .where(eq(clients.id, clientId))
    .limit(1);

  if (!client) return null;

  // Get content preferences
  const prefs = await getClientPreferences(clientId);

  // Get lead score
  const [leadScore] = await db
    .select()
    .from(leadScores)
    .where(eq(leadScores.clientId, clientId))
    .limit(1);

  // Get loyalty account
  const [loyalty] = await db
    .select()
    .from(loyaltyAccounts)
    .where(eq(loyaltyAccounts.clientId, clientId))
    .limit(1);

  // Get booking history
  const clientBookings = await db
    .select()
    .from(bookings)
    .innerJoin(quotes, eq(bookings.quoteId, quotes.id))
    .where(eq(quotes.clientId, clientId))
    .orderBy(desc(bookings.createdAt))
    .limit(10);

  // Get survey responses for NPS
  const surveyResponses = await db
    .select()
    .from(feedbackSurveys)
    .where(eq(feedbackSurveys.clientId, clientId))
    .orderBy(desc(feedbackSurveys.createdAt));

  // Calculate average NPS
  const npsScores = surveyResponses
    .filter((s) => s.npsScore !== null)
    .map((s) => s.npsScore as number);
  const avgNps = npsScores.length > 0
    ? npsScores.reduce((a, b) => a + b, 0) / npsScores.length
    : null;

  // Calculate average rating
  const ratings = surveyResponses
    .filter((s) => s.overallRating !== null)
    .map((s) => s.overallRating as number);
  const avgRating = ratings.length > 0
    ? ratings.reduce((a, b) => a + b, 0) / ratings.length
    : null;

  // Extract destinations and activities from booking history
  const pastDestinations = new Set<string>();
  const pastActivities = new Set<string>();

  // Get detected destinations from lead score
  const detectedDestinations = (leadScore?.detectedDestinations as string[]) || [];
  detectedDestinations.forEach((d) => pastDestinations.add(d));

  // Get preferred activities from preferences
  const prefActivities = (prefs.preferredActivities as string[]) || [];

  return {
    id: client.id,
    name: client.name || "Valued Guest",
    email: client.email || "",
    preferences: {
      language: prefs.preferredLanguage || "en",
      formalityLevel: prefs.formalityLevel || "professional",
      communicationStyle: prefs.communicationStyle || "detailed",
      interests: (prefs.interests as string[]) || [],
      preferredActivities: prefActivities,
      travelStyle: prefs.travelStyle || "comfort",
      dietaryRestrictions: (prefs.dietaryRestrictions as string[]) || [],
      accessibilityNeeds: (prefs.accessibilityNeeds as string[]) || [],
      specialOccasions: (prefs.specialOccasions as Record<string, string>) || {},
    },
    engagement: {
      leadScore: leadScore?.currentScore || 0,
      leadStatus: leadScore?.status || "new",
      totalBookings: loyalty?.totalBookings || 0,
      totalSpent: parseFloat(loyalty?.totalSpent?.toString() || "0"),
      loyaltyTier: loyalty?.tier || "bronze",
      loyaltyPoints: loyalty?.totalPoints || 0,
      npsScore: avgNps,
      lastBookingDate: loyalty?.lastBookingAt || null,
      averageRating: avgRating,
    },
    history: {
      destinations: Array.from(pastDestinations),
      activities: Array.from(pastActivities),
      accommodationPreferences: [],
      travelCompanions: leadScore?.detectedPax && leadScore.detectedPax > 1 ? "group" : "solo",
      averageTripLength: 7, // Default, would calculate from booking history
    },
    marketing: {
      emailOptOut: prefs.emailOptOut || false,
      smsOptOut: prefs.smsOptOut || false,
      marketingOptOut: prefs.marketingOptOut || false,
      preferredChannels: ["email"],
      bestContactTime: null,
    },
  };
}

/**
 * Update client profile based on interactions
 */
export async function updateClientProfileFromInteraction(
  clientId: number,
  interaction: {
    type: "view" | "click" | "booking" | "inquiry" | "feedback";
    data: Record<string, unknown>;
  }
): Promise<void> {
  const prefs = await getClientPreferences(clientId);

  // Update interests based on interaction
  const interests = new Set<string>((prefs.interests as string[]) || []);
  const activities = new Set<string>((prefs.preferredActivities as string[]) || []);

  if (interaction.data.destination) {
    interests.add(interaction.data.destination as string);
  }

  if (interaction.data.activity) {
    activities.add(interaction.data.activity as string);
  }

  if (interaction.data.travelStyle) {
    await updateClientPreferences(clientId, {
      travelStyle: interaction.data.travelStyle as string,
    });
  }

  // Update preferred topics based on clicks
  if (interaction.type === "click" && interaction.data.topic) {
    const preferredTopics = (prefs.preferredTopics as string[]) || [];
    preferredTopics.unshift(interaction.data.topic as string);
    await updateClientPreferences(clientId, {
      interests: Array.from(interests),
      preferredActivities: Array.from(activities),
    });
  }
}

// ─── Content Personalization ──────────────────────────────────────────────────

/**
 * Generate personalized content for a client
 */
export async function getPersonalizedContent(
  context: PersonalizationContext
): Promise<PersonalizedContent> {
  const profile = await buildClientProfile(context.clientId);

  if (!profile) {
    return getDefaultContent();
  }

  // Determine tone based on profile
  const tone = determineTone(profile);

  // Generate greeting
  const greeting = generateGreeting(profile, context);

  // Generate salutation
  const salutation = generateSalutation(profile, tone);

  // Generate recommendations
  const recommendations = await generateRecommendations(profile, context);

  // Generate call to action
  const callToAction = generateCallToAction(profile, context);

  // Check for special occasions
  const specialMessages = await getSpecialOccasionMessages(profile);

  return {
    greeting,
    salutation,
    recommendations,
    callToAction,
    tone,
    specialMessages,
  };
}

/**
 * Determine appropriate tone based on client profile
 */
function determineTone(
  profile: ClientProfile
): "formal" | "professional" | "casual" | "enthusiastic" {
  // High-value clients get more formal treatment
  if (profile.engagement.loyaltyTier === "platinum" || profile.engagement.totalSpent > 50000) {
    return profile.preferences.formalityLevel === "casual" ? "professional" : "formal";
  }

  // Repeat customers with good NPS get enthusiastic tone
  if (profile.engagement.totalBookings >= 3 && (profile.engagement.npsScore || 0) >= 8) {
    return "enthusiastic";
  }

  // Default to user preference
  return (profile.preferences.formalityLevel as "formal" | "professional" | "casual") || "professional";
}

/**
 * Generate personalized greeting
 */
function generateGreeting(profile: ClientProfile, context: PersonalizationContext): string {
  const firstName = profile.name.split(" ")[0];
  const timeOfDay = getTimeOfDay();

  // Check for special occasion
  const occasions = profile.preferences.specialOccasions;
  const today = new Date();
  const todayStr = `${today.getMonth() + 1}/${today.getDate()}`;

  for (const [occasion, date] of Object.entries(occasions)) {
    if (date === todayStr) {
      if (occasion.toLowerCase().includes("birthday")) {
        return `Happy Birthday, ${firstName}! We hope your day is as special as you are.`;
      }
      if (occasion.toLowerCase().includes("anniversary")) {
        return `Happy Anniversary, ${firstName}! We hope you're celebrating in style.`;
      }
    }
  }

  // Loyalty-based greetings
  if (profile.engagement.loyaltyTier === "platinum") {
    return `Good ${timeOfDay}, ${firstName}. It's always a pleasure to serve our Platinum members.`;
  }

  if (profile.engagement.totalBookings >= 5) {
    return `Welcome back, ${firstName}! Great to see you again.`;
  }

  // Context-based greetings
  if (context.context === "chat") {
    return `Hello ${firstName}! How can I help you plan your next adventure?`;
  }

  return `Good ${timeOfDay}, ${firstName}!`;
}

/**
 * Generate appropriate salutation
 */
function generateSalutation(
  profile: ClientProfile,
  tone: "formal" | "professional" | "casual" | "enthusiastic"
): string {
  const firstName = profile.name.split(" ")[0];

  switch (tone) {
    case "formal":
      return `Dear ${profile.name}`;
    case "professional":
      return `Dear ${firstName}`;
    case "casual":
      return `Hi ${firstName}`;
    case "enthusiastic":
      return `Hey ${firstName}!`;
    default:
      return `Dear ${firstName}`;
  }
}

/**
 * Generate personalized recommendations
 */
async function generateRecommendations(
  profile: ClientProfile,
  context: PersonalizationContext
): Promise<string[]> {
  const recommendations: string[] = [];

  // Based on past destinations, suggest related places
  if (profile.history.destinations.includes("nepal") || profile.history.destinations.includes("everest")) {
    recommendations.push("Continue your Himalayan journey in Bhutan - the Land of the Thunder Dragon");
  }

  // Based on travel style
  if (profile.preferences.travelStyle === "luxury") {
    recommendations.push("Exclusive private helicopter tours now available");
    recommendations.push("New luxury lodge openings in the Annapurna region");
  } else if (profile.preferences.travelStyle === "adventure") {
    recommendations.push("Challenge yourself with our new high-altitude expeditions");
    recommendations.push("Off-the-beaten-path treks for experienced adventurers");
  }

  // Based on preferred activities
  if (profile.preferences.preferredActivities.includes("trekking")) {
    recommendations.push("Spring trekking season approaching - book early for best lodges");
  }

  if (profile.preferences.preferredActivities.includes("cultural")) {
    recommendations.push("Upcoming Himalayan festivals: experience authentic local celebrations");
  }

  // Loyalty-based recommendations
  if (profile.engagement.loyaltyPoints > 1000) {
    recommendations.push(`You have ${profile.engagement.loyaltyPoints} points - redeem them on your next trip!`);
  }

  // Ensure we have at least some recommendations
  if (recommendations.length === 0) {
    recommendations.push("Discover the magic of the Himalayas");
    recommendations.push("Custom itineraries tailored to your preferences");
  }

  return recommendations.slice(0, 4);
}

/**
 * Generate call to action based on context and profile
 */
function generateCallToAction(
  profile: ClientProfile,
  context: PersonalizationContext
): string {
  // High-value clients
  if (profile.engagement.loyaltyTier === "platinum" || profile.engagement.leadScore >= 80) {
    return "Speak directly with your personal travel advisor";
  }

  // Context-based CTAs
  switch (context.context) {
    case "quote":
      return "Ready to proceed? Secure your adventure today";
    case "booking":
      return "Complete your booking and start the countdown";
    case "email":
      if (profile.engagement.totalBookings === 0) {
        return "Plan your first adventure with us";
      }
      return "Start planning your next journey";
    case "chat":
      return "Let's create your perfect itinerary together";
    default:
      return "Explore our curated adventures";
  }
}

/**
 * Check for special occasions and generate messages
 */
async function getSpecialOccasionMessages(profile: ClientProfile): Promise<string[]> {
  const messages: string[] = [];
  const today = new Date();
  const todayStr = `${today.getMonth() + 1}/${today.getDate()}`;

  // Check saved special occasions
  const occasions = profile.preferences.specialOccasions;
  for (const [occasion, date] of Object.entries(occasions)) {
    if (date === todayStr) {
      if (occasion.toLowerCase().includes("birthday")) {
        messages.push("🎂 Happy Birthday! Enjoy a special 10% discount on your next booking.");
      }
      if (occasion.toLowerCase().includes("anniversary")) {
        messages.push("💕 Happy Anniversary! Celebrate with a complimentary room upgrade.");
      }
    }

    // Check upcoming occasions (within 30 days)
    const [month, day] = date.split("/").map(Number);
    const occasionDate = new Date(today.getFullYear(), month - 1, day);
    const daysUntil = Math.ceil((occasionDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntil > 0 && daysUntil <= 30) {
      if (occasion.toLowerCase().includes("birthday")) {
        messages.push(`Your birthday is coming up! Plan a celebratory trip.`);
      }
      if (occasion.toLowerCase().includes("anniversary")) {
        messages.push(`Anniversary approaching? We have romantic getaways waiting.`);
      }
    }
  }

  // Loyalty milestones
  if (profile.engagement.loyaltyPoints >= 5000 && profile.engagement.loyaltyTier !== "gold") {
    messages.push("You're close to Gold tier! Book now to unlock exclusive benefits.");
  }

  // Booking anniversary
  if (profile.engagement.lastBookingDate) {
    const lastBooking = new Date(profile.engagement.lastBookingDate);
    const daysSince = Math.floor((today.getTime() - lastBooking.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSince >= 365 && daysSince <= 395) {
      messages.push("It's been a year since your last adventure. Time for another?");
    }
  }

  return messages;
}

/**
 * Get default content for unknown clients
 */
function getDefaultContent(): PersonalizedContent {
  return {
    greeting: "Welcome to CuratedAscents!",
    salutation: "Dear Traveler",
    recommendations: [
      "Explore the majestic Himalayas",
      "Discover hidden gems in Nepal, Bhutan, and Tibet",
      "Custom itineraries tailored to you",
    ],
    callToAction: "Start planning your dream adventure",
    tone: "professional",
    specialMessages: [],
  };
}

/**
 * Get time of day greeting
 */
function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

// ─── Email Personalization ────────────────────────────────────────────────────

/**
 * Personalize email content for a client
 */
export async function personalizeEmailContent(
  clientId: number,
  emailType: string,
  baseContent: { subject: string; body: string }
): Promise<{ subject: string; body: string }> {
  const profile = await buildClientProfile(clientId);

  if (!profile) {
    return baseContent;
  }

  const firstName = profile.name.split(" ")[0];
  let { subject, body } = baseContent;

  // Personalize subject line
  subject = subject.replace(/{{name}}/g, firstName);
  subject = subject.replace(/{{firstName}}/g, firstName);

  // Add loyalty tier prefix for premium members
  if (profile.engagement.loyaltyTier === "platinum") {
    subject = `[Priority] ${subject}`;
  }

  // Personalize body
  body = body.replace(/{{name}}/g, profile.name);
  body = body.replace(/{{firstName}}/g, firstName);
  body = body.replace(/{{loyaltyTier}}/g, profile.engagement.loyaltyTier);
  body = body.replace(/{{loyaltyPoints}}/g, String(profile.engagement.loyaltyPoints));

  // Add personalized greeting
  const greeting = generateGreeting(profile, { clientId, context: "email" });
  body = body.replace(/{{greeting}}/g, greeting);

  // Add personalized CTA
  const cta = generateCallToAction(profile, { clientId, context: "email" });
  body = body.replace(/{{callToAction}}/g, cta);

  // Add special messages
  const specialMessages = await getSpecialOccasionMessages(profile);
  if (specialMessages.length > 0) {
    body = body.replace(/{{specialMessages}}/g, specialMessages.join("\n"));
  } else {
    body = body.replace(/{{specialMessages}}/g, "");
  }

  return { subject, body };
}

/**
 * Check if client should receive marketing emails
 */
export async function canSendMarketingEmail(clientId: number): Promise<boolean> {
  const prefs = await getClientPreferences(clientId);
  return !prefs.emailOptOut && !prefs.marketingOptOut;
}

/**
 * Get preferred communication channel for client
 */
export async function getPreferredChannel(
  clientId: number
): Promise<"email" | "sms" | "whatsapp"> {
  const prefs = await getClientPreferences(clientId);

  if (prefs.smsOptOut && prefs.emailOptOut) {
    return "whatsapp"; // Fallback
  }

  if (!prefs.smsOptOut) {
    return "sms";
  }

  return "email";
}
