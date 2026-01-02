"use client";

import { useState, useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    destination: 'Nepal',
    travelers: '1',
    travelDates: '',
    budget: 'luxury',
    interests: [] as string[],
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAiItinerary, setHasAiItinerary] = useState(false);
  const [interests, setInterests] = useState<string[]>([]);

  // Check for AI itinerary when page loads
  useEffect(() => {
    const savedItinerary = localStorage.getItem('ai-itinerary');
    if (savedItinerary) {
      setHasAiItinerary(true);
      toast.success('AI itinerary detected! We\'ll reference it in your inquiry.');
    }
    
    // Try to get user interests from AI generator
    const aiPreferences = localStorage.getItem('ai-preferences');
    if (aiPreferences) {
      try {
        const prefs = JSON.parse(aiPreferences);
        setFormData(prev => ({
          ...prev,
          destination: prefs.destination || 'Nepal',
          travelers: prefs.travelers || '1',
          budget: prefs.budget || 'luxury'
        }));
        setInterests(prefs.interests || []);
      } catch (e) {
        // Ignore errors
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleInterest = (interest: string) => {
    const newInterests = interests.includes(interest)
      ? interests.filter(i => i !== interest)
      : [...interests, interest];
    setInterests(newInterests);
    setFormData(prev => ({ ...prev, interests: newInterests }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Get AI itinerary if exists
    const aiItinerary = localStorage.getItem('ai-itinerary') || '';
    
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
          phone: formData.phone || 'Not provided',
          destination: formData.destination,
          travelers: formData.travelers,
          travelDates: formData.travelDates || 'Flexible',
          budget: formData.budget,
          interests: interests.join(', ') || 'Not specified',
          message: formData.message,
          aiItinerary: aiItinerary ? 'Yes - attached' : 'No',
          source: aiItinerary ? 'AI Generator' : 'Direct Contact',
          _subject: `[${aiItinerary ? 'AI' : 'Direct'}] Inquiry: ${formData.destination} - ${formData.travelers} traveler(s)`,
        }),
      });
      
      if (response.ok) {
        toast.success(`Thank you ${formData.name}! Your luxury inquiry has been received. I'll respond within 24 hours.`);
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          destination: 'Nepal',
          travelers: '1',
          travelDates: '',
          budget: 'luxury',
          interests: [],
          message: ''
        });
        setInterests([]);
        
        // Clear AI data after successful submission
        localStorage.removeItem('ai-itinerary');
        localStorage.removeItem('ai-preferences');
        setHasAiItinerary(false);
        
      } else {
        throw new Error('Form submission failed');
      }
    } catch (error) {
      toast.error('There was an error sending your message. Please email curatedascents@gmail.com directly.');
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const interestOptions = ['Culture', 'Trekking', 'Luxury', 'Wellness', 'Wildlife', 'Photography', 'Spiritual'];
  const budgetOptions = [
    { value: 'premium', label: 'Premium ($300-500/day)' },
    { value: 'luxury', label: 'Luxury ($500-800/day)' },
    { value: 'ultra-luxury', label: 'Ultra-Luxury ($800+/day)' },
    { value: 'not-sure', label: 'Not sure - need guidance' }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Toaster position="top-right" />
      
      <section className="px-6 py-16 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-6xl mx-auto text-center">
          {hasAiItinerary && (
            <div className="inline-flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <span className="mr-2">✨</span> AI Itinerary Detected - Let's Make It Real!
            </div>
          )}
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Begin Your Luxury Journey
          </h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto">
            Share your vision. I'll craft the perfect Himalayan experience using 25 years of expertise.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-12">
        <div className="md:col-span-2">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Personalized Inquiry</h2>
              {hasAiItinerary && (
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                  AI Itinerary Attached
                </span>
              )}
            </div>
            <p className="text-gray-600 mb-8">All inquiries receive my direct attention and expert consultation.</p>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Info */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Phone (Optional)</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Travel Dates</label>
                  <input
                    type="text"
                    name="travelDates"
                    value={formData.travelDates}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., March 2024, Flexible, Next 6 months"
                  />
                </div>
              </div>

              {/* Destination & Travelers */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Primary Destination</label>
                  <select
                    name="destination"
                    value={formData.destination}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="1">Solo Traveler</option>
                    <option value="2">Couple (2)</option>
                    <option value="4">Small Group (3-4)</option>
                    <option value="8">Large Group (5-8)</option>
                    <option value="9+">9+ Travelers</option>
                  </select>
                </div>
              </div>

              {/* Interests */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">Interests (Select all that apply)</label>
                <div className="flex flex-wrap gap-2">
                  {interestOptions.map(interest => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`px-4 py-2 rounded-lg border transition ${interests.includes(interest)
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">Budget Level</label>
                <div className="space-y-2">
                  {budgetOptions.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, budget: option.value }))}
                      className={`w-full p-4 rounded-xl border-2 text-left transition ${formData.budget === option.value
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">Your Vision & Requirements *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Tell me about your dream experience: preferred dates, interests, special requirements, celebrations, or any questions..."
                />
                {hasAiItinerary && (
                  <p className="text-sm text-green-600 mt-2">
                    💡 Your AI-generated itinerary will be automatically included with this submission.
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-lg text-lg transition disabled:opacity-70 shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 text-white mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending Your Luxury Inquiry...
                  </span>
                ) : (
                  'Begin Your Luxury Journey →'
                )}
              </button>

              <p className="text-sm text-gray-500 text-center">
                By submitting, you agree to our Privacy Policy. You'll receive a personal response within 24 hours.
              </p>
            </form>
          </div>
        </div>

        <div className="space-y-8">
          {/* Benefits */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Why Inquire Directly</h3>
            <ul className="space-y-4">
              {[
                "Personal response within 24 hours",
                "Initial AI-powered itinerary draft included",
                "No automated responses - direct expert consultation",
                "25+ years of Himalayan expertise",
                "Luxury property insider access",
                "Custom pricing based on exact requirements"
              ].map((benefit, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-600 mr-3 mt-1">✓</span>
                  <span className="text-gray-700">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* AI Integration Info */}
          {hasAiItinerary && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-8">
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">✨</span>
                <h3 className="text-xl font-bold text-gray-900">AI Itinerary Attached</h3>
              </div>
              <p className="text-gray-700 mb-4">
                Your AI-generated itinerary will be automatically included with this inquiry. I'll review it and provide expert refinement suggestions.
              </p>
              <button
                onClick={() => {
                  localStorage.removeItem('ai-itinerary');
                  setHasAiItinerary(false);
                  toast.success('AI itinerary removed');
                }}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Remove AI itinerary
              </button>
            </div>
          )}

          {/* Contact Info */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Direct Contact</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <span className="text-gray-600 mr-4">📧</span>
                <div>
                  <div className="font-medium">Email</div>
                  <div className="text-gray-700">curatedascents@gmail.com</div>
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-gray-600 mr-4">⏰</span>
                <div>
                  <div className="font-medium">Response Time</div>
                  <div className="text-gray-700">Within 24 hours</div>
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-gray-600 mr-4">🌏</span>
                <div>
                  <div className="font-medium">Based In</div>
                  <div className="text-gray-700">Kathmandu, Nepal</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}