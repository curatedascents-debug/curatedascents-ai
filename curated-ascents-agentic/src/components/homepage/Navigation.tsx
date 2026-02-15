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
  { label: "Destinations", href: "#destinations" },
  { label: "Blog", href: "/blog", isExternal: true },
  { label: "About", href: "#about" },
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
              href="#"
              className="flex items-center gap-3 group"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              <CuratedAscentsLogo className="text-luxury-gold group-hover:text-luxury-gold/80 transition-colors" size={32} />
              <div>
                <span className="text-xl font-serif font-bold text-white">
                  CuratedAscents
                </span>
                <span className="hidden sm:block text-[10px] tracking-[0.2em] uppercase text-luxury-gold/60 -mt-0.5">
                  Beyond Boundaries, Beyond Ordinary
                </span>
              </div>
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) =>
                link.isExternal ? (
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
            <div className="flex items-center gap-2 md:hidden">
              <a
                href="tel:+17155054964"
                className="p-2 text-white/70 hover:text-luxury-gold transition-colors"
                aria-label="Call us"
              >
                <Phone className="w-5 h-5" />
              </a>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-white hover:text-luxury-gold transition-colors"
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
              className="fixed top-0 right-0 bottom-0 w-80 bg-luxury-navy z-50 md:hidden border-l border-luxury-gold/10"
            >
              <div className="flex flex-col h-full p-6">
                {/* Close Button */}
                <div className="flex justify-end mb-8">
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 text-white/60 hover:text-white transition-colors"
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
                  className="flex flex-col gap-4"
                >
                  {navLinks.map((link) =>
                    link.isExternal ? (
                      <motion.a
                        key={link.label}
                        variants={fadeInUp}
                        href={link.href}
                        className="text-left text-2xl font-serif text-white hover:text-luxury-gold transition-colors py-2"
                      >
                        {link.label}
                      </motion.a>
                    ) : (
                      <motion.button
                        key={link.label}
                        variants={fadeInUp}
                        onClick={() => scrollToSection(link.href)}
                        className="text-left text-2xl font-serif text-white hover:text-luxury-gold transition-colors py-2"
                      >
                        {link.label}
                      </motion.button>
                    )
                  )}
                </motion.nav>

                {/* Mobile CTA */}
                <motion.div
                  variants={fadeInUp}
                  className="mt-auto"
                >
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      openChat();
                    }}
                    className="w-full px-8 py-4 bg-luxury-gold text-luxury-navy font-medium rounded-full hover:bg-luxury-gold/90 transition-all duration-300"
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
