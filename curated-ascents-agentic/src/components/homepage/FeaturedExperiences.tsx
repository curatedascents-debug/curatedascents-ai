"use client";

import { motion } from "framer-motion";
import { staggerContainer, fadeInUp } from "@/lib/animations";
import { experiences } from "@/lib/constants/experiences";
import ExperienceCard from "./ExperienceCard";

interface FeaturedExperiencesProps {
  onChatOpen: () => void;
}

export default function FeaturedExperiences({ onChatOpen }: FeaturedExperiencesProps) {
  return (
    <section id="experiences" className="section-padding bg-slate-900">
      <div className="container-luxury">
        {/* Section Header */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <motion.span
            variants={fadeInUp}
            className="inline-block px-4 py-2 bg-emerald-500/10 rounded-full text-emerald-400 text-sm font-medium tracking-wider uppercase mb-4"
          >
            Curated Experiences
          </motion.span>
          <motion.h2
            variants={fadeInUp}
            className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4"
          >
            Extraordinary Adventures
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-slate-400 text-lg max-w-2xl mx-auto"
          >
            Each journey is meticulously designed to deliver unforgettable moments,
            blending luxury with authentic cultural immersion.
          </motion.p>
        </motion.div>

        {/* Experience Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {experiences.map((experience) => (
            <motion.div key={experience.id} variants={fadeInUp}>
              <ExperienceCard
                experience={experience}
                onSelect={onChatOpen}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* View All CTA */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <button onClick={onChatOpen} className="btn-secondary">
            Explore All Experiences
          </button>
        </motion.div>
      </div>
    </section>
  );
}
