import Image from "next/image";
import AnimateOnScroll from "./AnimateOnScroll";
import ChatButton from "./ChatButton";

const stats = [
  { value: "28+", label: "Years", sublabel: "Destination Expertise" },
  { value: "4", label: "Countries", sublabel: "Nepal \u00B7 India \u00B7 Bhutan \u00B7 Tibet" },
  { value: "500+", label: "Expeditions", sublabel: "Crafted" },
];

export default function FounderSection() {
  return (
    <section id="about" className="section-padding bg-luxury-cream overflow-hidden">
      <div className="container-luxury">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image side */}
          <AnimateOnScroll direction="left">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80"
                alt="Mountain expedition guide on a Himalayan trail"
                fill
                loading="lazy"
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-luxury-navy/30 to-transparent" />
            </div>
          </AnimateOnScroll>

          {/* Content side */}
          <div>
            <AnimateOnScroll staggerIndex={0}>
              <span className="inline-block text-luxury-gold text-sm font-medium tracking-[0.25em] uppercase mb-4">
                28 Years of Expertise
              </span>

              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-luxury-navy mb-6 leading-tight">
                Your Journey, Guided by Deep Destination Knowledge
              </h2>
            </AnimateOnScroll>

            <AnimateOnScroll staggerIndex={1}>
              <div className="space-y-4 mb-8">
                <p className="text-luxury-charcoal/80 leading-relaxed">
                  CuratedAscents was born from nearly three decades of walking the trails, negotiating the permits,
                  and building relationships with the finest local partners across the Himalayas and Indian subcontinent.
                </p>
                <p className="text-luxury-charcoal/80 leading-relaxed">
                  From luxury lodges in Bhutan&apos;s Paro Valley to heritage palaces in Rajasthan, from Everest Base
                  Camp to the monasteries of Lhasa — our expertise isn&apos;t from a brochure. It&apos;s from 28 years
                  of boots on the ground, combined with cutting-edge AI technology to craft your perfect expedition.
                </p>
              </div>
            </AnimateOnScroll>

            {/* Stats row */}
            <AnimateOnScroll staggerIndex={2}>
              <div className="grid grid-cols-3 gap-6 mb-8 py-6 border-y border-luxury-mist">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <p className="font-serif text-2xl sm:text-3xl font-bold text-luxury-navy">{stat.value}</p>
                    <p className="text-luxury-charcoal text-sm font-medium">{stat.label}</p>
                    <p className="text-luxury-charcoal/60 text-xs mt-0.5">{stat.sublabel}</p>
                  </div>
                ))}
              </div>
            </AnimateOnScroll>

            {/* CTA */}
            <AnimateOnScroll staggerIndex={3}>
              <ChatButton className="px-8 py-4 bg-luxury-gold text-luxury-navy font-medium rounded-full hover:bg-luxury-gold/90 transition-all duration-300 hover:shadow-lg hover:shadow-luxury-gold/25">
                Start a Conversation
              </ChatButton>
            </AnimateOnScroll>
          </div>
        </div>
      </div>
    </section>
  );
}
