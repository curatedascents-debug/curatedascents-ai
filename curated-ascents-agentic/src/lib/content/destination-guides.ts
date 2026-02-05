/**
 * Destination Guides Generator
 * Auto-generates comprehensive travel guides for destinations
 */

import { db } from "@/db";
import {
  destinationGuides,
  destinations,
  destinationContent,
  contentAssets,
  hotels,
  generatedContent,
  feedbackSurveys,
} from "@/db/schema";
import { eq, and, desc, sql, ilike } from "drizzle-orm";
import { getCachedContent, cacheGeneratedContent } from "./content-engine";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DestinationGuide {
  id?: number;
  destinationId: number;
  destinationName: string;
  title: string;
  subtitle?: string;
  language: string;
  guideType: string;
  overview: string;
  highlights: Array<{ title: string; description: string; icon?: string }>;
  bestTimeToVisit: {
    recommended: string[];
    weather: Record<string, string>;
    crowds: Record<string, string>;
    prices: Record<string, string>;
  };
  gettingThere: string;
  gettingAround: string;
  whereToStay: Array<{
    category: string;
    description: string;
    priceRange: string;
    recommendations: string[];
  }>;
  whatToSee: Array<{
    name: string;
    description: string;
    duration: string;
    tips?: string;
  }>;
  whatToDo: Array<{
    activity: string;
    description: string;
    difficulty?: string;
    bestSeason?: string;
  }>;
  culturalTips: Array<{ tip: string; explanation: string }>;
  packingList: Record<string, string[]>;
  healthAndSafety: string;
  moneyMatters: string;
  usefulPhrases?: Array<{ phrase: string; pronunciation?: string; meaning: string }>;
  emergencyInfo: {
    police?: string;
    ambulance?: string;
    embassy?: string;
    hospitals?: string[];
  };
  coverImage?: string;
  gallery?: Array<{ url: string; caption?: string }>;
}

// ─── Destination Data ─────────────────────────────────────────────────────────

// Pre-defined destination data for core destinations
const DESTINATION_DATA: Record<string, Partial<DestinationGuide>> = {
  nepal: {
    title: "Nepal Travel Guide",
    subtitle: "The Land of the Himalayas",
    overview: `Nepal, nestled between India and Tibet, is a land of incredible natural beauty and rich cultural heritage. From the towering peaks of the Himalayas, including Mount Everest, to the lush jungles of the Terai, Nepal offers diverse landscapes and experiences. The country is home to ancient temples, vibrant festivals, and some of the world's most renowned trekking routes. Whether you're seeking adventure, spirituality, or cultural immersion, Nepal delivers an unforgettable experience.`,
    highlights: [
      { title: "Mount Everest", description: "The world's highest peak and ultimate mountaineering destination", icon: "mountain" },
      { title: "Kathmandu Valley", description: "UNESCO World Heritage temples and rich Newari culture", icon: "temple" },
      { title: "Annapurna Circuit", description: "One of the world's best long-distance treks", icon: "hiking" },
      { title: "Chitwan National Park", description: "Wildlife sanctuary with rhinos, tigers, and elephants", icon: "wildlife" },
      { title: "Pokhara", description: "Lakeside paradise with stunning mountain views", icon: "lake" },
      { title: "Lumbini", description: "Birthplace of Buddha and sacred pilgrimage site", icon: "spiritual" },
    ],
    bestTimeToVisit: {
      recommended: ["October", "November", "March", "April"],
      weather: {
        spring: "Warm with rhododendron blooms, occasional rain",
        summer: "Monsoon season with heavy rainfall",
        autumn: "Clear skies, best mountain visibility",
        winter: "Cold but clear, snow at higher elevations",
      },
      crowds: {
        spring: "Moderate to high",
        summer: "Low",
        autumn: "Peak season",
        winter: "Low to moderate",
      },
      prices: {
        spring: "Moderate",
        summer: "Low season rates",
        autumn: "Peak season rates",
        winter: "Moderate to low",
      },
    },
    gettingThere: `Tribhuvan International Airport (KTM) in Kathmandu is Nepal's main international gateway. Direct flights are available from major Asian cities including Delhi, Bangkok, Doha, and Singapore. Land border crossings from India are possible at several points, with Sunauli/Bhairahawa and Kakarbhitta being the most popular.`,
    gettingAround: `Domestic flights connect Kathmandu to Pokhara, Lukla (Everest), and other destinations. Tourist buses run between major cities, while private vehicles with drivers offer flexibility. In cities, taxis and ride-sharing apps are available. For trekking regions, walking is the primary mode of transport.`,
    culturalTips: [
      { tip: "Remove shoes before entering temples and homes", explanation: "Shoes are considered impure and removing them shows respect" },
      { tip: "Use your right hand for eating and giving", explanation: "The left hand is considered unclean in Nepali culture" },
      { tip: "Dress modestly at religious sites", explanation: "Cover shoulders and knees when visiting temples and monasteries" },
      { tip: "Ask permission before photographing people", explanation: "Many locals appreciate being asked first, especially monks and elderly" },
      { tip: "Walk clockwise around Buddhist monuments", explanation: "This follows the traditional circumambulation direction" },
    ],
    packingList: {
      trekking: ["Sturdy hiking boots", "Layered clothing", "Down jacket", "Rain gear", "Sleeping bag liner", "Water purification", "Sunscreen SPF50+", "First aid kit"],
      cultural: ["Modest clothing", "Comfortable walking shoes", "Light scarf for temples", "Sunglasses", "Daypack", "Camera"],
      general: ["Valid passport", "Travel insurance documents", "Copies of permits", "Cash in USD/local currency", "Power adapter", "Medications"],
    },
    healthAndSafety: `Altitude sickness is a concern above 2,500m - acclimatize slowly and stay hydrated. Drink only bottled or purified water. Travel insurance with emergency evacuation is essential for trekking. Register with your embassy and inform someone of your itinerary. Food hygiene varies - choose restaurants carefully and avoid raw vegetables initially.`,
    moneyMatters: `The Nepali Rupee (NPR) is the local currency. ATMs are available in cities but rare in remote areas. Carry sufficient cash for treks. Credit cards accepted at hotels and larger restaurants in tourist areas. Tipping is customary - 10% at restaurants, and porters/guides expect tips at the end of treks. Bargaining is expected at markets.`,
    emergencyInfo: {
      police: "100",
      ambulance: "102",
      hospitals: ["CIWEC Hospital (Kathmandu)", "Grande International Hospital", "Manipal Teaching Hospital (Pokhara)"],
    },
  },
  bhutan: {
    title: "Bhutan Travel Guide",
    subtitle: "The Land of the Thunder Dragon",
    overview: `Bhutan, the last great Himalayan kingdom, is a country that measures success by Gross National Happiness rather than GDP. Nestled between India and Tibet, this Buddhist kingdom has preserved its traditional culture while embracing sustainable development. From the iconic Tiger's Nest Monastery clinging to a cliff face to the pristine forests that cover 72% of the country, Bhutan offers a unique travel experience unlike anywhere else on Earth.`,
    highlights: [
      { title: "Tiger's Nest Monastery", description: "Iconic cliffside monastery, Bhutan's most sacred site", icon: "temple" },
      { title: "Punakha Dzong", description: "Stunning fortress at the confluence of two rivers", icon: "fortress" },
      { title: "Thimphu", description: "The world's only capital without traffic lights", icon: "city" },
      { title: "Paro Valley", description: "Beautiful valley with ancient temples and rice paddies", icon: "valley" },
      { title: "Dochula Pass", description: "108 memorial chortens with Himalayan panorama", icon: "mountain" },
      { title: "Traditional Festivals", description: "Colorful tshechus with masked dances", icon: "festival" },
    ],
    bestTimeToVisit: {
      recommended: ["March", "April", "May", "September", "October", "November"],
      weather: {
        spring: "Mild with rhododendron blooms",
        summer: "Monsoon, heavy rain in south",
        autumn: "Clear skies, festival season",
        winter: "Cold, some areas snow-covered",
      },
      crowds: {
        spring: "Festival season, moderate crowds",
        summer: "Low season",
        autumn: "Peak season",
        winter: "Low season",
      },
      prices: {
        spring: "Standard SDF rates",
        summer: "Some discounts available",
        autumn: "Peak rates",
        winter: "Low season discounts",
      },
    },
    gettingThere: `Paro International Airport (PBH) is Bhutan's only international airport, served by Druk Air and Bhutan Airlines. Flights operate from Delhi, Kathmandu, Bangkok, Singapore, and a few other cities. The dramatic approach through mountain valleys is memorable. Overland entry from India is possible at Phuentsholing.`,
    culturalTips: [
      { tip: "Dress code is strictly enforced", explanation: "Bhutanese wear traditional dress (gho/kira) for official buildings; tourists should dress modestly" },
      { tip: "Photography may be restricted", explanation: "Ask before photographing inside dzongs and temples" },
      { tip: "Remove shoes and hats in temples", explanation: "Show respect by observing these customs" },
      { tip: "Walk clockwise around religious sites", explanation: "Follow Buddhist tradition when circumambulating" },
      { tip: "Avoid pointing at religious objects", explanation: "Use an open palm gesture instead of pointing" },
    ],
    packingList: {
      general: ["Warm layers", "Rain jacket", "Comfortable walking shoes", "Daypack", "Camera", "Sunscreen", "Hat", "Modest clothing"],
      trekking: ["Hiking boots", "Down jacket", "Sleeping bag", "Trekking poles", "Water bottle", "Headlamp"],
    },
    healthAndSafety: `Altitude can affect visitors, especially on treks. Medical facilities are limited outside Thimphu. Comprehensive travel insurance with evacuation coverage is mandatory. Water should be bottled or purified. Food hygiene is generally good at hotels.`,
    moneyMatters: `Bhutanese Ngultrum (BTN) is at par with Indian Rupee; both are accepted. The Sustainable Development Fee (SDF) of $200/day for tourists covers most costs. ATMs are available in main towns. Credit cards accepted at some hotels. Cash needed in remote areas.`,
    emergencyInfo: {
      police: "113",
      ambulance: "110",
      hospitals: ["Jigme Dorji Wangchuck National Referral Hospital (Thimphu)"],
    },
  },
  tibet: {
    title: "Tibet Travel Guide",
    subtitle: "The Roof of the World",
    overview: `Tibet, perched on the highest plateau on Earth, offers a profound journey through ancient Buddhist culture and breathtaking landscapes. From the magnificent Potala Palace in Lhasa to the sacred Mount Kailash, Tibet's spiritual heritage runs deep. The region's otherworldly scenery - turquoise lakes, vast grasslands, and snow-capped peaks - combined with warm Tibetan hospitality creates an unforgettable experience. Due to its special status, travel to Tibet requires permits and must be arranged through licensed agencies.`,
    highlights: [
      { title: "Potala Palace", description: "Former winter residence of the Dalai Lama, iconic symbol of Tibet", icon: "palace" },
      { title: "Jokhang Temple", description: "Tibet's most sacred temple and pilgrimage destination", icon: "temple" },
      { title: "Mount Everest North Base Camp", description: "The Tibetan side of the world's highest peak", icon: "mountain" },
      { title: "Mount Kailash", description: "Sacred to four religions, a profound pilgrimage circuit", icon: "spiritual" },
      { title: "Namtso Lake", description: "One of the highest saltwater lakes in the world", icon: "lake" },
      { title: "Shigatse & Tashilhunpo", description: "Second largest city and seat of the Panchen Lama", icon: "monastery" },
    ],
    bestTimeToVisit: {
      recommended: ["April", "May", "June", "September", "October"],
      weather: {
        spring: "Warming up, occasional dust storms",
        summer: "Peak season, some rain",
        autumn: "Clear and dry, excellent visibility",
        winter: "Very cold, some areas inaccessible",
      },
      crowds: {
        spring: "Moderate",
        summer: "High",
        autumn: "Moderate to high",
        winter: "Low",
      },
      prices: {
        spring: "Moderate",
        summer: "Peak rates",
        autumn: "Moderate",
        winter: "Lower rates, limited tours",
      },
    },
    gettingThere: `Most visitors fly to Lhasa Gonggar Airport from mainland China cities (Beijing, Chengdu, Xian). The Qinghai-Tibet Railway from Xian or Beijing is a scenic alternative. All foreign tourists must have a Tibet Travel Permit arranged in advance through a licensed tour operator.`,
    culturalTips: [
      { tip: "Respect religious customs", explanation: "Tibet is deeply Buddhist; show reverence at sacred sites" },
      { tip: "Walk clockwise around religious sites", explanation: "Follow the sun's path as per Buddhist tradition" },
      { tip: "Be sensitive with photography", explanation: "Avoid photos of military installations; ask permission at monasteries" },
      { tip: "Accept offered tea and food graciously", explanation: "Butter tea is customary; try a small amount even if it's unusual" },
      { tip: "Be politically sensitive", explanation: "Avoid discussions about sensitive political topics" },
    ],
    packingList: {
      general: ["Very warm layers", "Down jacket", "Sunglasses (UV protection)", "SPF 50+ sunscreen", "Lip balm", "Hand cream", "Water bottle"],
      altitude: ["Altitude sickness medication", "Diamox (consult doctor)", "Electrolytes", "Snacks"],
    },
    healthAndSafety: `Altitude is a serious concern - Lhasa is at 3,650m. Spend at least 2-3 days acclimatizing before any strenuous activity. Drink lots of water, avoid alcohol initially, and ascend gradually. Medical facilities are limited. Comprehensive travel insurance with high-altitude coverage is essential.`,
    moneyMatters: `Chinese Yuan (CNY/RMB) is the currency. ATMs available in Lhasa; carry cash for remote areas. Credit cards accepted at major hotels. All tour costs including permits, guides, and transportation must be pre-arranged and paid through your tour operator.`,
    emergencyInfo: {
      police: "110",
      ambulance: "120",
      hospitals: ["Tibet Autonomous Region People's Hospital (Lhasa)"],
    },
  },
};

// ─── Guide Generation ─────────────────────────────────────────────────────────

/**
 * Get or generate a destination guide
 */
export async function getDestinationGuide(
  destinationId: number,
  language: string = "en",
  guideType: string = "comprehensive"
): Promise<DestinationGuide | null> {
  // Check if guide exists in database
  const [existingGuide] = await db
    .select()
    .from(destinationGuides)
    .where(
      and(
        eq(destinationGuides.destinationId, destinationId),
        eq(destinationGuides.language, language),
        eq(destinationGuides.guideType, guideType),
        eq(destinationGuides.isPublished, true)
      )
    )
    .limit(1);

  if (existingGuide) {
    return formatGuideFromDb(existingGuide);
  }

  // Get destination info
  const [destination] = await db
    .select()
    .from(destinations)
    .where(eq(destinations.id, destinationId))
    .limit(1);

  if (!destination) return null;

  // Check for cached generated content
  const cached = await getCachedContent(
    "destination_guide",
    "destination",
    destinationId,
    language
  );

  if (cached) {
    return JSON.parse(cached.content);
  }

  // Generate new guide
  const guide = await generateDestinationGuide(destination, language, guideType);

  // Cache the generated guide
  await cacheGeneratedContent({
    contentType: "destination_guide",
    contextType: "destination",
    contextId: destinationId,
    language,
    content: JSON.stringify(guide),
    metadata: { guideType, destinationName: destination.city },
  });

  return guide;
}

/**
 * Generate a destination guide
 */
async function generateDestinationGuide(
  destination: typeof destinations.$inferSelect,
  language: string,
  guideType: string
): Promise<DestinationGuide> {
  const destName = (destination.city || destination.region || destination.country || "").toLowerCase();
  const country = destination.country?.toLowerCase() || "";

  // Find matching pre-defined data
  let baseData: Partial<DestinationGuide> = {};
  for (const [key, data] of Object.entries(DESTINATION_DATA)) {
    if (destName.includes(key) || country.includes(key)) {
      baseData = { ...data };
      break;
    }
  }

  // Get destination content from database
  const contentPieces = await db
    .select()
    .from(destinationContent)
    .where(
      and(
        eq(destinationContent.destinationId, destination.id),
        eq(destinationContent.language, language),
        eq(destinationContent.isApproved, true)
      )
    );

  // Merge database content with base data
  for (const piece of contentPieces) {
    if (piece.contentType === "destination_overview" && piece.content) {
      baseData.overview = piece.content;
    }
    if (piece.contentType === "travel_tips" && piece.highlights) {
      baseData.culturalTips = (piece.highlights as string[]).map((tip) => ({
        tip,
        explanation: "",
      }));
    }
  }

  // Get hotels for accommodation recommendations
  const destinationHotels = await db
    .select()
    .from(hotels)
    .where(eq(hotels.destinationId, destination.id))
    .limit(10);

  const whereToStay = [
    {
      category: "Luxury",
      description: "5-star hotels and boutique properties offering world-class amenities",
      priceRange: "$300-500+/night",
      recommendations: destinationHotels
        .filter((h) => h.starRating && h.starRating >= 5)
        .slice(0, 3)
        .map((h) => h.name),
    },
    {
      category: "Mid-Range",
      description: "Comfortable 3-4 star hotels with good facilities",
      priceRange: "$100-250/night",
      recommendations: destinationHotels
        .filter((h) => h.starRating && h.starRating >= 3 && h.starRating < 5)
        .slice(0, 3)
        .map((h) => h.name),
    },
    {
      category: "Budget",
      description: "Clean guesthouses and basic accommodations",
      priceRange: "$30-80/night",
      recommendations: [],
    },
  ];

  // Get images
  const images = await db
    .select()
    .from(contentAssets)
    .where(
      and(
        eq(contentAssets.destinationId, destination.id),
        eq(contentAssets.assetType, "image")
      )
    )
    .orderBy(desc(contentAssets.qualityScore))
    .limit(10);

  // Get testimonials related to this destination
  const testimonials = await db
    .select()
    .from(feedbackSurveys)
    .where(
      and(
        eq(feedbackSurveys.canUseAsTestimonial, true),
        sql`${feedbackSurveys.testimonial} IS NOT NULL`
      )
    )
    .limit(5);

  // Compile the guide
  const displayName = destination.city || destination.region || destination.country || "Destination";
  const guide: DestinationGuide = {
    destinationId: destination.id,
    destinationName: displayName,
    title: baseData.title || `${displayName} Travel Guide`,
    subtitle: baseData.subtitle || `Discover ${destination.country || "the region"}`,
    language,
    guideType,
    overview: baseData.overview || `${displayName} offers unique experiences and adventures for travelers seeking authentic cultural and natural wonders.`,
    highlights: baseData.highlights || [
      { title: "Local Culture", description: "Immerse yourself in rich traditions" },
      { title: "Natural Beauty", description: "Stunning landscapes await" },
      { title: "Adventure", description: "Exciting activities for all levels" },
    ],
    bestTimeToVisit: baseData.bestTimeToVisit || {
      recommended: ["October", "November", "March", "April"],
      weather: { autumn: "Clear and pleasant", spring: "Warming temperatures" },
      crowds: { autumn: "Moderate to high", spring: "Moderate" },
      prices: { autumn: "Peak season", spring: "Moderate" },
    },
    gettingThere: baseData.gettingThere || `Access to ${displayName} varies by location. Contact us for detailed transportation options.`,
    gettingAround: baseData.gettingAround || "Local transportation options include private vehicles, public transport, and walking.",
    whereToStay: whereToStay.length > 0 ? whereToStay : baseData.whereToStay || [],
    whatToSee: baseData.whatToSee || [
      { name: "Local Attractions", description: "Discover the highlights of the region", duration: "Varies" },
    ],
    whatToDo: baseData.whatToDo || [
      { activity: "Sightseeing", description: "Explore the area's main attractions" },
      { activity: "Cultural Experiences", description: "Engage with local traditions" },
    ],
    culturalTips: baseData.culturalTips || [
      { tip: "Respect local customs", explanation: "Learn about and follow local traditions" },
    ],
    packingList: baseData.packingList || {
      essentials: ["Passport", "Comfortable clothing", "Walking shoes", "Camera", "Sunscreen"],
    },
    healthAndSafety: baseData.healthAndSafety || "Travel insurance is recommended. Consult your doctor about any necessary vaccinations.",
    moneyMatters: baseData.moneyMatters || "Local currency is preferred. ATMs are available in major towns.",
    usefulPhrases: baseData.usefulPhrases,
    emergencyInfo: baseData.emergencyInfo || {},
    coverImage: images[0]?.url,
    gallery: images.slice(1).map((img) => ({
      url: img.url,
      caption: img.caption || undefined,
    })),
  };

  return guide;
}

/**
 * Format guide from database record
 */
function formatGuideFromDb(
  guide: typeof destinationGuides.$inferSelect
): DestinationGuide {
  return {
    id: guide.id,
    destinationId: guide.destinationId,
    destinationName: "", // Would need to join with destinations
    title: guide.title,
    subtitle: guide.subtitle || undefined,
    language: guide.language || "en",
    guideType: guide.guideType || "comprehensive",
    overview: guide.overview || "",
    highlights: (guide.highlights as DestinationGuide["highlights"]) || [],
    bestTimeToVisit: (guide.bestTimeToVisit as DestinationGuide["bestTimeToVisit"]) || {
      recommended: [],
      weather: {},
      crowds: {},
      prices: {},
    },
    gettingThere: guide.gettingThere || "",
    gettingAround: guide.gettingAround || "",
    whereToStay: (guide.whereToStay as DestinationGuide["whereToStay"]) || [],
    whatToSee: (guide.whatToSee as DestinationGuide["whatToSee"]) || [],
    whatToDo: (guide.whatToDo as DestinationGuide["whatToDo"]) || [],
    culturalTips: (guide.culturalTips as DestinationGuide["culturalTips"]) || [],
    packingList: (guide.packingList as DestinationGuide["packingList"]) || {},
    healthAndSafety: guide.healthAndSafety || "",
    moneyMatters: guide.moneyMatters || "",
    usefulPhrases: guide.usefulPhrases as DestinationGuide["usefulPhrases"],
    emergencyInfo: (guide.emergencyInfo as DestinationGuide["emergencyInfo"]) || {},
    coverImage: guide.coverImage || undefined,
    gallery: guide.gallery as DestinationGuide["gallery"],
  };
}

/**
 * Save a destination guide to the database
 */
export async function saveDestinationGuide(
  guide: DestinationGuide
): Promise<number> {
  const [saved] = await db
    .insert(destinationGuides)
    .values({
      destinationId: guide.destinationId,
      title: guide.title,
      subtitle: guide.subtitle,
      language: guide.language,
      guideType: guide.guideType,
      overview: guide.overview,
      highlights: guide.highlights,
      bestTimeToVisit: guide.bestTimeToVisit,
      gettingThere: guide.gettingThere,
      gettingAround: guide.gettingAround,
      whereToStay: guide.whereToStay,
      whatToSee: guide.whatToSee,
      whatToDo: guide.whatToDo,
      culturalTips: guide.culturalTips,
      packingList: guide.packingList,
      healthAndSafety: guide.healthAndSafety,
      moneyMatters: guide.moneyMatters,
      usefulPhrases: guide.usefulPhrases,
      emergencyInfo: guide.emergencyInfo,
      coverImage: guide.coverImage,
      gallery: guide.gallery,
      isPublished: false,
      isAutoGenerated: true,
    })
    .returning({ id: destinationGuides.id });

  return saved.id;
}

/**
 * Publish a destination guide
 */
export async function publishGuide(guideId: number): Promise<boolean> {
  const [updated] = await db
    .update(destinationGuides)
    .set({
      isPublished: true,
      publishedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(destinationGuides.id, guideId))
    .returning();

  return !!updated;
}

/**
 * List all destination guides
 */
export async function listDestinationGuides(options?: {
  destinationId?: number;
  language?: string;
  publishedOnly?: boolean;
}) {
  const conditions = [];

  if (options?.destinationId) {
    conditions.push(eq(destinationGuides.destinationId, options.destinationId));
  }
  if (options?.language) {
    conditions.push(eq(destinationGuides.language, options.language));
  }
  if (options?.publishedOnly) {
    conditions.push(eq(destinationGuides.isPublished, true));
  }

  return db
    .select({
      guide: destinationGuides,
      destination: {
        id: destinations.id,
        name: destinations.city,
        country: destinations.country,
      },
    })
    .from(destinationGuides)
    .leftJoin(destinations, eq(destinationGuides.destinationId, destinations.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(destinationGuides.updatedAt));
}
