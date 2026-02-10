"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Destination } from "@/lib/constants/destinations";
import { cardHover, imageZoom } from "@/lib/animations";

interface DestinationCardProps {
  destination: Destination;
  featured?: boolean;
  onSelect: () => void;
  imageOverride?: string;
  altOverride?: string;
}

export default function DestinationCard({
  destination,
  featured = false,
  onSelect,
  imageOverride,
  altOverride,
}: DestinationCardProps) {
  return (
    <motion.div
      variants={cardHover}
      initial="rest"
      whileHover="hover"
      className={`group relative rounded-2xl overflow-hidden cursor-pointer ${
        featured ? "row-span-2" : ""
      }`}
      onClick={onSelect}
    >
      {/* Background Image */}
      <div className={`relative ${featured ? "h-full min-h-[500px]" : "h-64"}`}>
        <motion.div variants={imageZoom} className="h-full w-full">
          <Image
            src={imageOverride || destination.image}
            alt={altOverride || destination.name}
            fill
            loading="lazy"
            className="object-cover"
            sizes={featured ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 33vw"}
          />
        </motion.div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />

        {/* Content */}
        <div className="absolute inset-0 p-6 flex flex-col justify-end">
          {/* Tagline */}
          <span className="text-emerald-400 text-sm font-medium mb-2">
            {destination.tagline}
          </span>

          {/* Name */}
          <h3 className={`font-serif font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors ${
            featured ? "text-3xl lg:text-4xl" : "text-2xl"
          }`}>
            {destination.name}
          </h3>

          {/* Description (featured only) */}
          {featured && (
            <p className="text-slate-300 mb-4 line-clamp-3">
              {destination.description}
            </p>
          )}

          {/* Highlights */}
          <div className="flex flex-wrap gap-2 mb-4">
            {destination.highlights.slice(0, featured ? 4 : 2).map((highlight) => (
              <span
                key={highlight}
                className="text-xs px-2 py-1 bg-white/10 backdrop-blur-sm rounded-full text-white/80"
              >
                {highlight}
              </span>
            ))}
          </div>

          {/* CTA */}
          <div className="flex items-center gap-2 text-white/70 group-hover:text-white transition-colors">
            <span className="text-sm font-medium">Explore {destination.name}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
