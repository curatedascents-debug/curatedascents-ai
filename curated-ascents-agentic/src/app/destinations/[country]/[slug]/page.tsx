import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronRight,
  Calendar,
  Clock,
  MapPin,
  Star,
  ArrowRight,
} from "lucide-react";
import ChatButton from "@/components/homepage/ChatButton";
import {
  getSubRegion,
  getAllSubRegionParams,
} from "@/lib/content/destinations-content";

interface PageProps {
  params: Promise<{ country: string; slug: string }>;
}

export async function generateStaticParams() {
  return getAllSubRegionParams();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { country, slug } = await params;
  const dest = getSubRegion(country, slug);
  if (!dest) return { title: "Destination Not Found | CuratedAscents" };

  return {
    title: dest.metaTitle,
    description: dest.metaDescription,
    keywords: dest.keywords,
    openGraph: {
      title: dest.metaTitle,
      description: dest.metaDescription,
      type: "article",
      images: [{ url: dest.heroImage }],
    },
    twitter: {
      card: "summary_large_image",
      title: dest.metaTitle,
      description: dest.metaDescription,
    },
  };
}

export default async function SubRegionPage({ params }: PageProps) {
  const { country, slug } = await params;
  const dest = getSubRegion(country, slug);

  if (!dest) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    name: dest.name,
    description: dest.metaDescription,
    image: dest.heroImage,
    containedInPlace: {
      "@type": "Country",
      name: dest.countryName,
    },
    touristType: "Luxury Adventure Traveller",
  };

  const paragraphs = dest.content.split("\n\n").filter(Boolean);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="relative h-[50vh] min-h-[400px]">
        <Image
          src={dest.heroImage}
          alt={`${dest.name}, ${dest.countryName}`}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-luxury-navy via-luxury-navy/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 lg:p-16">
          <div className="max-w-5xl mx-auto">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-1 text-sm text-luxury-gold/80 mb-4">
              <Link href="/destinations" className="hover:text-luxury-gold transition-colors">
                Destinations
              </Link>
              <ChevronRight className="w-3 h-3" />
              <Link
                href={`/destinations/${dest.country}`}
                className="hover:text-luxury-gold transition-colors"
              >
                {dest.countryName}
              </Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-luxury-gold">{dest.name}</span>
            </nav>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
              {dest.name}
            </h1>
            <p className="text-luxury-cream/60 mt-2 text-lg">{dest.countryName}</p>
          </div>
        </div>
      </section>

      {/* Content + Best Time Sidebar */}
      <section className="py-12 sm:py-16 bg-luxury-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-4">
              {paragraphs.map((p, i) => (
                <p key={i} className="text-luxury-charcoal/70 leading-relaxed">
                  {p}
                </p>
              ))}
            </div>
            <div className="space-y-6">
              <div className="bg-luxury-cream rounded-2xl p-6">
                <h3 className="font-serif text-lg font-bold text-luxury-navy mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-luxury-gold" />
                  Best Time to Visit
                </h3>
                <p className="text-luxury-charcoal/70 text-sm leading-relaxed">
                  {dest.bestTimeToVisit}
                </p>
              </div>
              <div className="bg-luxury-cream rounded-2xl p-6">
                <h3 className="font-serif text-lg font-bold text-luxury-navy mb-3 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-luxury-gold" />
                  Region
                </h3>
                <p className="text-luxury-charcoal/70 text-sm">
                  {dest.name}, {dest.countryName}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-12 sm:py-16 bg-luxury-cream/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-luxury-navy mb-8 text-center">
            Highlights
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {dest.highlights.map((h) => (
              <div
                key={h.title}
                className="bg-white rounded-xl p-6 border border-luxury-mist hover:border-luxury-gold/30 transition-colors"
              >
                <Star className="w-8 h-8 text-luxury-gold mb-3" />
                <h3 className="font-serif text-lg font-bold text-luxury-navy mb-2">
                  {h.title}
                </h3>
                <p className="text-luxury-charcoal/60 text-sm">{h.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample Itineraries */}
      {dest.sampleItineraries.length > 0 && (
        <section className="py-12 sm:py-16 bg-luxury-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-luxury-navy mb-8 text-center">
              Curated Itineraries
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {dest.sampleItineraries.map((it) => (
                <Link
                  key={it.slug}
                  href={`/itineraries/${it.slug}`}
                  className="group block bg-luxury-cream rounded-xl p-6 border border-luxury-mist hover:border-luxury-gold/30 transition-all hover:shadow-md"
                >
                  <h3 className="font-serif text-lg font-bold text-luxury-navy mb-2 group-hover:text-luxury-gold transition-colors">
                    {it.name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-luxury-charcoal/50">
                    <Clock className="w-4 h-4 text-luxury-gold" />
                    {it.duration}
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-luxury-gold text-sm font-medium">
                    View Itinerary
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Luxury Accommodations */}
      {dest.luxuryAccommodations.length > 0 && (
        <section className="py-12 sm:py-16 bg-luxury-cream/50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-luxury-navy mb-8 text-center">
              Luxury Accommodations
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {dest.luxuryAccommodations.map((acc) => (
                <div
                  key={acc.name}
                  className="bg-white rounded-xl p-6 border border-luxury-mist"
                >
                  <h3 className="font-serif text-lg font-bold text-luxury-navy mb-2">
                    {acc.name}
                  </h3>
                  <p className="text-luxury-charcoal/60 text-sm mb-3">
                    {acc.description}
                  </p>
                  <span className="inline-block text-luxury-gold text-sm font-medium">
                    {acc.priceRange}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Related Destinations */}
      {dest.relatedDestinations.length > 0 && (
        <section className="py-12 sm:py-16 bg-luxury-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-serif text-2xl font-bold text-luxury-navy mb-6 text-center">
              Related Destinations
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              {dest.relatedDestinations.map((rd) => (
                <Link
                  key={rd.slug}
                  href={`/destinations/${rd.country}/${rd.slug}`}
                  className="px-5 py-2.5 bg-luxury-cream rounded-full text-luxury-navy font-medium text-sm hover:bg-luxury-gold/10 hover:text-luxury-gold transition-colors border border-luxury-mist"
                >
                  {rd.name} — {rd.country.charAt(0).toUpperCase() + rd.country.slice(1)}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-luxury-navy py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <span className="inline-block text-luxury-gold text-sm font-medium tracking-[0.25em] uppercase mb-4">
            Ready to Visit {dest.name}?
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-4">
            Plan Your {dest.name} Journey
          </h2>
          <p className="text-luxury-cream/60 mb-8 max-w-lg mx-auto">
            Our AI Expedition Architect will craft a bespoke luxury itinerary
            tailored to your dates, interests, and travel style.
          </p>
          <ChatButton
            message={dest.chatPrompt}
            className="inline-block px-8 py-3.5 bg-luxury-gold text-luxury-navy font-medium rounded-full hover:bg-luxury-gold/90 transition-all duration-300 text-lg"
          >
            Start Planning
          </ChatButton>
        </div>
      </section>
    </>
  );
}
