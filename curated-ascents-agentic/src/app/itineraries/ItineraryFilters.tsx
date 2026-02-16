"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface Props {
  countries: string[];
  types: string[];
  activeCountry: string;
  activeType: string;
}

export default function ItineraryFilters({ countries, types, activeCountry, activeType }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/itineraries?${params.toString()}`);
  }

  return (
    <section className="bg-luxury-white border-b border-luxury-mist sticky top-16 z-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-luxury-charcoal/50 text-sm font-medium mr-1">Filter:</span>

          {/* Country filters */}
          <button
            onClick={() => setFilter("country", "")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              !activeCountry
                ? "bg-luxury-navy text-white"
                : "bg-luxury-cream text-luxury-charcoal/60 hover:bg-luxury-mist"
            }`}
          >
            All Countries
          </button>
          {countries.sort().map((c) => (
            <button
              key={c}
              onClick={() => setFilter("country", c.toLowerCase())}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeCountry.toLowerCase() === c.toLowerCase()
                  ? "bg-luxury-navy text-white"
                  : "bg-luxury-cream text-luxury-charcoal/60 hover:bg-luxury-mist"
              }`}
            >
              {c}
            </button>
          ))}

          <span className="w-px h-5 bg-luxury-mist mx-1" />

          {/* Type filters */}
          <button
            onClick={() => setFilter("type", "")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              !activeType
                ? "bg-luxury-gold text-luxury-navy"
                : "bg-luxury-cream text-luxury-charcoal/60 hover:bg-luxury-mist"
            }`}
          >
            All Types
          </button>
          {types.sort().map((t) => (
            <button
              key={t}
              onClick={() => setFilter("type", t.toLowerCase())}
              className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
                activeType.toLowerCase() === t.toLowerCase()
                  ? "bg-luxury-gold text-luxury-navy"
                  : "bg-luxury-cream text-luxury-charcoal/60 hover:bg-luxury-mist"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
