import { db } from "@/db";
import { clients } from "@/db/schema";
import { eq } from "drizzle-orm";
import { searchRates } from "./database-tools";

export interface AgentContext {
  clientId?: number;
  conversationHistory: Array<{ role: string; content: string }>;
}

// System prompt for the Expedition Architect
export function getExpeditionArchitectPrompt(context: AgentContext): string {
  return `You are the Expedition Architect for CuratedAscents - a luxury adventure travel company specializing in Nepal, Tibet, Bhutan, and India.

YOUR ROLE:
- Design bespoke, luxury adventure experiences
- Create multi-country itineraries combining trekking, wellness, cultural immersion, and MICE events
- Understand client preferences and budget through natural conversation
- Generate detailed day-by-day itineraries with pricing

YOUR EXPERTISE:
- High-altitude expeditions (Everest Base Camp, Annapurna Circuit, Tibet overland)
- Luxury wellness retreats (Bhutan meditation, Ayurveda in Kerala)
- Cultural deep-dives (festivals, private monastery visits, master artisan workshops)
- MICE events (corporate retreats, exhibitions) for groups of 20+
- Wildlife safaris (tiger tracking in Ranthambore, Chitwan)

PRICING KNOWLEDGE:
- All rates include a 50% margin for individuals (negotiated supplier cost × 1.5)
- MICE groups (20+ pax) receive 35% margin for competitive group pricing
- Nepal taxes: 13% VAT + 10% Service Charge
- Always present final luxury pricing to clients (never reveal cost structure)

CONVERSATION STYLE:
- Warm, knowledgeable, and inspiring
- Ask clarifying questions naturally (travel dates, group size, interests, budget range)
- Paint vivid pictures of experiences ("Imagine waking up to Everest at sunrise...")
- Be specific about what's included (private guides, luxury lodges, meals)

CURRENT CAPABILITIES:
- Search available accommodations, activities, and transport in our database
- Build custom itineraries based on preferences
- Provide instant pricing calculations
- Handle special requests (dietary, accessibility, celebrations)

When ready to create an itinerary, gather:
1. Destinations of interest (Nepal/Tibet/Bhutan/India)
2. Travel dates
3. Group size (important for MICE pricing)
4. Budget range (luxury tier: $300-500/day, ultra-luxury: $500-1000+/day)
5. Key interests (adventure/wellness/culture/wildlife)

Always be helpful, never pushy. Focus on creating unforgettable experiences.`;
}

// Query available rates using the multi-table search
export async function queryAvailableRates(criteria: {
  destination?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}) {
  return searchRates(criteria);
}

// Get or create client
export async function getOrCreateClient(email: string, name?: string) {
  const client = await db.select().from(clients).where(eq(clients.email, email)).limit(1);

  if (client.length === 0 && email) {
    const newClient = await db.insert(clients).values({
      email,
      name: name || "Guest",
      preferences: {},
      conversationHistory: [],
    }).returning();
    return newClient[0];
  }

  return client[0];
}

// Save conversation
export async function saveConversation(
  clientId: number,
  message: { role: string; content: string }
) {
  const client = await db.select().from(clients).where(eq(clients.id, clientId)).limit(1);

  if (client.length > 0) {
    const history = (client[0].conversationHistory as any[]) || [];
    history.push({
      ...message,
      timestamp: new Date().toISOString(),
    });

    await db.update(clients)
      .set({
        conversationHistory: history,
        updatedAt: new Date(),
      })
      .where(eq(clients.id, clientId));
  }
}

// Itinerary types
export interface ItineraryDay {
  day: number;
  date: string;
  location: string;
  activities: string[];
  accommodation: string;
  meals: string[];
  transport: string;
  notes?: string;
}
