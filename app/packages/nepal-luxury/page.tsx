export default function EnhancedNepalPackagePage() {
  const itinerary = [
    {
      day: 1,
      title: "Arrival in Kathmandu - Heritage Welcome",
      description: "Private VIP airport meet & greet. Transfer to heritage palace hotel with butler service.",
      highlight: "Exclusive dinner with local historian at preserved Rana-era palace",
      kiransNote: "Using my 28-year relationship with this heritage property for VIP access",
      icon: "🛬"
    },
    {
      day: 2,
      title: "Kathmandu Valley Cultural Deep Dive",
      description: "Private access to Patan Museum before public hours. Traditional Newari cooking class with master chef.",
      highlight: "Private meditation session at ancient monastery",
      kiransNote: "Arranged through my long-standing monastery connections",
      icon: "🏛️"
    },
    {
      day: 3,
      title: "Scenic Flight to Pokhara & Lakeside Luxury",
      description: "Private mountain flight with guaranteed window seats. Afternoon boating on Phewa Lake with champagne.",
      highlight: "Helicopter landing at Annapurna base camp (weather permitting)",
      kiransNote: "Helicopter operator is a 15-year partner with perfect safety record",
      icon: "✈️"
    },
    {
      day: 4,
      title: "Annapurna Sanctuary Helicopter Experience",
      description: "Private helicopter tour with expert mountain guide. Gourmet picnic at 4,000m with panoramic views.",
      highlight: "Personalized photography session with professional guide",
      kiransNote: "Photography guides trained by National Geographic photographers I've worked with",
      icon: "🚁"
    },
    {
      day: 5,
      title: "Chitwan National Park - Jungle Luxury",
      description: "Private wildlife safari with senior naturalist. Luxury tented camp with butler service and private pool.",
      highlight: "Elephant conservation center private visit and feeding experience",
      kiransNote: "Conservation center director is a personal friend from 20+ years",
      icon: "🐘"
    },
    {
      day: 6,
      title: "Bardia National Park - Remote Wilderness",
      description: "Exclusive tiger tracking experience with researchers. Traditional Tharu cultural performance.",
      highlight: "Riverfront private dining under the stars",
      kiransNote: "One of the most exclusive tiger viewing experiences in Nepal",
      icon: "🐅"
    },
    {
      day: 7,
      title: "Return to Kathmandu - Spa & Wellness",
      description: "Signature Himalayan stone massage at luxury spa. Evening gourmet dining with Nepalese celebrity chef.",
      highlight: "Private viewing of Kathmandu's finest private art collection",
      kiransNote: "Art collector is a former client who now offers exclusive access",
      icon: "🧖"
    },
    {
      day: 8,
      title: "Bhaktapur & Nagarkot Sunrise",
      description: "Private sunrise viewing over Himalayas. Bhaktapur pottery workshop with 8th generation master artisan.",
      highlight: "Heritage home lunch with local noble family",
      kiransNote: "Family connection from my early days in travel operations",
      icon: "🌄"
    },
    {
      day: 9,
      title: "Personal Shopping & Farewell Planning",
      description: "Curated shopping with expert guide who knows all the artisans. Evening farewell dinner with traditional dance.",
      highlight: "Next journey planning session with Kiran's team",
      kiransNote: "Most clients book their next journey before departing",
      icon: "🛍️"
    },
    {
      day: 10,
      title: "Departure with Lasting Connections",
      description: "Final mountain views from private terrace. Airport assistance with dedicated lounge access.",
      highlight: "Personalized travel memoir and photo book gift",
      kiransNote: "Each memoir is custom-designed based on your journey highlights",
      icon: "👋"
    }
  ];

  const inclusions = [
    "All luxury accommodation (5-star heritage hotels & premium mountain lodges)",
    "Private transportation throughout with dedicated driver & luxury vehicles",
    "Expert local guide with 15+ years experience (personally trained by Kiran)",
    "All meals featuring gourmet local & international cuisine",
    "Domestic flights (Kathmandu-Pokhara, scenic mountain flight)",
    "All activities, entries, and special access as described",
    "24/7 dedicated concierge service from Kiran's Nepal team",
    "Comprehensive travel insurance with adventure coverage",
    "Private photographer for select days (professional edits included)",
    "All gratuities for guides, drivers, and hotel staff"
  ];

  const kiransGuarantees = [
    "Every supplier personally vetted over 28 years of operations",
    "Safety protocols from my insurance industry experience",
    "Direct access to properties not available through normal channels",
    "Price guarantee - no middleman markups on Kiran's partnerships",
    "Emergency support network across all destinations"
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Enhanced Hero */}
      <section className="relative h-[80vh] luxury-gradient">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544735716-2f4d582135e1?auto=format&fit=crop&w=2070')] bg-cover bg-center opacity-30" />
        <div className="relative h-full flex items-center">
          <div className="max-w-7xl mx-auto px-6 text-white">
            <div className="inline-flex items-center bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full text-sm font-semibold mb-8 border border-white/30">
              <span className="mr-3">🏔️</span>
              <span>Kiran's Signature Journey • 28 Years in the Making</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              10-Day <span className="text-cyan-300">Ultimate Nepal</span> Luxury Odyssey
            </h1>
            
            <p className="text-xl md:text-2xl opacity-90 max-w-4xl mb-12">
              The definitive Himalayan luxury journey, curated from 28 years of exclusive access, 
              insider knowledge, and personal relationships across Nepal.
            </p>
            
            {/* Key Highlights */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl">
              {[
                { number: '10', label: 'Days of curated luxury', icon: '📅' },
                { number: '4', label: 'Unique destinations', icon: '📍' },
                { number: '100%', label: 'Private experiences', icon: '🔒' },
                { number: '28+', label: 'Years expertise applied', icon: '👨‍💼' }
              ].map((item, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/20">
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <div className="text-2xl font-bold">{item.number}</div>
                  <div className="text-sm opacity-90">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="text-white text-sm animate-bounce">↓ Explore the journey ↓</div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Left: Itinerary */}
            <div className="lg:col-span-2">
              <div className="mb-12">
                <div className="inline-flex items-center bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-full text-sm font-semibold mb-6">
                  <span className="mr-3">✨</span>
                  Kiran's Personal Touch Throughout
                </div>
                
                <h2 className="text-4xl font-bold text-gray-900 mb-6">Curated Itinerary</h2>
                <p className="text-xl text-gray-600 max-w-3xl">
                  Each day combines luxury comfort with exclusive access only possible through 28 years of relationships.
                </p>
              </div>
              
              <div className="space-y-8">
                {itinerary.map((item) => (
                  <div key={item.day} className="luxury-card overflow-hidden">
                    <div className="p-8">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mr-6">
                            {item.day}
                          </div>
                        </div>
                        
                        <div className="flex-grow">
                          <div className="flex items-center mb-4">
                            <span className="text-2xl mr-4">{item.icon}</span>
                            <div>
                              <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
                              <div className="flex items-center mt-2">
                                <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                                <span className="text-sm text-blue-600 font-semibold">Kiran's Note: {item.kiransNote}</span>
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-gray-700 mb-4">{item.description}</p>
                          
                          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200">
                            <div className="flex items-center">
                              <span className="text-amber-500 text-xl mr-3">✨</span>
                              <div>
                                <div className="font-semibold text-gray-900">Exclusive Highlight</div>
                                <div className="text-gray-700">{item.highlight}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Booking & Details */}
            <div>
              <div className="sticky top-6">
                {/* Main Booking Card */}
                <div className="luxury-card mb-8">
                  <div className="p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8">Journey Details</h2>
                    
                    {/* Inclusions */}
                    <div className="mb-8">
                      <h3 className="font-bold text-gray-900 mb-6 text-lg flex items-center">
                        <span className="mr-3">✅</span>
                        Package Inclusions
                      </h3>
                      <ul className="space-y-4">
                        {inclusions.map((item, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-green-500 mr-4 mt-1">✓</span>
                            <span className="text-gray-700">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Investment */}
                    <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-200">
                      <h3 className="font-bold text-gray-900 mb-6 text-lg">Investment</h3>
                      <div className="flex items-baseline mb-4">
                        <span className="text-4xl font-bold text-gray-900">$9,800</span>
                        <span className="text-gray-600 ml-3">per person (double occupancy)</span>
                      </div>
                      <div className="space-y-2 text-sm text-gray-700">
                        <div className="flex justify-between">
                          <span>Single supplement:</span>
                          <span className="font-semibold">$1,500</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Group discount (4+):</span>
                          <span className="font-semibold">12% per person</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Customization available:</span>
                          <span className="font-semibold">Complimentary consultation</span>
                        </div>
                      </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="space-y-4">
                      <a 
                        href="/contact?package=nepal-luxury-ultimate" 
                        className="block w-full luxury-button py-4 text-lg text-center"
                      >
                        Begin Your Journey
                      </a>
                      <a 
                        href="/contact" 
                        className="block w-full luxury-button-outline py-4 text-lg text-center"
                      >
                        Request Customization
                      </a>
                    </div>
                    
                    <p className="text-center text-sm text-gray-500 mt-6">
                      Includes complimentary consultation with Kiran's team
                    </p>
                  </div>
                </div>

                {/* Kiran's Guarantees */}
                <div className="luxury-card">
                  <div className="p-8">
                    <h3 className="font-bold text-gray-900 mb-6 text-lg flex items-center">
                      <span className="mr-3">🛡️</span>
                      Kiran's 28-Year Guarantees
                    </h3>
                    <ul className="space-y-4">
                      {kiransGuarantees.map((guarantee, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-blue-500 mr-3 mt-1">•</span>
                          <span className="text-gray-700">{guarantee}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <div className="mt-8 pt-8 border-t border-gray-200">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                          KP
                        </div>
                        <div>
                          <div className="font-semibold">Kiran Pokhrel</div>
                          <div className="text-sm text-gray-600">28+ Years Himalayan Expertise</div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-4">
                        "Every detail of this journey reflects three decades of building relationships across Nepal's luxury travel landscape."
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Contact */}
                <div className="mt-6 p-6 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl text-white text-center">
                  <h4 className="font-bold mb-3">Questions About This Journey?</h4>
                  <p className="text-sm opacity-90 mb-4">Kiran's team is ready to help</p>
                  <a 
                    href="mailto:kiran@curatedascents.com" 
                    className="inline-block bg-white text-gray-900 hover:bg-gray-100 font-semibold py-3 px-6 rounded-xl text-sm transition"
                  >
                    Email Kiran Directly
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 luxury-gradient text-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-8">
            Ready to Experience Nepal Through <span className="text-cyan-300">Kiran's Eyes</span>?
          </h2>
          
          <p className="text-xl opacity-90 mb-12 max-w-3xl mx-auto">
            This signature journey represents just one possibility. Let's craft your perfect Himalayan 
            adventure together, leveraging 28 years of relationships and expertise.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <a 
              href="/contact" 
              className="bg-white text-gray-900 hover:bg-gray-100 font-semibold py-5 px-12 rounded-xl text-lg transition-all transform hover:scale-105"
            >
              Start Your Custom Planning
            </a>
            <a 
              href="/ai-generator" 
              className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-semibold py-5 px-12 rounded-xl text-lg transition"
            >
              Generate AI Itinerary First
            </a>
          </div>
          
          <p className="text-sm opacity-80 mt-8">
            All journeys include complimentary AI itinerary generation and personal consultation
          </p>
        </div>
      </section>
    </main>
  );
}