"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Clock, MapPin, TrendingUp } from "lucide-react";
import { Experience } from "@/lib/constants/experiences";
import { cardHover, imageZoom } from "@/lib/animations";

interface ExperienceCardProps {
  experience: Experience;
  onSelect: () => void;
}

export default function ExperienceCard({ experience, onSelect }: ExperienceCardProps) {
  const difficultyColor = {
    Easy: "text-emerald-400",
    Moderate: "text-yellow-400",
    Challenging: "text-orange-400",
    Expert: "text-red-400",
  };

  return (
    <motion.div
      variants={cardHover}
      initial="rest"
      whileHover="hover"
      className="group relative bg-slate-800/50 rounded-2xl overflow-hidden border border-slate-700/50 cursor-pointer"
      onClick={onSelect}
    >
      {/* Image Container */}
      <div className="relative h-56 overflow-hidden">
        <motion.div variants={imageZoom} className="h-full w-full">
          <Image
            src={experience.image}
            alt={experience.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </motion.div>
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />

        {/* Difficulty Badge */}
        <div className="absolute top-4 right-4">
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-sm text-xs font-medium ${difficultyColor[experience.difficulty]}`}>
            <TrendingUp className="w-3 h-3" />
            {experience.difficulty}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Location & Duration */}
        <div className="flex items-center gap-4 mb-3 text-sm text-slate-400">
          <span className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {experience.destination}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {experience.duration}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-serif text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
          {experience.name}
        </h3>

        {/* Description */}
        <p className="text-slate-400 text-sm mb-4 line-clamp-2">
          {experience.description}
        </p>

        {/* Price & CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
          <div>
            <span className="text-slate-500 text-xs">From</span>
            <p className="text-emerald-400 font-bold text-lg">
              ${experience.startingPrice.toLocaleString()}
            </p>
          </div>
          <span className="text-sm text-white/70 group-hover:text-white transition-colors">
            Learn More &rarr;
          </span>
        </div>
      </div>
    </motion.div>
  );
}
