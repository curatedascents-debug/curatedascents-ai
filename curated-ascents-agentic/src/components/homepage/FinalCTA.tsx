import Image from "next/image";
import AnimateOnScroll from "./AnimateOnScroll";
import ChatButton from "./ChatButton";

export default function FinalCTA() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80"
          alt="Dramatic mountain landscape"
          fill
          loading="lazy"
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-luxury-navy/75" />
      </div>

      {/* Content — centered */}
      <div className="relative z-10 container-luxury px-4 sm:px-6 lg:px-8 text-center">
        <AnimateOnScroll>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Your Extraordinary Journey Awaits
          </h2>
        </AnimateOnScroll>
        <AnimateOnScroll staggerIndex={1}>
          <p className="text-luxury-cream/70 text-lg max-w-xl mx-auto mb-10">
            Speak with our AI Expedition Architect and let us craft a journey as unique as you are.
          </p>
        </AnimateOnScroll>
        <AnimateOnScroll staggerIndex={2}>
          <ChatButton className="px-10 py-4 bg-luxury-gold text-luxury-navy font-medium rounded-full hover:bg-luxury-gold/90 transition-all duration-300 hover:shadow-lg hover:shadow-luxury-gold/25">
            Begin Planning Now
          </ChatButton>
          <p className="text-luxury-cream/40 text-sm mt-6">
            Or call us: +1-715-505-4964
          </p>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
