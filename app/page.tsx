export default function Home() {
  return (
    <div className="py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to CuratedAscents AI</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Your AI-powered luxury travel platform with 25+ years of Himalayan expertise.
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-bold text-xl mb-3">AI Trip Generator</h3>
          <p className="text-gray-600">Create personalized luxury itineraries instantly.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-bold text-xl mb-3">Expert Curation</h3>
          <p className="text-gray-600">25+ years of Himalayan travel expertise.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-bold text-xl mb-3">Luxury Packages</h3>
          <p className="text-gray-600">Exclusive experiences in Nepal, Tibet, Bhutan.</p>
        </div>
      </div>
      
      <div className="text-center mt-12">
        <a href="/contact" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 inline-block">
          Start Your Journey
        </a>
      </div>
    </div>
  );
}
