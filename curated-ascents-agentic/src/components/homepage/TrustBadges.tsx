import AnimateOnScroll from "./AnimateOnScroll";

const badges = [
  {
    title: "29 Years Experience",
    description: "Himalayan expertise since 1996",
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 28L18 8L28 28H8Z" stroke="#C9A96E" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M13 28L18 18L23 28" stroke="#C9A96E" strokeWidth="1.5" strokeLinejoin="round"/>
        <line x1="18" y1="18" x2="18" y2="8" stroke="#C9A96E" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    title: "Verified Business",
    description: "Licensed & insured travel operator",
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 4L30 10V18C30 25 25 30 18 32C11 30 6 25 6 18V10L18 4Z" stroke="#C9A96E" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M13 18L16.5 21.5L23 15" stroke="#C9A96E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    title: "Stripe Secured",
    description: "PCI-compliant payment processing",
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="5" y="11" width="26" height="15" rx="2" stroke="#C9A96E" strokeWidth="1.5"/>
        <path d="M5 16H31" stroke="#C9A96E" strokeWidth="1.5"/>
        <path d="M18 8V11" stroke="#C9A96E" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="18" cy="6" r="2" stroke="#C9A96E" strokeWidth="1.5"/>
        <path d="M13 8.5L18 11L23 8.5" stroke="#C9A96E" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export default function TrustBadges() {
  return (
    <section className="py-12 sm:py-16 bg-luxury-cream border-t border-luxury-gold/10">
      <div className="container-luxury">
        <AnimateOnScroll>
          <div className="text-center mb-10">
            <span className="inline-block text-luxury-gold text-sm font-medium tracking-[0.25em] uppercase mb-3">
              Your Confidence, Our Commitment
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-luxury-navy">
              Trusted Industry Credentials
            </h2>
          </div>
        </AnimateOnScroll>

        <AnimateOnScroll staggerIndex={1}>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-8 sm:gap-16">
            {badges.map((badge) => (
              <div
                key={badge.title}
                className="flex flex-col items-center text-center max-w-[200px]"
              >
                <div className="w-16 h-16 rounded-full border border-luxury-gold/30 flex items-center justify-center bg-white/60 mb-3">
                  {badge.icon}
                </div>
                <h3 className="font-serif text-lg font-semibold text-luxury-navy mb-1">
                  {badge.title}
                </h3>
                <p className="text-luxury-charcoal/50 text-xs">
                  {badge.description}
                </p>
              </div>
            ))}
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
