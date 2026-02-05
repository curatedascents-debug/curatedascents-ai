"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mountain, Menu, X } from "lucide-react";
import { navSlideIn, mobileMenuVariants, fadeInUp } from "@/lib/animations";

interface NavigationProps {
  onChatOpen: () => void;
}

const navLinks = [
  { label: "Experiences", href: "#experiences" },
  { label: "Destinations", href: "#destinations" },
  { label: "Blog", href: "/blog", isExternal: true },
  { label: "About", href: "#about" },
];

export default function Navigation({ onChatOpen }: NavigationProps) {
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
            ? "bg-slate-900/95 backdrop-blur-md border-b border-slate-800/50 py-4"
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
              <Mountain className="w-8 h-8 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
              <span className="text-xl font-serif font-bold text-white">
                CuratedAscents
              </span>
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) =>
                link.isExternal ? (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-slate-300 hover:text-white transition-colors link-underline"
                  >
                    {link.label}
                  </a>
                ) : (
                  <button
                    key={link.label}
                    onClick={() => scrollToSection(link.href)}
                    className="text-slate-300 hover:text-white transition-colors link-underline"
                  >
                    {link.label}
                  </button>
                )
              )}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden md:block">
              <button
                onClick={onChatOpen}
                className="btn-primary text-sm"
              >
                Plan Your Journey
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-white hover:text-emerald-400 transition-colors"
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
              className="fixed top-0 right-0 bottom-0 w-80 bg-slate-900 z-50 md:hidden border-l border-slate-800"
            >
              <div className="flex flex-col h-full p-6">
                {/* Close Button */}
                <div className="flex justify-end mb-8">
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 text-slate-400 hover:text-white transition-colors"
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
                        className="text-left text-2xl font-serif text-white hover:text-emerald-400 transition-colors py-2"
                      >
                        {link.label}
                      </motion.a>
                    ) : (
                      <motion.button
                        key={link.label}
                        variants={fadeInUp}
                        onClick={() => scrollToSection(link.href)}
                        className="text-left text-2xl font-serif text-white hover:text-emerald-400 transition-colors py-2"
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
                      onChatOpen();
                    }}
                    className="btn-primary w-full"
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
