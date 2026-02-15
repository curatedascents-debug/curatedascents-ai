import AnimateOnScroll from "./AnimateOnScroll";

const badges = [
  {
    title: "ASTA Member",
    description: "American Society of Travel Advisors",
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="18" cy="18" r="14" stroke="#C9A96E" strokeWidth="1.5"/>
        <path d="M18 7L21 14H28L22.5 18.5L24.5 26L18 22L11.5 26L13.5 18.5L8 14H15L18 7Z" stroke="#C9A96E" strokeWidth="1.5" strokeLinejoin="round"/>
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
