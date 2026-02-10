/**
 * Public Media — Homepage Images
 * GET /api/media/homepage
 * Returns media library images grouped for homepage sections:
 *   heroSlides, experiences, destinations, about
 * Falls back gracefully when media library is empty.
 */

import { NextResponse } from "next/server";
import { db } from "@/db";
import { mediaLibrary } from "@/db/schema";
import { eq, and, ilike, desc, asc, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

interface HomepageImage {
  cdnUrl: string;
  alt: string;
  country: string;
  destination: string | null;
  category: string;
}

async function findImages(
  country?: string,
  destination?: string,
  category?: string,
  limit = 1
): Promise<HomepageImage[]> {
  const conditions = [eq(mediaLibrary.active, true)];
  if (country) conditions.push(eq(mediaLibrary.country, country.toLowerCase()));
  if (destination) conditions.push(ilike(mediaLibrary.destination, `%${destination}%`));
  if (category) conditions.push(eq(mediaLibrary.category, category.toLowerCase()));

  const results = await db
    .select({
      cdnUrl: mediaLibrary.cdnUrl,
      altText: mediaLibrary.altText,
      title: mediaLibrary.title,
      country: mediaLibrary.country,
      destination: mediaLibrary.destination,
      category: mediaLibrary.category,
    })
    .from(mediaLibrary)
    .where(and(...conditions))
    .orderBy(desc(mediaLibrary.featured), asc(mediaLibrary.usageCount), sql`RANDOM()`)
    .limit(limit);

  return results.map((r) => ({
    cdnUrl: r.cdnUrl,
    alt: r.altText || r.title || r.destination || r.country,
    country: r.country,
    destination: r.destination,
    category: r.category,
  }));
}

export async function GET() {
  try {
    // Hero slides: one per country + one landscape
    const [nepal, bhutan, tibet, india, landscape] = await Promise.all([
      findImages("nepal", undefined, "landscape"),
      findImages("bhutan", undefined, "landscape"),
      findImages("tibet", undefined, "landscape"),
      findImages("india", undefined, "landscape"),
      findImages(undefined, undefined, "landscape"),
    ]);

    const heroSlides: Record<string, HomepageImage | null> = {
      Nepal: nepal[0] || null,
      Bhutan: bhutan[0] || null,
      Tibet: tibet[0] || null,
      India: india[0] || null,
      Annapurna: landscape[0] || null,
    };

    // Experiences: by destination + category
    const [
      everestTrek, bhutanCulture, annapurna, kailash, tigerSafari, ladakh
    ] = await Promise.all([
      findImages("nepal", "Everest", "trek"),
      findImages("bhutan", undefined, "culture"),
      findImages("nepal", "Annapurna", "landscape"),
      findImages("tibet", "Kailash"),
      findImages("india", undefined, "wildlife"),
      findImages("india", "Ladakh", "landscape"),
    ]);

    const experiences: Record<string, HomepageImage | null> = {
      "everest-base-camp-luxury": everestTrek[0] || null,
      "bhutan-cultural-journey": bhutanCulture[0] || null,
      "annapurna-heli-trek": annapurna[0] || null,
      "tibet-kailash-pilgrimage": kailash[0] || null,
      "india-tiger-safari": tigerSafari[0] || null,
      "ladakh-expedition": ladakh[0] || null,
    };

    // Destinations: one per country
    const destinations: Record<string, HomepageImage | null> = {
      nepal: nepal[0] || null,
      bhutan: bhutan[0] || null,
      tibet: tibet[0] || null,
      india: india[0] || null,
    };

    // About section: trek or adventure image
    const aboutImages = await findImages(undefined, undefined, "trek");
    const about: HomepageImage | null = aboutImages[0] || null;

    return NextResponse.json({
      heroSlides,
      experiences,
      destinations,
      about,
    });
  } catch (error) {
    console.error("Homepage media error:", error);
    // Return empty — components fall back to hardcoded images
    return NextResponse.json({
      heroSlides: {},
      experiences: {},
      destinations: {},
      about: null,
    });
  }
}
