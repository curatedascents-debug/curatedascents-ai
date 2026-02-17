import type { Metadata } from "next";
import { LuxuryHomepage } from "@/components/homepage";

const OG_TITLE = "CuratedAscents \u2014 Private Luxury Expeditions Across the Himalayas";
const OG_DESCRIPTION =
  "AI-powered bespoke travel across Nepal, Bhutan, Tibet & India. 29 years of expertise, now at your fingertips.";
const OG_IMAGE = "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&h=630&fit=crop&q=80";

export const metadata: Metadata = {
  title: OG_TITLE,
  description: OG_DESCRIPTION,
  openGraph: {
    title: OG_TITLE,
    description: OG_DESCRIPTION,
    url: "https://curated-ascents-agentic.vercel.app",
    type: "website",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Himalayan landscape at golden hour — CuratedAscents luxury expeditions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: OG_TITLE,
    description: OG_DESCRIPTION,
    images: [OG_IMAGE],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "TravelAgency",
  name: "CuratedAscents",
  url: "https://curated-ascents-agentic.vercel.app",
  logo: "https://curated-ascents-agentic.vercel.app/icons/icon-512x512.png",
  description: OG_DESCRIPTION,
  telephone: "+1-715-505-4964",
  email: "hello@curatedascents.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "4498 Voyageur Way",
    addressLocality: "Carmel",
    addressRegion: "IN",
    postalCode: "46074",
    addressCountry: "US",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 39.9784,
    longitude: -86.1180,
  },
  areaServed: [
    { "@type": "Country", name: "Nepal" },
    { "@type": "Country", name: "Bhutan" },
    { "@type": "Country", name: "India" },
    { "@type": "Country", name: "China" },
  ],
  foundingDate: "1996",
  sameAs: [
    "https://www.instagram.com/curatedascents",
    "https://www.facebook.com/curatedascents",
    "https://www.linkedin.com/company/curatedascents",
    "https://twitter.com/curatedascents",
  ],
  priceRange: "$$$",
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    opens: "00:00",
    closes: "23:59",
  },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LuxuryHomepage />
    </>
  );
}
