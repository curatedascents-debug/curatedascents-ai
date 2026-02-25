import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { aiBusinessRules } from "@/db/schema";
import { verifyAdminSession, adminUnauthorizedResponse } from "@/lib/auth/admin-api-auth";

export const dynamic = "force-dynamic";

const SEED_RULES = [
  // Pricing Display
  {
    category: "pricing_display" as const,
    ruleKey: "never_show_breakdown",
    ruleTitle: "Never show price breakdown",
    ruleText: "NEVER show per-service, per-item, or per-night price breakdowns. Do NOT attach individual prices to hotels, flights, guides, transport, permits, or any other service. The cost breakdown is strictly confidential.",
    appliesTo: "all" as const,
    priority: 10,
  },
  {
    category: "pricing_display" as const,
    ruleKey: "total_and_per_person_only",
    ruleTitle: "Show total + per-person only",
    ruleText: "ONLY present the total package price and per-person price. Example: \"Your 14-day Nepal journey for 2 travelers: **$4,800 per person** ($9,600 total).\" That is the ONLY price format you should use.",
    appliesTo: "all" as const,
    priority: 11,
  },
  {
    category: "pricing_display" as const,
    ruleKey: "no_pricing_tables",
    ruleTitle: "No pricing tables",
    ruleText: "Do NOT create pricing tables, cost breakdowns, or itemized price lists. No \"Hotel: $X\", \"Guide: $Y\", \"Flight: $Z\" format. List services included by name but NEVER put a dollar amount next to any individual service.",
    appliesTo: "all" as const,
    priority: 12,
  },
  {
    category: "pricing_display" as const,
    ruleKey: "mice_group_pricing",
    ruleTitle: "MICE group pricing note",
    ruleText: "For groups of 20+ people (MICE), mention group discounts are available and suggest contacting the sales team.",
    appliesTo: "all" as const,
    priority: 15,
  },
  // Component Checklist
  {
    category: "component_checklist" as const,
    ruleKey: "require_airport_transfers",
    ruleTitle: "Require airport transfers",
    ruleText: "Airport transfers: Arrival transfer (airport → hotel) AND departure transfer (hotel → airport) for EACH city with an airport. Example: KTM airport→hotel + hotel→KTM airport, PKR airport→hotel + hotel→PKR airport.",
    appliesTo: "all" as const,
    priority: 20,
  },
  {
    category: "component_checklist" as const,
    ruleKey: "require_all_transport_legs",
    ruleTitle: "Transport for every leg",
    ruleText: "Inter-city transport for EVERY leg: Ground transfers OR domestic flights between EACH pair of consecutive cities — BOTH directions when returning. Example for KTM→Chitwan→Pokhara→KTM: KTM→Chitwan transport, Chitwan→Pokhara transport, Pokhara→KTM flight. Do NOT skip any leg.",
    appliesTo: "all" as const,
    priority: 21,
  },
  {
    category: "component_checklist" as const,
    ruleKey: "require_hotels_correct_nights",
    ruleTitle: "Hotels with correct nights",
    ruleText: "Hotels: One hotel per destination/city for the CORRECT number of nights. If the client stays 3 nights in Kathmandu, pass nights=3.",
    appliesTo: "all" as const,
    priority: 22,
  },
  {
    category: "component_checklist" as const,
    ruleKey: "require_guides_correct_days",
    ruleTitle: "Guides with correct days",
    ruleText: "Guides/sightseeing: A guide for EACH destination where sightseeing is planned, with the correct number of days. If there are 2 half-day sightseeing tours, pass quantity=1 and nights=2. If there's 1 full day, pass nights=1.",
    appliesTo: "all" as const,
    priority: 23,
  },
  {
    category: "component_checklist" as const,
    ruleKey: "require_permits",
    ruleTitle: "Include permits",
    ruleText: "Permits/entry fees: Required permits for the destination (e.g., TIMS, national park fees, Chitwan entry).",
    appliesTo: "all" as const,
    priority: 24,
  },
  {
    category: "component_checklist" as const,
    ruleKey: "require_return_flight",
    ruleTitle: "Require return flights",
    ruleText: "When a client flies to a destination mid-trip, they MUST fly back at the end. Example: if client flies KTM→PKR, they need PKR→KTM at the end (same serviceId, separate line item). ALWAYS include return flights unless the client departs internationally from that city.",
    appliesTo: "all" as const,
    priority: 25,
  },
  // Route Planning
  {
    category: "route_planning" as const,
    ruleKey: "no_backtracking",
    ruleTitle: "No route backtracking",
    ruleText: "For multi-city trips, plan a logical route that minimizes backtracking. Example: KTM→Pokhara→Chitwan→KTM or KTM→Chitwan→Pokhara→KTM. Do NOT route through the origin city between stops (e.g., KTM→Chitwan→KTM→Pokhara is wrong).",
    appliesTo: "all" as const,
    priority: 30,
  },
  {
    category: "route_planning" as const,
    ruleKey: "note_missing_transport",
    ruleTitle: "Note missing DB transport",
    ruleText: "If a transport leg is NOT found in the DB (e.g., Chitwan→Pokhara), still include ALL other legs and note the missing one in your response as \"to be arranged by our operations team.\"",
    appliesTo: "all" as const,
    priority: 31,
  },
  {
    category: "route_planning" as const,
    ruleKey: "pre_save_checklist",
    ruleTitle: "Pre-save verification",
    ruleText: "Before calling save_quote, verify: 1) Draw the route — is it logical with no backtracking? 2) Transport for every leg? 3) Airport transfers at first/last city and flight cities? 4) Hotels per city with correct nights? 5) Guides at sightseeing cities with correct days? 6) Return flight if client flew somewhere mid-trip? 7) Permits for destinations that need them? If anything is missing, search and add it.",
    appliesTo: "all" as const,
    priority: 32,
  },
  // Quantity Rules
  {
    category: "quantity_rules" as const,
    ruleKey: "hotel_rooms_x_nights",
    ruleTitle: "Hotel: rooms x nights",
    ruleText: "hotel: effectiveQty = quantity (rooms) x nights. Example: 1 room for 3 nights → quantity=1, nights=3. You MUST pass the correct nights for hotels.",
    appliesTo: "all" as const,
    priority: 40,
  },
  {
    category: "quantity_rules" as const,
    ruleKey: "guide_qty_x_days",
    ruleTitle: "Guide: qty x days",
    ruleText: "guide/porter: effectiveQty = quantity (number of guides) x nights (days). Example: 1 guide for 2 days → quantity=1, nights=2.",
    appliesTo: "all" as const,
    priority: 41,
  },
  {
    category: "quantity_rules" as const,
    ruleKey: "flight_qty_equals_pax",
    ruleTitle: "Flight: qty = pax",
    ruleText: "flight/permit/package: effectiveQty = quantity (should equal numberOfPax). Example: 2 travelers → quantity=2.",
    appliesTo: "all" as const,
    priority: 42,
  },
  // Search Strategy
  {
    category: "search_strategy" as const,
    ruleKey: "search_packages_first",
    ruleTitle: "Search packages first",
    ruleText: "ALWAYS search packages first (search_packages) when a client mentions ANY destination or trip type. If a curated package is found, present its day-by-day itinerary and use calculate_quote with serviceType 'package'.",
    appliesTo: "all" as const,
    priority: 50,
  },
  {
    category: "search_strategy" as const,
    ruleKey: "domestic_flight_return_sector",
    ruleTitle: "Same ID for return sector",
    ruleText: "Our database stores each flight sector once (e.g., Kathmandu→Pokhara). The same rate applies for the return sector. When building a round-trip quote, add TWO separate flight items using the SAME serviceId — one for outbound, one for return. This applies to ALL domestic sectors.",
    appliesTo: "all" as const,
    priority: 51,
  },
  // Escalation
  {
    category: "escalation" as const,
    ruleKey: "budget_over_25k",
    ruleTitle: "Budget > $25K escalation",
    ruleText: "Proactively suggest speaking with a human expedition specialist when trip budget exceeds $25,000.",
    appliesTo: "all" as const,
    priority: 60,
  },
  {
    category: "escalation" as const,
    ruleKey: "group_over_8",
    ruleTitle: "Group > 8 escalation",
    ruleText: "Proactively suggest speaking with a human expedition specialist when group sizes exceed 8 people.",
    appliesTo: "all" as const,
    priority: 61,
  },
  // Country Specific
  {
    category: "country_specific" as const,
    ruleKey: "nepal_full_rates",
    ruleTitle: "Nepal: full DB rates",
    ruleText: "Nepal: Full individual rates available in DB. Tier 1 or Tier 2 always possible.",
    appliesTo: "all" as const,
    priority: 70,
    country: "Nepal",
  },
  {
    category: "country_specific" as const,
    ruleKey: "bhutan_packages_only",
    ruleTitle: "Bhutan/Tibet/India: packages or Tier 3",
    ruleText: "Bhutan, India, Tibet: May only have packages (Tier 1). If no package, go to Tier 3 (estimate + contact team).",
    appliesTo: "all" as const,
    priority: 71,
  },
  // Communication
  {
    category: "communication" as const,
    ruleKey: "warm_professional",
    ruleTitle: "Warm professional style",
    ruleText: "Be warm, professional, and knowledgeable. Share your expertise about destinations. Ask clarifying questions when needed (group size, dates, preferences). Suggest complementary services (guides, transportation, activities).",
    appliesTo: "customer_chat" as const,
    priority: 80,
  },
];

/**
 * POST /api/admin/seed-ai-rules
 * Seed AI business rules from hardcoded prompts
 */
export async function POST(req: NextRequest) {
  const session = await verifyAdminSession(req);
  if (!session) return adminUnauthorizedResponse();

  try {
    let created = 0;
    let updated = 0;

    for (const rule of SEED_RULES) {
      const result = await db
        .insert(aiBusinessRules)
        .values({
          ...rule,
          isActive: true,
          createdBy: "seed",
        })
        .onConflictDoUpdate({
          target: aiBusinessRules.ruleKey,
          set: {
            ruleTitle: rule.ruleTitle,
            ruleText: rule.ruleText,
            category: rule.category,
            appliesTo: rule.appliesTo,
            priority: rule.priority,
            country: rule.country || null,
            updatedAt: new Date(),
          },
        })
        .returning();

      if (result.length > 0) {
        // Check if it was a create or update based on createdAt vs updatedAt
        const r = result[0];
        if (r.createdAt && r.updatedAt && r.createdAt.getTime() === r.updatedAt.getTime()) {
          created++;
        } else {
          updated++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Seeded ${SEED_RULES.length} AI business rules (${created} created, ${updated} updated)`,
      total: SEED_RULES.length,
    });
  } catch (error) {
    console.error("Error seeding AI rules:", error);
    return NextResponse.json({ error: "Failed to seed rules" }, { status: 500 });
  }
}
