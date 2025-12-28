export default function NepalPackagePage() {
  const itinerary = [
    {
      day: 1,
      title: "Arrival in Kathmandu - Heritage Welcome",
      description: "Private airport transfer. Evening heritage briefing at a restored Rana-era palace hotel.",
      highlight: "Exclusive dinner with local historian"
    },
    {
      day: 2,
      title: "Kathmandu Valley Cultural Deep Dive",
      description: "Private access to Patan Museum before public hours. Traditional Newari cooking class.",
      highlight: "Monastery meditation session"
    },
    {
      day: 3,
      title: "Scenic Flight to Pokhara & Lakeside Luxury",
      description: "Morning mountain flight with guaranteed window seats. Afternoon boating on Phewa Lake.",
      highlight: "Helicopter landing at Annapurna base camp (weather permitting)"
    },
    {
      day: 4,
      title: "Annapurna Sanctuary Helicopter Experience",
      description: "Private helicopter tour with expert mountain guide. Gourmet picnic at 4,000m with panoramic views.",
      highlight: "Personalized photography session"
    },
    {
      day: 5,
      title: "Chitwan National Park - Jungle Luxury",
      description: "Private wildlife safari with senior naturalist. Luxury tented camp with butler service.",
      highlight: "Elephant conservation center private visit"
    },
    {
      day: 6,
      title: "Bardia National Park - Remote Wilderness",
      description: "Exclusive tiger tracking experience. Traditional Tharu cultural performance.",
      highlight: "Riverfront private dining"
    },
    {
      day: 7,
      title: "Return to Kathmandu - Spa & Wellness",
      description: "Signature Himalayan stone massage. Evening gourmet dining with Nepalese celebrity chef.",
      highlight: "Private art collection viewing"
    },
    {
      day: 8,
      title: "Bhaktapur & Nagarkot Sunrise",
      description: "Sunrise over Himalayas from private viewpoint. Bhaktapur pottery workshop with master artisan.",
      highlight: "Heritage home lunch with local family"
    },
    {
      day: 9,
      title: "Personal Shopping & Farewell Planning",
      description: "Curated shopping with expert guide. Evening farewell dinner with traditional dance.",
      highlight: "Next journey planning session"
    },
    {
      day: 10,
      title: "Departure with Lasting Connections",
      description: "Final mountain views. Airport assistance with dedicated lounge access.",
      highlight: "Personalized travel memoir gift"
    }
  ];

  const inclusions = [
    "All luxury accommodation (5-star hotels & premium lodges)",
    "Private transportation & dedicated driver throughout",
    "Expert local guide with 15+ years experience",
    "All meals featuring gourmet local & international cuisine",
    "Domestic flights (Kathmandu-Pokhara, scenic mountain flight)",
    "All activities, entries, and special access as described",
    "24/7 dedicated concierge service",
    "Comprehensive travel insurance"
  ];

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section with Nepal image */}
      <section className="relative h-[70vh] bg-gradient-to-r from-blue-900/80 to-purple-900/80">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544735716-2f4d582135e1?auto=format&fit=crop&w=2070')] bg-cover bg-center opacity-40" />
        <div className="relative h-full flex items-center">
          <div className="max-w-6xl mx-auto px-6 text-white">
            <div className="inline-block bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-6">
              Flagship Experience
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              10-Day Luxury Nepal Odyssey
            </h1>
            <p className="text-xl md:text-2xl opacity-90 max-w-3xl">
              The definitive Himalayan journey, curated from 25 years of exclusive access and insider knowledge.
            </p>
          </div>
        </div>
      </section>
      {/* Key Highlights */}
      <section className="py-16 px-6 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">10</div>
              <div className="text-gray-700">Days of curated luxury</div>
            </div>
            <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">4</div>
              <div className="text-gray-700">Unique destinations</div>
            </div>
            <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">100%</div>
              <div className="text-gray-700">Private experiences</div>
            </div>
            <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">25+</div>
              <div className="text-gray-700">Years expertise applied</div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Itinerary */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Curated Itinerary</h2>
              <div className="space-y-6">
                {itinerary.map((item) => (
                  <div key={item.day} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-start">
                      <div className="bg-blue-100 text-blue-800 font-bold w-10 h-10 flex items-center justify-center rounded-full mr-4">
                        {item.day}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 mb-2">{item.title}</h3>
                        <p className="text-gray-700 mb-2">{item.description}</p>
                        <div className="flex items-center text-blue-600">
                          <span className="mr-2">✨</span>
                          <span className="font-medium">{item.highlight}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Booking & Details */}
            <div>
              <div className="sticky top-6">
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Journey Details</h2>
                  
                  <div className="mb-8">
                    <h3 className="font-bold text-gray-900 mb-4">Package Inclusions</h3>
                    <ul className="space-y-3">
                      {inclusions.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-green-500 mr-3">✓</span>
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mb-8 p-6 bg-blue-50 rounded-xl">
                    <h3 className="font-bold text-gray-900 mb-4">Investment</h3>
                    <div className="flex items-baseline mb-4">
                      <span className="text-4xl font-bold text-gray-900">$8,900</span>
                      <span className="text-gray-600 ml-2">per person (double occupancy)</span>
                    </div>
                    <p className="text-gray-700 text-sm">
                      Single supplement: $1,200. Customization available for groups of 4+.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <a 
                      href="/contact?package=nepal-luxury" 
                      className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center font-semibold py-4 px-6 rounded-lg text-lg transition"
                    >
                      Inquire About This Journey
                    </a>
                    <a 
                      href="/contact" 
                      className="block w-full bg-gray-800 hover:bg-gray-900 text-white text-center font-semibold py-4 px-6 rounded-lg text-lg transition"
                    >
                      Request Customization
                    </a>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8">
                  <h3 className="font-bold text-gray-900 mb-4">Why This Journey Is Unique</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-3">•</span>
                      <span className="text-gray-700">Based on my 25 years of operating in Nepal</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-3">•</span>
                      <span className="text-gray-700">Access to locations not available to standard tours</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-3">•</span>
                      <span className="text-gray-700">Every vendor personally vetted over decades</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-3">•</span>
                      <span className="text-gray-700">Safety protocols from insurance industry experience</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Experience Nepal Like Never Before?</h2>
          <p className="text-xl opacity-90 mb-8">
            This itinerary represents just one possibility. Let's craft your perfect journey together.
          </p>
          <a 
            href="/contact" 
            className="inline-block bg-white text-gray-900 hover:bg-gray-100 font-semibold py-4 px-12 rounded-lg text-lg transition"
          >
            Start Your Custom Planning
          </a>
        </div>
      </section>
    </main>
  );
}
