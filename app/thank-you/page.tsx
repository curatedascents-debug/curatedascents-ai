"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EnhancedThankYouPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);
  const [hasAiItinerary, setHasAiItinerary] = useState(false);

  useEffect(() => {
    // Check for AI itinerary
    const savedItinerary = localStorage.getItem('ai-itinerary');
    setHasAiItinerary(!!savedItinerary);

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [router]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="luxury-card overflow-hidden">
          {/* Header */}
          <div className="p-8 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-center">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">✨</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Thank You for Choosing CuratedAscents AI!
            </h1>
            <p className="text-xl opacity-90">
              Your luxury Himalayan journey begins now.
            </p>
          </div>
          
          {/* Main Content */}
          <div className="p-8 md:p-12">
            <div className="text-center mb-10">
              <p className="text-xl text-gray-700 mb-6 max-w-2xl mx-auto">
                Your inquiry has been received by Kiran's team. We're excited to help create your perfect 
                Himalayan luxury experience using 28+ years of expertise and AI-powered planning.
              </p>
              
              {hasAiItinerary && (
                <div className="inline-flex items-center bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-3 rounded-full text-blue-700 font-semibold mb-8">
                  <span className="mr-3">🤖</span>
                  Your AI itinerary has been attached for Kiran's review
                </div>
              )}
            </div>
            
            {/* Next Steps */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                What Happens Next:
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    step: 1,
                    title: 'Expert Review',
                    description: 'Kiran personally reviews your inquiry and any AI itinerary',
                    icon: '👨‍💼',
                    color: 'blue'
                  },
                  {
                    step: 2,
                    title: 'Personalized Response',
                    description: 'Detailed recommendations based on 28+ years expertise',
                    icon: '✉️',
                    color: 'green'
                  },
                  {
                    step: 3,
                    title: 'Consultation Call',
                    description: 'Optional video call with Kiran\'s team',
                    icon: '📞',
                    color: 'purple'
                  },
                  {
                    step: 4,
                    title: 'Custom Proposal',
                    description: 'Bespoke itinerary & pricing for your approval',
                    icon: '📋',
                    color: 'amber'
                  }
                ].map((item) => (
                  <div key={item.step} className="flex items-start p-6 bg-gray-50 rounded-2xl">
                    <div className={`w-14 h-14 bg-gradient-to-br from-${item.color}-500 to-${item.color}-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mr-6 flex-shrink-0`}>
                      {item.step}
                    </div>
                    <div>
                      <div className="flex items-center mb-2">
                        <span className="text-2xl mr-3">{item.icon}</span>
                        <h3 className="font-semibold text-gray-900 text-lg">{item.title}</h3>
                      </div>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Kiran's Promise */}
            <div className="mb-12 p-8 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-200">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mr-6">
                  KP
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Kiran's Personal Promise</h3>
                  <p className="text-gray-600">Founder, CuratedAscents AI</p>
                </div>
              </div>
              <blockquote className="text-gray-700 italic text-lg border-l-4 border-blue-500 pl-6 py-2">
                "Every journey we craft combines 28 years of Himalayan operational expertise with 
                enterprise-grade AI technology. You'll receive white-glove service from our US-based 
                AI platform and Nepal-based execution team."
              </blockquote>
            </div>
            
            {/* Contact Info */}
            <div className="mb-12">
              <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Need Immediate Assistance?</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="text-center p-6 bg-gray-50 rounded-2xl">
                  <div className="text-3xl mb-4">📧</div>
                  <h4 className="font-semibold text-gray-900 mb-2">Email Kiran Directly</h4>
                  <a 
                    href="mailto:kiran@curatedascents.com" 
                    className="text-blue-600 font-semibold hover:text-blue-800 transition"
                  >
                    kiran@curatedascents.com
                  </a>
                </div>
                <div className="text-center p-6 bg-gray-50 rounded-2xl">
                  <div className="text-3xl mb-4">🤖</div>
                  <h4 className="font-semibold text-gray-900 mb-2">Create Another Itinerary</h4>
                  <p className="text-gray-600 text-sm">Our AI gets better with each use</p>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link
                href="/"
                className="luxury-button py-4 px-10 text-center"
              >
                Return Home
              </Link>
              <Link
                href="/ai-generator"
                className="luxury-button-outline py-4 px-10 text-center"
              >
                Create Another Itinerary
              </Link>
            </div>
            
            {/* Countdown */}
            <div className="text-center">
              <p className="text-sm text-gray-500">
                You will be redirected to the homepage in{' '}
                <span className="font-bold text-blue-600">{countdown}</span> seconds...
              </p>
            </div>
          </div>
          
          {/* Footer Note */}
          <div className="p-6 bg-gray-900 text-gray-400 text-center">
            <p className="text-sm">
              © {new Date().getFullYear()} CuratedAscents AI • Carmel, IN • Kathmandu, NP
            </p>
            <p className="text-xs mt-2">
              28+ Years Himalayan Expertise × Enterprise-Grade AI Technology
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}