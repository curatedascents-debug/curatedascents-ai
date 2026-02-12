import AnimateOnScroll from "./AnimateOnScroll";

const steps = [
  {
    number: "01",
    title: "Share Your Vision",
    description:
      "Tell our AI Expedition Architect exactly what inspires you — from Himalayan treks to palace stays, spiritual retreats to tiger safaris.",
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 28C8 28 10 26 20 26C30 26 32 28 32 28V8C32 8 30 10 20 10C10 10 8 8 8 8V28Z" stroke="#C9A96E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8 28V34" stroke="#C9A96E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="20" cy="18" r="4" stroke="#C9A96E" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    number: "02",
    title: "We Craft Your Expedition",
    description:
      "Our AI searches across 10+ service categories — hotels, guides, transport, permits — and builds a bespoke quote tailored to your preferences.",
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="14" stroke="#C9A96E" strokeWidth="1.5"/>
        <path d="M20 8L22 18L32 20L22 22L20 32L18 22L8 20L18 18L20 8Z" stroke="#C9A96E" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    number: "03",
    title: "Travel Extraordinarily",
    description:
      "Every detail managed. Permits, private guides, luxury lodges, helicopter transfers — all coordinated for a seamless, unforgettable experience.",
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 32L20 8L34 32H6Z" stroke="#C9A96E" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M13 32L20 18L27 32" stroke="#C9A96E" strokeWidth="1.5" strokeLinejoin="round"/>
        <line x1="20" y1="18" x2="20" y2="8" stroke="#C9A96E" strokeWidth="1.5"/>
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section className="section-padding bg-luxury-cream">
      <div className="container-luxury">
        {/* Section header */}
        <AnimateOnScroll>
          <div className="text-center mb-16">
            <span className="inline-block text-luxury-gold text-sm font-medium tracking-[0.25em] uppercase mb-4">
              Your Journey Begins Here
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-luxury-navy">
              Three Steps to an Extraordinary Expedition
            </h2>
          </div>
        </AnimateOnScroll>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <AnimateOnScroll key={step.number} staggerIndex={index}>
              <div className="text-center">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 rounded-full border border-luxury-gold/30 flex items-center justify-center bg-white/60">
                    {step.icon}
                  </div>
                </div>

                {/* Step number */}
                <span className="inline-block text-luxury-gold text-sm font-medium tracking-wider mb-3">
                  Step {step.number}
                </span>

                {/* Title */}
                <h3 className="font-serif text-xl font-bold text-luxury-navy mb-3">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-luxury-charcoal/70 leading-relaxed max-w-sm mx-auto">
                  {step.description}
                </p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
