"use client";

import { useState, useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function ContactPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    destination: 'Nepal',
    travelers: '1',
    travelDates: '',
    budget: 'luxury',
    interests: [] as string[],
    message: '',
    urgency: 'standard',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAiItinerary, setHasAiItinerary] = useState(false);
  const [aiItineraryPreview, setAiItineraryPreview] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [formProgress, setFormProgress] = useState(0);

  // Check for AI itinerary and preferences when page loads
  useEffect(() => {
    const savedItinerary = localStorage.getItem('ai-itinerary');
    const aiPreferences = localStorage.getItem('ai-preferences');
    
    if (savedItinerary) {
      setHasAiItinerary(true);
      // Create a short preview (first 200 chars)
      const preview = savedItinerary.length > 200 
        ? savedItinerary.substring(0, 200) + '...' 
        : savedItinerary;
      setAiItineraryPreview(preview);
      
      toast.success('AI itinerary detected! It will be included in your inquiry.', {
        duration: 4000,
        icon: '✨',
      });
    }
    
    if (aiPreferences) {
      try {
        const prefs = JSON.parse(aiPreferences);
        const newFormData = { ...formData };
        
        if (prefs.destination) newFormData.destination = prefs.destination;
        if (prefs.travelers) newFormData.travelers = prefs.travelers;
        if (prefs.budget) newFormData.budget = prefs.budget;
        if (prefs.dates) newFormData.travelDates = prefs.dates;
        
        setFormData(newFormData);
        setInterests(prefs.interests || []);
        newFormData.interests = prefs.interests || [];
        
        toast('AI preferences loaded', {
          icon: '🤖',
          duration: 3000,
        });
      } catch (e) {
        console.error('Error parsing AI preferences:', e);
      }
    }
    
    // Calculate form progress
    calculateFormProgress();
  }, []);

  // Update progress when form data changes
  useEffect(() => {
    calculateFormProgress();
  }, [formData, interests]);

  const calculateFormProgress = () => {
    let progress = 0;
    const totalFields = 8; // Adjust based on important fields
    
    if (formData.name) progress += 15;
    if (formData.email) progress += 15;
    if (formData.destination && formData.destination !== 'Nepal') progress += 10;
    if (formData.travelDates) progress += 10;
    if (formData.budget && formData.budget !== 'not-sure') progress += 15;
    if (interests.length > 0) progress += 15;
    if (formData.message) progress += 20;
    
    setFormProgress(Math.min(progress, 100));
  };

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
    const aiPreferences = localStorage.getItem('ai-preferences') || '';
    
    const FORMSPREE_ENDPOINT = "https://formspree.io/f/meeqkvpp";
    
    try {
      // Get estimated budget range
      const budgetLabels: Record<string, string> = {
        'budget': 'Budget ($150-300/day)',
        'premium': 'Premium ($300-500/day)',
        'luxury': 'Luxury ($500-800/day)',
        'ultra-luxury': 'Ultra-Luxury ($800+/day)',
        'not-sure': 'Not sure - need guidance'
      };
      
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || 'Not provided',
          destination: formData.destination,
          travelers: formData.travelers,
          travelDates: formData.travelDates || 'Flexible',
          budget: budgetLabels[formData.budget] || formData.budget,
          interests: interests.join(', ') || 'Not specified',
          message: formData.message,
          urgency: formData.urgency,
          aiItinerary: aiItinerary ? 'Yes' : 'No',
          aiPreferences: aiPreferences ? 'Yes' : 'No',
          source: aiItinerary ? 'AI Generator' : 'Direct Contact',
          estimatedValue: calculateEstimatedValue(formData.budget, formData.travelers),
          _subject: `[${formData.urgency === 'urgent' ? 'URGENT' : 'Inquiry'}] ${formData.name} - ${formData.destination} - ${budgetLabels[formData.budget] || 'Luxury'}`,
          _replyto: formData.email,
        }),
      });
      
      if (response.ok) {
        toast.success(`Thank you ${formData.name}! Your luxury inquiry has been received. I'll respond within ${formData.urgency === 'urgent' ? '12 hours' : '24 hours'}.`, {
          duration: 6000,
          icon: '🌟',
        });
        
        // Track submission for analytics
        localStorage.setItem('last-inquiry-time', new Date().toISOString());
        
        // Reset form but keep some preferences
        setFormData({
          name: '',
          email: '',
          phone: '',
          destination: formData.destination, // Keep destination
          travelers: '1',
          travelDates: '',
          budget: formData.budget, // Keep budget preference
          interests: [],
          message: '',
          urgency: 'standard',
        });
        setInterests([]);
        
        // Clear AI data after successful submission
        localStorage.removeItem('ai-itinerary');
        localStorage.removeItem('ai-preferences');
        setHasAiItinerary(false);
        setAiItineraryPreview('');
        
        // Redirect to thank you page after delay
        setTimeout(() => {
          router.push('/thank-you');
        }, 3000);
        
      } else {
        throw new Error('Form submission failed');
      }
    } catch (error) {
      toast.error('There was an error sending your message. Please email curatedascents@gmail.com directly.', {
        duration: 5000,
      });
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateEstimatedValue = (budget: string, travelers: string) => {
    const dailyRates: Record<string, number> = {
      'budget': 225,
      'premium': 400,
      'luxury': 650,
      'ultra-luxury': 1000,
      'not-sure': 500,
    };
    
    const numTravelers = parseInt(travelers) || 1;
    const avgTripLength = 10; // days
    const dailyRate = dailyRates[budget] || 500;
    
    return `~$${Math.round(dailyRate * avgTripLength * numTravelers).toLocaleString()}`;
  };

  const interestOptions = [
    { value: 'Culture', icon: '🏛️' },
    { value: 'Trekking', icon: '🥾' },
    { value: 'Luxury', icon: '✨' },
    { value: 'Wellness', icon: '🧘' },
    { value: 'Wildlife', icon: '🐘' },
    { value: 'Photography', icon: '📸' },
    { value: 'Spiritual', icon: '🕉️' },
    { value: 'Adventure', icon: '🧗' },
    { value: 'Food', icon: '🍲' },
    { value: 'Family', icon: '👨‍👩‍👧‍👦' },
  ];
  
  const budgetOptions = [
    { value: 'budget', label: 'Budget ($150-300/day)', desc: 'Comfortable accommodations' },
    { value: 'premium', label: 'Premium ($300-500/day)', desc: 'Boutique hotels & guided experiences' },
    { value: 'luxury', label: 'Luxury ($500-800/day)', desc: '5-star properties & exclusive access' },
    { value: 'ultra-luxury', label: 'Ultra-Luxury ($800+/day)', desc: 'Private charters & bespoke services' },
    { value: 'not-sure', label: 'Not sure - need guidance', desc: 'Let\'s discuss options' },
  ];
  
  const urgencyOptions = [
    { value: 'standard', label: 'Standard (24h response)', desc: 'Planning for future travel' },
    { value: 'urgent', label: 'Urgent (12h response)', desc: 'Need immediate assistance' },
    { value: 'planning', label: 'Planning Phase', desc: 'Researching for future trip' },
  ];
  
  const popularDestinations = [
    'Nepal', 'Bhutan', 'Tibet', 'Multiple', 'India', 'Sri Lanka', 'Myanmar', 'Other'
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Toaster position="top-right" />
      
      {/* Progress Bar */}
      {formProgress > 0 && formProgress < 100 && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-50">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
            style={{ width: `${formProgress}%` }}
          />
        </div>
      )}
      
      <section className="px-6 py-16 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="max-w-6xl mx-auto text-center relative z-10">
          {hasAiItinerary && (
            <div className="inline-flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold mb-6 animate-pulse">
              <span className="mr-2">✨</span> AI-Powered Inquiry Detected
            </div>
          )}
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
            Begin Your Luxury Journey
          </h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto mb-8">
            Share your vision. I'll craft the perfect Himalayan experience using 25 years of expertise.
          </p>
          
          {/* Estimated Value Preview */}
          {formData.budget && formData.budget !== 'not-sure' && formData.travelers && (
            <div className="inline-block bg-white/10 backdrop-blur-sm px-6 py-3 rounded-2xl mb-4">
              <div className="text-sm opacity-80">Estimated Trip Value</div>
              <div className="text-2xl font-bold">
                {calculateEstimatedValue(formData.budget, formData.travelers)}
              </div>
              <div className="text-xs opacity-70">Based on {formData.travelers} traveler(s) for 10 days</div>
            </div>
          )}
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-12 grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Personalized Inquiry</h2>
                <p className="text-gray-600 mt-2">All inquiries receive my direct attention and expert consultation.</p>
              </div>
              {hasAiItinerary && (
                <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                  ✨ AI Itinerary Attached
                </span>
              )}
            </div>
            
            {/* AI Itinerary Preview */}
            {hasAiItinerary && aiItineraryPreview && (
              <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-gray-900 flex items-center">
                    <span className="mr-2">📋</span> AI Itinerary Preview
                  </h3>
                  <button
                    onClick={() => {
                      const fullItinerary = localStorage.getItem('ai-itinerary');
                      if (fullItinerary) {
                        navigator.clipboard.writeText(fullItinerary);
                        toast.success('Itinerary copied to clipboard');
                      }
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Copy Full Itinerary
                  </button>
                </div>
                <div className="text-gray-700 text-sm bg-white/50 p-4 rounded-lg max-h-32 overflow-y-auto">
                  {aiItineraryPreview}
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Progress Indicator */}
              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Inquiry Progress</span>
                  <span className="text-sm font-bold text-blue-600">{formProgress}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                    style={{ width: `${formProgress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Complete more fields for a more accurate consultation
                </p>
              </div>

              {/* Section 1: Basic Info */}
              <div className="space-y-8">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="text-xl font-semibold text-gray-900">Your Information</h3>
                  <p className="text-gray-600">How can I reach you?</p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="+1 (555) 123-4567"
                    />
                    <p className="text-xs text-gray-500 mt-1">For urgent inquiries or WhatsApp coordination</p>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Response Urgency</label>
                    <select
                      name="urgency"
                      value={formData.urgency}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    >
                      {urgencyOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Trip Details */}
              <div className="space-y-8">
                <div className="border-l-4 border-purple-500 pl-4">
                  <h3 className="text-xl font-semibold text-gray-900">Trip Details</h3>
                  <p className="text-gray-600">Tell me about your journey</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Primary Destination *</label>
                    <div className="grid grid-cols-2 gap-2">
                      {popularDestinations.map(dest => (
                        <button
                          key={dest}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, destination: dest }))}
                          className={`p-3 rounded-lg border-2 text-center transition ${formData.destination === dest
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                          {dest}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Travelers *</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {['1', '2', '4', '8', '9+'].map(num => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, travelers: num }))}
                          className={`p-3 rounded-lg border-2 text-center transition ${formData.travelers === num
                              ? 'border-purple-500 bg-purple-50 text-purple-700'
                              : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                          {num === '1' ? 'Solo' : num === '2' ? 'Couple' : num === '4' ? '3-4' : num === '8' ? '5-8' : '9+'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Travel Dates *</label>
                  <input
                    type="text"
                    name="travelDates"
                    value={formData.travelDates}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="e.g., March 15-30, 2024 • Flexible • Next 6 months"
                  />
                  <p className="text-xs text-gray-500 mt-1">Specific dates or general timeframe</p>
                </div>
              </div>

              {/* Section 3: Preferences */}
              <div className="space-y-8">
                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="text-xl font-semibold text-gray-900">Your Preferences</h3>
                  <p className="text-gray-600">What defines luxury for you?</p>
                </div>

                {/* Interests */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Interests (Select all that apply)</label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {interestOptions.map(({ value, icon }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => toggleInterest(value)}
                        className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center transition ${interests.includes(value)
                            ? 'border-green-500 bg-green-50 text-green-700 transform scale-105'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                      >
                        <span className="text-2xl mb-2">{icon}</span>
                        <span className="text-sm font-medium">{value}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Budget */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Budget Level *</label>
                  <div className="space-y-3">
                    {budgetOptions.map(option => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, budget: option.value }))}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${formData.budget === option.value
                            ? 'border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 shadow-md'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                          }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-semibold text-gray-900">{option.label}</div>
                            <div className="text-sm text-gray-600 mt-1">{option.desc}</div>
                          </div>
                          {formData.budget === option.value && (
                            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section 4: Final Details */}
              <div className="space-y-8">
                <div className="border-l-4 border-amber-500 pl-4">
                  <h3 className="text-xl font-semibold text-gray-900">Your Vision</h3>
                  <p className="text-gray-600">The more details, the better</p>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Your Vision, Requirements & Questions *
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      (What makes this trip special for you?)
                    </span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="Tell me about your dream experience: preferred dates, interests, special requirements, celebrations, or any questions..."
                  />
                  {hasAiItinerary && (
                    <div className="flex items-start mt-2 p-3 bg-blue-50 rounded-lg">
                      <span className="text-blue-500 mr-2">💡</span>
                      <p className="text-sm text-blue-700">
                        Your AI-generated itinerary will be automatically included and reviewed. I'll provide expert refinement suggestions based on 25+ years of experience.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Section */}
              <div className="pt-6 border-t border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {calculateEstimatedValue(formData.budget, formData.travelers)}
                    </div>
                    <div className="text-sm text-gray-600">
                      Estimated value for {formData.travelers === '1' ? 'a solo' : formData.travelers === '2' ? 'a couple' : 'a group'} trip
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Response time:</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {formData.urgency === 'urgent' ? 'Within 12 hours' : 
                       formData.urgency === 'planning' ? 'Within 48 hours' : 
                       'Within 24 hours'}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white font-bold py-5 px-6 rounded-2xl text-lg transition-all duration-300 disabled:opacity-70 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-6 w-6 text-white mr-3" xmlns="http://www.w3.org/2000/snow" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending Your Luxury Inquiry...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      Begin Your Luxury Journey
                      <svg className="ml-3 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                  )}
                </button>

                <p className="text-sm text-gray-500 text-center mt-4">
                  By submitting, you agree to our Privacy Policy. You'll receive a personal response from me directly.
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Value Proposition */}
          <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-3xl shadow-xl p-8 border border-blue-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="mr-3">✨</span> Why Inquire Directly
            </h3>
            <ul className="space-y-5">
              {[
                { icon: "🎯", text: "Personal response within 24 hours", highlight: true },
                { icon: "🤖", text: "AI-powered itinerary review & refinement" },
                { icon: "👨‍💼", text: "No automated responses - direct expert consultation" },
                { icon: "⛰️", text: "25+ years of Himalayan expertise" },
                { icon: "🏨", text: "Luxury property insider access & VIP treatment" },
                { icon: "💎", text: "Custom pricing based on exact requirements" },
                { icon: "🛡️", text: "Full trip insurance & risk management" },
                { icon: "📱", text: "24/7 local support during your trip" },
              ].map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className={`text-xl mr-3 mt-1 ${item.highlight ? 'text-blue-600' : 'text-gray-600'}`}>
                    {item.icon}
                  </span>
                  <span className={`${item.highlight ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* AI Integration Info */}
          {hasAiItinerary && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl shadow-lg p-8 border border-green-200">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
                  <span className="text-2xl">✨</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">AI-Powered Consultation</h3>
                  <p className="text-sm text-gray-600">Enhanced with technology</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-white/70 p-4 rounded-xl">
                  <div className="text-sm font-medium text-gray-700 mb-1">What happens next:</div>
                  <ol className="text-sm text-gray-600 space-y-2 pl-5 list-decimal">
                    <li>I review your AI itinerary</li>
                    <li>Provide expert refinement suggestions</li>
                    <li>Create a customized proposal</li>
                    <li>Schedule a personal consultation</li>
                  </ol>
                </div>
                <button
                  onClick={() => {
                    localStorage.removeItem('ai-itinerary');
                    localStorage.removeItem('ai-preferences');
                    setHasAiItinerary(false);
                    setAiItineraryPreview('');
                    toast.success('AI itinerary removed');
                  }}
                  className="w-full text-center text-sm text-gray-600 hover:text-gray-900 font-medium py-2 border border-gray-300 hover:border-gray-400 rounded-lg transition"
                >
                  Remove AI itinerary
                </button>
              </div>
            </div>
          )}

          {/* Contact & Trust */}
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Direct Contact & Trust</h3>
            <div className="space-y-6">
              <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                  <span className="text-blue-600">📧</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Email</div>
                  <div className="text-gray-700">curatedascents@gmail.com</div>
                </div>
              </div>
              <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-4">
                  <span className="text-green-600">⏰</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Response Time</div>
                  <div className="text-gray-700">
                    {formData.urgency === 'urgent' ? '12 hours or less' : 
                     formData.urgency === 'planning' ? '48 hours' : 
                     '24 hours'}
                  </div>
                </div>
              </div>
              <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                  <span className="text-purple-600">🌏</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Based In</div>
                  <div className="text-gray-700">Kathmandu, Nepal</div>
                </div>
              </div>
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <div className="font-semibold text-gray-900 mb-2 flex items-center">
                  <span className="mr-2">🔒</span> Data Privacy
                </div>
                <div className="text-sm text-gray-600">
                  Your information is never shared. All itineraries and inquiries are kept confidential.
                </div>
              </div>
            </div>
          </div>

          {/* CTA to AI Generator */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-2xl p-8 text-white">
            <h3 className="text-xl font-bold mb-4">Need an itinerary first?</h3>
            <p className="mb-6 opacity-90">Try our AI Trip Generator to create a customized draft.</p>
            <button
              onClick={() => router.push('/ai-generator')}
              className="w-full bg-white text-blue-600 hover:bg-blue-50 font-bold py-3 px-4 rounded-xl transition transform hover:scale-105"
            >
              ✨ Generate AI Itinerary
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}