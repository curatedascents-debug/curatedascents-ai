export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Enhanced Hero */}
      <section className="relative px-6 py-24 luxury-gradient text-white overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20 mb-8">
            <span className="mr-3">👨‍💼</span>
            <span className="font-medium">Founded by Kiran Pokhrel</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-8">
            The <span className="text-cyan-300">Expertise</span> Behind Your Journey
          </h1>
          
          <p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto mb-12">
            28+ Years of Himalayan Mastery × Enterprise-Grade AI Innovation
          </p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {[
              { value: '1997', label: 'Started in Travel' },
              { value: '28+', label: 'Years Experience' },
              { value: '500+', label: 'Luxury Partners' },
              { value: 'AI-Powered', label: 'Today' }
            ].map((stat, idx) => (
              <div key={idx} className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10">
                <div className="text-2xl font-bold text-cyan-300">{stat.value}</div>
                <div className="text-sm text-blue-200 mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-6 py-24">
        <div className="max-w-6xl mx-auto">
          {/* Founder's Story */}
          <div className="mb-24">
            <div className="grid lg:grid-cols-3 gap-12 items-start">
              <div className="lg:col-span-2">
                <h2 className="text-4xl font-bold text-gray-900 mb-8">
                  From Kathmandu Operations to Carmel AI: A 28-Year Journey
                </h2>
                
                <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
                  <p>
                    For over <strong className="text-blue-600">28 years</strong>, I've personally operated luxury and adventure tours across 
                    <strong className="text-blue-600"> Nepal, Tibet, and Bhutan</strong>. This isn't theoretical knowledge—it's hands-on 
                    experience negotiating with remote lodge owners, coordinating helicopter rescues at 5,000m, and curating experiences 
                    for dignitaries that never appear on public itineraries.
                  </p>
                  
                  <p>
                    For the past <strong className="text-teal-600">12 years</strong>, I've worked as an IT Business Analyst and Consultant for 
                    <strong className="text-teal-600"> Travelport, American Airlines, American Express Global Business Travel, and Starr Insurance</strong>. 
                    This unique dual expertise means your travel platform is built with <strong>real operational knowledge</strong> and 
                    <strong> enterprise-grade technology standards</strong> from day one.
                  </p>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-teal-50 border-l-4 border-blue-500 p-8 rounded-r my-8">
                    <p className="font-semibold text-blue-800 text-lg mb-3">The CuratedAscents AI Difference:</p>
                    <p className="text-blue-700">
                      "We combine 28 years of on-the-ground Himalayan expertise with the same enterprise technology standards used by 
                      global airlines and Fortune 500 travel departments. Our AI doesn't replace human knowledge—it amplifies it, 
                      allowing us to deliver white-glove service at scale."
                    </p>
                    <p className="text-sm text-blue-600 mt-4">— Kiran Pokhrel, Founder</p>
                  </div>
                  
                  <p>
                    CuratedAscents AI represents the intersection of these two worlds. Every AI recommendation encodes decades of 
                    Himalayan travel intelligence, from altitude acclimatization protocols for luxury clients to which mountain 
                    view suite is worth the upgrade during specific seasons.
                  </p>
                </div>
              </div>
              
              {/* Sidebar - Expertise Highlights */}
              <div className="space-y-6">
                <div className="luxury-card p-8">
                  <h3 className="text-xl font-bold mb-6 text-blue-900">🏔️ Operational Mastery</h3>
                  <ul className="space-y-4">
                    {[
                      'Network of 500+ vetted luxury suppliers',
                      'Hidden gem locations only locals know',
                      'Altitude & safety protocols from experience',
                      'Cultural access beyond standard tours'
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-blue-500 mr-3">✓</span>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="luxury-card p-8">
                  <h3 className="text-xl font-bold mb-6 text-teal-900">💻 Technical Excellence</h3>
                  <ul className="space-y-4">
                    {[
                      'GDS & airline systems (Travelport, AA)',
                      'Corporate travel protocols (Amex GBT)',
                      'Risk management frameworks (Starr)',
                      'Enterprise scalability patterns'
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-teal-500 mr-3">⚡</span>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Dual Expertise Visual */}
          <div className="mb-24">
            <h2 className="text-3xl font-bold text-center mb-16">The Unique Intersection</h2>
            
            <div className="grid md:grid-cols-2 gap-12">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-8">
                  <span className="text-4xl text-white">🏔️</span>
                </div>
                <h3 className="text-2xl font-bold mb-6">28+ Years Himalayan Operations</h3>
                <ul className="space-y-4 text-gray-700">
                  <li className="flex items-center justify-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    Luxury lodge & hotel partnerships
                  </li>
                  <li className="flex items-center justify-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    Guide network with 15+ years experience
                  </li>
                  <li className="flex items-center justify-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    Exclusive cultural access
                  </li>
                </ul>
              </div>
              
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-8">
                  <span className="text-4xl text-white">💻</span>
                </div>
                <h3 className="text-2xl font-bold mb-6">12+ Years Enterprise IT</h3>
                <ul className="space-y-4 text-gray-700">
                  <li className="flex items-center justify-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                    Travelport GDS systems
                  </li>
                  <li className="flex items-center justify-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                    American Airlines operations
                  </li>
                  <li className="flex items-center justify-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                    Amex GBT corporate protocols
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="text-center mt-12">
              <div className="w-32 h-32 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-8">
                <span className="text-5xl text-white">✨</span>
              </div>
              <h3 className="text-2xl font-bold mb-6">CuratedAscents AI</h3>
              <p className="text-gray-700 max-w-2xl mx-auto">
                The intersection where deep operational knowledge meets enterprise-grade AI technology, 
                creating a luxury travel platform unlike any other.
              </p>
            </div>
          </div>

          {/* Final CTA */}
          <div className="text-center p-12 luxury-gradient rounded-3xl text-white">
            <h2 className="text-3xl font-bold mb-6">Experience the Difference</h2>
            <p className="text-xl opacity-90 mb-10 max-w-3xl mx-auto">
              This isn't just another travel website. It's the culmination of decades of expertise, 
              powered by AI to deliver truly personalized luxury travel.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/ai-generator" 
                className="bg-white text-gray-900 hover:bg-gray-100 font-semibold py-4 px-10 rounded-xl text-lg transition"
              >
                Try AI Generator
              </a>
              <a 
                href="/contact" 
                className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-semibold py-4 px-10 rounded-xl text-lg transition"
              >
                Contact Kiran
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}