import { NextResponse } from "next/server";
import { db } from "@/db";
import { destinationGuides, destinations } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

const DESTINATION_GUIDES = [
  {
    country: "Nepal",
    title: "Nepal Travel Guide",
    subtitle: "The Land of the Himalayas",
    overview: "Nepal, nestled between India and Tibet, is a land of incredible natural beauty and rich cultural heritage. From the towering peaks of the Himalayas, including Mount Everest, to the lush jungles of the Terai, Nepal offers diverse landscapes and experiences.",
    highlights: [
      { title: "Mount Everest", description: "The world's highest peak and ultimate mountaineering destination" },
      { title: "Kathmandu Valley", description: "UNESCO World Heritage temples and rich Newari culture" },
      { title: "Annapurna Circuit", description: "One of the world's best long-distance treks" },
      { title: "Chitwan National Park", description: "Wildlife sanctuary with rhinos, tigers, and elephants" },
    ],
    bestTimeToVisit: { recommended: ["October", "November", "March", "April"], weather: { autumn: "Clear skies, best visibility", spring: "Warm with blooms" }, crowds: { autumn: "Peak", spring: "Moderate" }, prices: { autumn: "Peak", spring: "Moderate" } },
    culturalTips: [
      { tip: "Remove shoes before entering temples", explanation: "Shows respect for sacred spaces" },
      { tip: "Walk clockwise around Buddhist monuments", explanation: "Follows traditional circumambulation direction" },
    ],
    healthAndSafety: "Altitude sickness is a concern above 2,500m. Travel insurance with evacuation is essential.",
    emergencyInfo: { police: "100", ambulance: "102", hospitals: ["CIWEC Hospital (Kathmandu)"] },
  },
  {
    country: "Bhutan",
    title: "Bhutan Travel Guide",
    subtitle: "The Land of the Thunder Dragon",
    overview: "Bhutan, the last great Himalayan kingdom, measures success by Gross National Happiness. From the iconic Tiger's Nest Monastery to pristine forests covering 72% of the country, Bhutan offers a unique travel experience.",
    highlights: [
      { title: "Tiger's Nest Monastery", description: "Iconic cliffside monastery, Bhutan's most sacred site" },
      { title: "Punakha Dzong", description: "Stunning fortress at the confluence of two rivers" },
      { title: "Gangtey Valley", description: "Home to rare black-necked cranes" },
    ],
    bestTimeToVisit: { recommended: ["March", "April", "September", "October", "November"], weather: { spring: "Mild with blooms", autumn: "Clear festival season" }, crowds: { spring: "Moderate", autumn: "Peak" }, prices: { spring: "Standard", autumn: "Peak" } },
    culturalTips: [
      { tip: "Dress modestly", explanation: "Strict dress code for official buildings" },
      { tip: "Photography may be restricted in dzongs", explanation: "Ask before photographing" },
    ],
    healthAndSafety: "Medical facilities limited outside Thimphu. Comprehensive travel insurance mandatory.",
    emergencyInfo: { police: "113", ambulance: "110", hospitals: ["Jigme Dorji Wangchuck Hospital (Thimphu)"] },
  },
  {
    country: "Tibet",
    title: "Tibet Travel Guide",
    subtitle: "The Roof of the World",
    overview: "Tibet, perched on the highest plateau on Earth, offers a profound journey through ancient Buddhist culture. From the Potala Palace to Mount Kailash, Tibet's spiritual heritage and otherworldly landscapes create an unforgettable experience.",
    highlights: [
      { title: "Potala Palace", description: "Former residence of the Dalai Lama, iconic symbol of Tibet" },
      { title: "Mount Kailash", description: "Sacred to four religions, a profound pilgrimage circuit" },
      { title: "Namtso Lake", description: "One of the highest saltwater lakes in the world" },
    ],
    bestTimeToVisit: { recommended: ["April", "May", "June", "September", "October"], weather: { spring: "Warming, occasional dust", autumn: "Clear and dry" }, crowds: { spring: "Moderate", autumn: "Moderate to high" }, prices: { spring: "Moderate", autumn: "Moderate" } },
    culturalTips: [
      { tip: "Walk clockwise around religious sites", explanation: "Buddhist tradition" },
      { tip: "Be politically sensitive", explanation: "Avoid sensitive political topics" },
    ],
    healthAndSafety: "Altitude is serious — Lhasa is 3,650m. Acclimatize 2-3 days before strenuous activity.",
    emergencyInfo: { police: "110", ambulance: "120", hospitals: ["Tibet People's Hospital (Lhasa)"] },
  },
  {
    country: "India",
    title: "India Travel Guide",
    subtitle: "A Tapestry of Cultures, Landscapes & Legends",
    overview: "India offers extraordinary diversity — from the Himalayas of Ladakh and the spiritual Ganges to royal Rajasthan palaces and Kerala backwaters. Over 5,000 years of civilization woven into journeys that are enriching and exhilarating.",
    highlights: [
      { title: "Rajasthan's Royal Palaces", description: "Magnificent forts and heritage palace hotels" },
      { title: "Ladakh & the Himalayas", description: "High-altitude monasteries and pristine lakes" },
      { title: "Kerala Backwaters", description: "Luxury houseboat cruises through palm-fringed waterways" },
      { title: "Golden Triangle", description: "Delhi, Agra (Taj Mahal), and Jaipur" },
    ],
    bestTimeToVisit: { recommended: ["October", "November", "December", "January", "February", "March"], weather: { winter: "Cool and dry, ideal", summer: "Hot in plains, monsoon Jun-Sep" }, crowds: { winter: "Peak season", summer: "Low" }, prices: { winter: "Peak", summer: "Low season" } },
    culturalTips: [
      { tip: "Greet with Namaste", explanation: "Universally understood respectful greeting" },
      { tip: "Remove shoes at religious sites", explanation: "Footwear considered impure" },
    ],
    healthAndSafety: "Drink only bottled water. Travel insurance essential. Vaccinations for Hepatitis A and Typhoid recommended.",
    emergencyInfo: { police: "100", ambulance: "102 / 108", hospitals: ["Max Super Speciality Hospital (Delhi)", "Apollo Hospitals"] },
  },
];

export async function POST() {
  try {
    let seeded = 0;

    for (const guide of DESTINATION_GUIDES) {
      // Find destination by country
      const [dest] = await db
        .select()
        .from(destinations)
        .where(eq(destinations.country, guide.country))
        .limit(1);

      if (!dest) {
        console.log(`No destination found for ${guide.country}, skipping`);
        continue;
      }

      // Check if guide exists
      const [existing] = await db
        .select()
        .from(destinationGuides)
        .where(
          and(
            eq(destinationGuides.destinationId, dest.id),
            eq(destinationGuides.language, "en"),
            eq(destinationGuides.guideType, "comprehensive")
          )
        )
        .limit(1);

      if (existing) {
        // Update
        await db
          .update(destinationGuides)
          .set({
            title: guide.title,
            subtitle: guide.subtitle,
            overview: guide.overview,
            highlights: guide.highlights,
            bestTimeToVisit: guide.bestTimeToVisit,
            culturalTips: guide.culturalTips,
            healthAndSafety: guide.healthAndSafety,
            emergencyInfo: guide.emergencyInfo,
            isPublished: true,
            updatedAt: new Date(),
          })
          .where(eq(destinationGuides.id, existing.id));
      } else {
        // Insert
        await db.insert(destinationGuides).values({
          destinationId: dest.id,
          title: guide.title,
          subtitle: guide.subtitle,
          language: "en",
          guideType: "comprehensive",
          overview: guide.overview,
          highlights: guide.highlights,
          bestTimeToVisit: guide.bestTimeToVisit,
          culturalTips: guide.culturalTips,
          healthAndSafety: guide.healthAndSafety,
          emergencyInfo: guide.emergencyInfo,
          isPublished: true,
          isAutoGenerated: false,
        });
      }
      seeded++;
    }

    return NextResponse.json({
      success: true,
      message: `Seeded ${seeded} destination guides`,
    });
  } catch (error) {
    console.error("Failed to seed destinations:", error);
    return NextResponse.json(
      { error: "Failed to seed destination guides" },
      { status: 500 }
    );
  }
}
