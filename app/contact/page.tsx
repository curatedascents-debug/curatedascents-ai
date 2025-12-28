"use client"; // This marks the page as a Client Component for interactivity

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // For now, we'll simulate form submission
    // In the next step, we'll connect to a real email service
    setTimeout(() => {
      console.log('Form would submit:', formData);
      setSubmitMessage(`Thank you ${formData.name}! Your inquiry for ${formData.destination} has been received. I'll personally respond within 24 hours.`);
      setIsSubmitting(false);
      
      // Reset form after successful "submission"
      setFormData({
        name: '',
        email: '',
        destination: 'Nepal',
        travelers: '1',
        message: ''
      });
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
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
        {/* Contact Form */}
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
                {isSubmitting ? 'Crafting Your Response...' : 'Submit Inquiry →'}
              </button>

              {submitMessage && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-medium">✓ {submitMessage}</p>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Contact Info Sidebar */}
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
              <li className="flex items-start">
                <span className="text-blue-600 mr-3">✓</span>
                <span className="text-gray-700">Priority access to <strong>exclusive experiences</strong></span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">What Happens Next</h3>
            <ol className="space-y-4 text-gray-700">
              <li className="flex items-start">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">1</span>
                <span>I'll review your inquiry and research availability</span>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">2</span>
                <span>Generate a preliminary AI-curated itinerary</span>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">3</span>
                <span>Schedule a personal consultation call</span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </main>
  );
}
