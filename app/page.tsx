export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center luxury-gradient overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-6xl mx-auto text-center">
            {/* Founder Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full mb-8 border border-white/20">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Founded by Kiran Pokhrel • 28+ Years Himalayan Expertise</span>
            </div>
            
            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
              <span className="text-white">Himalayan Luxury</span>
              <br />
              <span className="bg-gradient-to-r from-cyan-300 via-blue-300 to-teal-300 bg-clip-text text-transparent">
                Reimagined by AI
              </span>
            </h1>
            
            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-3xl mx-auto leading-relaxed">
              Combining 28 years of exclusive Himalayan access with enterprise-grade AI to deliver 
              bespoke journeys that traditional travel can't match.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <a 
                href="/ai-generator" 
                className="group bg-white text-gray-900 hover:bg-gray-50 font-semibold py-5 px-12 rounded-xl text-lg transition-all transform hover:scale-105 shadow-2xl flex items-center justify-center gap-3"
              >
                <span>Begin AI Consultation</span>
                <span className="group-hover:translate-x-2 transition-transform">→</span>
              </a>
              <a 
                href="#how-it-works" 
                className="bg-transparent border-2 border-white/30 hover:border-white text-white font-semibold py-5 px-12 rounded-xl text-lg transition flex items-center justify-center gap-3"
              >
                <span>See The AI Advantage</span>
                <span className="text-xl">✨</span>
              </a>
            </div>
            
            {/* Trust Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {[
                { value: '28+', label: 'Years Expertise', icon: '🏔️' },
                { value: '500+', label: 'Vetted Suppliers', icon: '🤝' },
                { value: 'AI-Powered', label: 'Technology', icon: '🤖' },
                { value: '100%', label: 'Private Journeys', icon: '✨' }
              ].map((stat, idx) => (
                <div key={idx} className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                  <div className="text-2xl mb-2">{stat.icon}</div>
                  <div className="text-2xl font-bold text-cyan-300">{stat.value}</div>
                  <div className="text-sm text-blue-200 mt-2">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2"></div>
          </div>
        </div>
      </section>

      {/* AI Advantage Section */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              The <span className="text-blue-600">AI Advantage</span> for Luxury Travel
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Why settle for weeks of planning when AI delivers hyper-personalized luxury in minutes?
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: '🧠',
                title: 'AI-Powered Intelligence',
                description: 'DeepSeek AI trained on 28 years of Himalayan travel patterns',
                features: ['Personalized itinerary generation', 'Real-time availability', 'Dynamic pricing']
              },
              {
                icon: '⚡',
                title: '10x Faster Planning',
                description: 'Minutes vs weeks for initial luxury itinerary creation',
                features: ['Instant AI generation', 'Quick refinements', 'Rapid iteration']
              },
              {
                icon: '🏨',
                title: 'Supplier-Aware Planning',
                description: 'Direct access to elite luxury properties and experiences',
                features: ['Real partner rates', 'Exclusive access', 'Priority bookings']
              },
              {
                icon: '👁️',
                title: 'Human Perfection',
                description: 'AI drafts, Kiran\'s Nepal team perfects every detail',
                features: ['Expert final review', 'Local execution', 'White-glove service']
              }
            ].map((feature, idx) => (
              <div key={idx} className="luxury-card p-8">
                <div className="text-4xl mb-6">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600 mb-6">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.features.map((item, fIdx) => (
                    <li key={fIdx} className="flex items-center text-sm text-gray-700">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder Highlight */}
      <section className="py-24 luxury-gradient-light">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Founder Content */}
              <div>
                <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                  <span>👨‍💼</span>
                  <span>Meet the Founder</span>
                </div>
                
                <h2 className="text-4xl font-bold mb-6">
                  Kiran Pokhrel: Where <span className="text-blue-600">Luxury Travel</span> Meets <span className="text-teal-600">Enterprise Tech</span>
                </h2>
                
                <div className="space-y-6 text-gray-700">
                  <p className="text-lg">
                    With <strong>28 years of Himalayan luxury travel operations</strong> and <strong>12 years as an IT Business Analyst</strong> for companies like American Airlines and American Express Global Business Travel, Kiran brings a unique perspective to travel technology.
                  </p>
                  
                  <p>
                    CuratedAscents AI represents the culmination of this dual expertise—combining deep local knowledge with enterprise-grade automation.
                  </p>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-teal-50 border-l-4 border-blue-500 p-6 rounded-r">
                    <p className="font-semibold text-blue-800 mb-2">The Unique Advantage:</p>
                    <p className="text-blue-700">
                      "Our AI doesn't replace human expertise—it amplifies it. Every itinerary encodes 28 years of Himalayan knowledge, from altitude protocols to which mountain lodge has the most exceptional private dining."
                    </p>
                  </div>
                </div>
                
                <div className="mt-8">
                  <a 
                    href="/about" 
                    className="luxury-button-outline inline-flex items-center gap-2"
                  >
                    <span>Explore Full Expertise</span>
                    <span>→</span>
                  </a>
                </div>
              </div>
              
              {/* Founder Stats */}
              <div className="grid grid-cols-2 gap-6">
                {[
                  { number: '28+', label: 'Years Himalayan Experience', color: 'blue' },
                  { number: '500+', label: 'Vetted Luxury Suppliers', color: 'teal' },
                  { number: '12+', label: 'Years Enterprise IT', color: 'purple' },
                  { number: '100%', label: 'Personalized Journeys', color: 'amber' }
                ].map((stat, idx) => (
                  <div key={idx} className="luxury-card p-6 text-center">
                    <div className={`text-3xl font-bold text-${stat.color}-600 mb-2`}>{stat.number}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Luxury Destinations */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Exclusive Himalayan Destinations</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI understands the nuances of each destination, from luxury lodge availability to seasonal exclusives
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                destination: 'Nepal',
                color: 'from-red-500 to-orange-500',
                highlights: ['Everest Luxury Lodges', 'Annapurna Heli-Tours', 'Kathmandu Heritage'],
                description: 'The ultimate Himalayan luxury destination'
              },
              {
                destination: 'Bhutan',
                color: 'from-orange-500 to-amber-500',
                highlights: ['Dragon Kingdom Tours', 'Luxury Monastery Stays', 'Private Cultural Access'],
                description: 'Last Buddhist kingdom, premium access'
              },
              {
                destination: 'Tibet',
                color: 'from-yellow-500 to-red-500',
                highlights: ['Lhasa Palace Stays', 'Mount Kailash Pilgrimage', 'Trans-Himalayan Routes'],
                description: 'Spiritual journeys, exclusive permits'
              },
              {
                destination: 'Himalayan India',
                color: 'from-green-500 to-teal-500',
                highlights: ['Ladakh Monasteries', 'Sikkim Tea Estates', 'Himachal Luxury Villas'],
                description: 'Diverse luxury across the range'
              }
            ].map((dest, idx) => (
              <div key={idx} className="luxury-card group overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${dest.color}`}></div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-4">{dest.destination}</h3>
                  <p className="text-gray-600 mb-6">{dest.description}</p>
                  <ul className="space-y-3 mb-8">
                    {dest.highlights.map((highlight, hIdx) => (
                      <li key={hIdx} className="flex items-center text-sm">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                        {highlight}
                      </li>
                    ))}
                  </ul>
                  <a 
                    href={`/ai-generator?destination=${dest.destination.toLowerCase()}`}
                    className="text-blue-600 font-semibold hover:text-blue-800 transition group-hover:translate-x-2 inline-flex items-center gap-2"
                  >
                    Plan {dest.destination} Journey
                    <span>→</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 luxury-gradient text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-8">
              Ready to Experience <span className="text-cyan-300">AI-Powered Luxury Travel</span>?
            </h2>
            
            <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
              Get your personalized itinerary in minutes, backed by 28 years of Himalayan expertise and enterprise-grade technology.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <a 
                href="/ai-generator" 
                className="bg-white text-gray-900 hover:bg-gray-100 font-semibold py-5 px-12 rounded-xl text-lg transition-all transform hover:scale-105 shadow-2xl"
              >
                Start AI Consultation
              </a>
              <a 
                href="/contact" 
                className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-semibold py-5 px-12 rounded-xl text-lg transition"
              >
                Talk to Kiran's Team
              </a>
            </div>
            
            <p className="text-sm text-blue-300 mt-8">
              No credit card required • Your first itinerary is complimentary
            </p>
          </div>
        </div>
      </section>
    </>
  );
}