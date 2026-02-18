"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone } from "lucide-react";
import CuratedAscentsLogo from "@/components/icons/CuratedAscentsLogo";
import { navSlideIn, mobileMenuVariants, fadeInUp } from "@/lib/animations";
import { useChatContext } from "./ChatContext";

const navLinks = [
  { label: "Journeys", href: "#signature-journeys" },
  { label: "Itineraries", href: "/itineraries", isExternal: true },
  { label: "Destinations", href: "/destinations", isExternal: true, hasDropdown: true },
  { label: "Blog", href: "/blog", isExternal: true },
  { label: "About", href: "/about", isExternal: true },
];

const destinationDropdown = [
  {
    country: "Nepal",
    slug: "nepal",
    subRegions: [
      { name: "Kathmandu Valley", slug: "kathmandu" },
      { name: "Everest Region", slug: "everest-region" },
      { name: "Annapurna", slug: "annapurna" },
      { name: "Chitwan", slug: "chitwan" },
      { name: "Pokhara", slug: "pokhara" },
      { name: "Upper Mustang", slug: "upper-mustang" },
    ],
  },
  {
    country: "Bhutan",
    slug: "bhutan",
    subRegions: [
      { name: "Paro Valley", slug: "paro-valley" },
      { name: "Thimphu", slug: "thimphu" },
      { name: "Punakha", slug: "punakha" },
    ],
  },
  {
    country: "India",
    slug: "india",
    subRegions: [
      { name: "Ladakh", slug: "ladakh" },
      { name: "Sikkim", slug: "sikkim" },
      { name: "Darjeeling", slug: "darjeeling" },
      { name: "Rajasthan", slug: "rajasthan" },
      { name: "Kerala", slug: "kerala" },
    ],
  },
  {
    country: "Tibet",
    slug: "tibet",
    subRegions: [
      { name: "Lhasa", slug: "lhasa" },
      { name: "Everest North Face", slug: "everest-north-face" },
    ],
  },
];

export default function Navigation() {
  const { openChat } = useChatContext();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    setIsMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <motion.header
        variants={navSlideIn}
        initial="hidden"
        animate="visible"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-luxury-navy/95 backdrop-blur-md border-b border-luxury-gold/10 py-4"
            : "bg-transparent py-6"
        }`}
      >
        <div className="container-luxury px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a
              href="/"
              className="flex items-center gap-3 group"
            >
              <CuratedAscentsLogo className="text-luxury-gold group-hover:text-luxury-gold/80 transition-colors" size={32} />
              <div>
                <span className="text-xl font-serif font-bold text-white">
                  CuratedAscents
                </span>
                <span
                  className="hidden sm:block text-[10px] tracking-[0.2em] uppercase text-luxury-gold/70 -mt-0.5"
                  style={{ textShadow: "0 1px 3px rgba(15, 27, 45, 0.8)" }}
                >
                  Beyond Boundaries, Beyond Ordinary
                </span>
              </div>
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) =>
                link.hasDropdown ? (
                  <div key={link.label} className="relative group/dest">
                    <a
                      href={link.href}
                      className="text-white/70 hover:text-white transition-colors link-underline"
                    >
                      {link.label}
                    </a>
                    {/* Dropdown */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 opacity-0 invisible group-hover/dest:opacity-100 group-hover/dest:visible transition-all duration-200 z-50">
                      <div className="bg-luxury-navy/95 backdrop-blur-md border border-luxury-gold/10 rounded-xl shadow-2xl p-6 min-w-[480px]">
                        <div className="grid grid-cols-4 gap-6">
                          {destinationDropdown.map((group) => (
                            <div key={group.slug}>
                              <a
                                href={`/destinations/${group.slug}`}
                                className="text-luxury-gold text-xs font-semibold tracking-[0.15em] uppercase hover:text-luxury-gold/80 transition-colors"
                              >
                                {group.country}
                              </a>
                              <ul className="mt-2 space-y-1.5">
                                {group.subRegions.map((sr) => (
                                  <li key={sr.slug}>
                                    <a
                                      href={`/destinations/${group.slug}/${sr.slug}`}
                                      className="text-sm text-white/60 hover:text-white transition-colors block py-0.5"
                                    >
                                      {sr.name}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 pt-3 border-t border-luxury-gold/10">
                          <a
                            href="/destinations"
                            className="text-xs text-luxury-gold/60 hover:text-luxury-gold transition-colors"
                          >
                            View All Destinations &rarr;
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : link.isExternal ? (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-white/70 hover:text-white transition-colors link-underline"
                  >
                    {link.label}
                  </a>
                ) : (
                  <button
                    key={link.label}
                    onClick={() => scrollToSection(link.href)}
                    className="text-white/70 hover:text-white transition-colors link-underline"
                  >
                    {link.label}
                  </button>
                )
              )}
            </nav>

            {/* Desktop Phone + CTA */}
            <div className="hidden md:flex items-center gap-4">
              <a
                href="tel:+17155054964"
                className="flex items-center gap-2 text-white/70 hover:text-luxury-gold transition-colors text-sm"
              >
                <Phone className="w-4 h-4" />
                <span className="hidden lg:inline">+1-715-505-4964</span>
              </a>
              <button
                onClick={() => openChat()}
                className="px-6 py-2.5 bg-luxury-gold text-luxury-navy text-sm font-medium rounded-full hover:bg-luxury-gold/90 transition-all duration-300"
              >
                Plan Your Journey
              </button>
            </div>

            {/* Mobile Phone + Menu */}
            <div className="flex items-center gap-1 md:hidden">
              <a
                href="tel:+17155054964"
                className="w-11 h-11 flex items-center justify-center text-white/70 hover:text-luxury-gold transition-colors"
                aria-label="Call us"
              >
                <Phone className="w-5 h-5" />
              </a>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="w-11 h-11 flex items-center justify-center text-white hover:text-luxury-gold transition-colors"
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              variants={mobileMenuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-luxury-navy z-50 md:hidden border-l border-luxury-gold/10 overflow-y-auto"
            >
              <div className="flex flex-col h-full p-6">
                {/* Close Button */}
                <div className="flex justify-end mb-8">
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-11 h-11 flex items-center justify-center text-white/60 hover:text-white transition-colors -mr-2"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Mobile Links */}
                <motion.nav
                  variants={{
                    open: {
                      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
                    },
                    closed: {},
                  }}
                  className="flex flex-col gap-2"
                >
                  {navLinks.map((link) =>
                    link.isExternal ? (
                      <motion.a
                        key={link.label}
                        variants={fadeInUp}
                        href={link.href}
                        className="text-left text-2xl font-serif text-white hover:text-luxury-gold transition-colors py-3 min-h-[44px]"
                      >
                        {link.label}
                      </motion.a>
                    ) : (
                      <motion.button
                        key={link.label}
                        variants={fadeInUp}
                        onClick={() => scrollToSection(link.href)}
                        className="text-left text-2xl font-serif text-white hover:text-luxury-gold transition-colors py-3 min-h-[44px]"
                      >
                        {link.label}
                      </motion.button>
                    )
                  )}
                </motion.nav>

                {/* Phone number */}
                <motion.div variants={fadeInUp} className="mt-8">
                  <a
                    href="tel:+17155054964"
                    className="flex items-center gap-3 text-white/70 hover:text-luxury-gold transition-colors py-3 min-h-[44px]"
                  >
                    <Phone className="w-5 h-5" />
                    <span className="text-sm">+1-715-505-4964</span>
                  </a>
                </motion.div>

                {/* Mobile CTA */}
                <motion.div
                  variants={fadeInUp}
                  className="mt-auto pt-6"
                >
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      openChat();
                    }}
                    className="w-full px-8 py-4 min-h-[48px] bg-luxury-gold text-luxury-navy font-medium rounded-full hover:bg-luxury-gold/90 transition-all duration-300"
                  >
                    Plan Your Journey
                  </button>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
