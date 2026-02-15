import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { itineraries } from "@/lib/constants/itineraries";
import { Clock, Mountain, Users, Calendar } from "lucide-react";

export const metadata: Metadata = {
  title: "Sample Itineraries | CuratedAscents - Luxury Himalayan Adventures",
  description:
    "Explore our curated luxury itineraries for Nepal, Bhutan, India, and Tibet. Day-by-day plans with pricing, accommodations, and expert-led experiences.",
  keywords: [
    "luxury travel itineraries",
    "nepal itinerary",
    "bhutan itinerary",
    "tibet itinerary",
    "india himalayan tour",
    "luxury adventure travel",
  ],
  openGraph: {
    title: "Sample Itineraries | CuratedAscents",
    description:
      "Curated luxury itineraries for Nepal, Bhutan, India, and Tibet with day-by-day plans and pricing.",
    type: "website",
  },
};

export default function ItinerariesPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-luxury-navy pt-28 pb-16 sm:pt-36 sm:pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block text-luxury-gold text-sm font-medium tracking-[0.25em] uppercase mb-4">
            Curated Journeys
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Sample Itineraries
          </h1>
          <p className="text-luxury-cream/70 text-lg max-w-2xl mx-auto">
            Each journey is fully customizable. Choose a starting point and let our
            Expedition Architect tailor every detail to your preferences.
          </p>
        </div>
      </section>

      {/* Itinerary Grid */}
      <section className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {itineraries.map((itinerary) => (
              <Link
                key={itinerary.slug}
                href={`/itineraries/${itinerary.slug}`}
                className="group"
              >
                <article className="rounded-2xl overflow-hidden bg-white border border-luxury-mist hover:border-luxury-gold/30 transition-all duration-300 hover:shadow-lg">
                  {/* Image */}
                  <div className="relative h-64 sm:h-72 overflow-hidden">
                    <Image
                      src={itinerary.heroImage}
                      alt={itinerary.heroAlt}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    {/* Price badge */}
                    <div className="absolute bottom-4 left-4">
                      <span className="inline-block px-3 py-1.5 bg-luxury-gold text-luxury-navy text-sm font-semibold rounded-full">
                        From ${itinerary.startingPrice.toLocaleString()} pp
                      </span>
                    </div>
                    {/* Country badge */}
                    <div className="absolute top-4 right-4">
                      <span className="inline-block px-3 py-1 bg-luxury-navy/80 backdrop-blur-sm text-white text-xs font-medium rounded-full">
                        {itinerary.country}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h2 className="font-serif text-xl sm:text-2xl font-bold text-luxury-navy mb-3 group-hover:text-luxury-gold transition-colors">
                      {itinerary.title}
                    </h2>
                    <p className="text-luxury-charcoal/60 text-sm leading-relaxed mb-4 line-clamp-2">
                      {itinerary.overview}
                    </p>

                    {/* Meta row */}
                    <div className="flex flex-wrap gap-4 text-xs text-luxury-charcoal/50">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {itinerary.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mountain className="w-3.5 h-3.5" />
                        {itinerary.difficulty}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {itinerary.groupSize}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {itinerary.bestMonths}
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
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
            href="/#signature-journeys"
            className="inline-block px-8 py-3 bg-luxury-gold text-luxury-navy font-medium rounded-full hover:bg-luxury-gold/90 transition-all duration-300"
          >
            Start Planning
          </Link>
        </div>
      </section>
    </>
  );
}
