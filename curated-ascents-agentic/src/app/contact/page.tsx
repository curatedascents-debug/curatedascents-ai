import type { Metadata } from "next";
import StaticPageLayout from "@/components/StaticPageLayout";

export const metadata: Metadata = {
  title: "Contact Us - CuratedAscents",
  description: "Get in touch with CuratedAscents for luxury adventure travel inquiries. Reach us by email, phone, or visit our office in Kathmandu, Nepal.",
};

export default function ContactPage() {
  return (
    <StaticPageLayout>
      <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-4">
        Contact Us
      </h1>
      <p className="text-slate-400 mb-10">
        We&apos;d love to help you plan your next luxury Himalayan adventure.
        Reach out to us through any of the channels below.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {/* Email */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-2">Email</h3>
          <a
            href="mailto:hello@curatedascents.com"
            className="text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            hello@curatedascents.com
          </a>
          <p className="text-slate-500 text-sm mt-2">
            We respond within 24 hours on business days.
          </p>
        </div>

        {/* Phone */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-2">Phone</h3>
          <a
            href="tel:+9771234567890"
            className="text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            +977 1 234 567 890
          </a>
          <p className="text-slate-500 text-sm mt-2">
            Available Mon-Sat, 9 AM - 6 PM NPT (Nepal Time).
          </p>
        </div>

        {/* Address */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-2">Office</h3>
          <p className="text-slate-300">
            CuratedAscents<br />
            Thamel, Kathmandu<br />
            Nepal 44600
          </p>
          <p className="text-slate-500 text-sm mt-2">
            Visits by appointment only.
          </p>
        </div>

        {/* Response Time */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-2">Urgent Matters</h3>
          <p className="text-slate-300 text-sm">
            For urgent booking changes or emergencies during your trip, please call our 24/7 emergency line.
          </p>
          <a
            href="tel:+9779800000000"
            className="text-emerald-400 hover:text-emerald-300 transition-colors text-sm"
          >
            +977 980 000 0000 (Emergency)
          </a>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-emerald-900/30 to-slate-800/30 border border-emerald-700/30 rounded-xl p-8 text-center">
        <h2 className="text-xl font-serif font-bold text-white mb-3">
          Prefer to Chat?
        </h2>
        <p className="text-slate-400 mb-6 max-w-md mx-auto">
          Our AI Expedition Architect is available 24/7 on the homepage. Describe your dream
          adventure and get personalized recommendations instantly.
        </p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors font-medium"
        >
          Start a Conversation
        </a>
      </div>
    </StaticPageLayout>
  );
}
