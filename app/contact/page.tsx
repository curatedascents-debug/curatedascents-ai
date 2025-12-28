"use client";

import { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    destination: 'Nepal',
    travelers: '1',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitError, setSubmitError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    setSubmitMessage('');
    
    // REPLACE THIS URL WITH YOUR ACTUAL FORMSPREE ENDPOINT
    const FORMSPREE_ENDPOINT = "https://formspree.io/f/meeqkvpp";
    
    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          destination: formData.destination,
          travelers: formData.travelers,
          message: formData.message,
          _subject: `New Inquiry: ${formData.destination} trip for ${formData.travelers} traveler(s)`,
        }),
      });
      
      if (response.ok) {
        setSubmitMessage(`Thank you ${formData.name}! Your inquiry for ${formData.destination} has been received. I'll personally respond within 24 hours.`);
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          destination: 'Nepal',
          travelers: '1',
          message: ''
        });
      } else {
        throw new Error('Form submission failed');
      }
    } catch (error) {
      setSubmitError('There was an error sending your message. Please email me directly or try again.');
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <section className="px-6 py-16 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Begin Your Journey
          </h1>
          <p className="text-xl opacity-90">
            Share your vision. I'll craft the perfect Himalayan experience using 25 years of expertise and AI precision.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-12">
        <div className="md:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Personalized Inquiry</h2>
            <p className="text-gray-600 mb-8">All inquiries receive my direct attention.</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Primary Destination</label>
                  <select
                    name="destination"
                    value={formData.destination}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Nepal">Nepal</option>
                    <option value="Bhutan">Bhutan</option>
                    <option value="Tibet">Tibet</option>
                    <option value="Multiple">Multiple Destinations</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Travelers</label>
                  <select
                    name="travelers"
                    value={formData.travelers}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="1">Solo Traveler</option>
                    <option value="2">Couple (2)</option>
                    <option value="4">Small Group (3-4)</option>
                    <option value="8">Large Group (5-8)</option>
                    <option value="9+">9+ Travelers</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Your Vision & Requirements *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tell me about your dream experience: preferred dates, interests (trekking/culture/luxury), budget considerations, special requirements..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg text-lg transition disabled:opacity-70"
              >
                {isSubmitting ? 'Sending Your Inquiry...' : 'Submit Inquiry →'}
              </button>

              {submitMessage && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-medium">✓ {submitMessage}</p>
                </div>
              )}

              {submitError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 font-medium">⚠️ {submitError}</p>
                  <p className="text-red-700 text-sm mt-1">
                    You can also email me directly at: curatedascents@gmail.com
                  </p>
                </div>
              )}
            </form>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Why Inquire Directly</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <span className="text-blue-600 mr-3">✓</span>
                <span className="text-gray-700">Personal response within <strong>24 hours</strong></span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-3">✓</span>
                <span className="text-gray-700">Initial <strong>AI-powered itinerary draft</strong> included</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-3">✓</span>
                <span className="text-gray-700">No automated responses - <strong>direct expert consultation</strong></span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Email Testing Note</h3>
            <p className="text-gray-700 mb-3">
              <strong>Form is now connected to Formspree.</strong> After submitting, check:
            </p>
            <ol className="space-y-2 text-gray-700 text-sm">
              <li>1. Your Formspree dashboard for the submission</li>
              <li>2. Your connected email inbox</li>
              <li>3. The success message on this page</li>
            </ol>
          </div>
        </div>
      </div>
    </main>
  );
}
