import Image from "next/image";
import { Linkedin } from "lucide-react";
import AnimateOnScroll from "./AnimateOnScroll";
import ChatButton from "./ChatButton";

const stats = [
  { value: "29+", label: "Years in Himalayan Travel" },
  { value: "4", label: "Countries Mastered" },
  { value: "15+", label: "Years Enterprise Tech" },
  { value: "2", label: "Travel Companies Founded" },
];

export default function FounderSection() {
  return (
    <section id="about" className="section-padding bg-luxury-cream overflow-hidden">
      <div className="container-luxury">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-start">
          {/* Left column — Photo + Name */}
          <AnimateOnScroll direction="left" className="lg:col-span-2">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-luxury-gold/20">
              <Image
                src="/uploads/media/nepal/landscape/everest-region-everest-view-hotel-eed54c67.webp"
                alt="Kiran Pokhrel — Founder of CuratedAscents"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 40vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-luxury-navy/60 via-transparent to-transparent" />
            </div>
            <div className="mt-6 text-center lg:text-left">
              <h3 className="font-serif text-2xl font-bold text-luxury-navy">
                Kiran Pokhrel
              </h3>
              <p className="text-luxury-charcoal/60 text-sm mt-1">
                Founder &amp; Expedition Architect
              </p>
              <a
                href="https://www.linkedin.com/in/kiranpokhrel"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-3 text-luxury-gold hover:text-luxury-gold/80 transition-colors text-sm"
              >
                <Linkedin className="w-4 h-4" />
                <span>Connect on LinkedIn</span>
              </a>
            </div>
          </AnimateOnScroll>

          {/* Right column — Bio */}
          <div className="lg:col-span-3">
            <AnimateOnScroll staggerIndex={0}>
              <span className="inline-block text-luxury-gold text-sm font-medium tracking-[0.25em] uppercase mb-4">
                The Person Behind The Platform
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-luxury-navy mb-8 leading-tight">
                29 Years of Himalayan Mastery
              </h2>
            </AnimateOnScroll>

            <AnimateOnScroll staggerIndex={1}>
              <div className="space-y-5 mb-10">
                <p className="text-luxury-charcoal/80 leading-relaxed">
                  My first Himalayan journey was in 1996. Not as a tourist with a checklist, but as
                  someone who fell irreversibly in love with a landscape that humbles everyone who
                  enters it. In the three decades since, I&apos;ve built relationships with local
                  communities, vetted every lodge and guide personally, and developed an intimate
                  understanding of what makes each region extraordinary. Nepal, Bhutan, Tibet, and
                  India are not destinations I sell — they are places I know deeply.
                </p>
                <p className="text-luxury-charcoal/80 leading-relaxed">
                  But knowing a place deeply isn&apos;t enough. After founding two Nepal-based travel
                  companies — E-tour Channel (2008) and Nepal Adventure Trail (2022) — I spent 15
                  years in enterprise IT consulting, delivering complex technology solutions for
                  Expedia, United Airlines, American Airlines, Travelport, Hilton, and American
                  Express Global Business Travel. I saw firsthand how luxury travel was held back by
                  outdated systems: travellers waiting days for quotes, agents manually searching
                  fragmented supplier inventories, pricing that couldn&apos;t adapt to real-time demand.
                </p>
                <p className="text-luxury-charcoal/80 leading-relaxed">
                  CuratedAscents exists because I refused to accept that trade-off. I built an
                  AI-powered Expedition Architect that searches across 10 service types and builds
                  personalised quotes in minutes, not days. But behind every algorithm is three
                  decades of knowing which helicopter pilot is safest in the Khumbu, which Bhutanese
                  guide brings history alive at Tiger&apos;s Nest, and which Ladakhi homestay will
                  change the way you see the world. Technology makes us fast. Expertise makes us right.
                </p>
              </div>
            </AnimateOnScroll>

            {/* Stats row */}
            <AnimateOnScroll staggerIndex={2}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 py-6 border-y border-luxury-mist mb-8">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <p className="font-serif text-2xl sm:text-3xl font-bold text-luxury-navy">
                      {stat.value}
                    </p>
                    <p className="text-luxury-charcoal/60 text-sm mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </AnimateOnScroll>

            {/* CTA */}
            <AnimateOnScroll staggerIndex={3}>
              <div className="flex flex-wrap items-center gap-4">
                <ChatButton className="px-8 py-4 bg-luxury-gold text-luxury-navy font-medium rounded-full hover:bg-luxury-gold/90 transition-all duration-300 hover:shadow-lg hover:shadow-luxury-gold/25">
                  Start a Conversation
                </ChatButton>
                <a
                  href="/about"
                  className="px-8 py-4 border border-luxury-navy/20 text-luxury-navy font-medium rounded-full hover:border-luxury-navy/40 transition-all duration-300 text-sm"
                >
                  Read the Full Story
                </a>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </div>
    </section>
  );
}
