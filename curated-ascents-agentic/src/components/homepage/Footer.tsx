"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Mail, Phone, MapPin, Instagram, Facebook, Linkedin, Twitter } from "lucide-react";
import CuratedAscentsLogo from "@/components/icons/CuratedAscentsLogo";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { socialLinks } from "@/lib/constants/social-links";
import { useChatContext } from "./ChatContext";

const experienceLinks = [
  { label: "Everest Region", message: "Tell me about Everest Region trips" },
  { label: "Annapurna Circuit", message: "Tell me about Annapurna Circuit treks" },
  { label: "Bhutan Tours", message: "Tell me about luxury Bhutan tours" },
  { label: "Tibet Expeditions", message: "Tell me about Tibet expeditions" },
  { label: "Wildlife Safaris", message: "Tell me about wildlife safari experiences in India" },
];

const companyLinks = [
  { label: "About Us", href: "#about" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Press", href: "#press" },
  { label: "Careers", href: "mailto:careers@curatedascents.com" },
];

const supportLinks = [
  { label: "Contact Us", href: "/contact" },
  { label: "FAQs", href: "/faq" },
  { label: "Travel Insurance", href: "/faq#travel-insurance" },
  { label: "Visa Information", href: "/faq#visa-information" },
  { label: "Terms & Conditions", href: "/terms" },
];

const socialIconLinks = [
  { icon: Instagram, href: socialLinks.instagram, label: "Instagram" },
  { icon: Facebook, href: socialLinks.facebook, label: "Facebook" },
  { icon: Linkedin, href: socialLinks.linkedin, label: "LinkedIn" },
  { icon: Twitter, href: socialLinks.twitter, label: "Twitter" },
];

export default function Footer() {
  const { openChat } = useChatContext();

  return (
    <footer className="bg-luxury-navy border-t border-luxury-gold/10">
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
              <Link href="/" className="flex items-center gap-3 mb-1">
                <CuratedAscentsLogo className="text-luxury-gold" size={32} />
                <span className="text-xl font-serif font-bold text-white">
                  CuratedAscents
                </span>
              </Link>
              <p className="text-[10px] tracking-[0.2em] uppercase text-luxury-gold/60 mb-6 ml-[44px]">
                Beyond Boundaries, Beyond Ordinary
              </p>
              <p className="text-white/50 mb-6 max-w-sm">
                Crafting bespoke luxury adventures across the Himalayas since 1996.
                Where every journey is a masterpiece.
              </p>

              {/* Contact Info */}
              <div className="space-y-3">
                <a
                  href="mailto:hello@curatedascents.com"
                  className="flex items-center gap-3 text-white/50 hover:text-luxury-gold transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  <span>hello@curatedascents.com</span>
                </a>
                <a
                  href="tel:+17155054964"
                  className="flex items-center gap-3 text-white/50 hover:text-luxury-gold transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  <span>+1-715-505-4964</span>
                </a>
                <div className="flex items-start gap-3 text-white/50">
                  <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>4498 Voyageur Way, Carmel, IN 46074, USA</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex gap-4 mt-6">
                {socialIconLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full border border-luxury-gold/20 flex items-center justify-center text-white/40 hover:text-luxury-gold hover:border-luxury-gold/50 transition-colors"
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
                {experienceLinks.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => openChat(link.message)}
                      className="text-white/50 hover:text-luxury-gold transition-colors text-sm text-left"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Company Column */}
            <motion.div variants={fadeInUp}>
              <h3 className="text-white font-medium mb-4">Company</h3>
              <ul className="space-y-3">
                {companyLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-white/50 hover:text-luxury-gold transition-colors text-sm"
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
                {supportLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-white/50 hover:text-luxury-gold transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-luxury-gold/10">
        <div className="container-luxury px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-white/30 text-sm">
              &copy; {new Date().getFullYear()} CuratedAscents. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="/privacy-policy" className="text-white/30 hover:text-white/60 text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-white/30 hover:text-white/60 text-sm transition-colors">
                Terms of Service
              </Link>
              <Link href="/privacy-policy#cookies" className="text-white/30 hover:text-white/60 text-sm transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
