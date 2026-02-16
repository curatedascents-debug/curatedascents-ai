import { NextResponse } from "next/server";
import { db } from "@/db";
import { packages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { allLuxuryItineraries } from "@/lib/data/luxury-itineraries";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    let created = 0;
    let updated = 0;

    for (const itin of allLuxuryItineraries) {
      const itineraryDetailed = {
        highlights: itin.highlights,
        bestMonths: itin.bestMonths,
        route: itin.route,
        days: itin.days,
      };

      const values = {
        slug: itin.slug,
        name: itin.name,
        packageType: itin.packageType,
        country: itin.country,
        region: itin.region,
        durationDays: itin.durationDays,
        durationNights: itin.durationNights,
        difficulty: itin.difficulty,
        maxAltitude: itin.maxAltitude,
        groupSizeMin: itin.groupSizeMin,
        groupSizeMax: itin.groupSizeMax,
        itinerarySummary: itin.itinerarySummary,
        itineraryDetailed,
        costPrice: itin.costPrice.toFixed(2),
        sellPrice: itin.sellPrice.toFixed(2),
        marginPercent: "50.00",
        priceType: "per_person" as const,
        currency: "USD",
        inclusions: itin.inclusions.join("\n"),
        exclusions: itin.exclusions.join("\n"),
        isActive: true,
        updatedAt: new Date(),
      };

      // Check if slug exists
      const [existing] = await db
        .select({ id: packages.id })
        .from(packages)
        .where(eq(packages.slug, itin.slug))
        .limit(1);

      if (existing) {
        await db
          .update(packages)
          .set(values)
          .where(eq(packages.id, existing.id));
        updated++;
      } else {
        await db.insert(packages).values(values);
        created++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Seeded ${created + updated} itineraries (${created} new, ${updated} updated)`,
      total: allLuxuryItineraries.length,
      created,
      updated,
    });
  } catch (error) {
    console.error("Failed to seed itineraries:", error);
    return NextResponse.json(
      {
        error: "Failed to seed itineraries",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
