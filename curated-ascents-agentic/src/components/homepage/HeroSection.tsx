"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { fadeInUp, fadeIn, staggerContainer } from "@/lib/animations";
import { heroSlides } from "@/lib/constants/hero-slides";
import type { HomepageMediaImage } from "./LuxuryHomepage";

interface HeroSectionProps {
  onChatOpen: () => void;
  mediaOverrides?: Record<string, HomepageMediaImage | null>;
}

export default function HeroSection({ onChatOpen, mediaOverrides }: HeroSectionProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [currentSlide]);

  const scrollToExperiences = () => {
    const element = document.querySelector("#experiences");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden">
      {/* Background Images with Crossfade */}
      <div className="absolute inset-0">
        <AnimatePresence mode="sync">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Image
              src={mediaOverrides?.[heroSlides[currentSlide].label]?.cdnUrl || heroSlides[currentSlide].src}
              alt={mediaOverrides?.[heroSlides[currentSlide].label]?.alt || heroSlides[currentSlide].alt}
              fill
              priority={currentSlide === 0}
              loading={currentSlide === 0 ? undefined : "eager"}
              className="object-cover"
              sizes="100vw"
            />
          </motion.div>
        </AnimatePresence>

        {/* Gradient Overlay (stable, outside AnimatePresence) */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-slate-900/50 to-slate-900 z-[1]" />
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

      {/* Dot Indicators */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
        {heroSlides.map((slide, index) => (
          <button
            key={slide.label}
            onClick={() => goToSlide(index)}
            aria-label={`Go to ${slide.label}`}
            className={`transition-all duration-300 rounded-full ${
              index === currentSlide
                ? "w-8 h-3 bg-emerald-500"
                : "w-3 h-3 bg-white/30 hover:bg-white/50"
            }`}
          />
        ))}
      </div>

      {/* Scroll Indicator */}
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
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
