import Image from "next/image";
import AnimateOnScroll from "./AnimateOnScroll";
import ScrollLink from "./ScrollLink";

const trustBadges = [
  {
    label: "Stripe Secured Payments",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="8" width="24" height="16" rx="2" stroke="#C9A96E" strokeWidth="1.5"/>
        <path d="M4 13H28" stroke="#C9A96E" strokeWidth="1.5"/>
        <path d="M12 20L14.5 17L17 20" stroke="#C9A96E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="22" cy="19" r="2" stroke="#C9A96E" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    label: "24/7 Support",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="11" stroke="#C9A96E" strokeWidth="1.5"/>
        <path d="M16 9V16L20 20" stroke="#C9A96E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="16" cy="16" r="2" fill="#C9A96E" fillOpacity="0.3"/>
      </svg>
    ),
  },
  {
    label: "Verified Business",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 4L27 9V16C27 22.5 22.5 27.5 16 29.5C9.5 27.5 5 22.5 5 16V9L16 4Z" stroke="#C9A96E" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M11 16L14.5 19.5L21 13" stroke="#C9A96E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label: "28+ Years Experience",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 26L16 6L26 26H6Z" stroke="#C9A96E" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M11 26L16 16L21 26" stroke="#C9A96E" strokeWidth="1.5" strokeLinejoin="round"/>
        <line x1="16" y1="16" x2="16" y2="6" stroke="#C9A96E" strokeWidth="1.5"/>
      </svg>
    ),
  },
];

const partners = [
  "TUI",
  "SAGA Holidays",
  "Adventure World Australia",
  "Geographical Tours",
];

const destinations = [
  {
    name: "Nepal",
    image: "/uploads/media/nepal/landscape/everest-region5-4c22ff59-thumb.webp",
  },
  {
    name: "Bhutan",
    image: "/uploads/media/bhutan/landscape/bhutan-taktsang-monastery2-1d1a0917-thumb.webp",
  },
  {
    name: "Tibet",
    image: "/uploads/media/tibet/landscape/lhasa-potala-palace-47dd9d03-thumb.webp",
  },
  {
    name: "India",
    image: "/uploads/media/india/landscape/udaipur-rajasthan-india-17d99ac2-thumb.webp",
  },
];

export default function TrustStrip() {
  return (
    <section id="press" className="section-padding bg-luxury-cream py-12 sm:py-16">
      <div className="container-luxury">
        {/* Partner strip */}
        <AnimateOnScroll>
          <div className="text-center mb-10">
            <p className="text-luxury-charcoal/50 text-sm mb-4">
              Trusted by discerning travelers &middot; Expertise forged with
            </p>
            <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-3">
              {partners.map((partner) => (
                <span
                  key={partner}
                  className="font-serif text-lg text-luxury-charcoal/40 hover:text-luxury-charcoal/70 transition-colors cursor-default"
                >
                  {partner}
                </span>
              ))}
            </div>
          </div>
        </AnimateOnScroll>

        {/* Divider */}
        <div className="section-divider mb-10" />

        {/* Featured destinations row */}
        <AnimateOnScroll staggerIndex={1}>
          <p className="text-center text-luxury-charcoal/50 text-sm mb-6">
            Featured Destinations
          </p>
          <div className="flex justify-center gap-6 sm:gap-12">
            {destinations.map((dest) => (
              <ScrollLink
                key={dest.name}
                targetId="signature-journeys"
                className="flex flex-col items-center gap-2 group"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-luxury-mist group-hover:border-luxury-gold transition-colors">
                  <Image
                    src={dest.image}
                    alt={dest.name}
                    width={80}
                    height={80}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-xs sm:text-sm text-luxury-charcoal/60 group-hover:text-luxury-charcoal transition-colors">
                  {dest.name}
                </span>
              </ScrollLink>
            ))}
          </div>
        </AnimateOnScroll>

        {/* Divider */}
        <div className="section-divider my-10" />

        {/* Trust badges row */}
        <AnimateOnScroll staggerIndex={2}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {trustBadges.map((badge) => (
              <div
                key={badge.label}
                className="flex flex-col items-center gap-3 text-center"
              >
                <div className="w-14 h-14 rounded-full border border-luxury-gold/20 flex items-center justify-center bg-white/60">
                  {badge.icon}
                </div>
                <span className="text-xs text-luxury-charcoal/60 font-medium">
                  {badge.label}
                </span>
              </div>
            ))}
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
