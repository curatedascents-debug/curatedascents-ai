// src/lib/agents/fallback-rate-research.ts
// AI Agent Fallback: Research rates from external sources when not in database

export interface FallbackRateResult {
  found: boolean;
  source: "estimation";
  confidence: "high" | "medium" | "low";
  serviceType: string;
  serviceName: string;
  location: string;
  estimatedRates: {
    description: string;
    priceRange: {
      low: number;
      high: number;
    };
    currency: string;
    priceType: string;
    notes: string[];
  };
  disclaimer: string;
  suggestion: string;
}

// 50% margin multiplier applied to all fallback cost estimates
const MARGIN_MULTIPLIER = 1.5;

// Approximate supplier cost rates (2024-2025) — margin is applied at lookup time
const MARKET_RATES: Record<string, any> = {
  hotel: {
    nepal: {
      "5-star": { low: 200, high: 400, note: "Luxury hotels like Dwarika's, Hyatt, Marriott" },
      "4-star": { low: 100, high: 200, note: "Business hotels, good quality" },
      "3-star": { low: 50, high: 100, note: "Standard hotels, clean and comfortable" },
      "budget": { low: 15, high: 50, note: "Guesthouses and budget hotels" },
      "teahouse": { low: 15, high: 40, note: "Trekking tea houses with basic meals" },
    },
    bhutan: {
      "5-star": { low: 500, high: 1000, note: "Luxury lodges like Amankora, Six Senses" },
      "4-star": { low: 350, high: 500, note: "Good quality hotels" },
      "3-star": { low: 250, high: 350, note: "Standard tourist hotels" },
    },
    tibet: {
      "4-star": { low: 80, high: 150, note: "Best available in most areas" },
      "3-star": { low: 50, high: 80, note: "Standard tourist hotels" },
    },
  },
  transportation: {
    nepal: {
      "ktm-pokhara": { low: 100, high: 150, note: "Private car/SUV" },
      "ktm-chitwan": { low: 120, high: 160, note: "Private car/SUV" },
      "airport-transfer": { low: 15, high: 40, note: "Kathmandu airport" },
      "full-day-car": { low: 60, high: 100, note: "In Kathmandu" },
      "land-cruiser": { low: 150, high: 250, note: "For mountain roads" },
    },
  },
  flight: {
    nepal: {
      "ktm-lukla": { low: 180, high: 220, note: "Foreigner rate, weather dependent" },
      "ktm-pokhara": { low: 100, high: 130, note: "25 min scenic flight" },
      "mountain-flight": { low: 200, high: 250, note: "Everest sightseeing" },
    },
  },
  guide: {
    nepal: {
      "trekking": { low: 30, high: 50, note: "Licensed trekking guide per day" },
      "city": { low: 40, high: 60, note: "City/cultural guide per day" },
      "mountaineering": { low: 50, high: 100, note: "High altitude guide per day" },
    },
  },
  porter: {
    nepal: {
      "general": { low: 20, high: 30, note: "Per day, carries up to 25kg" },
    },
  },
  helicopter: {
    nepal: {
      "ebc-sharing": { low: 1000, high: 1200, note: "Per seat, 4-5 hour tour" },
      "ebc-charter": { low: 4500, high: 5500, note: "Whole helicopter" },
      "abc-sharing": { low: 400, high: 600, note: "Per seat" },
      "langtang": { low: 600, high: 800, note: "Per seat" },
    },
  },
  permit: {
    nepal: {
      "tims": { low: 20, high: 20, note: "Trekkers Information Management System" },
      "sagarmatha": { low: 30, high: 30, note: "Everest National Park" },
      "acap": { low: 30, high: 30, note: "Annapurna Conservation Area" },
      "langtang": { low: 30, high: 30, note: "Langtang National Park" },
      "manaslu": { low: 100, high: 100, note: "Restricted area permit" },
    },
    tibet: {
      "tibet-permit": { low: 50, high: 100, note: "Varies by region" },
    },
    bhutan: {
      "sdf": { low: 200, high: 200, note: "Per night Sustainable Development Fee" },
    },
  },
  package: {
    nepal: {
      "ebc-trek": { low: 1500, high: 2500, note: "12-14 days, all inclusive" },
      "annapurna-circuit": { low: 1200, high: 2000, note: "14-18 days" },
      "langtang-trek": { low: 800, high: 1200, note: "7-10 days" },
    },
    bhutan: {
      "cultural-tour": { low: 250, high: 500, note: "Per person per night, all inclusive" },
    },
    tibet: {
      "lhasa-tour": { low: 1000, high: 1500, note: "5-7 days from Kathmandu" },
      "ebc-north": { low: 1500, high: 2500, note: "8-10 days" },
      "kailash": { low: 2000, high: 3500, note: "15-18 days" },
    },
  },
};

export async function researchExternalRates(args: {
  serviceType: string;
  serviceName: string;
  location: string;
  category?: string;
  additionalContext?: string;
}): Promise<FallbackRateResult> {
  const { serviceType, serviceName, location, category, additionalContext } = args;

  // Normalize location to country
  const country = normalizeCountry(location);
  const categoryKey = normalizeCategory(category, serviceType);

  // Look up rates
  const serviceRates = MARKET_RATES[serviceType]?.[country];
  let rateInfo = serviceRates?.[categoryKey] || serviceRates?.["general"];

  // Default fallback if nothing found
  if (!rateInfo) {
    rateInfo = { 
      low: 0, 
      high: 0, 
      note: "Unable to estimate - please contact us for a custom quote" 
    };
  }

  const priceType = getPriceType(serviceType);

  // Apply 50% margin to cost estimates so AI always presents sell prices
  const sellLow = Math.round(rateInfo.low * MARGIN_MULTIPLIER);
  const sellHigh = Math.round(rateInfo.high * MARGIN_MULTIPLIER);

  return {
    found: true,
    source: "estimation",
    confidence: rateInfo.low > 0 ? "medium" : "low",
    serviceType,
    serviceName,
    location,
    estimatedRates: {
      description: `Estimated sell rates for ${serviceName} in ${location}`,
      priceRange: {
        low: sellLow,
        high: sellHigh,
      },
      currency: "USD",
      priceType,
      notes: [
        rateInfo.note,
        "Rates are approximate and may vary by season",
        "Final pricing subject to availability confirmation",
        additionalContext || "",
      ].filter(Boolean),
    },
    disclaimer: "⚠️ These are estimated rates for planning purposes only. Actual rates may vary based on season, availability, specific property/service, and current market conditions.",
    suggestion: "Would you like me to prepare a formal quote with confirmed rates from our partner suppliers?",
  };
}

function normalizeCountry(location: string): string {
  const loc = location.toLowerCase();
  if (loc.includes("nepal") || loc.includes("kathmandu") || loc.includes("pokhara") || 
      loc.includes("everest") || loc.includes("annapurna") || loc.includes("lukla") ||
      loc.includes("namche") || loc.includes("chitwan")) {
    return "nepal";
  }
  if (loc.includes("bhutan") || loc.includes("paro") || loc.includes("thimphu")) {
    return "bhutan";
  }
  if (loc.includes("tibet") || loc.includes("lhasa")) {
    return "tibet";
  }
  if (loc.includes("india") || loc.includes("darjeeling") || loc.includes("sikkim")) {
    return "india";
  }
  return "nepal"; // Default to Nepal
}

function normalizeCategory(category: string | undefined, serviceType: string): string {
  if (!category) return "general";
  
  const cat = category.toLowerCase();
  
  if (serviceType === "hotel") {
    if (cat.includes("5") || cat.includes("luxury") || cat.includes("deluxe")) return "5-star";
    if (cat.includes("4") || cat.includes("business")) return "4-star";
    if (cat.includes("3") || cat.includes("standard")) return "3-star";
    if (cat.includes("budget") || cat.includes("cheap")) return "budget";
    if (cat.includes("tea") || cat.includes("lodge")) return "teahouse";
  }
  
  if (serviceType === "guide") {
    if (cat.includes("trek")) return "trekking";
    if (cat.includes("city") || cat.includes("cultural")) return "city";
    if (cat.includes("mountain") || cat.includes("climb")) return "mountaineering";
  }
  
  if (serviceType === "helicopter") {
    if (cat.includes("ebc") || cat.includes("everest")) {
      return cat.includes("charter") ? "ebc-charter" : "ebc-sharing";
    }
    if (cat.includes("abc") || cat.includes("annapurna")) return "abc-sharing";
  }
  
  return "general";
}

function getPriceType(serviceType: string): string {
  switch (serviceType) {
    case "hotel":
      return "per night (double occupancy)";
    case "guide":
    case "porter":
      return "per day";
    case "transportation":
      return "per vehicle";
    case "flight":
    case "helicopter":
      return "per person/seat";
    case "permit":
      return "per person";
    case "package":
      return "per person (total package)";
    default:
      return "per service";
  }
}

// System prompt addition for the AI agent
export const FALLBACK_SYSTEM_PROMPT = `
## Fallback Rate Behavior (IMPORTANT)

When a specific hotel, service, or package is NOT found in our database:

1. **DO NOT** say "I don't have information about this" or "This is not in our database"
2. **INSTEAD**, use the research_external_rates tool OR your knowledge to provide approximate market rates
3. **ALWAYS** clearly label these as "Estimated Rates" or "Approximate Market Rates"
4. **ALWAYS** provide a price RANGE (low to high), not a single number
5. **ALWAYS** include a disclaimer about confirming final rates
6. **ALWAYS** offer to get a formal quote with confirmed pricing

### Response Format for Estimates:

"While I don't have [Hotel Name] specifically in our current inventory, based on current market rates for similar [category] properties in [location]:

**Estimated Rate:** $[low] - $[high] USD per night
- Based on [category] category properties
- Includes [typical inclusions]
- Additional taxes may apply

*Note: These are approximate rates for planning purposes. Would you like me to get a confirmed quote from our partner suppliers?*"

### Quick Reference - Nepal Sell Rates (2024-2025, 50% margin included):
- 5-Star Hotels: $300-600/night
- 4-Star Hotels: $150-300/night
- 3-Star Hotels: $75-150/night
- Trekking Guides: $45-75/day
- Porters: $30-45/day
- KTM-Lukla Flight: $270-330
- EBC Heli (sharing): $1,500-1,800/seat

### Bhutan:
- SDF (mandatory): $200/person/night (government fee, no margin)
- 3-Star Package: $375-450/person/night (all-inclusive)
- 5-Star Package: $750-1,200/person/night (all-inclusive)

Remember: Never leave the client without useful information. Always be helpful!
`;
