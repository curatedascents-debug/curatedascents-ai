import type { Metadata } from "next";
import StaticPageLayout from "@/components/StaticPageLayout";

export const metadata: Metadata = {
  title: "Privacy Policy - CuratedAscents",
  description: "CuratedAscents privacy policy detailing how we collect, use, and protect your personal data.",
};

export default function PrivacyPolicyPage() {
  return (
    <StaticPageLayout>
      <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-2">
        Privacy Policy
      </h1>
      <p className="text-slate-500 text-sm mb-10">Last updated: January 2026</p>

      <div className="prose-custom space-y-8">
        <Section title="1. Introduction">
          <p>
            CuratedAscents (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy.
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information
            when you visit our website, use our AI chat assistant, or book travel services with us.
          </p>
          <p>
            By using our services, you agree to the collection and use of information in accordance
            with this policy.
          </p>
        </Section>

        <Section title="2. Information We Collect">
          <h3 className="text-white font-medium text-sm mt-4 mb-2">Personal Information</h3>
          <ul>
            <li>Name, email address, and phone number (when you provide them via chat or booking forms)</li>
            <li>Passport details and nationality (required for visa and permit arrangements)</li>
            <li>Payment information (processed securely through Stripe; we do not store card details)</li>
            <li>Travel preferences, dietary requirements, and health information relevant to your trip</li>
          </ul>

          <h3 className="text-white font-medium text-sm mt-4 mb-2">Automatically Collected Information</h3>
          <ul>
            <li>Browser type, operating system, and device information</li>
            <li>IP address and approximate geographic location</li>
            <li>Pages visited, time spent on site, and referral sources</li>
            <li>Chat conversation history with our AI assistant</li>
          </ul>
        </Section>

        <Section title="3. How We Use Your Information">
          <ul>
            <li>To design and deliver personalized travel itineraries</li>
            <li>To process bookings, payments, and arrange permits and visas</li>
            <li>To communicate with you about your trip (confirmations, updates, pre-departure information)</li>
            <li>To improve our AI chat assistant and service quality</li>
            <li>To send you relevant travel content and offers (with your consent)</li>
            <li>To comply with legal obligations and prevent fraud</li>
          </ul>
        </Section>

        <Section title="4. Information Sharing">
          <p>We may share your information with:</p>
          <ul>
            <li><strong>Service Providers:</strong> Hotels, airlines, trekking operators, and guides necessary to deliver your trip</li>
            <li><strong>Government Authorities:</strong> For visa applications, trekking permits, and regulatory requirements</li>
            <li><strong>Payment Processors:</strong> Stripe for secure payment processing</li>
            <li><strong>Email Services:</strong> For sending booking confirmations and trip communications</li>
          </ul>
          <p>
            We never sell your personal information to third parties for marketing purposes.
          </p>
        </Section>

        <Section title="5. Data Security">
          <p>
            We implement appropriate technical and organizational security measures to protect your
            personal data, including encrypted data transmission (SSL/TLS), secure database storage,
            and access controls. Payment processing is handled entirely by Stripe, a PCI DSS Level 1
            certified provider.
          </p>
        </Section>

        <Section title="6. Data Retention">
          <p>
            We retain your personal information for as long as necessary to fulfill the purposes
            outlined in this policy, typically for 3 years after your last interaction with us.
            Financial records are retained for 7 years as required by law. You may request deletion
            of your data at any time.
          </p>
        </Section>

        <Section title="7. Your Rights">
          <p>You have the right to:</p>
          <ul>
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data (subject to legal obligations)</li>
            <li>Opt out of marketing communications at any time</li>
            <li>Withdraw consent for data processing</li>
            <li>Lodge a complaint with a data protection authority</li>
          </ul>
        </Section>

        <div id="cookies" className="scroll-mt-24">
          <Section title="8. Cookies & Tracking">
            <p>We use cookies and similar technologies to:</p>
            <ul>
              <li><strong>Essential cookies:</strong> Required for site functionality and secure sessions</li>
              <li><strong>Analytics cookies:</strong> Help us understand how visitors use our site (anonymized)</li>
              <li><strong>Preference cookies:</strong> Remember your language and currency preferences</li>
            </ul>
            <p>
              You can control cookies through your browser settings. Disabling essential cookies may
              affect site functionality. We do not use advertising or third-party tracking cookies.
            </p>
          </Section>
        </div>

        <Section title="9. Third-Party Services">
          <p>
            Our website uses the following third-party services that may collect data independently:
          </p>
          <ul>
            <li><strong>Stripe</strong> for payment processing</li>
            <li><strong>Vercel</strong> for website hosting and analytics</li>
            <li><strong>Resend</strong> for email delivery</li>
          </ul>
          <p>Each service operates under its own privacy policy.</p>
        </Section>

        <Section title="10. Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any material
            changes by posting the new policy on this page with an updated revision date. Continued
            use of our services after changes constitutes acceptance of the updated policy.
          </p>
        </Section>

        <Section title="11. Contact Us">
          <p>
            If you have questions about this Privacy Policy or wish to exercise your data rights, contact us at:
          </p>
          <ul>
            <li>Email: <a href="mailto:hello@curatedascents.com" className="text-emerald-400 hover:text-emerald-300">hello@curatedascents.com</a></li>
            <li>Address: CuratedAscents, 4498 Voyageur Way, Carmel, IN 46074, USA</li>
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
