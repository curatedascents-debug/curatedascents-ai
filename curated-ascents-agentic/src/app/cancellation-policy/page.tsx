import type { Metadata } from "next";
import StaticPageLayout from "@/components/StaticPageLayout";

export const metadata: Metadata = {
  title: "Cancellation Policy - CuratedAscents",
  description: "CuratedAscents cancellation and refund policy for luxury adventure travel bookings. Tiered refund schedule, force majeure provisions, and amendment terms.",
};

export default function CancellationPolicyPage() {
  return (
    <StaticPageLayout>
      <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-2">
        Cancellation &amp; Refund Policy
      </h1>
      <p className="text-slate-500 text-sm mb-10">Last updated: February 2026</p>

      <div className="space-y-8">
        <Section title="1. Cancellation Schedule">
          <p>
            All cancellations must be submitted in writing via email to{" "}
            <a href="mailto:hello@curatedascents.com" className="text-emerald-400 hover:text-emerald-300">
              hello@curatedascents.com
            </a>. The cancellation date is the date we receive your written notice. Refunds are calculated
            based on the number of days remaining before your scheduled departure:
          </p>

          <div className="mt-4 space-y-3">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
              <h3 className="text-emerald-400 font-medium text-sm mb-1">60+ days before departure</h3>
              <p>Full refund minus a $250 USD administrative fee per person. The administrative fee covers permit applications, supplier reservation holds, and processing costs already incurred.</p>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <h3 className="text-yellow-400 font-medium text-sm mb-1">30 &ndash; 59 days before departure</h3>
              <p>50% refund of the total trip cost. Non-refundable supplier commitments (flights, permits, peak-season hotel deposits) are deducted before calculating the refund.</p>
            </div>
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
              <h3 className="text-orange-400 font-medium text-sm mb-1">15 &ndash; 29 days before departure</h3>
              <p>25% refund of the total trip cost. At this stage, most supplier payments have been finalised and cannot be recovered.</p>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <h3 className="text-red-400 font-medium text-sm mb-1">Less than 15 days before departure</h3>
              <p>No refund. 100% of the trip cost is forfeited. We strongly recommend travel insurance to protect against late cancellations.</p>
            </div>
          </div>

          <p className="mt-4">
            Refunds are processed within 14 business days of receiving your cancellation notice. Credit card
            refunds are returned to the original payment method. Bank transfer refunds are sent to the
            originating account (international transfer fees may apply).
          </p>
        </Section>

        <Section title="2. Force Majeure">
          <p>
            In the event of circumstances beyond reasonable control that make travel impossible or
            unsafe, CuratedAscents will offer affected travellers the choice of:
          </p>
          <ul>
            <li>A full credit toward a future trip (valid for 18 months from the original departure date)</li>
            <li>Rescheduling to alternative dates at no additional charge (subject to availability)</li>
            <li>A refund minus any non-recoverable supplier costs already paid on your behalf</li>
          </ul>
          <p>
            Force majeure events include, but are not limited to:
          </p>
          <ul>
            <li>Natural disasters (earthquakes, floods, volcanic eruptions, avalanches)</li>
            <li>Pandemics and government-imposed travel restrictions</li>
            <li>Political unrest, civil disturbance, or armed conflict</li>
            <li>Government border closures or airspace restrictions</li>
            <li>Severe weather events that make travel routes impassable</li>
          </ul>
          <p>
            CuratedAscents will communicate promptly with all affected travellers and work to find the
            best possible resolution. We will provide documentation of non-recoverable costs upon request
            to support your travel insurance claim.
          </p>
        </Section>

        <Section title="3. Amendment Policy">
          <p>
            We understand that plans evolve. The following amendments can be accommodated subject to
            availability and supplier terms:
          </p>
          <h3 className="text-white font-medium text-sm mt-4 mb-2">Date Changes</h3>
          <ul>
            <li><strong>60+ days before departure:</strong> One date change is permitted free of charge. Subsequent changes incur a $150 USD processing fee.</li>
            <li><strong>30&ndash;59 days before departure:</strong> Date changes are subject to a $250 USD rebooking fee plus any supplier price differences.</li>
            <li><strong>Less than 30 days:</strong> Date changes are treated as a cancellation and rebooking under the cancellation schedule above.</li>
          </ul>

          <h3 className="text-white font-medium text-sm mt-4 mb-2">Itinerary Modifications</h3>
          <ul>
            <li><strong>Room upgrades:</strong> Available subject to hotel availability; price difference applies</li>
            <li><strong>Route changes:</strong> Minor adjustments (e.g., adding a side trip) accommodated where possible at additional cost</li>
            <li><strong>Group size changes:</strong> Adding travellers is possible up to 30 days before departure; removing travellers follows the cancellation schedule</li>
            <li><strong>Service additions:</strong> Extra activities, helicopter flights, or spa services can be added at any time before departure</li>
          </ul>

          <p className="mt-4">
            All amendments are confirmed in writing. We will always advise you of any cost implications
            before proceeding with changes.
          </p>
        </Section>

        <Section title="4. Travel Insurance">
          <p>
            <strong>Comprehensive travel insurance is strongly recommended for all CuratedAscents trips
            and is mandatory for treks above 3,000m.</strong> Travel insurance is not included in our
            trip pricing.
          </p>
          <p>
            Your travel insurance policy should cover:
          </p>
          <ul>
            <li>Trip cancellation and interruption (covering the full cost of your trip)</li>
            <li>Medical expenses of at least $100,000 USD</li>
            <li>Emergency helicopter evacuation and medical repatriation</li>
            <li>High-altitude trekking coverage (up to your itinerary&apos;s maximum elevation)</li>
            <li>Travel delays, baggage loss, and personal liability</li>
          </ul>
          <p>
            We recommend purchasing insurance within 14 days of paying your deposit to access
            &quot;cancel for any reason&quot; provisions offered by many providers. Recommended providers
            include World Nomads, Global Rescue, and IMG Global — all of which offer plans designed
            for adventure travel in the Himalayas.
          </p>
          <p>
            Proof of adequate travel insurance must be provided at least 30 days before your departure date.
            CuratedAscents reserves the right to decline participation to any traveller who cannot provide
            proof of adequate insurance coverage for their itinerary.
          </p>
        </Section>

        <Section title="5. Deposits &amp; Payment Protection">
          <p>
            Your initial deposit (typically 30% of the total trip cost) secures your booking and
            initiates supplier reservations on your behalf. Payment is processed securely through
            Stripe, a PCI DSS Level 1 certified payment processor.
          </p>
          <ul>
            <li><strong>Credit card payments</strong> are protected by Stripe&apos;s buyer protection and your card issuer&apos;s dispute resolution process</li>
            <li><strong>Bank transfers (SWIFT)</strong> are confirmed by email receipt within 48 hours of funds clearing</li>
            <li><strong>Cash on arrival</strong> is available for the remaining balance (after deposit) and must be arranged at the time of booking</li>
          </ul>
          <p>
            All prices are quoted in USD unless otherwise agreed. We do not charge additional processing
            fees for credit card payments. SWIFT transfer bank fees charged by intermediary banks are
            the responsibility of the traveller.
          </p>
        </Section>

        <Section title="6. No-Show Policy">
          <p>
            Travellers who fail to arrive at the designated meeting point at the scheduled departure
            time without prior written notice will be considered a no-show. No-shows are not eligible
            for any refund. We will make every reasonable effort to contact you in the event of a
            delayed arrival.
          </p>
        </Section>

        <Section title="7. CuratedAscents-Initiated Cancellations">
          <p>
            In rare circumstances, CuratedAscents may need to cancel a trip due to insufficient
            enrolment, safety concerns, or operational reasons. In such cases:
          </p>
          <ul>
            <li>You will receive a full refund of all payments made</li>
            <li>We will offer alternative dates or itineraries where possible</li>
            <li>Notification will be provided at least 30 days before departure (except in emergencies)</li>
            <li>CuratedAscents is not liable for incidental costs such as non-refundable airfares booked independently</li>
          </ul>
        </Section>

        <Section title="8. Contact">
          <p>
            For cancellation requests, amendments, or questions about this policy:
          </p>
          <ul>
            <li>Email: <a href="mailto:hello@curatedascents.com" className="text-emerald-400 hover:text-emerald-300">hello@curatedascents.com</a></li>
            <li>Phone: <a href="tel:+17155054964" className="text-emerald-400 hover:text-emerald-300">+1-715-505-4964</a> (Mon&ndash;Fri 9AM&ndash;6PM EST)</li>
            <li>Address: CuratedAscents, 4498 Voyageur Way, Carmel, IN 46074, USA</li>
          </ul>
          <p className="mt-4">
            See also our{" "}
            <a href="/terms" className="text-emerald-400 hover:text-emerald-300">Terms of Service</a>{" "}
            and{" "}
            <a href="/privacy-policy" className="text-emerald-400 hover:text-emerald-300">Privacy Policy</a>.
          </p>
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
