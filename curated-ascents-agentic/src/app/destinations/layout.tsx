"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Phone, Menu, X } from "lucide-react";
import CuratedAscentsLogo from "@/components/icons/CuratedAscentsLogo";

const navLinks = [
  { label: "Journeys", href: "/#signature-journeys" },
  { label: "Itineraries", href: "/itineraries" },
  { label: "Destinations", href: "/destinations" },
  { label: "Blog", href: "/blog" },
];

export default function DestinationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-luxury-navy/95 backdrop-blur-md border-b border-luxury-gold/10 py-4"
            : "bg-luxury-navy py-6"
        }`}
      >
        <div className="container-luxury px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <CuratedAscentsLogo className="text-luxury-gold group-hover:text-luxury-gold/80 transition-colors" size={32} />
              <div>
                <span className="text-xl font-serif font-bold text-white">
                  CuratedAscents
                </span>
                <span className="hidden sm:block text-[10px] tracking-[0.2em] uppercase text-luxury-gold/60 -mt-0.5">
                  Beyond Boundaries, Beyond Ordinary
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`text-white/70 hover:text-white transition-colors link-underline ${
                    link.href === "/destinations" ? "text-white font-medium" : ""
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-4">
              <a
                href="tel:+17155054964"
                className="flex items-center gap-2 text-white/70 hover:text-luxury-gold transition-colors text-sm"
              >
                <Phone className="w-4 h-4" />
                <span className="hidden lg:inline">+1-715-505-4964</span>
              </a>
              <Link
                href="/"
                className="px-6 py-2.5 bg-luxury-gold text-luxury-navy text-sm font-medium rounded-full hover:bg-luxury-gold/90 transition-all duration-300"
              >
                Plan Your Journey
              </Link>
            </div>

            {/* Mobile */}
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
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed top-0 right-0 bottom-0 w-80 bg-luxury-navy z-50 md:hidden border-l border-luxury-gold/10">
            <div className="flex flex-col h-full p-6">
              <div className="flex justify-end mb-8">
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <nav className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-2xl font-serif text-white hover:text-luxury-gold transition-colors py-2"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-auto">
                <Link
                  href="/"
                  className="block w-full px-8 py-4 bg-luxury-gold text-luxury-navy font-medium rounded-full hover:bg-luxury-gold/90 transition-all duration-300 text-center"
                >
                  Plan Your Journey
                </Link>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Page Content */}
      {children}

      {/* Footer */}
      <footer className="bg-luxury-navy border-t border-luxury-gold/10">
        <div className="container-luxury px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-3 mb-1">
                <CuratedAscentsLogo className="text-luxury-gold" size={32} />
                <span className="text-xl font-serif font-bold text-white">
                  CuratedAscents
                </span>
              </Link>
              <p className="text-[10px] tracking-[0.2em] uppercase text-luxury-gold/60 mb-4 ml-[44px]">
                Beyond Boundaries, Beyond Ordinary
              </p>
              <p className="text-white/50 text-sm max-w-sm">
                Crafting bespoke luxury adventures across the Himalayas since 1996.
              </p>
            </div>

            <div>
              <h3 className="text-white font-medium mb-4">Destinations</h3>
              <ul className="space-y-3">
                <li><Link href="/destinations/nepal" className="text-white/50 hover:text-luxury-gold transition-colors text-sm">Nepal</Link></li>
                <li><Link href="/destinations/bhutan" className="text-white/50 hover:text-luxury-gold transition-colors text-sm">Bhutan</Link></li>
                <li><Link href="/destinations/tibet" className="text-white/50 hover:text-luxury-gold transition-colors text-sm">Tibet</Link></li>
                <li><Link href="/destinations/india" className="text-white/50 hover:text-luxury-gold transition-colors text-sm">India</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-medium mb-4">Support</h3>
              <ul className="space-y-3">
                <li><Link href="/contact" className="text-white/50 hover:text-luxury-gold transition-colors text-sm">Contact Us</Link></li>
                <li><Link href="/faq" className="text-white/50 hover:text-luxury-gold transition-colors text-sm">FAQs</Link></li>
                <li><Link href="/terms" className="text-white/50 hover:text-luxury-gold transition-colors text-sm">Terms & Conditions</Link></li>
                <li><Link href="/privacy-policy" className="text-white/50 hover:text-luxury-gold transition-colors text-sm">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-luxury-gold/10">
          <div className="container-luxury px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-white/30 text-sm">
                &copy; {new Date().getFullYear()} CuratedAscents. All rights reserved.
              </p>
              <div className="flex gap-6">
                <Link href="/privacy-policy" className="text-white/30 hover:text-white/60 text-sm transition-colors">Privacy Policy</Link>
                <Link href="/terms" className="text-white/30 hover:text-white/60 text-sm transition-colors">Terms of Service</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
