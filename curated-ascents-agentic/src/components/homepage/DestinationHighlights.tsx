"use client";

import { motion } from "framer-motion";
import { staggerContainer, fadeInUp } from "@/lib/animations";
import { destinations } from "@/lib/constants/destinations";
import DestinationCard from "./DestinationCard";
import type { HomepageMediaImage } from "./LuxuryHomepage";

interface DestinationHighlightsProps {
  onChatOpen: () => void;
  mediaOverrides?: Record<string, HomepageMediaImage | null>;
}

export default function DestinationHighlights({ onChatOpen, mediaOverrides }: DestinationHighlightsProps) {
  // Nepal is featured (first), others are standard
  const featuredDestination = destinations.find((d) => d.featured);
  const otherDestinations = destinations.filter((d) => !d.featured);

  return (
    <section id="destinations" className="section-padding bg-slate-900">
      <div className="container-luxury">
        {/* Section Header */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <motion.span
            variants={fadeInUp}
            className="inline-block px-4 py-2 bg-emerald-500/10 rounded-full text-emerald-400 text-sm font-medium tracking-wider uppercase mb-4"
          >
            Destinations
          </motion.span>
          <motion.h2
            variants={fadeInUp}
            className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4"
          >
            Where Dreams Take Flight
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-slate-400 text-lg max-w-2xl mx-auto"
          >
            From the towering peaks of the Himalayas to the mystical valleys of Bhutan,
            discover destinations that stir the soul.
          </motion.p>
        </motion.div>

        {/* Bento Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {/* Featured Destination (Nepal) - Takes 2 rows on lg */}
          {featuredDestination && (
            <motion.div variants={fadeInUp} className="lg:row-span-2">
              <DestinationCard
                destination={featuredDestination}
                featured
                onSelect={onChatOpen}
                imageOverride={mediaOverrides?.[featuredDestination.id]?.cdnUrl}
                altOverride={mediaOverrides?.[featuredDestination.id]?.alt}
              />
            </motion.div>
          )}

          {/* Other Destinations */}
          {otherDestinations.map((destination) => (
            <motion.div key={destination.id} variants={fadeInUp}>
              <DestinationCard
                destination={destination}
                onSelect={onChatOpen}
                imageOverride={mediaOverrides?.[destination.id]?.cdnUrl}
                altOverride={mediaOverrides?.[destination.id]?.alt}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
