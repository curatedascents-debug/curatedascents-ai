"use client";

import { useState, useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';

// Create a separate component for the search params logic
function ContactFormContent() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    destination: 'Nepal',
    travelers: '2',
    travelDates: '',
    budget: 'luxury',
    interests: [] as string[],
    message: '',
    urgency: 'standard',
    travelerType: 'luxury-couple',
    planningStage: 'ready-to-book',
    heardAboutUs: 'search'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAiItinerary, setHasAiItinerary] = useState(false);
  const [aiItineraryPreview, setAiItineraryPreview] = useState('');
  const [interests, setInterests] = useState<string[]>(['Culture', 'Luxury']);
  const [formProgress, setFormProgress] = useState(0);
  const [estimatedValue, setEstimatedValue] = useState('');
  const [packageParam, setPackageParam] = useState<string | null>(null);

  // Check for AI itinerary and preferences when page loads
  useEffect(() => {
    const savedItinerary = localStorage.getItem('ai-itinerary');
    const aiPreferences = localStorage.getItem('ai-preferences');
    
    if (savedItinerary) {
      setHasAiItinerary(true);
      const preview = savedItinerary.length > 200 
        ? savedItinerary.substring(0, 200) + '...' 
        : savedItinerary;
      setAiItineraryPreview(preview);
      
      toast.success('✨ AI itinerary detected! It will be included in your inquiry.', {
        duration: 5000,
        icon: '🤖',
      });
    }
    
    if (aiPreferences) {
      try {
        const prefs = JSON.parse(aiPreferences);
        const newFormData = { ...formData };
        
        if (prefs.destination) newFormData.destination = prefs.destination;
        if (prefs.travelers) newFormData.travelers = prefs.travelers;
        if (prefs.budget) newFormData.budget = prefs.budget;
        if (prefs.travelerType) newFormData.travelerType = prefs.travelerType;
        
        setFormData(newFormData);
        setInterests(prefs.interests || ['Culture', 'Luxury']);
        newFormData.interests = prefs.interests || ['Culture', 'Luxury'];
        
        toast('🤖 AI preferences loaded for personalized consultation', {
          duration: 4000,
        });
      } catch (e) {
        console.error('Error parsing AI preferences:', e);
      }
    }
    
    // Check URL for package parameter (client-side only)
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const packageFromUrl = urlParams.get('package');
      if (packageFromUrl) {
        setPackageParam(packageFromUrl);
        setFormData(prev => ({
          ...prev,
          message: `I'm interested in the ${packageFromUrl.replace('-', ' ')} package. ${prev.message}`
        }));
      }
    }
    
    calculateFormProgress();
  }, []);

  // Update progress and estimated value
  useEffect(() => {
    calculateFormProgress();
    updateEstimatedValue();
  }, [formData, interests]);

  const calculateFormProgress = () => {
    let progress = 0;
    const fields = [
      { condition: !!formData.name, weight: 15 },
      { condition: !!formData.email, weight: 15 },
      { condition: formData.destination && formData.destination !== 'Nepal', weight: 10 },
      { condition: !!formData.travelDates, weight: 10 },
      { condition: formData.budget && formData.budget !== 'not-sure', weight: 15 },
      { condition: interests.length > 0, weight: 15 },
      { condition: !!formData.message, weight: 20 }
    ];
    
    progress = fields.reduce((acc, field) => acc + (field.condition ? field.weight : 0), 0);
    setFormProgress(Math.min(progress, 100));
  };

  const updateEstimatedValue = () => {
    const dailyRates: Record<string, number> = {
      'premium': 400,
      'luxury': 650,
      'ultra-luxury': 1000
    };
    
    const numTravelers = parseInt(formData.travelers) || 2;
    const avgTripLength = formData.destination === 'Multiple' ? 14 : 10;
    const dailyRate = dailyRates[formData.budget] || 650;
    
    const value = Math.round(dailyRate * avgTripLength * numTravelers);
    setEstimatedValue(`$${value.toLocaleString()}+`);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [e.target.name]: value });
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
      // Get budget label
      const budgetLabels: Record<string, string> = {
        'premium': 'Premium ($300-500/day)',
        'luxury': 'Luxury ($500-800/day)',
        'ultra-luxury': 'Ultra-Luxury ($800+/day)'
      };
      
      const travelerTypes: Record<string, string> = {
        'luxury-couple': 'Luxury Couple',
        'family-luxury': 'Luxury Family',
        'adventure-luxury': 'Adventure Luxury',
        'spiritual-group': 'Spiritual Group',
        'corporate-retreat': 'Corporate Retreat'
      };
      
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          // Contact Info
          name: formData.name,
          email: formData.email,
          phone: formData.phone || 'Not provided',
          
          // Trip Details
          destination: formData.destination,
          travelers: formData.travelers,
          travelDates: formData.travelDates || 'Flexible',
          budget: budgetLabels[formData.budget] || formData.budget,
          interests: interests.join(', ') || 'Not specified',
          travelerType: travelerTypes[formData.travelerType] || 'Luxury Traveler',
          planningStage: formData.planningStage,
          heardAboutUs: formData.heardAboutUs,
          
          // Message
          message: formData.message,
          urgency: formData.urgency,
          
          // AI Integration
          aiItinerary: aiItinerary ? 'Yes' : 'No',
          aiPreferences: aiPreferences ? 'Yes' : 'No',
          source: aiItinerary ? 'AI Generator' : 'Direct Contact',
          
          // Estimated Value
          estimatedValue: estimatedValue,
          
          // Email Settings
          _subject: `[${formData.urgency === 'urgent' ? 'URGENT' : 'LUXURY INQUIRY'}] ${formData.name} - ${formData.destination} - ${budgetLabels[formData.budget] || 'Luxury'}`,
          _replyto: formData.email,
          _template: 'luxury-inquiry',
        }),
      });
      
      if (response.ok) {
        toast.success(`✨ Thank you ${formData.name}! Your luxury inquiry has been received. Kiran's team will respond within ${formData.urgency === 'urgent' ? '12 hours' : '24 hours'}.`, {
          duration: 8000,
          icon: '🌟',
        });
        
        // Track submission
        localStorage.setItem('last-inquiry-time', new Date().toISOString());
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          destination: formData.destination,
          travelers: '2',
          travelDates: '',
          budget: formData.budget,
          interests: [],
          message: '',
          urgency: 'standard',
          travelerType: 'luxury-couple',
          planningStage: 'ready-to-book',
          heardAboutUs: 'search'
        });
        setInterests(['Culture', 'Luxury']);
        
        // Clear AI data
        localStorage.removeItem('ai-itinerary');
        localStorage.removeItem('ai-preferences');
        setHasAiItinerary(false);
        setAiItineraryPreview('');
        
        // Redirect to thank you page
        setTimeout(() => {
          router.push('/thank-you');
        }, 3000);
        
      } else {
        throw new Error('Form submission failed');
      }
    } catch (error) {
      toast.error('There was an error sending your message. Please email kiran@curatedascents.com directly.', {
        duration: 5000,
      });
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
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
    { value: 'premium', label: 'Premium ($300-500/day)', desc: 'Boutique hotels & guided experiences' },
    { value: 'luxury', label: 'Luxury ($500-800/day)', desc: '5-star properties & exclusive access' },
    { value: 'ultra-luxury', label: 'Ultra-Luxury ($800+/day)', desc: 'Private charters & bespoke services' },
  ];
  
  const urgencyOptions = [
    { value: 'standard', label: 'Standard (24h response)', desc: 'Planning for future travel' },
    { value: 'urgent', label: 'Urgent (12h response)', desc: 'Need immediate assistance' },
  ];
  
  const travelerTypeOptions = [
    { value: 'luxury-couple', label: 'Luxury Couple', desc: 'Romantic getaway, anniversary' },
    { value: 'family-luxury', label: 'Luxury Family', desc: 'Multigenerational, kids-friendly' },
    { value: 'adventure-luxury', label: 'Adventure Luxury', desc: 'Active travel with luxury comfort' },
    { value: 'spiritual-group', label: 'Spiritual Group', desc: 'Meditation, yoga, retreat' },
    { value: 'corporate-retreat', label: 'Corporate Retreat', desc: 'Business group, incentives' },
  ];
  
  const planningStageOptions = [
    { value: 'exploring', label: 'Just Exploring', desc: 'Researching options' },
    { value: 'serious-planning', label: 'Serious Planning', desc: 'Ready to discuss details' },
    { value: 'ready-to-book', label: 'Ready to Book', desc: 'Want to proceed within 3 months' },
  ];
  
  const popularDestinations = [
    { value: 'Nepal', icon: '🇳🇵' },
    { value: 'Bhutan', icon: '🇧🇹' },
    { value: 'Tibet', icon: '🇨🇳' },
    { value: 'Multiple', icon: '🌏' },
    { value: 'Other', icon: '🗺️' }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Toaster position="top-right" />
      
      {/* Progress Bar */}
      {formProgress > 0 && formProgress < 100 && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-50">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-teal-500 transition-all duration-500"
            style={{ width: `${formProgress}%` }}
          />
        </div>
      )}
      
      {/* Hero Section */}
      <section className="relative px-6 py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          {hasAiItinerary && (
            <div className="inline-flex items-center bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full text-sm font-semibold mb-8 border border-white/30">
              <span className="mr-3">✨</span>
              AI-Powered Inquiry Detected • Kiran's Team Ready
            </div>
          )}
          
          <h1 className="text-4xl md:text-6xl font-bold mb-8">
            Begin Your <span className="text-cyan-300">Luxury Himalayan</span> Journey
          </h1>
          
          <p className="text-xl opacity-90 max-w-3xl mx-auto mb-12">
            Share your vision. Kiran's team will craft the perfect experience using 28 years of expertise 
            and enterprise-grade AI technology.
          </p>
          
          {/* Estimated Value */}
          {estimatedValue && (
            <div className="inline-block bg-white/10 backdrop-blur-sm px-8 py-6 rounded-2xl mb-8 border border-white/20">
              <div className="text-sm opacity-80 mb-2">Estimated Journey Value</div>
              <div className="text-3xl font-bold">{estimatedValue}</div>
              <div className="text-xs opacity-70 mt-2">
                Based on {formData.travelers} traveler(s) • {formData.destination} • {formData.budget} level
              </div>
            </div>
          )}
          
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <span className="flex items-center bg-white/10 px-4 py-2 rounded-full">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
              Direct access to Kiran's team
            </span>
            <span>•</span>
            <span className="bg-white/10 px-4 py-2 rounded-full">28+ Years Expertise</span>
            <span>•</span>
            <span className="bg-white/10 px-4 py-2 rounded-full">US-Based AI • Nepal-Based Execution</span>
          </div>
        </div>
      </section>

      {/* Main Form */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Left: Kiran's Promise */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 sticky top-6">
              <h3 className="text-xl font-bold mb-8 text-gray-900">Kiran's Personal Promise</h3>
              
              <div className="space-y-8">
                <div>
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                      <span className="text-blue-600 text-xl">👨‍💼</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Direct Founder Access</h4>
                      <p className="text-sm text-gray-600">Kiran reviews every luxury inquiry</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                      <span className="text-green-600 text-xl">🤖</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">AI-Enhanced Planning</h4>
                      <p className="text-sm text-gray-600">Enterprise technology + 28 years expertise</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                      <span className="text-purple-600 text-xl">🏔️</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Nepal-Based Execution</h4>
                      <p className="text-sm text-gray-600">Full operations team in Kathmandu</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Contact Info */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-4">Direct Contact</h4>
                <p className="text-sm text-gray-600 mb-4">
                  For urgent luxury inquiries or corporate partnerships:
                </p>
                <a 
                  href="mailto:kiran@curatedascents.com" 
                  className="text-blue-600 font-semibold hover:text-blue-800 transition"
                >
                  kiran@curatedascents.com
                </a>
                <p className="text-xs text-gray-500 mt-2">
                  Carmel, IN • Kathmandu, NP
                </p>
              </div>
              
              {/* Response Time */}
              <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                <h4 className="font-semibold text-gray-900 mb-2">Response Time</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    <span>Standard: Within 24 hours</span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-amber-500 rounded-full mr-3"></span>
                    <span>Urgent: Within 12 hours</span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    <span>Weekends: Within 36 hours</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Right: Enhanced Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Personalized Luxury Inquiry</h2>
                  <p className="text-gray-600 mt-2">All inquiries receive Kiran's direct attention and expert consultation.</p>
                </div>
                {hasAiItinerary && (
                  <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                    ✨ AI Itinerary Attached
                  </span>
                )}
              </div>
              
              {/* AI Itinerary Preview */}
              {hasAiItinerary && aiItineraryPreview && (
                <div className="mb-10 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-200">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold text-gray-900 flex items-center">
                      <span className="mr-3">📋</span>
                      AI-Generated Itinerary Preview
                    </h3>
                    <button
                      onClick={() => {
                        const fullItinerary = localStorage.getItem('ai-itinerary');
                        if (fullItinerary) {
                          navigator.clipboard.writeText(fullItinerary);
                          toast.success('Itinerary copied for your consultation');
                        }
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Copy Full Itinerary
                    </button>
                  </div>
                  <div className="text-gray-700 text-sm bg-white/70 p-4 rounded-lg max-h-40 overflow-y-auto">
                    {aiItineraryPreview}
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    This itinerary will be personally reviewed by Kiran's team
                  </p>
                </div>
              )}
              
              {/* Progress Indicator */}
              <div className="bg-gray-50 p-6 rounded-2xl mb-10">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-medium text-gray-700">Inquiry Progress</span>
                  <span className="text-sm font-bold text-blue-600">{formProgress}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-teal-500 transition-all duration-700"
                    style={{ width: `${formProgress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Complete more fields for a more accurate luxury consultation
                </p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-12">
                {/* Section 1: Basic Information */}
                <div className="space-y-8">
                  <div className="border-b border-gray-200 pb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-3">Full Name *</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder="Your name"
                          className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-3">Email Address *</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="your@email.com"
                          className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-3">Phone Number</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+1 (555) 123-4567"
                          className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-3">Traveler Type</label>
                        <select
                          name="travelerType"
                          value={formData.travelerType}
                          onChange={handleChange}
                          className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        >
                          {travelerTypeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Trip Details */}
                  <div className="border-b border-gray-200 pb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Trip Details</h3>
                    
                    <div className="mb-8">
                      <label className="block text-sm font-medium mb-4">Destination</label>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {popularDestinations.map((dest) => (
                          <button
                            key={dest.value}
                            type="button"
                            onClick={() => setFormData({...formData, destination: dest.value})}
                            className={`p-4 rounded-xl border transition flex flex-col items-center ${
                              formData.destination === dest.value
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <span className="text-2xl mb-2">{dest.icon}</span>
                            <span className="text-sm">{dest.value}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-3">Number of Travelers</label>
                        <select
                          name="travelers"
                          value={formData.travelers}
                          onChange={handleChange}
                          className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        >
                          <option value="1">1 (Solo)</option>
                          <option value="2">2 (Couple)</option>
                          <option value="3">3</option>
                          <option value="4">4 (Family/Group)</option>
                          <option value="5">5</option>
                          <option value="6">6+</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-3">Travel Dates / Season</label>
                        <input
                          type="text"
                          name="travelDates"
                          value={formData.travelDates}
                          onChange={handleChange}
                          placeholder="e.g., March 2026, Flexible, Specific dates"
                          className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Preferences */}
                  <div className="border-b border-gray-200 pb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Preferences & Budget</h3>
                    
                    <div className="mb-8">
                      <label className="block text-sm font-medium mb-4">Interests (Select all that apply)</label>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {interestOptions.map((interest) => (
                          <button
                            key={interest.value}
                            type="button"
                            onClick={() => toggleInterest(interest.value)}
                            className={`p-4 rounded-xl border transition flex flex-col items-center ${
                              interests.includes(interest.value)
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <span className="text-2xl mb-2">{interest.icon}</span>
                            <span className="text-sm">{interest.value}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mb-8">
                      <label className="block text-sm font-medium mb-4">Budget Level</label>
                      <div className="space-y-3">
                        {budgetOptions.map((budget) => (
                          <button
                            key={budget.value}
                            type="button"
                            onClick={() => setFormData({...formData, budget: budget.value})}
                            className={`w-full p-4 rounded-xl border transition text-left ${
                              formData.budget === budget.value
                                ? 'border-amber-500 bg-amber-50 text-amber-700'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="font-bold">{budget.label}</div>
                            <div className="text-sm text-gray-600">{budget.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-3">Planning Stage</label>
                        <select
                          name="planningStage"
                          value={formData.planningStage}
                          onChange={handleChange}
                          className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        >
                          {planningStageOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-3">Response Urgency</label>
                        <select
                          name="urgency"
                          value={formData.urgency}
                          onChange={handleChange}
                          className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        >
                          {urgencyOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Section 4: Message */}
                  <div>
                    <label className="block text-xl font-semibold text-gray-900 mb-6">
                      Tell Us About Your Vision
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={6}
                      placeholder="Describe your dream Himalayan journey. What experiences are most important to you? Any special occasions, celebrations, or specific requirements?"
                      className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                    <p className="text-sm text-gray-500 mt-3">
                      The more details you provide, the better Kiran's team can personalize your luxury experience.
                    </p>
                  </div>
                </div>
                
                {/* Submit Button */}
                <div className="pt-8 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-blue-600 to-teal-600 text-white font-semibold py-5 px-8 rounded-xl text-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-xl w-full flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin">⟳</span>
                        <span>Submitting to Kiran's Team...</span>
                      </>
                    ) : (
                      <>
                        <span>✨</span>
                        <span>Submit Luxury Inquiry</span>
                        <span>→</span>
                      </>
                    )}
                  </button>
                  <p className="text-center text-sm text-gray-500 mt-4">
                    Kiran or a senior team member will respond within {formData.urgency === 'urgent' ? '12 hours' : '24 hours'}
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

// Main component with Suspense boundary
export default function ContactPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading contact form...</p>
        </div>
      </div>
    }>
      <ContactFormContent />
    </Suspense>
  );
}