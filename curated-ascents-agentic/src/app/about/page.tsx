import type { Metadata } from "next";
import Image from "next/image";
import { MapPin, Phone, Mail, Compass, Cpu, HeartHandshake, Linkedin } from "lucide-react";
import ChatButton from "@/components/homepage/ChatButton";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://curated-ascents-agentic.vercel.app";

export const metadata: Metadata = {
  title: "About CuratedAscents — 29 Years of Himalayan Mastery | Kiran Pokhrel",
  description:
    "Founded by Kiran Pokhrel after 29 years of Himalayan travel expertise and 15 years in enterprise tech at Expedia, United Airlines, and Travelport. AI-powered luxury adventure travel across Nepal, Bhutan, Tibet & India.",
  keywords: [
    "CuratedAscents founder",
    "Kiran Pokhrel",
    "Himalayan travel expert",
    "luxury adventure travel",
    "Nepal travel company",
    "AI travel platform",
  ],
  openGraph: {
    title: "About CuratedAscents — 29 Years of Himalayan Mastery",
    description:
      "Founded by Kiran Pokhrel after 29 years of Himalayan travel expertise and 15 years in enterprise tech. AI-powered luxury adventure travel.",
    url: `${BASE_URL}/about`,
    type: "website",
    images: [
      {
        url: "/uploads/media/nepal/landscape/everest-region1-049bedc8.webp",
        width: 1200,
        height: 630,
        alt: "Himalayan panorama — CuratedAscents luxury adventure travel",
      },
    ],
  },
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Kiran Pokhrel",
  jobTitle: "Founder & Expedition Architect",
  url: `${BASE_URL}/about`,
  sameAs: ["https://www.linkedin.com/in/kiranpokhrel"],
  worksFor: {
    "@type": "TravelAgency",
    name: "CuratedAscents",
    url: BASE_URL,
  },
  knowsAbout: [
    "Himalayan Travel",
    "Luxury Adventure Tourism",
    "Nepal",
    "Bhutan",
    "Tibet",
    "India",
    "AI Travel Technology",
    "Enterprise IT",
  ],
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "TravelAgency",
  name: "CuratedAscents",
  url: BASE_URL,
  logo: `${BASE_URL}/icons/icon-512x512.png`,
  description:
    "AI-powered luxury adventure travel across Nepal, Bhutan, Tibet & India. 29 years of Himalayan expertise meets modern technology.",
  telephone: "+1-715-505-4964",
  email: "hello@curatedascents.com",
  founder: {
    "@type": "Person",
    name: "Kiran Pokhrel",
  },
  foundingDate: "1996",
  address: {
    "@type": "PostalAddress",
    streetAddress: "4498 Voyageur Way",
    addressLocality: "Carmel",
    addressRegion: "IN",
    postalCode: "46074",
    addressCountry: "US",
  },
  areaServed: [
    { "@type": "Country", name: "Nepal" },
    { "@type": "Country", name: "Bhutan" },
    { "@type": "Country", name: "India" },
    { "@type": "Country", name: "China" },
  ],
};

const philosophy = [
  {
    icon: Compass,
    title: "Destination Mastery",
    description:
      "29 years of on-ground expertise across 4 Himalayan nations. We don\u2019t sell destinations we\u2019ve read about \u2014 we sell places we know.",
  },
  {
    icon: Cpu,
    title: "AI-Powered Precision",
    description:
      "18 AI tools search 10 service types to build your perfect itinerary in minutes. Real-time pricing, instant availability, dynamic optimisation.",
  },
  {
    icon: HeartHandshake,
    title: "White-Glove Service",
    description:
      "Technology handles the complexity. Humans handle the care. Our experts are always a phone call away.",
  },
];

const enterpriseRoles = [
  {
    company: "Travelport",
    role: "SOA service integrations and carrier onboarding across the GDS platform",
  },
  {
    company: "American Airlines",
    role: "Enhanced the Sabre FOS airline operations system",
  },
  {
    company: "United Airlines",
    role: "Pioneered Agile/Scrum adoption for IT delivery",
  },
  {
    company: "Expedia",
    role: "PCI compliance and e-commerce platform enhancements",
  },
  {
    company: "American Express GBT",
    role: "Platform migrations and optimised booking flows",
  },
  {
    company: "Hilton Hotels Corporation",
    role: "Project charters and hospitality technology requirements",
  },
  {
    company: "Starr Insurance Holdings",
    role: "FX automation, Guidewire-to-Workday integrations, IFRS-17 compliance",
  },
];

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([personJsonLd, orgJsonLd]) }}
      />

      {/* Hero */}
      <section className="relative h-[50vh] sm:h-[60vh] min-h-[400px]">
        <Image
          src="/uploads/media/nepal/landscape/everest-region1-049bedc8.webp"
          alt="Himalayan panorama at golden hour"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-luxury-navy via-luxury-navy/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 lg:p-16">
          <div className="max-w-5xl mx-auto">
            <span className="block text-luxury-gold text-sm font-medium tracking-[0.25em] uppercase mb-3">
              About CuratedAscents
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
              Our Story
            </h1>
          </div>
        </div>
      </section>

      {/* The CuratedAscents Story */}
      <section className="py-16 sm:py-20 bg-luxury-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-luxury-navy mb-10 leading-tight">
            From Trail to Technology: A 29-Year Journey
          </h2>

          <div className="space-y-12">
            {/* Section 1 — with founder photo */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
              {/* Founder portrait */}
              <div className="lg:col-span-1">
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-luxury-gold/20">
                  <Image
                    src="/uploads/media/nepal/people/kiran_pokhrel_photo_formal-caec398d.webp"
                    alt="Kiran Pokhrel — Founder of CuratedAscents"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="mt-4 text-center">
                  <h3 className="font-serif text-xl font-bold text-luxury-navy">
                    Kiran Pokhrel
                  </h3>
                  <p className="text-luxury-charcoal/60 text-sm mt-1">
                    Founder &amp; Expedition Architect
                  </p>
                  <a
                    href="https://www.linkedin.com/in/kiranpokhrel"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-2 text-luxury-gold hover:text-luxury-gold/80 transition-colors text-sm"
                  >
                    <Linkedin className="w-4 h-4" />
                    <span>Connect on LinkedIn</span>
                  </a>
                </div>
              </div>

              {/* Opening text */}
              <div className="lg:col-span-2">
                <p className="text-luxury-charcoal/80 leading-relaxed text-lg">
                  In 1996, Kiran Pokhrel stepped onto his first Himalayan trail and never truly left.
                  What began as an instinct — a pull toward the world&apos;s most dramatic landscapes
                  — became a career spanning nearly three decades. Working with international brands
                  including TUI, Kuoni Travel, SAGA Holidays, Adventure World Australia, and
                  Geographical Tours, Kiran built an encyclopaedic knowledge of Nepal, Bhutan, Tibet,
                  and India: not from brochures, but from thousands of miles walked, hundreds of
                  supplier relationships nurtured, and an intimate understanding of what separates an
                  adequate Himalayan experience from an extraordinary one.
                </p>
              </div>
            </div>

            {/* Section 2 */}
            <div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-luxury-navy mb-4">
                Building on the Ground
              </h3>
              <p className="text-luxury-charcoal/80 leading-relaxed">
                This expertise crystallised into action. In 2008, Kiran founded E-tour Channel, a
                full-service Destination Management Company based in Kathmandu, handling everything
                from airport transfers to multi-week expedition logistics across the Himalayan
                region. In 2022, he launched Nepal Adventure Trail, an online adventure trekking
                company bringing his expertise to a new generation of digital-first travellers.
                These ventures gave Kiran something few technology founders have: operational depth.
                He knows what happens when a helicopter can&apos;t fly due to weather at Lukla, when
                monsoon timing shifts unexpectedly, or when a permit application stalls in Lhasa.
              </p>
            </div>

            {/* Section 3 */}
            <div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-luxury-navy mb-4">
                The Enterprise Technology Years
              </h3>
              <p className="text-luxury-charcoal/80 leading-relaxed mb-6">
                In parallel with his travel ventures, Kiran built a 15-year career as a Senior
                Business Analyst and Product Owner in enterprise IT. His portfolio includes:
              </p>
              <div className="space-y-3">
                {enterpriseRoles.map((role) => (
                  <div
                    key={role.company}
                    className="flex items-start gap-3 bg-luxury-cream/50 rounded-xl px-5 py-3.5 border border-luxury-mist"
                  >
                    <span className="font-medium text-luxury-navy whitespace-nowrap min-w-[160px]">
                      {role.company}
                    </span>
                    <span className="text-luxury-charcoal/70 text-sm leading-relaxed">
                      — {role.role}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-luxury-charcoal/80 leading-relaxed mt-6">
                This career gave Kiran a rare vantage point: he understood both the traveller&apos;s
                expectation and the enterprise systems that serve them.
              </p>
            </div>

            {/* Section 4 */}
            <div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-luxury-navy mb-4">
                The CuratedAscents Vision
              </h3>
              <p className="text-luxury-charcoal/80 leading-relaxed mb-5">
                CuratedAscents was born from a simple conviction: high-net-worth travellers should
                not have to choose between deep regional expertise and modern technology. The
                platform&apos;s AI Expedition Architect draws on a database of 10 service types
                across Nepal, Tibet, Bhutan, and India, generating personalised quotes in minutes.
                Dynamic pricing adapts to seasons, demand, and group sizes in real time. A full
                booking lifecycle — from first conversation to post-trip feedback — runs on
                enterprise-grade infrastructure.
              </p>
              <p className="text-luxury-charcoal/80 leading-relaxed">
                But technology is the enabler, not the soul. Behind every AI-generated itinerary is
                Kiran&apos;s 29 years of knowing which trails offer solitude in peak season, which
                lodges pair world-class views with genuine warmth, and which cultural encounters
                leave a lasting impression rather than a fleeting photo. CuratedAscents is where
                three decades of Himalayan devotion meets the precision of modern AI — and the
                result is luxury adventure travel that is both deeply personal and effortlessly
                intelligent.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Philosophy */}
      <section className="py-16 sm:py-20 bg-luxury-cream/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block text-luxury-gold text-sm font-medium tracking-[0.25em] uppercase mb-3">
              What Drives Us
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-luxury-navy">
              Our Philosophy
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {philosophy.map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-2xl p-8 border border-luxury-mist hover:border-luxury-gold/30 transition-colors text-center"
              >
                <div className="w-14 h-14 rounded-full bg-luxury-gold/10 flex items-center justify-center mx-auto mb-5">
                  <item.icon className="w-7 h-7 text-luxury-gold" />
                </div>
                <h3 className="font-serif text-lg font-bold text-luxury-navy mb-3">
                  {item.title}
                </h3>
                <p className="text-luxury-charcoal/70 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Office */}
      <section className="py-16 sm:py-20 bg-luxury-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block text-luxury-gold text-sm font-medium tracking-[0.25em] uppercase mb-3">
            Our Office
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-luxury-navy mb-8">
            Where to Find Us
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-luxury-charcoal/70">
            <div className="flex flex-col items-center gap-2">
              <MapPin className="w-6 h-6 text-luxury-gold" />
              <span className="text-sm text-center">4498 Voyageur Way,<br />Carmel, IN 46074, USA</span>
            </div>
            <a
              href="tel:+17155054964"
              className="flex flex-col items-center gap-2 hover:text-luxury-gold transition-colors"
            >
              <Phone className="w-6 h-6 text-luxury-gold" />
              <span className="text-sm">+1-715-505-4964</span>
            </a>
            <a
              href="mailto:hello@curatedascents.com"
              className="flex flex-col items-center gap-2 hover:text-luxury-gold transition-colors"
            >
              <Mail className="w-6 h-6 text-luxury-gold" />
              <span className="text-sm">hello@curatedascents.com</span>
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 bg-luxury-navy">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block text-luxury-gold text-sm font-medium tracking-[0.25em] uppercase mb-4">
            Ready to Begin?
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-4">
            Start Your Journey
          </h2>
          <p className="text-luxury-cream/60 mb-8 max-w-lg mx-auto">
            Our AI Expedition Architect will craft a bespoke luxury itinerary tailored to your
            dates, interests, and travel style.
          </p>
          <ChatButton
            className="inline-block px-10 py-4 bg-luxury-gold text-luxury-navy font-medium rounded-full hover:bg-luxury-gold/90 transition-all duration-300 hover:shadow-lg hover:shadow-luxury-gold/25 text-lg"
          >
            Start Your Journey
          </ChatButton>
        </div>
      </section>
    </>
  );
}
