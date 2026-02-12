"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import CuratedAscentsLogo from "@/components/icons/CuratedAscentsLogo";
import BlogList from "@/components/blog/BlogList";

export default function BlogPageClient() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-luxury-navy">
      {/* Navigation */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-luxury-navy/95 backdrop-blur-md border-b border-luxury-gold/10 py-4"
            : "bg-transparent py-6"
        }`}
      >
        <div className="container-luxury px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <CuratedAscentsLogo className="text-luxury-gold group-hover:text-luxury-gold/80 transition-colors" size={32} />
              <div>
                <span className="text-xl font-serif font-bold text-white">
                  CuratedAscents
                </span>
                <span className="hidden sm:block text-[10px] tracking-[0.2em] uppercase text-luxury-gold/60 -mt-0.5">
                  Beyond Boundaries, Beyond Ordinary
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <Link
                href="/#signature-journeys"
                className="text-white/70 hover:text-white transition-colors link-underline"
              >
                Journeys
              </Link>
              <Link
                href="/#destinations"
                className="text-white/70 hover:text-white transition-colors link-underline"
              >
                Destinations
              </Link>
              <Link
                href="/blog"
                className="text-white font-medium"
              >
                Blog
              </Link>
            </nav>

            <Link
              href="/"
              className="hidden md:inline-block px-6 py-2.5 bg-luxury-gold text-luxury-navy text-sm font-medium rounded-full hover:bg-luxury-gold/90 transition-all duration-300"
            >
              Plan Your Journey
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-luxury-gold/5 to-luxury-navy" />

        <div className="container-luxury px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="inline-block text-luxury-gold text-sm font-medium tracking-[0.25em] uppercase mb-4">
              Travel Stories & Insights
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-6">
              Explore the Himalayas
            </h1>
            <p className="text-lg text-white/60">
              Discover destination guides, travel tips, and inspiring stories
              from Nepal, Bhutan, Tibet, and India.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Blog Content */}
      <section className="py-12">
        <div className="container-luxury px-4 sm:px-6 lg:px-8">
          <BlogList />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container-luxury px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-luxury-navy border border-luxury-gold/20 rounded-3xl p-8 md:p-12 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
              Ready to Start Your Adventure?
            </h2>
            <p className="text-lg text-white/60 mb-8 max-w-2xl mx-auto">
              Chat with our AI Expedition Architect to plan your perfect
              Himalayan journey.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-8 py-4 bg-luxury-gold text-luxury-navy font-medium rounded-full hover:bg-luxury-gold/90 transition-all duration-300 hover:shadow-lg hover:shadow-luxury-gold/25"
            >
              Plan Your Journey
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-luxury-gold/10 py-12">
        <div className="container-luxury px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2">
              <CuratedAscentsLogo className="text-luxury-gold" size={24} />
              <div>
                <span className="text-lg font-serif font-bold text-white">
                  CuratedAscents
                </span>
                <span className="hidden sm:block text-[9px] tracking-[0.2em] uppercase text-luxury-gold/60 -mt-0.5">
                  Beyond Boundaries, Beyond Ordinary
                </span>
              </div>
            </Link>
            <p className="text-white/30 text-sm">
              &copy; {new Date().getFullYear()} CuratedAscents. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
