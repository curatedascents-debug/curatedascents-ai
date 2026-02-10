"use client";

import { useState, useEffect } from "react";
import Navigation from "./Navigation";
import HeroSection from "./HeroSection";
import FeaturedExperiences from "./FeaturedExperiences";
import TrustSignals from "./TrustSignals";
import PressAndCertifications from "./PressAndCertifications";
import DestinationHighlights from "./DestinationHighlights";
import InteractiveMap from "./InteractiveMap";
import AboutSection from "./AboutSection";
import Footer from "./Footer";
import ChatWidget from "./ChatWidget";
import LazySection from "./LazySection";

export interface HomepageMediaImage {
  cdnUrl: string;
  alt: string;
  country: string;
  destination: string | null;
  category: string;
}

export interface HomepageMedia {
  heroSlides: Record<string, HomepageMediaImage | null>;
  experiences: Record<string, HomepageMediaImage | null>;
  destinations: Record<string, HomepageMediaImage | null>;
  about: HomepageMediaImage | null;
}

export default function LuxuryHomepage() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [initialMessage, setInitialMessage] = useState<string | undefined>();
  const [media, setMedia] = useState<HomepageMedia | null>(null);

  const handleChatToggle = () => {
    setIsChatOpen(!isChatOpen);
  };

  const handleChatOpen = (message?: string) => {
    if (message) {
      setInitialMessage(message);
    }
    setIsChatOpen(true);
  };

  // Fetch media library images for homepage (non-blocking)
  useEffect(() => {
    fetch("/api/media/homepage")
      .then((r) => r.json())
      .then((data) => setMedia(data))
      .catch(() => {}); // Silently fail — components use hardcoded fallbacks
  }, []);

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Navigation */}
      <Navigation onChatOpen={handleChatOpen} />

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <HeroSection onChatOpen={handleChatOpen} mediaOverrides={media?.heroSlides} />

        {/* Featured Experiences */}
        <LazySection rootMargin="300px">
          <FeaturedExperiences onChatOpen={handleChatOpen} mediaOverrides={media?.experiences} />
        </LazySection>

        {/* Trust Signals & Testimonials */}
        <LazySection>
          <TrustSignals />
        </LazySection>

        {/* Press & Certifications */}
        <LazySection>
          <PressAndCertifications />
        </LazySection>

        {/* Destination Highlights */}
        <LazySection>
          <DestinationHighlights onChatOpen={handleChatOpen} mediaOverrides={media?.destinations} />
        </LazySection>

        {/* Interactive Map */}
        <LazySection>
          <InteractiveMap onChatOpen={handleChatOpen} />
        </LazySection>

        {/* About Section */}
        <LazySection>
          <AboutSection onChatOpen={handleChatOpen} mediaOverride={media?.about} />
        </LazySection>
      </main>

      {/* Footer */}
      <Footer onChatOpen={handleChatOpen} />

      {/* Floating Chat Widget */}
      <ChatWidget isOpen={isChatOpen} onToggle={handleChatToggle} initialMessage={initialMessage} />
    </div>
  );
}
