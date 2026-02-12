import type { Metadata } from "next";
import StaticPageLayout from "@/components/StaticPageLayout";

export const metadata: Metadata = {
  title: "FAQ - CuratedAscents",
  description: "Frequently asked questions about CuratedAscents luxury adventure travel, bookings, payments, travel insurance, and visa information.",
};

const faqs = {
  general: [
    {
      q: "What destinations does CuratedAscents cover?",
      a: "We specialize in luxury adventure travel across Nepal, Tibet, Bhutan, and India. From Everest Base Camp treks to Bhutanese monastery tours, Tibetan plateau expeditions to Indian wildlife safaris and palace stays, we craft bespoke itineraries across the Himalayas and beyond.",
    },
    {
      q: "What makes CuratedAscents different from other travel companies?",
      a: "We combine luxury with authentic adventure. Our AI-powered Expedition Architect designs personalized itineraries, while our on-the-ground team with 25+ years of experience ensures every detail meets the highest standards. We maintain a maximum group size of 12 and offer exclusive access to experiences not available through standard tour operators.",
    },
    {
      q: "How do I start planning a trip?",
      a: "Simply open our AI chat assistant on the homepage and describe your dream adventure. Our Expedition Architect will recommend destinations, activities, and accommodations tailored to your preferences. You can also email us at hello@curatedascents.com or call +1-715-505-4964.",
    },
    {
      q: "How far in advance should I book?",
      a: "We recommend booking 3-6 months in advance for peak seasons (October-November and March-May in Nepal/Bhutan). For popular festivals like Bhutan's Paro Tsechu, 6-12 months is advisable. Off-peak travel can be arranged with shorter notice.",
    },
  ],
  booking: [
    {
      q: "How does the booking process work?",
      a: "After your consultation with our Expedition Architect, we prepare a detailed quote. Once you accept, we require a 30% deposit to secure your booking. The remaining balance is due 60 days before departure — payable by card, bank transfer (SWIFT), or cash on arrival (arranged in advance). We handle all logistics including permits, internal flights, and accommodation.",
    },
    {
      q: "What payment methods do you accept?",
      a: "We accept major credit cards (Visa, MasterCard, American Express) via our secure Stripe payment system, international bank transfers (SWIFT), and cash payment on arrival for the remaining balance after deposit. All transactions are processed in USD, GBP, EUR, or your preferred supported currency.",
    },
    {
      q: "What is your cancellation policy?",
      a: "Cancellations made 90+ days before departure receive a full refund minus a $200 administrative fee. 60-89 days: 50% refund. 30-59 days: 25% refund. Less than 30 days: no refund. We strongly recommend travel insurance to protect your investment.",
    },
    {
      q: "Can I modify my itinerary after booking?",
      a: "Yes, we understand plans can change. Minor modifications are usually accommodated at no extra charge. Significant changes may incur adjustment fees depending on supplier commitments already made. Contact us as early as possible for any changes.",
    },
  ],
  insurance: [
    {
      q: "Do I need travel insurance?",
      a: "Yes, comprehensive travel insurance is mandatory for all CuratedAscents trips. Your policy must cover high-altitude trekking (up to your trek's maximum elevation), emergency helicopter evacuation, trip cancellation, and medical expenses of at least $100,000.",
    },
    {
      q: "Can you recommend travel insurance providers?",
      a: "We recommend World Nomads, Global Rescue, or IMG Global for adventure travel coverage. These providers offer plans specifically designed for high-altitude trekking and remote area travel. Ensure your policy explicitly covers helicopter evacuation above 3,000m.",
    },
    {
      q: "What does emergency evacuation insurance cover?",
      a: "Emergency evacuation insurance covers helicopter rescue from remote areas, medical evacuation to appropriate facilities, and repatriation if needed. In the Himalayas, helicopter evacuation can cost $5,000-$20,000 without insurance.",
    },
  ],
  visa: [
    {
      q: "Do I need a visa for Nepal?",
      a: "Most nationalities can obtain a visa on arrival at Kathmandu airport. A 30-day tourist visa costs $50 USD. You'll need a passport valid for at least 6 months, two passport photos, and the visa fee in cash (USD). We provide detailed visa guidance specific to your nationality.",
    },
    {
      q: "How do I get a Bhutan visa?",
      a: "Bhutan visas are arranged through your tour operator (that's us). We handle the entire application process. A Sustainable Development Fee (SDF) of $100/night for international visitors applies. Indian nationals do not require a visa but need a valid passport.",
    },
    {
      q: "What about Tibet permits?",
      a: "Tibet requires a Tibet Travel Permit, which can only be obtained through a registered Chinese travel agency. We arrange all necessary permits including the Tibet Entry Permit, Alien Travel Permit, and Military Permit (for restricted areas). Processing takes approximately 20 days.",
    },
    {
      q: "Do I need a visa for India?",
      a: "Most nationalities need an Indian visa. E-visas are available for 160+ countries and can be applied for online. Processing takes 3-5 business days. We recommend applying at least 30 days before travel. We provide guidance on the specific visa type needed for your itinerary.",
    },
  ],
  trip: [
    {
      q: "What fitness level is required for trekking?",
      a: "It varies by trek. Everest Base Camp requires moderate-to-good fitness and the ability to walk 5-7 hours per day at altitude. Our Expedition Architect will recommend itineraries suited to your fitness level and provide a pre-trip training guide.",
    },
    {
      q: "What about altitude sickness?",
      a: "Our itineraries are designed with proper acclimatization days built in. Our guides are trained in altitude sickness recognition and carry emergency supplies. We include acclimatization hikes, monitor your condition daily, and have evacuation protocols in place.",
    },
    {
      q: "What meals and accommodation are included?",
      a: "All meals and accommodation are included as specified in your itinerary. In cities, we book 4-5 star hotels. On treks, we use the best available lodges (or luxury camping for premium itineraries). Dietary requirements are accommodated with advance notice.",
    },
    {
      q: "What should I pack?",
      a: "We provide a detailed packing list tailored to your specific trip. Generally, you'll need quality trekking boots, layered clothing, a warm sleeping bag (available for rent), rain gear, and personal items. We can arrange gear rental in Kathmandu for most equipment.",
    },
  ],
};

const sectionConfig = [
  { key: "general" as const, title: "General", id: "general" },
  { key: "booking" as const, title: "Booking & Payments", id: "booking" },
  { key: "insurance" as const, title: "Travel Insurance", id: "travel-insurance" },
  { key: "visa" as const, title: "Visa Information", id: "visa-information" },
  { key: "trip" as const, title: "On The Trip", id: "on-the-trip" },
];

export default function FAQPage() {
  return (
    <StaticPageLayout>
      <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-4">
        Frequently Asked Questions
      </h1>
      <p className="text-slate-400 mb-10">
        Everything you need to know about planning your luxury Himalayan adventure.
        Can&apos;t find what you&apos;re looking for?{" "}
        <a href="/contact" className="text-emerald-400 hover:text-emerald-300 underline">
          Contact us
        </a>.
      </p>

      {sectionConfig.map((section) => (
        <div key={section.key} id={section.id} className="mb-10 scroll-mt-24">
          <h2 className="text-xl font-semibold text-emerald-400 mb-4 border-b border-slate-800 pb-2">
            {section.title}
          </h2>
          <div className="space-y-3">
            {faqs[section.key].map((faq, idx) => (
              <details
                key={idx}
                className="group bg-slate-800/50 border border-slate-700/50 rounded-lg"
              >
                <summary className="cursor-pointer px-5 py-4 text-white font-medium text-sm list-none flex items-center justify-between hover:text-emerald-400 transition-colors">
                  {faq.q}
                  <span className="text-slate-500 group-open:rotate-180 transition-transform ml-4 flex-shrink-0">
                    &#9660;
                  </span>
                </summary>
                <div className="px-5 pb-4 text-slate-400 text-sm leading-relaxed border-t border-slate-700/50 pt-3">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      ))}
    </StaticPageLayout>
  );
}
