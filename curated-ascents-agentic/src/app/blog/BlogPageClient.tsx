"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import CuratedAscentsLogo from "@/components/icons/CuratedAscentsLogo";
import BlogList from "@/components/blog/BlogList";

export default function BlogPageClient() {
  const [isScrolled, setIsScrolled] = useState(false);

  // Add scroll listener
  if (typeof window !== "undefined") {
    window.addEventListener("scroll", () => {
      setIsScrolled(window.scrollY > 50);
    });
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Navigation */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-slate-900/95 backdrop-blur-md border-b border-slate-800/50 py-4"
            : "bg-transparent py-6"
        }`}
      >
        <div className="container-luxury px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <CuratedAscentsLogo className="text-emerald-400 group-hover:text-emerald-300 transition-colors" size={32} />
              <span className="text-xl font-serif font-bold text-white">
                CuratedAscents
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <Link
                href="/#experiences"
                className="text-slate-300 hover:text-white transition-colors"
              >
                Experiences
              </Link>
              <Link
                href="/#destinations"
                className="text-slate-300 hover:text-white transition-colors"
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
              className="hidden md:inline-block px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-medium transition-colors"
            >
              Plan Your Journey
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/20 to-slate-950" />
        <div className="absolute inset-0 bg-[url('/images/himalaya-pattern.svg')] opacity-5" />

        <div className="container-luxury px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="inline-block px-4 py-1 bg-emerald-500/20 text-emerald-400 text-sm font-medium rounded-full mb-4">
              Travel Stories & Insights
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-6">
              Explore the Himalayas
            </h1>
            <p className="text-xl text-slate-300">
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
            className="bg-gradient-to-r from-emerald-900/50 to-teal-900/50 border border-emerald-500/30 rounded-3xl p-8 md:p-12 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
              Ready to Start Your Adventure?
            </h2>
            <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
              Chat with our AI Expedition Architect to plan your perfect
              Himalayan journey.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-full transition-colors"
            >
              Plan Your Journey
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12">
        <div className="container-luxury px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2">
              <CuratedAscentsLogo className="text-emerald-400" size={24} />
              <span className="text-lg font-serif font-bold text-white">
                CuratedAscents
              </span>
            </Link>
            <p className="text-slate-500 text-sm">
              &copy; {new Date().getFullYear()} CuratedAscents. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
