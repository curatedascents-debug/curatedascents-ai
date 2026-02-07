import type { Metadata } from "next";
import StaticPageLayout from "@/components/StaticPageLayout";

export const metadata: Metadata = {
  title: "Terms of Service - CuratedAscents",
  description: "Terms and conditions for CuratedAscents luxury adventure travel services, bookings, payments, and cancellation policies.",
};

export default function TermsPage() {
  return (
    <StaticPageLayout>
      <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-2">
        Terms of Service
      </h1>
      <p className="text-slate-500 text-sm mb-10">Last updated: January 2026</p>

      <div className="space-y-8">
        <Section title="1. Acceptance of Terms">
          <p>
            By accessing or using the CuratedAscents website, AI chat assistant, or booking our
            travel services, you agree to be bound by these Terms of Service. If you do not agree
            to these terms, please do not use our services.
          </p>
        </Section>

        <Section title="2. Services">
          <p>
            CuratedAscents provides luxury adventure travel planning, booking, and management
            services across Nepal, Tibet, Bhutan, and India. Our services include:
          </p>
          <ul>
            <li>AI-powered itinerary design and trip planning</li>
            <li>Hotel, transportation, and activity bookings</li>
            <li>Permit and visa arrangement assistance</li>
            <li>Guide and porter services coordination</li>
            <li>24/7 trip support and emergency assistance</li>
          </ul>
        </Section>

        <Section title="3. Booking & Payment">
          <h3 className="text-white font-medium text-sm mt-4 mb-2">Deposits & Payments</h3>
          <ul>
            <li>A non-refundable deposit of 30% of the total trip cost is required to confirm your booking</li>
            <li>The remaining balance is due 60 days before the departure date</li>
            <li>Bookings made within 60 days of departure require full payment at the time of booking</li>
            <li>All prices are quoted in USD unless otherwise specified</li>
          </ul>

          <h3 className="text-white font-medium text-sm mt-4 mb-2">Price Adjustments</h3>
          <p>
            Quoted prices are valid for 14 days from the date of the quote. Prices may be subject to
            change due to currency fluctuations, government fee changes, or fuel surcharges. We will
            notify you of any price changes before confirming your booking.
          </p>
        </Section>

        <Section title="4. Cancellation Policy">
          <ul>
            <li><strong>90+ days before departure:</strong> Full refund minus $200 administrative fee</li>
            <li><strong>60-89 days:</strong> 50% refund of total trip cost</li>
            <li><strong>30-59 days:</strong> 25% refund of total trip cost</li>
            <li><strong>Less than 30 days:</strong> No refund</li>
          </ul>
          <p>
            All cancellations must be made in writing via email to hello@curatedascents.com.
            Refunds are processed within 14 business days. We strongly recommend purchasing
            comprehensive travel insurance to protect against cancellation costs.
          </p>
        </Section>

        <Section title="5. Travel Insurance">
          <p>
            Comprehensive travel insurance is mandatory for all CuratedAscents trips. Your policy must include:
          </p>
          <ul>
            <li>Medical coverage of at least $100,000 USD</li>
            <li>Emergency helicopter evacuation coverage</li>
            <li>High-altitude trekking coverage (up to your trip&apos;s maximum elevation)</li>
            <li>Trip cancellation and interruption coverage</li>
          </ul>
          <p>
            Proof of insurance must be provided at least 30 days before departure. CuratedAscents
            is not responsible for any costs that would normally be covered by travel insurance.
          </p>
        </Section>

        <Section title="6. Traveler Responsibilities">
          <p>You are responsible for:</p>
          <ul>
            <li>Ensuring you have a valid passport (minimum 6 months validity) and required visas</li>
            <li>Obtaining recommended vaccinations and health clearances</li>
            <li>Disclosing any medical conditions that may affect your travel</li>
            <li>Maintaining adequate physical fitness for your chosen itinerary</li>
            <li>Following the instructions of guides and safety personnel during the trip</li>
            <li>Respecting local customs, laws, and environmental guidelines</li>
          </ul>
        </Section>

        <Section title="7. Itinerary Changes">
          <p>
            While we make every effort to deliver the itinerary as planned, circumstances beyond our
            control may necessitate changes. These include but are not limited to:
          </p>
          <ul>
            <li>Weather conditions and natural events</li>
            <li>Government restrictions or permit changes</li>
            <li>Flight cancellations or schedule changes</li>
            <li>Safety concerns identified by our guides</li>
            <li>Road closures or infrastructure issues</li>
          </ul>
          <p>
            In such cases, we will provide suitable alternatives of equal or greater value whenever
            possible. No refunds are provided for changes caused by force majeure events.
          </p>
        </Section>

        <Section title="8. Liability">
          <p>
            CuratedAscents acts as an intermediary between you and third-party service providers
            (hotels, airlines, trekking operators). While we carefully select our partners, we
            cannot be held liable for:
          </p>
          <ul>
            <li>Actions, omissions, or negligence of third-party service providers</li>
            <li>Injuries, illness, or death resulting from adventure travel activities</li>
            <li>Loss, theft, or damage to personal belongings</li>
            <li>Delays or changes caused by circumstances beyond our control</li>
          </ul>
          <p>
            Our total liability shall not exceed the amount paid for your trip. We strongly
            recommend adequate travel insurance to cover all potential risks.
          </p>
        </Section>

        <Section title="9. AI Chat Assistant">
          <p>
            Our AI-powered Expedition Architect provides travel recommendations and information.
            While we strive for accuracy, AI-generated responses are for informational purposes
            and may not reflect the most current conditions. Final itineraries and prices are
            confirmed by our human team before booking.
          </p>
        </Section>

        <Section title="10. Intellectual Property">
          <p>
            All content on the CuratedAscents website, including text, images, logos, and software,
            is owned by or licensed to CuratedAscents and is protected by intellectual property laws.
            You may not reproduce, distribute, or create derivative works without our written consent.
          </p>
        </Section>

        <Section title="11. Governing Law">
          <p>
            These Terms of Service are governed by the laws of Nepal. Any disputes arising from
            these terms or our services shall be subject to the exclusive jurisdiction of the
            courts of Kathmandu, Nepal. We encourage resolution through discussion before
            pursuing legal action.
          </p>
        </Section>

        <Section title="12. Contact">
          <p>
            For questions about these Terms of Service, please contact us:
          </p>
          <ul>
            <li>Email: <a href="mailto:hello@curatedascents.com" className="text-emerald-400 hover:text-emerald-300">hello@curatedascents.com</a></li>
            <li>Phone: <a href="tel:+9771234567890" className="text-emerald-400 hover:text-emerald-300">+977 1 234 567 890</a></li>
            <li>Address: CuratedAscents, Thamel, Kathmandu, Nepal 44600</li>
          </ul>
        </Section>
      </div>
    </StaticPageLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-white mb-3">{title}</h2>
      <div className="text-slate-400 text-sm leading-relaxed space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_li]:text-slate-400 [&_strong]:text-slate-300">
        {children}
      </div>
    </section>
  );
}
