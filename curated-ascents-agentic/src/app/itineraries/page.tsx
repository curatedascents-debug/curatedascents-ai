import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/db";
import { packages } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Clock, Mountain, Users, Calendar } from "lucide-react";
import ItineraryFilters from "./ItineraryFilters";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Luxury Itineraries | CuratedAscents - Himalayan Adventures",
  description:
    "Explore 45+ curated luxury itineraries for Nepal, Bhutan, India, and Tibet. Treks, cultural tours, peak climbs, and wellness retreats with day-by-day plans.",
  keywords: [
    "luxury travel itineraries",
    "nepal trekking",
    "bhutan tours",
    "tibet expeditions",
    "india luxury travel",
    "himalayan adventure",
  ],
  openGraph: {
    title: "Luxury Itineraries | CuratedAscents",
    description:
      "45+ curated luxury itineraries across Nepal, Bhutan, India, and Tibet.",
    type: "website",
  },
};

// Country hero images for fallback
const countryImages: Record<string, string> = {
  Nepal: "/uploads/media/nepal/landscape/everest-region-everest-view-hotel-eed54c67.webp",
  Bhutan: "/uploads/media/bhutan/landscape/bhutan-taktsang-monastery2-1d1a0917.webp",
  Tibet: "/uploads/media/tibet/landscape/potala-palace-lhasa-tibet-china-dd114557.webp",
  India: "/uploads/media/india/landscape/jaipur-rajasthan-india-e33d82ba.webp",
};

export default async function ItinerariesPage({
  searchParams,
}: {
  searchParams: Promise<{ country?: string; type?: string }>;
}) {
  const params = await searchParams;
  const allPackages = await db
    .select({
      id: packages.id,
      slug: packages.slug,
      name: packages.name,
      packageType: packages.packageType,
      country: packages.country,
      region: packages.region,
      durationDays: packages.durationDays,
      durationNights: packages.durationNights,
      difficulty: packages.difficulty,
      maxAltitude: packages.maxAltitude,
      groupSizeMin: packages.groupSizeMin,
      groupSizeMax: packages.groupSizeMax,
      itinerarySummary: packages.itinerarySummary,
      itineraryDetailed: packages.itineraryDetailed,
      sellPrice: packages.sellPrice,
    })
    .from(packages)
    .where(eq(packages.isActive, true))
    .orderBy(desc(packages.createdAt));

  // Filter
  let filtered = allPackages;
  if (params.country) {
    filtered = filtered.filter(
      (p) => p.country?.toLowerCase() === params.country!.toLowerCase()
    );
  }
  if (params.type) {
    filtered = filtered.filter(
      (p) => p.packageType?.toLowerCase() === params.type!.toLowerCase()
    );
  }

  // Get unique countries and types for filters
  const countries = [...new Set(allPackages.map((p) => p.country).filter(Boolean))] as string[];
  const types = [...new Set(allPackages.map((p) => p.packageType).filter(Boolean))] as string[];

  return (
    <>
      {/* Hero */}
      <section className="bg-luxury-navy pt-28 pb-16 sm:pt-36 sm:pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block text-luxury-gold text-sm font-medium tracking-[0.25em] uppercase mb-4">
            Curated Journeys
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Luxury Itineraries
          </h1>
          <p className="text-luxury-cream/70 text-lg max-w-2xl mx-auto">
            {allPackages.length} handcrafted journeys across {countries.length} countries.
            Each is fully customizable — choose a starting point and let our
            Expedition Architect tailor every detail.
          </p>
        </div>
      </section>

      {/* Filters */}
      <ItineraryFilters
        countries={countries}
        types={types}
        activeCountry={params.country || ""}
        activeType={params.type || ""}
      />

      {/* Itinerary Grid */}
      <section className="py-10 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-luxury-charcoal/50 text-lg">
                No itineraries found. Try adjusting your filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((pkg) => {
                const detailed = pkg.itineraryDetailed as { bestMonths?: string; highlights?: string[] } | null;
                const heroImage = countryImages[pkg.country || "Nepal"] || countryImages.Nepal;
                const price = pkg.sellPrice ? parseFloat(pkg.sellPrice) : 0;

                return (
                  <Link
                    key={pkg.id}
                    href={`/itineraries/${pkg.slug}`}
                    className="group"
                  >
                    <article className="rounded-2xl overflow-hidden bg-white border border-luxury-mist hover:border-luxury-gold/30 transition-all duration-300 hover:shadow-lg h-full flex flex-col">
                      {/* Image */}
                      <div className="relative h-48 sm:h-56 overflow-hidden">
                        <Image
                          src={heroImage}
                          alt={pkg.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        {/* Price badge */}
                        {price > 0 && (
                          <div className="absolute bottom-3 left-3">
                            <span className="inline-block px-2.5 py-1 bg-luxury-gold text-luxury-navy text-xs font-semibold rounded-full">
                              From ${price.toLocaleString()} pp
                            </span>
                          </div>
                        )}
                        {/* Country + Type badges */}
                        <div className="absolute top-3 right-3 flex gap-1.5">
                          <span className="px-2 py-0.5 bg-luxury-navy/80 backdrop-blur-sm text-white text-[10px] font-medium rounded-full">
                            {pkg.country}
                          </span>
                          <span className="px-2 py-0.5 bg-luxury-gold/80 backdrop-blur-sm text-luxury-navy text-[10px] font-medium rounded-full capitalize">
                            {pkg.packageType}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 flex flex-col flex-1">
                        <h2 className="font-serif text-lg font-bold text-luxury-navy mb-2 group-hover:text-luxury-gold transition-colors line-clamp-2">
                          {pkg.name}
                        </h2>
                        <p className="text-luxury-charcoal/60 text-xs leading-relaxed mb-3 line-clamp-2 flex-1">
                          {pkg.itinerarySummary}
                        </p>

                        {/* Meta row */}
                        <div className="flex flex-wrap gap-3 text-[10px] text-luxury-charcoal/50">
                          {pkg.durationDays && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {pkg.durationDays}D/{(pkg.durationNights || pkg.durationDays - 1)}N
                            </span>
                          )}
                          {pkg.difficulty && (
                            <span className="flex items-center gap-1">
                              <Mountain className="w-3 h-3" />
                              {pkg.difficulty}
                            </span>
                          )}
                          {pkg.groupSizeMax && (
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {pkg.groupSizeMin}-{pkg.groupSizeMax}
                            </span>
                          )}
                          {detailed?.bestMonths && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {detailed.bestMonths}
                            </span>
                          )}
                        </div>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-luxury-cream py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-luxury-navy mb-4">
            Don&apos;t See Your Perfect Trip?
          </h2>
          <p className="text-luxury-charcoal/60 mb-6">
            Every itinerary is a starting point. Our AI Expedition Architect can
            build a completely bespoke journey from scratch.
          </p>
          <Link
            href="/"
            className="inline-block px-8 py-3 bg-luxury-gold text-luxury-navy font-medium rounded-full hover:bg-luxury-gold/90 transition-all duration-300"
          >
            Start Planning
          </Link>
        </div>
      </section>
    </>
  );
}
