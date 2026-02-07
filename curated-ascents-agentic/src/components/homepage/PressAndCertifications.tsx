"use client";

import { motion } from "framer-motion";
import { Leaf, ShieldCheck, Award, Mountain } from "lucide-react";
import { staggerContainer, fadeInUp } from "@/lib/animations";
import { pressMentions, certifications, Certification } from "@/lib/constants/press";

const iconMap: Record<Certification["icon"], React.ComponentType<{ className?: string }>> = {
  Leaf,
  ShieldCheck,
  Award,
  Mountain,
};

export default function PressAndCertifications() {
  return (
    <section className="section-padding bg-slate-900 overflow-hidden">
      <div className="container-luxury">
        {/* Press Mentions */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <motion.p
            variants={fadeInUp}
            className="text-slate-500 text-sm tracking-wider uppercase mb-8"
          >
            As Featured In
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="flex flex-wrap justify-center items-center gap-x-10 gap-y-6"
          >
            {pressMentions.map((mention) => (
              <span
                key={mention.name}
                className="font-serif text-xl sm:text-2xl text-slate-500 hover:text-slate-300 transition-colors duration-300 cursor-default"
                title={mention.quote}
              >
                {mention.name}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent mb-16" />

        {/* Certifications */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center"
        >
          <motion.p
            variants={fadeInUp}
            className="text-slate-500 text-sm tracking-wider uppercase mb-8"
          >
            Certifications &amp; Memberships
          </motion.p>

          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {certifications.map((cert) => {
              const Icon = iconMap[cert.icon];
              return (
                <motion.div
                  key={cert.name}
                  variants={fadeInUp}
                  className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 text-center hover:border-emerald-500/30 transition-colors duration-300"
                >
                  <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="text-white font-medium mb-2">{cert.name}</h3>
                  <p className="text-slate-400 text-sm">{cert.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
