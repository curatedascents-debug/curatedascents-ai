"use client";

import { motion } from "framer-motion";
import { staggerContainer, fadeInUp } from "@/lib/animations";
import { stats } from "@/lib/constants/stats";
import StatCard from "./StatCard";
import TestimonialCarousel from "./TestimonialCarousel";

export default function TrustSignals() {
  return (
    <section className="section-padding bg-slate-950">
      <div className="container-luxury">
        {/* Stats Section */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-20"
        >
          {stats.map((stat, index) => (
            <StatCard key={stat.id} stat={stat} index={index} />
          ))}
        </motion.div>

        {/* Divider */}
        <div className="w-24 h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent mx-auto mb-20" />

        {/* Testimonials Section */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div variants={fadeInUp} className="text-center mb-12">
            <span className="inline-block px-4 py-2 bg-emerald-500/10 rounded-full text-emerald-400 text-sm font-medium tracking-wider uppercase mb-4">
              Testimonials
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
              What Our Travelers Say
            </h2>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <TestimonialCarousel />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
