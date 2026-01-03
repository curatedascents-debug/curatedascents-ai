"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ThankYouPage() {
  const router = useRouter();

  useEffect(() => {
    // Auto-redirect to home after 10 seconds
    const timer = setTimeout(() => {
      router.push('/');
    }, 10000);
    
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-6">
      <div className="max-w-2xl mx-auto text-center bg-white rounded-3xl shadow-2xl p-12 md:p-16">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
          <span className="text-3xl">✨</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Thank You for Your Inquiry!
        </h1>
        
        <p className="text-xl text-gray-600 mb-10 max-w-lg mx-auto">
          Your luxury travel inquiry has been received. I'll review your details and 
          respond personally within 24 hours.
        </p>
        
        <div className="bg-blue-50 rounded-2xl p-8 mb-10 border border-blue-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">What Happens Next:</h2>
          <ol className="text-left text-gray-700 space-y-3">
            <li className="flex items-start">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">1</span>
              <span>I'll review your inquiry and any attached AI itinerary</span>
            </li>
            <li className="flex items-start">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">2</span>
              <span>Personalized response with initial recommendations</span>
            </li>
            <li className="flex items-start">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">3</span>
              <span>Option to schedule a consultation call</span>
            </li>
            <li className="flex items-start">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">4</span>
              <span>Customized itinerary and pricing proposal</span>
            </li>
          </ol>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-8 rounded-xl hover:opacity-90 transition"
          >
            Return Home
          </Link>
          <Link
            href="/ai-generator"
            className="bg-gray-100 text-gray-800 font-semibold py-3 px-8 rounded-xl hover:bg-gray-200 transition border border-gray-300"
          >
            Create Another Itinerary
          </Link>
        </div>
        
        <p className="text-sm text-gray-500 mt-10">
          You will be redirected to the homepage in 10 seconds...
        </p>
        
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-600">
            Need immediate assistance? Email me directly at{' '}
            <a href="mailto:curatedascents@gmail.com" className="text-blue-600 font-semibold hover:underline">
              curatedascents@gmail.com
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}