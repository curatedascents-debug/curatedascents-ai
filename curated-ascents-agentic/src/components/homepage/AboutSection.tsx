"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Shield, Heart, Sparkles, Users } from "lucide-react";
import { staggerContainer, fadeInUp, fadeInLeft, fadeInRight } from "@/lib/animations";

interface AboutSectionProps {
  onChatOpen: () => void;
}

const valueProps = [
  {
    icon: Shield,
    title: "Expert-Led",
    description: "28+ years of Himalayan expertise with certified local guides who know every trail, temple, and hidden gem.",
  },
  {
    icon: Heart,
    title: "Bespoke Design",
    description: "Every journey is crafted around your interests, pace, and style. No cookie-cutter itineraries.",
  },
  {
    icon: Sparkles,
    title: "Luxury Details",
    description: "From boutique lodges to private helicopters, we handle every detail so you can focus on the experience.",
  },
  {
    icon: Users,
    title: "24/7 Support",
    description: "Our team is always available, from planning to your safe return home. You're never alone on your journey.",
  },
];

export default function AboutSection({ onChatOpen }: AboutSectionProps) {
  return (
    <section id="about" className="section-padding bg-slate-950 overflow-hidden">
      <div className="container-luxury">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image Side */}
          <motion.div
            variants={fadeInLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="relative"
          >
            <div className="relative h-[400px] lg:h-[600px] rounded-2xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80"
                alt="Trekkers on a mountain trail"
                fill
                loading="lazy"
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {/* Decorative overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/50 to-transparent" />
            </div>

            {/* Floating Card */}
            <div className="absolute -bottom-6 -right-6 lg:bottom-8 lg:-right-8 bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-2xl max-w-xs hidden sm:block">
              <p className="text-emerald-400 font-serif text-3xl font-bold mb-1">28+</p>
              <p className="text-white font-medium">Years of Excellence</p>
              <p className="text-slate-400 text-sm mt-1">Crafting unforgettable Himalayan journeys since 1996</p>
            </div>
          </motion.div>

          {/* Content Side */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.span
              variants={fadeInRight}
              className="inline-block px-4 py-2 bg-emerald-500/10 rounded-full text-emerald-400 text-sm font-medium tracking-wider uppercase mb-4"
            >
              Why Choose Us
            </motion.span>

            <motion.h2
              variants={fadeInRight}
              className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6"
            >
              Your Journey,{" "}
              <span className="text-gradient">Our Passion</span>
            </motion.h2>

            <motion.p
              variants={fadeInRight}
              className="text-slate-300 text-lg mb-8"
            >
              We believe luxury travel should be transformative, not transactional.
              Our AI-powered expedition architect works alongside our human experts
              to design journeys that exceed expectations at every turn.
            </motion.p>

            {/* Value Props */}
            <motion.div
              variants={staggerContainer}
              className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8"
            >
              {valueProps.map((prop) => (
                <motion.div
                  key={prop.title}
                  variants={fadeInUp}
                  className="flex gap-4"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <prop.icon className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-1">{prop.title}</h3>
                    <p className="text-slate-400 text-sm">{prop.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA */}
            <motion.div variants={fadeInUp}>
              <button onClick={onChatOpen} className="btn-primary">
                Start Your Conversation
              </button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
