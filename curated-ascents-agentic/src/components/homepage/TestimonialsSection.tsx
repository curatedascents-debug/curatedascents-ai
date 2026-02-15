"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, BadgeCheck } from "lucide-react";

const testimonials = [
  {
    quote:
      "From the moment we described our dream to the Expedition Architect, every detail was crafted with extraordinary care. The private helicopter to Everest Base Camp was the highlight of our lives.",
    name: "Sarah & James W.",
    location: "London, UK",
    tripType: "14-Day Nepal Expedition",
    trip: "Nepal Expedition, 2026",
  },
  {
    quote:
      "The AI understood exactly what we wanted — a spiritual journey through Bhutan that was also luxurious. Tiger's Nest at sunrise, followed by a hot stone bath at Amankora. Perfection.",
    name: "Michael R.",
    location: "New York, USA",
    tripType: "10-Day Bhutan Immersion",
    trip: "Bhutan Immersion, 2026",
  },
  {
    quote:
      "We've traveled with Abercrombie & Kent and Scott Dunn. CuratedAscents' combination of deep local expertise and AI-powered personalization is in a class of its own.",
    name: "Elena & David S.",
    location: "Dubai, UAE",
    tripType: "12-Day Rajasthan Royal Circuit",
    trip: "Rajasthan Royal Circuit, 2026",
  },
];

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const current = testimonials[currentIndex];

  return (
    <section
      ref={sectionRef}
      id="testimonials"
      className="section-padding bg-luxury-navy"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container-luxury max-w-4xl">
        {/* Section header */}
        <div className="text-center mb-12">
          <span
            className={`inline-block text-luxury-gold text-sm font-medium tracking-[0.25em] uppercase mb-4 transition-all duration-600 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            Traveler Stories
          </span>
          <h2
            className={`font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-luxury-cream transition-all duration-600 delay-100 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            Journeys That Stay With You
          </h2>
        </div>

        {/* Testimonial card */}
        <div
          className={`relative transition-all duration-600 delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="bg-luxury-cream/5 border border-luxury-gold/10 rounded-2xl p-6 sm:p-8 md:p-12 text-center">
            {/* Gold quote mark */}
            <div className="flex justify-center mb-8">
              <svg width="48" height="36" viewBox="0 0 48 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M0 36V20.4C0 13.6 1.6 8.4 4.8 4.8C8.13333 1.2 12.8 0 18.8 0L20.4 6C16.9333 6.4 14.2 7.6 12.2 9.6C10.3333 11.4667 9.4 13.8667 9.4 16.8H18V36H0ZM28 36V20.4C28 13.6 29.6 8.4 32.8 4.8C36.1333 1.2 40.8 0 46.8 0L48.4 6C44.9333 6.4 42.2 7.6 40.2 9.6C38.3333 11.4667 37.4 13.8667 37.4 16.8H46V36H28Z"
                  fill="rgba(201, 169, 110, 0.3)"
                />
              </svg>
            </div>

            {/* Quote */}
            <blockquote className="text-lg sm:text-xl text-luxury-cream font-light italic leading-relaxed mb-8 min-h-[80px] sm:min-h-[100px]">
              &ldquo;{current.quote}&rdquo;
            </blockquote>

            {/* Author */}
            <div>
              <div className="flex items-center justify-center gap-2 mb-1">
                <p className="text-white font-medium">{current.name}</p>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-luxury-gold/10 border border-luxury-gold/20 rounded-full text-luxury-gold text-[10px] font-medium uppercase tracking-wider">
                  <BadgeCheck className="w-3 h-3" />
                  Verified Trip
                </span>
              </div>
              <p className="text-luxury-cream/50 text-sm">
                {current.location} &mdash; {current.tripType}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={() => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
              className="p-2 rounded-full border border-luxury-gold/20 text-luxury-gold/60 hover:text-luxury-gold hover:border-luxury-gold/50 transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "bg-luxury-gold w-6 h-2"
                      : "bg-luxury-gold/20 w-2 h-2 hover:bg-luxury-gold/40"
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={() => setCurrentIndex((prev) => (prev + 1) % testimonials.length)}
              className="p-2 rounded-full border border-luxury-gold/20 text-luxury-gold/60 hover:text-luxury-gold hover:border-luxury-gold/50 transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
