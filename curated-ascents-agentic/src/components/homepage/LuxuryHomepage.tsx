import { ChatProvider } from "./ChatContext";

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
import Navigation from "./Navigation";
import HeroSection from "./HeroSection";
import HowItWorks from "./HowItWorks";
import SignatureJourneys from "./SignatureJourneys";
import FounderSection from "./FounderSection";
import TestimonialsSection from "./TestimonialsSection";
import TrustStrip from "./TrustStrip";
import FinalCTA from "./FinalCTA";
import Footer from "./Footer";

export default function LuxuryHomepage() {
  return (
    <ChatProvider>
      <div className="min-h-screen bg-luxury-navy">
        {/* Navigation */}
        <Navigation />

        {/* Main Content */}
        <main>
          {/* Hero Section */}
          <HeroSection />

          {/* Gold divider */}
          <div className="section-divider my-0" />

          {/* How It Works */}
          <HowItWorks />

          {/* Gold divider */}
          <div className="section-divider my-0" />

          {/* Signature Journeys */}
          <SignatureJourneys />

          {/* Gold divider */}
          <div className="section-divider my-0" />

          {/* Founder / Expertise */}
          <FounderSection />

          {/* Gold divider */}
          <div className="section-divider my-0" />

          {/* Testimonials */}
          <TestimonialsSection />

          {/* Trust Strip */}
          <TrustStrip />

          {/* Final CTA */}
          <FinalCTA />
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </ChatProvider>
  );
}
