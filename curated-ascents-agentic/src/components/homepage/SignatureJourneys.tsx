import Image from "next/image";
import Link from "next/link";
import AnimateOnScroll from "./AnimateOnScroll";
import ChatButton from "./ChatButton";

const journeys = [
  {
    id: "nepal",
    title: "The Himalayan Crown",
    subtitle: "14 Days — Nepal",
    description:
      "From the temples of Kathmandu to Everest Base Camp by helicopter. Private lodges, personal sherpa guides, and summit sunrises.",
    price: "From $4,500 per person",
    itinerarySlug: "14-day-nepal-luxury-expedition",
    image: "/uploads/media/nepal/landscape/everest-region5-4c22ff59.webp",
    alt: "Everest region mountain landscape in Nepal",
    country: "Nepal",
  },
  {
    id: "bhutan",
    title: "The Last Kingdom",
    subtitle: "10 Days — Bhutan",
    description:
      "Tiger's Nest monastery, sacred festivals, luxury Amankora lodges, and private audiences with local hosts.",
    price: "From $6,200 per person",
    itinerarySlug: "10-day-bhutan-cultural-immersion",
    image: "/uploads/media/bhutan/landscape/bhutan-taktsang-monastery2-1d1a0917.webp",
    alt: "Tiger's Nest Monastery perched on a cliff in Paro, Bhutan",
    country: "Bhutan",
  },
  {
    id: "india",
    title: "Palace & Tiger",
    subtitle: "12 Days — Rajasthan & Ranthambore",
    description:
      "Heritage palace hotels, private tiger safaris, Ayurvedic wellness, and the Golden Triangle with a personal historian guide.",
    price: "From $3,800 per person",
    itinerarySlug: "12-day-india-himalayan-explorer",
    image: "/uploads/media/india/landscape/udaipur-rajasthan-india-17d99ac2.webp",
    alt: "Udaipur Lake Palace in Rajasthan, India",
    country: "India",
  },
  {
    id: "tibet",
    title: "Roof of the World",
    subtitle: "12 Days — Tibet & Nepal",
    description:
      "Lhasa to Everest North Face. Ancient monasteries, high-altitude passes, and the journey of a lifetime along the Friendship Highway.",
    price: "From $5,500 per person",
    itinerarySlug: "8-day-tibet-sacred-lands",
    image: "/uploads/media/tibet/landscape/potala-palace-lhasa-tibet-china-dd114557.webp",
    alt: "Potala Palace in Lhasa, Tibet",
    country: "Tibet",
  },
];

export default function SignatureJourneys() {
  return (
    <section id="signature-journeys" className="section-padding bg-luxury-white">
      <div className="container-luxury">
        {/* Section header */}
        <AnimateOnScroll>
          <div className="text-center mb-16">
            <span className="inline-block text-luxury-gold text-sm font-medium tracking-[0.25em] uppercase mb-4">
              Signature Experiences
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-luxury-navy">
              Journeys Crafted for the Extraordinary
            </h2>
          </div>
        </AnimateOnScroll>

        {/* Journey cards — 2x2 grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {journeys.map((journey, index) => (
            <AnimateOnScroll key={journey.id} staggerIndex={index}>
              <div className="group relative rounded-2xl overflow-hidden bg-luxury-navy">
                {/* Image — 60% height */}
                <div className="relative h-64 sm:h-72 lg:h-80 overflow-hidden">
                  <Image
                    src={journey.image}
                    alt={journey.alt}
                    fill
                    loading="lazy"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  {/* Gradient overlay at bottom */}
                  <div className="absolute inset-0 bg-gradient-to-t from-luxury-navy via-luxury-navy/20 to-transparent" />
                </div>

                {/* Content overlay */}
                <div className="relative p-6 sm:p-8 -mt-16 z-10">
                  <p className="text-luxury-gold text-sm font-medium tracking-wider mb-2">
                    {journey.subtitle}
                  </p>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-3">
                    {journey.title}
                  </h3>
                  <p className="text-white/70 text-sm leading-relaxed mb-4 max-w-md">
                    {journey.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-luxury-gold font-serif font-bold text-sm">{journey.price}</span>
                    <div className="flex items-center gap-4">
                      <Link
                        href={`/itineraries/${journey.itinerarySlug}`}
                        className="text-luxury-cream/60 text-sm hover:text-white transition-colors"
                      >
                        View Itinerary
                      </Link>
                      <ChatButton
                        message={`I'm interested in the ${journey.title} experience in ${journey.country}. Can you customize this for my dates and group size?`}
                        className="text-luxury-gold text-sm font-medium hover:underline underline-offset-4 transition-all"
                      >
                        Customize &rarr;
                      </ChatButton>
                    </div>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
