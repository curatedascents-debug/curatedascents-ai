export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="px-6 py-20 bg-gradient-to-r from-blue-50 to-slate-50">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            The Expertise Behind Your Journey
          </h1>
          <p className="text-xl text-gray-700">
            25 Years in the Himalayas × AI-Powered Precision
          </p>
        </div>
      </section>

      <section className="px-6 py-16 max-w-4xl mx-auto">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">My Story: From Ground Operations to AI Innovation</h2>
          <div className="space-y-4 text-gray-700">
            <p>
              For over <strong>25 years</strong>, I've personally operated luxury and adventure tours across <strong>Nepal, Tibet, and Bhutan</strong>. 
              I've negotiated with remote lodge owners, coordinated helicopter rescues, and curated experiences for dignitaries that never appear on public itineraries.
            </p>
            <p>
              For the past <strong>11 years</strong>, I've worked as a Business Analyst and IT Consultant for companies like <strong>Travelport, American Airlines, American Express Global Business Travel, and Starr Insurance</strong>.
              This unique dual expertise means your travel platform is built with <strong>real industry knowledge</strong> and <strong>enterprise-grade technology standards</strong> from day one.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="p-6 border border-blue-100 rounded-xl bg-blue-50">
            <h3 className="text-xl font-bold mb-3 text-blue-900">🏔️ On-the-Ground Mastery</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• Network of 500+ vetted local suppliers</li>
              <li>• Hidden gem locations only locals know</li>
              <li>• Cultural protocol & safety expertise</li>
            </ul>
          </div>
          <div className="p-6 border border-purple-100 rounded-xl bg-purple-50">
            <h3 className="text-xl font-bold mb-3 text-purple-900">💻 Technical Excellence</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• GDS & airline system knowledge (Travelport, AA)</li>
              <li>• Corporate travel protocols (Amex GBT)</li>
              <li>• Risk management frameworks (Starr Insurance)</li>
            </ul>
          </div>
        </div>

        <div className="text-center p-8 bg-gray-50 rounded-2xl">
          <h3 className="text-2xl font-bold mb-4">Ready to Experience the Difference?</h3>
          <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
            This isn't just another travel website. It's the culmination of decades of expertise, powered by AI to deliver truly personalized luxury travel.
          </p>
          <a 
            href="/" 
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition"
          >
            ← Back to Home
          </a>
        </div>
      </section>
    </main>
  );
}
