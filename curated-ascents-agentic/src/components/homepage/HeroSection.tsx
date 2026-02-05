"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { fadeInUp, fadeIn, staggerContainer } from "@/lib/animations";

interface HeroSectionProps {
  onChatOpen: () => void;
}

export default function HeroSection({ onChatOpen }: HeroSectionProps) {
  const scrollToExperiences = () => {
    const element = document.querySelector("#experiences");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1486911278844-a81c5267e227?w=1920&q=80"
          alt="Himalayan mountains at sunrise"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-slate-900/50 to-slate-900" />
      </div>

      {/* Content */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative z-10 container-luxury px-4 sm:px-6 lg:px-8 text-center"
      >
        {/* Eyebrow */}
        <motion.div variants={fadeInUp} className="mb-6">
          <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-emerald-400 text-sm font-medium tracking-wider uppercase">
            Luxury Adventure Travel
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={fadeInUp}
          className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 text-balance leading-tight"
        >
          Extraordinary Journeys
          <br />
          <span className="text-gradient">Beyond Imagination</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          variants={fadeInUp}
          className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 text-balance"
        >
          Bespoke luxury expeditions across Nepal, Tibet, Bhutan, and India.
          Where every detail is crafted for the discerning traveler.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={fadeInUp}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button onClick={onChatOpen} className="btn-primary">
            Start Planning
          </button>
          <button onClick={scrollToExperiences} className="btn-secondary">
            Explore Experiences
          </button>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <button
          onClick={scrollToExperiences}
          className="flex flex-col items-center gap-2 text-white/60 hover:text-white transition-colors group"
          aria-label="Scroll to experiences"
        >
          <span className="text-sm tracking-wider uppercase">Discover</span>
          <ChevronDown className="w-6 h-6 animate-bounce" />
        </button>
      </motion.div>
    </section>
  );
}
