import Image from "next/image";
import AnimateOnScroll from "./AnimateOnScroll";
import ScrollLink from "./ScrollLink";

const partners = [
  "TUI",
  "SAGA Holidays",
  "Adventure World Australia",
  "Geographical Tours",
];

const destinations = [
  {
    name: "Nepal",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=200&q=80",
  },
  {
    name: "Bhutan",
    image: "https://images.unsplash.com/photo-1578556881786-851d4b79cb73?w=200&q=80",
  },
  {
    name: "Tibet",
    image: "https://images.unsplash.com/photo-1503641926155-5c17619b79d0?w=200&q=80",
  },
  {
    name: "India",
    image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=200&q=80",
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
          <div className="flex justify-center gap-8 sm:gap-12">
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
      </div>
    </section>
  );
}
