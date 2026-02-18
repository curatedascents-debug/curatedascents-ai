import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { packages } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  Clock,
  Mountain,
  Users,
  Calendar,
  Check,
  X,
  MapPin,
  UtensilsCrossed,
  Hotel,
  ChevronLeft,
} from "lucide-react";
import CustomizeButton from "./CustomizeButton";
import FlightFinder from "@/components/flights/FlightFinder";
import { findItineraryImage } from "@/lib/media/media-service";

function formatPackageType(type: string): string {
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Country hero images for fallback
const countryImages: Record<string, string> = {
  Nepal: "/uploads/media/nepal/landscape/everest-region-everest-view-hotel-eed54c67.webp",
  Bhutan: "/uploads/media/bhutan/landscape/bhutan-taktsang-monastery2-1d1a0917.webp",
  Tibet: "/uploads/media/tibet/landscape/potala-palace-lhasa-tibet-china-dd114557.webp",
  India: "/uploads/media/india/landscape/jaipur-rajasthan-india-e33d82ba.webp",
};

async function getPackage(slug: string) {
  const [pkg] = await db
    .select()
    .from(packages)
    .where(eq(packages.slug, slug))
    .limit(1);
  return pkg || null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const pkg = await getPackage(slug);

  if (!pkg) {
    return { title: "Itinerary Not Found | CuratedAscents" };
  }

  return {
    title: `${pkg.name} | CuratedAscents`,
    description: pkg.itinerarySummary || `Luxury ${pkg.packageType} in ${pkg.country}`,
    keywords: [
      `${pkg.country?.toLowerCase()} ${pkg.packageType}`,
      `${pkg.country?.toLowerCase()} luxury travel`,
      "luxury adventure travel",
      "himalayan expedition",
    ],
    openGraph: {
      title: `${pkg.name} | CuratedAscents`,
      description: pkg.itinerarySummary || undefined,
      type: "article",
    },
  };
}

export default async function ItineraryDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const pkg = await getPackage(slug);

  if (!pkg) {
    notFound();
  }

  const detailed = pkg.itineraryDetailed as {
    highlights?: string[];
    bestMonths?: string;
    route?: string;
    days?: { day: number; title: string; description: string; accommodation: string; meals: string; altitude?: string }[];
  } | null;

  const days = detailed?.days || [];
  const highlights = detailed?.highlights || [];
  const route = detailed?.route || "";
  const bestMonths = detailed?.bestMonths || "";
  const dynamicImage = await findItineraryImage({
    name: pkg.name,
    country: pkg.country || undefined,
    region: pkg.region || undefined,
  });
  const heroImage = dynamicImage?.cdnUrl || countryImages[pkg.country || "Nepal"] || countryImages.Nepal;
  const sellPrice = pkg.sellPrice ? parseFloat(pkg.sellPrice) : 0;
  const inclusions = pkg.inclusions?.split("\n").filter(Boolean) || [];
  const exclusions = pkg.exclusions?.split("\n").filter(Boolean) || [];
  const duration = `${pkg.durationDays} Days / ${pkg.durationNights || (pkg.durationDays ? pkg.durationDays - 1 : 0)} Nights`;
  const groupSize = pkg.groupSizeMin && pkg.groupSizeMax ? `${pkg.groupSizeMin}-${pkg.groupSizeMax} guests` : "";
  const chatMessage = `I'm interested in the ${pkg.name}. Can you customize this for my dates and group size?`;

  return (
    <>
      {/* Hero */}
      <section className="relative h-[50vh] sm:h-[60vh] min-h-[400px]">
        <Image
          src={heroImage}
          alt={pkg.name}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-luxury-navy via-luxury-navy/40 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 lg:p-16">
          <div className="max-w-5xl mx-auto">
            <Link
              href="/itineraries"
              className="inline-flex items-center gap-1 text-luxury-cream/60 text-sm hover:text-white transition-colors mb-4"
            >
              <ChevronLeft className="w-4 h-4" />
              All Itineraries
            </Link>
            <div className="flex gap-2 mb-2">
              <span className="text-luxury-gold text-sm font-medium tracking-[0.2em] uppercase">
                {pkg.country}
              </span>
              <span className="text-luxury-cream/40">|</span>
              <span className="text-luxury-cream/60 text-sm">
                {formatPackageType(pkg.packageType || "")}
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              {pkg.name}
            </h1>
            <div className="flex flex-wrap gap-4 sm:gap-6 text-sm text-luxury-cream/70">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-luxury-gold" />
                {duration}
              </span>
              {pkg.difficulty && (
                <span className="flex items-center gap-1.5">
                  <Mountain className="w-4 h-4 text-luxury-gold" />
                  {pkg.difficulty}
                </span>
              )}
              {groupSize && (
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-luxury-gold" />
                  {groupSize}
                </span>
              )}
              {bestMonths && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-luxury-gold" />
                  {bestMonths}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Sticky price bar */}
      {sellPrice > 0 && (
        <div className="sticky top-16 z-30 bg-luxury-navy/95 backdrop-blur-md border-b border-luxury-gold/10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
            <div>
              <span className="text-luxury-gold font-serif text-lg sm:text-xl font-bold">
                From ${sellPrice.toLocaleString()}
              </span>
              <span className="text-luxury-cream/50 text-sm ml-2">per person</span>
            </div>
            <CustomizeButton
              message={chatMessage}
              className="px-5 py-2 bg-luxury-gold text-luxury-navy text-sm font-medium rounded-full hover:bg-luxury-gold/90 transition-all duration-300"
            />
          </div>
        </div>
      )}

      {/* Overview + Route */}
      <section className="py-12 sm:py-16 bg-luxury-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Overview */}
            <div className="lg:col-span-2">
              <h2 className="font-serif text-2xl font-bold text-luxury-navy mb-4">
                Overview
              </h2>
              <p className="text-luxury-charcoal/70 leading-relaxed mb-6">
                {pkg.itinerarySummary}
              </p>

              {route && (
                <>
                  <h3 className="font-serif text-lg font-bold text-luxury-navy mb-3">
                    Route
                  </h3>
                  <p className="flex items-center gap-2 text-luxury-charcoal/60 text-sm mb-6">
                    <MapPin className="w-4 h-4 text-luxury-gold flex-shrink-0" />
                    {route}
                  </p>
                </>
              )}

              {highlights.length > 0 && (
                <>
                  <h3 className="font-serif text-lg font-bold text-luxury-navy mb-3">
                    Highlights
                  </h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {highlights.map((h) => (
                      <li
                        key={h}
                        className="flex items-start gap-2 text-luxury-charcoal/70 text-sm"
                      >
                        <Check className="w-4 h-4 text-luxury-gold flex-shrink-0 mt-0.5" />
                        {h}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            {/* Sidebar quick facts */}
            <div className="bg-luxury-cream rounded-2xl p-6">
              <h3 className="font-serif text-lg font-bold text-luxury-navy mb-4">
                Quick Facts
              </h3>
              <dl className="space-y-4 text-sm">
                <div>
                  <dt className="text-luxury-charcoal/50 mb-1">Duration</dt>
                  <dd className="text-luxury-navy font-medium">{duration}</dd>
                </div>
                {pkg.difficulty && (
                  <div>
                    <dt className="text-luxury-charcoal/50 mb-1">Difficulty</dt>
                    <dd className="text-luxury-navy font-medium">{pkg.difficulty}</dd>
                  </div>
                )}
                {groupSize && (
                  <div>
                    <dt className="text-luxury-charcoal/50 mb-1">Group Size</dt>
                    <dd className="text-luxury-navy font-medium">{groupSize}</dd>
                  </div>
                )}
                {pkg.maxAltitude && (
                  <div>
                    <dt className="text-luxury-charcoal/50 mb-1">Max Altitude</dt>
                    <dd className="text-luxury-navy font-medium">{pkg.maxAltitude.toLocaleString()}m</dd>
                  </div>
                )}
                {bestMonths && (
                  <div>
                    <dt className="text-luxury-charcoal/50 mb-1">Best Months</dt>
                    <dd className="text-luxury-navy font-medium">{bestMonths}</dd>
                  </div>
                )}
                {sellPrice > 0 && (
                  <div>
                    <dt className="text-luxury-charcoal/50 mb-1">Starting From</dt>
                    <dd className="text-luxury-gold font-serif text-xl font-bold">
                      ${sellPrice.toLocaleString()} pp
                    </dd>
                  </div>
                )}
              </dl>
              <CustomizeButton
                message={chatMessage}
                className="mt-6 w-full px-6 py-3 bg-luxury-gold text-luxury-navy font-medium rounded-full hover:bg-luxury-gold/90 transition-all duration-300 text-center"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Day-by-day */}
      {days.length > 0 && (
        <section className="py-12 sm:py-16 bg-luxury-cream/50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-luxury-navy mb-10 text-center">
              Day-by-Day Itinerary
            </h2>

            <div className="space-y-0">
              {days.map((day, idx) => (
                <div
                  key={day.day}
                  className={`relative pl-10 sm:pl-14 pb-8 ${
                    idx < days.length - 1
                      ? "border-l-2 border-luxury-gold/20 ml-4 sm:ml-5"
                      : "ml-4 sm:ml-5"
                  }`}
                >
                  {/* Day circle */}
                  <div className="absolute -left-4 sm:-left-5 top-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-luxury-gold text-luxury-navy flex items-center justify-center text-xs sm:text-sm font-bold">
                    {day.day}
                  </div>

                  <div className="bg-white rounded-xl p-5 sm:p-6 border border-luxury-mist">
                    <h3 className="font-serif text-lg font-bold text-luxury-navy mb-2">
                      {day.title}
                    </h3>
                    <p className="text-luxury-charcoal/70 text-sm leading-relaxed mb-3">
                      {day.description}
                    </p>
                    <div className="flex flex-wrap gap-4 text-xs text-luxury-charcoal/50">
                      {day.accommodation && day.accommodation !== "—" && (
                        <span className="flex items-center gap-1">
                          <Hotel className="w-3.5 h-3.5 text-luxury-gold" />
                          {day.accommodation}
                        </span>
                      )}
                      {day.meals && (
                        <span className="flex items-center gap-1">
                          <UtensilsCrossed className="w-3.5 h-3.5 text-luxury-gold" />
                          {day.meals}
                        </span>
                      )}
                      {day.altitude && (
                        <span className="flex items-center gap-1">
                          <Mountain className="w-3.5 h-3.5 text-luxury-gold" />
                          {day.altitude}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Included / Not included */}
      {(inclusions.length > 0 || exclusions.length > 0) && (
        <section className="py-12 sm:py-16 bg-luxury-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {inclusions.length > 0 && (
                <div>
                  <h2 className="font-serif text-2xl font-bold text-luxury-navy mb-6">
                    What&apos;s Included
                  </h2>
                  <ul className="space-y-3">
                    {inclusions.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-3 text-luxury-charcoal/70 text-sm"
                      >
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {exclusions.length > 0 && (
                <div>
                  <h2 className="font-serif text-2xl font-bold text-luxury-navy mb-6">
                    Not Included
                  </h2>
                  <ul className="space-y-3">
                    {exclusions.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-3 text-luxury-charcoal/50 text-sm"
                      >
                        <X className="w-5 h-5 text-luxury-charcoal/30 flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Flight Finder */}
      <FlightFinder defaultDestination={
        pkg.country ? ({ Nepal: "nepal", Bhutan: "bhutan", Tibet: "tibet", India: "india" } as Record<string, string>)[pkg.country] || "nepal" : "nepal"
      } />

      {/* Bottom CTA */}
      <section className="bg-luxury-navy py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <span className="inline-block text-luxury-gold text-sm font-medium tracking-[0.25em] uppercase mb-4">
            Ready to Begin?
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-4">
            Customize This Journey
          </h2>
          <p className="text-luxury-cream/60 mb-8 max-w-lg mx-auto">
            This itinerary is a starting point. Our AI Expedition Architect will
            tailor every detail — dates, accommodations, activities — to create
            your perfect trip.
          </p>
          <CustomizeButton
            message={chatMessage}
            className="inline-block px-8 py-3.5 bg-luxury-gold text-luxury-navy font-medium rounded-full hover:bg-luxury-gold/90 transition-all duration-300 text-lg"
          />
        </div>
      </section>
    </>
  );
}
