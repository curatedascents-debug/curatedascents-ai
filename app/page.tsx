export default function Home() {
  return (
    <div className="py-8 md:py-12">
      {/* Hero Section */}
      <div className="text-center mb-12 max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Luxury Travel, <span className="text-blue-600">AI-Powered</span>
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Combining 25+ years of Himalayan expertise with artificial intelligence 
          to create your perfect luxury journey.
        </p>
        <a 
          href="/ai-generator" 
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 inline-block text-lg"
        >
          Generate Your AI Itinerary
        </a>
      </div>
      
      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="text-blue-600 text-2xl mb-4">🤖</div>
          <h3 className="font-bold text-xl mb-3">AI-Powered Planning</h3>
          <p className="text-gray-600">
            Instant personalized itineraries using DeepSeek AI, trained on 25 years of expertise.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="text-blue-600 text-2xl mb-4">🏔️</div>
          <h3 className="font-bold text-xl mb-3">Himalayan Expertise</h3>
          <p className="text-gray-600">
            Exclusive access to hidden gems in Nepal, Tibet, and Bhutan that only locals know.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="text-blue-600 text-2xl mb-4">⭐</div>
          <h3 className="font-bold text-xl mb-3">Luxury Curation</h3>
          <p className="text-gray-600">
            Handpicked 5-star accommodations, private guides, and exclusive experiences.
          </p>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-50 to-gray-50 rounded-2xl p-8 max-w-4xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-4">Ready for Your Journey?</h2>
        <p className="text-gray-600 mb-6">
          Experience the difference when expertise meets technology.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/contact" className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800">
            Contact Our Experts
          </a>
          <a href="/packages/nepal-luxury" className="bg-white text-black border border-gray-300 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50">
            View Sample Packages
          </a>
        </div>
      </div>
    </div>
  );
}