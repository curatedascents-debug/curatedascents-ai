"use client";

import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Instagram, Facebook, Linkedin, Twitter } from "lucide-react";
import CuratedAscentsLogo from "@/components/icons/CuratedAscentsLogo";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const footerLinks = {
  experiences: [
    { label: "Everest Region", href: "#" },
    { label: "Annapurna Circuit", href: "#" },
    { label: "Bhutan Tours", href: "#" },
    { label: "Tibet Expeditions", href: "#" },
    { label: "Wildlife Safaris", href: "#" },
  ],
  company: [
    { label: "About Us", href: "#about" },
    { label: "Our Team", href: "#" },
    { label: "Testimonials", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Press", href: "#" },
  ],
  support: [
    { label: "Contact Us", href: "#" },
    { label: "FAQs", href: "#" },
    { label: "Travel Insurance", href: "#" },
    { label: "Visa Information", href: "#" },
    { label: "Terms & Conditions", href: "#" },
  ],
};

const socialLinks = [
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Twitter, href: "#", label: "Twitter" },
];

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800">
      {/* Main Footer */}
      <div className="section-padding pb-12">
        <div className="container-luxury">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12"
          >
            {/* Brand Column */}
            <motion.div variants={fadeInUp} className="lg:col-span-2">
              <a href="#" className="flex items-center gap-3 mb-6">
                <CuratedAscentsLogo className="text-emerald-400" size={32} />
                <span className="text-xl font-serif font-bold text-white">
                  CuratedAscents
                </span>
              </a>
              <p className="text-slate-400 mb-6 max-w-sm">
                Crafting bespoke luxury adventures across the Himalayas since 1996.
                Where every journey is a masterpiece.
              </p>

              {/* Contact Info */}
              <div className="space-y-3">
                <a
                  href="mailto:hello@curatedascents.com"
                  className="flex items-center gap-3 text-slate-400 hover:text-emerald-400 transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  <span>hello@curatedascents.com</span>
                </a>
                <a
                  href="tel:+9771234567890"
                  className="flex items-center gap-3 text-slate-400 hover:text-emerald-400 transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  <span>+977 1 234 567 890</span>
                </a>
                <div className="flex items-start gap-3 text-slate-400">
                  <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>Thamel, Kathmandu, Nepal</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex gap-4 mt-6">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    className="w-10 h-10 rounded-full border border-slate-700 flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:border-emerald-400 transition-colors"
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </motion.div>

            {/* Experiences Column */}
            <motion.div variants={fadeInUp}>
              <h3 className="text-white font-medium mb-4">Experiences</h3>
              <ul className="space-y-3">
                {footerLinks.experiences.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-slate-400 hover:text-emerald-400 transition-colors text-sm"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Company Column */}
            <motion.div variants={fadeInUp}>
              <h3 className="text-white font-medium mb-4">Company</h3>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-slate-400 hover:text-emerald-400 transition-colors text-sm"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Support Column */}
            <motion.div variants={fadeInUp}>
              <h3 className="text-white font-medium mb-4">Support</h3>
              <ul className="space-y-3">
                {footerLinks.support.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-slate-400 hover:text-emerald-400 transition-colors text-sm"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="container-luxury px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">
              &copy; {new Date().getFullYear()} CuratedAscents. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
