"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { useChatContext } from "./ChatContext";

const HERO_IMAGE = "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1920&q=80";

export default function HeroSection() {
  const { openChat } = useChatContext();
  const [isVisible, setIsVisible] = useState(false);
  const [heroImageSrc, setHeroImageSrc] = useState(HERO_IMAGE);
  const [heroImageAlt, setHeroImageAlt] = useState("Himalayan landscape at golden hour");

  useEffect(() => {
    setIsVisible(true);

    // Fetch hero image from media library (non-blocking)
    fetch("/api/media/homepage")
      .then((r) => r.json())
      .then((data) => {
        const heroMedia = data?.heroSlides?.["hero"];
        if (heroMedia?.cdnUrl) {
          setHeroImageSrc(heroMedia.cdnUrl);
          if (heroMedia.alt) setHeroImageAlt(heroMedia.alt);
        }
      })
      .catch(() => {}); // Silently fail — use hardcoded fallback
  }, []);

  const scrollToJourneys = () => {
    const element = document.querySelector("#signature-journeys");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative h-screen min-h-[700px] flex items-end overflow-hidden">
      {/* Background Image with Ken Burns effect */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 animate-ken-burns">
          <Image
            src={heroImageSrc}
            alt={heroImageAlt}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        </div>
        {/* Dark gradient overlay — heavier at bottom for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-luxury-navy/30 via-luxury-navy/40 to-luxury-navy/85" />
      </div>

      {/* Content — positioned bottom-left */}
      <div className="relative z-10 container-luxury px-4 sm:px-6 lg:px-8 pb-32 sm:pb-36">
        <div className="max-w-2xl">
          {/* Eyebrow */}
          <div
            className={`mb-6 transition-all duration-700 delay-300 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            <span className="inline-block text-luxury-gold text-sm font-medium tracking-[0.25em] uppercase">
              Private Luxury Expeditions
            </span>
          </div>

          {/* Main heading */}
          <h1
            className={`font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight transition-all duration-700 delay-500 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            Nepal &middot; Bhutan &middot; Tibet &middot; India
          </h1>

          {/* Subheading */}
          <p
            className={`text-base sm:text-lg text-luxury-cream/80 max-w-xl mb-10 leading-relaxed transition-all duration-700 delay-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            Your private Expedition Architect — 28 years of Himalayan mastery, now powered by AI.
            Tell us your dream, and we&apos;ll craft a journey no one else can.
          </p>

          {/* CTAs */}
          <div
            className={`flex flex-col sm:flex-row gap-4 transition-all duration-700 delay-[900ms] ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            <button
              onClick={() => openChat()}
              className="btn-primary"
            >
              Begin Your Journey
            </button>
            <button
              onClick={scrollToJourneys}
              className="btn-secondary"
            >
              View Signature Journeys
            </button>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-10 transition-all duration-700 delay-[1200ms] ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <button
          onClick={scrollToJourneys}
          className="flex flex-col items-center gap-2 text-white/50 hover:text-white/80 transition-colors"
          aria-label="Scroll to discover more"
        >
          <span className="text-xs tracking-[0.2em] uppercase">Discover</span>
          <ChevronDown className="w-5 h-5 animate-bounce" />
        </button>
      </div>
    </section>
  );
}
