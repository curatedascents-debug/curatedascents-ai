import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { itineraries, getItineraryBySlug } from "@/lib/constants/itineraries";
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

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return itineraries.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const itinerary = getItineraryBySlug(slug);

  if (!itinerary) {
    return { title: "Itinerary Not Found | CuratedAscents" };
  }

  return {
    title: `${itinerary.title} | CuratedAscents`,
    description: itinerary.overview,
    keywords: [
      `${itinerary.country.toLowerCase()} itinerary`,
      `${itinerary.country.toLowerCase()} luxury tour`,
      "luxury adventure travel",
      "himalayan expedition",
      itinerary.country.toLowerCase(),
    ],
    openGraph: {
      title: `${itinerary.title} | CuratedAscents`,
      description: itinerary.overview,
      type: "article",
      images: [{ url: itinerary.heroImage }],
    },
  };
}

export default async function ItineraryDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const itinerary = getItineraryBySlug(slug);

  if (!itinerary) {
    notFound();
  }

  return (
    <>
      {/* Hero */}
      <section className="relative h-[50vh] sm:h-[60vh] min-h-[400px]">
        <Image
          src={itinerary.heroImage}
          alt={itinerary.heroAlt}
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
            <span className="block text-luxury-gold text-sm font-medium tracking-[0.2em] uppercase mb-2">
              {itinerary.country}
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              {itinerary.title}
            </h1>
            <div className="flex flex-wrap gap-4 sm:gap-6 text-sm text-luxury-cream/70">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-luxury-gold" />
                {itinerary.duration}
              </span>
              <span className="flex items-center gap-1.5">
                <Mountain className="w-4 h-4 text-luxury-gold" />
                {itinerary.difficulty}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-luxury-gold" />
                {itinerary.groupSize}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-luxury-gold" />
                {itinerary.bestMonths}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky price bar */}
      <div className="sticky top-16 z-30 bg-luxury-navy/95 backdrop-blur-md border-b border-luxury-gold/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div>
            <span className="text-luxury-gold font-serif text-lg sm:text-xl font-bold">
              From ${itinerary.startingPrice.toLocaleString()}
            </span>
            <span className="text-luxury-cream/50 text-sm ml-2">per person</span>
          </div>
          <CustomizeButton
            message={itinerary.chatMessage}
            className="px-5 py-2 bg-luxury-gold text-luxury-navy text-sm font-medium rounded-full hover:bg-luxury-gold/90 transition-all duration-300"
          />
        </div>
      </div>

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
                {itinerary.overview}
              </p>

              <h3 className="font-serif text-lg font-bold text-luxury-navy mb-3">
                Route
              </h3>
              <p className="flex items-center gap-2 text-luxury-charcoal/60 text-sm mb-6">
                <MapPin className="w-4 h-4 text-luxury-gold flex-shrink-0" />
                {itinerary.route}
              </p>

              <h3 className="font-serif text-lg font-bold text-luxury-navy mb-3">
                Highlights
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {itinerary.highlights.map((h) => (
                  <li
                    key={h}
                    className="flex items-start gap-2 text-luxury-charcoal/70 text-sm"
                  >
                    <Check className="w-4 h-4 text-luxury-gold flex-shrink-0 mt-0.5" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>

            {/* Sidebar quick facts */}
            <div className="bg-luxury-cream rounded-2xl p-6">
              <h3 className="font-serif text-lg font-bold text-luxury-navy mb-4">
                Quick Facts
              </h3>
              <dl className="space-y-4 text-sm">
                <div>
                  <dt className="text-luxury-charcoal/50 mb-1">Duration</dt>
                  <dd className="text-luxury-navy font-medium">{itinerary.duration}</dd>
                </div>
                <div>
                  <dt className="text-luxury-charcoal/50 mb-1">Difficulty</dt>
                  <dd className="text-luxury-navy font-medium">{itinerary.difficulty}</dd>
                </div>
                <div>
                  <dt className="text-luxury-charcoal/50 mb-1">Group Size</dt>
                  <dd className="text-luxury-navy font-medium">{itinerary.groupSize}</dd>
                </div>
                <div>
                  <dt className="text-luxury-charcoal/50 mb-1">Best Months</dt>
                  <dd className="text-luxury-navy font-medium">{itinerary.bestMonths}</dd>
                </div>
                <div>
                  <dt className="text-luxury-charcoal/50 mb-1">Starting From</dt>
                  <dd className="text-luxury-gold font-serif text-xl font-bold">
                    ${itinerary.startingPrice.toLocaleString()} pp
                  </dd>
                </div>
              </dl>
              <CustomizeButton
                message={itinerary.chatMessage}
                className="mt-6 w-full px-6 py-3 bg-luxury-gold text-luxury-navy font-medium rounded-full hover:bg-luxury-gold/90 transition-all duration-300 text-center"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Day-by-day */}
      <section className="py-12 sm:py-16 bg-luxury-cream/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-luxury-navy mb-10 text-center">
            Day-by-Day Itinerary
          </h2>

          <div className="space-y-0">
            {itinerary.days.map((day, idx) => (
              <div
                key={day.day}
                className={`relative pl-10 sm:pl-14 pb-8 ${
                  idx < itinerary.days.length - 1
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
                    {day.accommodation !== "—" && (
                      <span className="flex items-center gap-1">
                        <Hotel className="w-3.5 h-3.5 text-luxury-gold" />
                        {day.accommodation}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <UtensilsCrossed className="w-3.5 h-3.5 text-luxury-gold" />
                      {day.meals}
                    </span>
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

      {/* Included / Not included */}
      <section className="py-12 sm:py-16 bg-luxury-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Included */}
            <div>
              <h2 className="font-serif text-2xl font-bold text-luxury-navy mb-6">
                What&apos;s Included
              </h2>
              <ul className="space-y-3">
                {itinerary.included.map((item) => (
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

            {/* Not included */}
            <div>
              <h2 className="font-serif text-2xl font-bold text-luxury-navy mb-6">
                Not Included
              </h2>
              <ul className="space-y-3">
                {itinerary.notIncluded.map((item) => (
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
          </div>
        </div>
      </section>

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
            message={itinerary.chatMessage}
            className="inline-block px-8 py-3.5 bg-luxury-gold text-luxury-navy font-medium rounded-full hover:bg-luxury-gold/90 transition-all duration-300 text-lg"
          />
        </div>
      </section>
    </>
  );
}
