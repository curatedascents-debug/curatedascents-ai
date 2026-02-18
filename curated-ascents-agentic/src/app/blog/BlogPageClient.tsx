"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import BlogList from "@/components/blog/BlogList";
import { useChatContext } from "@/components/homepage/ChatContext";

export default function BlogPageClient() {
  const { openChat } = useChatContext();

  return (
    <div className="min-h-screen bg-luxury-navy">
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
            <button
              onClick={() => openChat()}
              className="inline-flex items-center gap-2 px-8 py-4 bg-luxury-gold text-luxury-navy font-medium rounded-full hover:bg-luxury-gold/90 transition-all duration-300 hover:shadow-lg hover:shadow-luxury-gold/25"
            >
              Plan Your Journey
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
