"use client";

import { useState } from "react";
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

export default function LuxuryHomepage() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [initialMessage, setInitialMessage] = useState<string | undefined>();

  const handleChatToggle = () => {
    setIsChatOpen(!isChatOpen);
  };

  const handleChatOpen = (message?: string) => {
    if (message) {
      setInitialMessage(message);
    }
    setIsChatOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Navigation */}
      <Navigation onChatOpen={handleChatOpen} />

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <HeroSection onChatOpen={handleChatOpen} />

        {/* Featured Experiences */}
        <LazySection rootMargin="300px">
          <FeaturedExperiences onChatOpen={handleChatOpen} />
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
          <DestinationHighlights onChatOpen={handleChatOpen} />
        </LazySection>

        {/* Interactive Map */}
        <LazySection>
          <InteractiveMap onChatOpen={handleChatOpen} />
        </LazySection>

        {/* About Section */}
        <LazySection>
          <AboutSection onChatOpen={handleChatOpen} />
        </LazySection>
      </main>

      {/* Footer */}
      <Footer onChatOpen={handleChatOpen} />

      {/* Floating Chat Widget */}
      <ChatWidget isOpen={isChatOpen} onToggle={handleChatToggle} initialMessage={initialMessage} />
    </div>
  );
}
