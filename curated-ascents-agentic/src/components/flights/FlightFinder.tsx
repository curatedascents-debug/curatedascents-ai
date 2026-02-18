"use client";

import { useState, useMemo } from "react";
import { Info, ExternalLink, Plane } from "lucide-react";
import { GATEWAY_AIRPORTS, type GatewayCountry } from "@/lib/constants/gateway-airports";
import { GATEWAY_CODES } from "@/lib/constants/world-airports";
import { buildFlightSearchUrls } from "@/lib/utils/flight-url-builder";
import AirportSearch from "./AirportSearch";

interface FlightFinderProps {
  defaultDestination?: string;
}

const allGatewayAirports = (Object.entries(GATEWAY_AIRPORTS) as [GatewayCountry, typeof GATEWAY_AIRPORTS[GatewayCountry]][]).flatMap(
  ([country, data]) =>
    data.airports.map((a) => ({
      ...a,
      country,
      label: `${a.city} (${a.code}) — ${country.charAt(0).toUpperCase() + country.slice(1)}`,
    }))
);

export default function FlightFinder({ defaultDestination }: FlightFinderProps) {
  const defaultCode = defaultDestination
    ? GATEWAY_AIRPORTS[defaultDestination as GatewayCountry]?.airports[0]?.code || "KTM"
    : "KTM";

  const [origin, setOrigin] = useState("");
  const [destinationCode, setDestinationCode] = useState(defaultCode);
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const isGateway = GATEWAY_CODES.has(destinationCode);

  const selectedGatewayAirport = useMemo(
    () => allGatewayAirports.find((a) => a.code === destinationCode),
    [destinationCode]
  );

  const urls = useMemo(
    () =>
      buildFlightSearchUrls(
        origin,
        destinationCode,
        departureDate || undefined,
        returnDate || undefined
      ),
    [origin, destinationCode, departureDate, returnDate]
  );

  return (
    <section className="bg-luxury-navy py-16 sm:py-20">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 text-luxury-gold text-sm font-medium tracking-[0.25em] uppercase mb-3">
            <Plane className="w-4 h-4" />
            Plan Your Journey
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
            Find Your Flights
          </h2>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur border border-luxury-gold/20 rounded-2xl p-6 sm:p-8">
          {/* Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* From */}
            <div>
              <label className="block text-luxury-cream/70 text-sm mb-1.5">From</label>
              <AirportSearch
                value={origin}
                onChange={setOrigin}
                placeholder="Type city (e.g. New York)"
              />
            </div>

            {/* To */}
            <div>
              <label className="block text-luxury-cream/70 text-sm mb-1.5">To</label>
              <AirportSearch
                value={destinationCode}
                onChange={setDestinationCode}
                placeholder="Type city or select destination"
                showGatewayFirst
              />
            </div>

            {/* Departure */}
            <div>
              <label className="block text-luxury-cream/70 text-sm mb-1.5">Departure</label>
              <input
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                min={today}
                className="w-full bg-white/10 border border-luxury-gold/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-luxury-gold/50 transition-colors [color-scheme:dark]"
              />
            </div>

            {/* Return */}
            <div>
              <label className="block text-luxury-cream/70 text-sm mb-1.5">Return</label>
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                min={departureDate || today}
                className="w-full bg-white/10 border border-luxury-gold/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-luxury-gold/50 transition-colors [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <a
              href={urls.google}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-luxury-gold text-luxury-navy font-medium rounded-full hover:bg-luxury-gold/90 transition-all duration-300"
            >
              Search Google Flights
              <ExternalLink className="w-4 h-4" />
            </a>
            <a
              href={urls.skyscanner}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-luxury-gold text-luxury-gold font-medium rounded-full hover:bg-luxury-gold/10 transition-all duration-300"
            >
              Search Skyscanner
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Info Strip */}
          {destinationCode && (
            <div className="bg-luxury-gold/10 rounded-xl px-5 py-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-luxury-gold flex-shrink-0 mt-0.5" />
                <div className="text-sm text-luxury-cream/80 space-y-1">
                  {isGateway && selectedGatewayAirport ? (
                    <>
                      <p>{selectedGatewayAirport.notes}</p>
                      <p className="text-luxury-cream/60">
                        <span className="text-luxury-gold">Typical airlines:</span>{" "}
                        {selectedGatewayAirport.typicalAirlines.join(", ")}
                      </p>
                    </>
                  ) : (
                    <p>
                      This is not a direct Himalayan gateway — you may need connecting flights to
                      reach your final destination.
                    </p>
                  )}
                  <p className="text-luxury-cream/50 text-xs mt-2">
                    International flights are not included in CuratedAscents packages.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
