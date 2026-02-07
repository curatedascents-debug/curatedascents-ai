"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { staggerContainer, fadeInUp } from "@/lib/animations";

interface InteractiveMapProps {
  onChatOpen: () => void;
}

interface MapDestination {
  id: string;
  name: string;
  tagline: string;
  image: string;
  highlights: string[];
  path: string;
  labelX: number;
  labelY: number;
}

const mapDestinations: MapDestination[] = [
  {
    id: "india",
    name: "India",
    tagline: "Where Every Journey Transforms",
    image: "https://images.unsplash.com/photo-1526711657229-e7e080ed7aa1?w=600&q=80",
    highlights: ["Ladakh", "Ranthambore", "Rajasthan", "Kerala"],
    path: "M80,180 L200,140 L280,180 L320,320 L280,480 L200,520 L100,480 L60,380 L40,280 Z",
    labelX: 170,
    labelY: 340,
  },
  {
    id: "nepal",
    name: "Nepal",
    tagline: "The Roof of the World",
    image: "https://images.unsplash.com/photo-1571401835393-8c5f35328320?w=600&q=80",
    highlights: ["Everest Base Camp", "Annapurna", "Kathmandu", "Chitwan"],
    path: "M280,180 L420,160 L460,200 L440,260 L320,280 L280,240 Z",
    labelX: 370,
    labelY: 220,
  },
  {
    id: "tibet",
    name: "Tibet",
    tagline: "The Spiritual Heart of Asia",
    image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=600&q=80",
    highlights: ["Potala Palace", "Mount Kailash", "Lhasa", "Everest North"],
    path: "M320,60 L580,40 L700,80 L720,180 L620,200 L460,200 L420,160 L280,180 L280,120 Z",
    labelX: 500,
    labelY: 130,
  },
  {
    id: "bhutan",
    name: "Bhutan",
    tagline: "Land of the Thunder Dragon",
    image: "https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3?w=600&q=80",
    highlights: ["Tiger's Nest", "Paro Valley", "Punakha Dzong", "Bumthang"],
    path: "M460,200 L560,190 L580,220 L560,260 L480,260 L440,260 Z",
    labelX: 510,
    labelY: 230,
  },
];

export default function InteractiveMap({ onChatOpen }: InteractiveMapProps) {
  const [activeDestination, setActiveDestination] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const active = mapDestinations.find(
    (d) => d.id === (activeDestination ?? hoveredId)
  );

  return (
    <section className="section-padding bg-slate-900 overflow-hidden">
      <div className="container-luxury">
        {/* Section Header */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-12"
        >
          <motion.span
            variants={fadeInUp}
            className="inline-block px-4 py-2 bg-emerald-500/10 rounded-full text-emerald-400 text-sm font-medium tracking-wider uppercase mb-4"
          >
            Our Destinations
          </motion.span>
          <motion.h2
            variants={fadeInUp}
            className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4"
          >
            Explore the <span className="text-gradient">Himalayas</span>
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-slate-400 text-lg max-w-2xl mx-auto"
          >
            Four extraordinary destinations, each offering a unique window into the world&apos;s most spectacular mountain landscapes.
          </motion.p>
        </motion.div>

        {/* Map + Detail Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          {/* SVG Map */}
          <div className="lg:col-span-3">
            <svg
              viewBox="0 0 800 560"
              className="w-full h-auto"
              role="img"
              aria-label="Interactive map of Nepal, Bhutan, Tibet, and India"
            >
              {/* Background */}
              <rect width="800" height="560" fill="transparent" />

              {/* Country shapes */}
              {mapDestinations.map((dest) => {
                const isActive = active?.id === dest.id;
                return (
                  <g key={dest.id}>
                    <path
                      d={dest.path}
                      fill={isActive ? "rgba(5, 150, 105, 0.3)" : "rgba(30, 41, 59, 0.6)"}
                      stroke={isActive ? "#059669" : "#475569"}
                      strokeWidth={isActive ? 2.5 : 1.5}
                      className="transition-all duration-300 cursor-pointer"
                      onMouseEnter={() => setHoveredId(dest.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      onClick={() =>
                        setActiveDestination((prev) =>
                          prev === dest.id ? null : dest.id
                        )
                      }
                    />
                    {/* Label */}
                    <text
                      x={dest.labelX}
                      y={dest.labelY}
                      textAnchor="middle"
                      className="pointer-events-none select-none"
                      fill={isActive ? "#6ee7b7" : "#94a3b8"}
                      fontSize={isActive ? 18 : 15}
                      fontWeight={isActive ? 700 : 500}
                      fontFamily="var(--font-playfair), serif"
                    >
                      {dest.name}
                    </text>
                    {/* Pin icon for active */}
                    {isActive && (
                      <circle
                        cx={dest.labelX}
                        cy={dest.labelY - 24}
                        r="4"
                        fill="#059669"
                      />
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Mobile destination buttons */}
            <div className="flex flex-wrap gap-2 mt-4 lg:hidden justify-center">
              {mapDestinations.map((dest) => (
                <button
                  key={dest.id}
                  onClick={() =>
                    setActiveDestination((prev) =>
                      prev === dest.id ? null : dest.id
                    )
                  }
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    active?.id === dest.id
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <MapPin className="w-3 h-3 inline-block mr-1" />
                  {dest.name}
                </button>
              ))}
            </div>
          </div>

          {/* Detail Card */}
          <div className="lg:col-span-2 min-h-[320px]">
            <AnimatePresence mode="wait">
              {active ? (
                <motion.div
                  key={active.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden"
                >
                  <div className="relative h-48">
                    <Image
                      src={active.image}
                      alt={active.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 40vw"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-800/90 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <h3 className="font-serif text-2xl font-bold text-white">
                        {active.name}
                      </h3>
                      <p className="text-emerald-400 text-sm">{active.tagline}</p>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex flex-wrap gap-2 mb-6">
                      {active.highlights.map((h) => (
                        <span
                          key={h}
                          className="text-xs px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full"
                        >
                          {h}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={onChatOpen}
                      className="btn-primary w-full text-center text-sm"
                    >
                      Plan a Trip to {active.name}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center h-full min-h-[320px] text-slate-500 text-center px-6"
                >
                  <div>
                    <MapPin className="w-10 h-10 mx-auto mb-3 text-slate-600" />
                    <p className="text-lg font-medium text-slate-400">
                      Select a destination
                    </p>
                    <p className="text-sm mt-1">
                      Hover or tap a region on the map to explore
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
