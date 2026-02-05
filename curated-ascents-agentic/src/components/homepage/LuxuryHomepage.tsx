"use client";

import { useState } from "react";
import Navigation from "./Navigation";
import HeroSection from "./HeroSection";
import FeaturedExperiences from "./FeaturedExperiences";
import TrustSignals from "./TrustSignals";
import DestinationHighlights from "./DestinationHighlights";
import AboutSection from "./AboutSection";
import Footer from "./Footer";
import ChatWidget from "./ChatWidget";

export default function LuxuryHomepage() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleChatToggle = () => {
    setIsChatOpen(!isChatOpen);
  };

  const handleChatOpen = () => {
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
        <FeaturedExperiences onChatOpen={handleChatOpen} />

        {/* Trust Signals & Testimonials */}
        <TrustSignals />

        {/* Destination Highlights */}
        <DestinationHighlights onChatOpen={handleChatOpen} />

        {/* About Section */}
        <AboutSection onChatOpen={handleChatOpen} />
      </main>

      {/* Footer */}
      <Footer />

      {/* Floating Chat Widget */}
      <ChatWidget isOpen={isChatOpen} onToggle={handleChatToggle} />
    </div>
  );
}
