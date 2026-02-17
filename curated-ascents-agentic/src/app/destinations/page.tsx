import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Calendar, Compass, ArrowRight } from "lucide-react";
import { getSubRegionsByCountry } from "@/lib/content/destinations-content";

export const metadata: Metadata = {
  title: "Destinations | CuratedAscents - Luxury Himalayan Adventures",
  description:
    "Explore our luxury travel destinations: Nepal, Bhutan, Tibet, and India. Comprehensive guides with cultural tips, best times to visit, and curated experiences.",
  keywords: [
    "nepal travel",
    "bhutan travel",
    "tibet travel",
    "india luxury travel",
    "himalayan destinations",
    "luxury adventure destinations",
  ],
  openGraph: {
    title: "Destinations | CuratedAscents",
    description:
      "Luxury travel destinations across the Himalayas: Nepal, Bhutan, Tibet, and India.",
    type: "website",
  },
};

const destinations = [
  {
    slug: "nepal",
    name: "Nepal",
    subtitle: "The Land of the Himalayas",
    description:
      "Home to Mount Everest and eight of the world's fourteen 8,000m peaks, Nepal offers unparalleled trekking, ancient temples, and vibrant culture.",
    heroImage: "/uploads/media/nepal/landscape/everest-region-everest-view-hotel-eed54c67.webp",
    highlights: ["Everest Base Camp", "Annapurna Circuit", "Kathmandu Valley", "Chitwan Safari"],
    bestTime: "Oct-Nov, Mar-Apr",
  },
  {
    slug: "bhutan",
    name: "Bhutan",
    subtitle: "The Land of the Thunder Dragon",
    description:
      "The world's last Himalayan kingdom measures success by Gross National Happiness. Pristine forests, ancient dzongs, and deeply preserved Buddhist culture await.",
    heroImage: "/uploads/media/bhutan/landscape/bhutan-taktsang-monastery2-1d1a0917.webp",
    highlights: ["Tiger's Nest Monastery", "Punakha Dzong", "Gangtey Valley", "Traditional Festivals"],
    bestTime: "Mar-May, Sep-Nov",
  },
  {
    slug: "tibet",
    name: "Tibet",
    subtitle: "The Roof of the World",
    description:
      "Perched on the highest plateau on Earth, Tibet offers a profound journey through ancient Buddhist culture, sacred lakes, and otherworldly landscapes.",
    heroImage: "/uploads/media/tibet/landscape/potala-palace-lhasa-tibet-china-dd114557.webp",
    highlights: ["Potala Palace", "Mount Kailash", "Everest North Base Camp", "Namtso Lake"],
    bestTime: "Apr-Jun, Sep-Oct",
  },
  {
    slug: "india",
    name: "India",
    subtitle: "A Tapestry of Cultures & Legends",
    description:
      "From the royal palaces of Rajasthan to the Himalayan monasteries of Ladakh and the tranquil backwaters of Kerala, India offers extraordinary diversity.",
    heroImage: "/uploads/media/india/landscape/jaipur-rajasthan-india-e33d82ba.webp",
    highlights: ["Ladakh Monasteries", "Rajasthan Palaces", "Kerala Backwaters", "Golden Triangle"],
    bestTime: "Oct-Mar",
  },
];

export default function DestinationsPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-luxury-navy pt-28 pb-16 sm:pt-36 sm:pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block text-luxury-gold text-sm font-medium tracking-[0.25em] uppercase mb-4">
            Where We Travel
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Our Destinations
          </h1>
          <p className="text-luxury-cream/70 text-lg max-w-2xl mx-auto">
            Four extraordinary countries across the Himalayas, each offering unique
            landscapes, cultures, and luxury experiences crafted for discerning travellers.
          </p>
        </div>
      </section>

      {/* Destination Cards */}
      <section className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {destinations.map((dest, idx) => (
              <div key={dest.slug}>
              <Link
                href={`/destinations/${dest.slug}`}
                className="group block"
              >
                <article
                  className={`grid grid-cols-1 lg:grid-cols-2 gap-8 items-center ${
                    idx % 2 === 1 ? "lg:direction-rtl" : ""
                  }`}
                >
                  {/* Image */}
                  <div className={`relative h-72 sm:h-96 rounded-2xl overflow-hidden ${idx % 2 === 1 ? "lg:order-2" : ""}`}>
                    <Image
                      src={dest.heroImage}
                      alt={`${dest.name} landscape`}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-luxury-gold text-luxury-navy text-xs font-semibold rounded-full">
                        {dest.name}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className={`${idx % 2 === 1 ? "lg:order-1" : ""}`}>
                    <span className="text-luxury-gold text-sm font-medium tracking-[0.15em] uppercase">
                      {dest.subtitle}
                    </span>
                    <h2 className="font-serif text-3xl sm:text-4xl font-bold text-luxury-navy mt-2 mb-4 group-hover:text-luxury-gold transition-colors">
                      {dest.name}
                    </h2>
                    <p className="text-luxury-charcoal/60 leading-relaxed mb-6">
                      {dest.description}
                    </p>

                    {/* Highlights */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {dest.highlights.map((h) => (
                        <span
                          key={h}
                          className="flex items-center gap-1 px-3 py-1.5 bg-luxury-cream rounded-full text-xs text-luxury-charcoal"
                        >
                          <Compass className="w-3 h-3 text-luxury-gold" />
                          {h}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-luxury-charcoal/50">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-luxury-gold" />
                        Best: {dest.bestTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-luxury-gold" />
                        View Full Guide &rarr;
                      </span>
                    </div>
                  </div>
                </article>
              </Link>

              {/* Sub-region links */}
              {(() => {
                const subRegions = getSubRegionsByCountry(dest.slug);
                if (subRegions.length === 0) return null;
                return (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {subRegions.map((sr) => (
                      <Link
                        key={sr.slug}
                        href={`/destinations/${dest.slug}/${sr.slug}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-luxury-cream/80 rounded-full text-xs text-luxury-charcoal hover:text-luxury-gold hover:bg-luxury-gold/10 transition-colors border border-luxury-mist"
                      >
                        {sr.name}
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    ))}
                  </div>
                );
              })()}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-luxury-cream py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-luxury-navy mb-4">
            Ready to Explore?
          </h2>
          <p className="text-luxury-charcoal/60 mb-6">
            Our AI Expedition Architect can help you choose the perfect destination
            and build a bespoke itinerary tailored to your interests.
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
