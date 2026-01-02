"use client";
import ReactMarkdown from 'react-markdown';
import { useState, useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';

// Type definitions
type TripPreferences = {
  destination: string;
  duration: string;
  travelers: string;
  interests: string[];
  budget: string;
  specialRequests: string;
};

type AIResponse = {
  itinerary: string;
  estimatedCost: string;
  bestSeason: string;
  proTips: string[];
  title?: string;
  highlights?: string[];
};

// Sample prompts for inspiration
const SAMPLE_PROMPTS = [
  {
    title: "Luxury Nepal Culture & Wellness",
    description: "7-day luxury cultural tour with spa retreat",
    preferences: {
      destination: "Nepal",
      duration: "7",
      travelers: "2",
      interests: ["Culture", "Wellness", "Luxury"],
      budget: "luxury",
      specialRequests: "Private guided tours, luxury spa experiences, heritage hotels"
    }
  },
  {
    title: "Bhutan Spiritual Journey",
    description: "10-day spiritual and photography tour",
    preferences: {
      destination: "Bhutan",
      duration: "10",
      travelers: "4",
      interests: ["Spiritual", "Photography", "Culture"],
      budget: "premium",
      specialRequests: "Monastery visits, meditation sessions, local family experiences"
    }
  },
  {
    title: "Tibet Trekking Adventure",
    description: "14-day luxury trek with wildlife viewing",
    preferences: {
      destination: "Tibet",
      duration: "14",
      travelers: "6",
      interests: ["Trekking", "Wildlife", "Luxury"],
      budget: "ultra-luxury",
      specialRequests: "Private chef, luxury camps, wildlife expert guide"
    }
  }
];

export default function AIGeneratorPage() {
  // Form state
  const [preferences, setPreferences] = useState<TripPreferences>({
    destination: 'Nepal',
    duration: '7',
    travelers: '2',
    interests: ['Culture'],
    budget: 'luxury',
    specialRequests: ''
  });

  // AI response state
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [showSamplePrompts, setShowSamplePrompts] = useState(true);
  const [responseTime, setResponseTime] = useState<number | null>(null);

  // Available options
  const destinations = [
    { value: 'Nepal', icon: '🇳🇵' },
    { value: 'Bhutan', icon: '🇧🇹' },
    { value: 'Tibet', icon: '🇨🇳' },
    { value: 'Multiple', icon: '🌏' }
  ];
  
  const durations = [
    { days: '5', label: '5 days' },
    { days: '7', label: '7 days' },
    { days: '10', label: '10 days' },
    { days: '14', label: '2 weeks' },
    { days: '21', label: '3 weeks' }
  ];
  
  const travelerOptions = [
    { value: '1', label: 'Solo' },
    { value: '2', label: 'Couple' },
    { value: '4', label: 'Family (4)' },
    { value: '6', label: 'Group (6)' },
    { value: '8+', label: 'Large Group' }
  ];
  
  const interestOptions = [
    { value: 'Culture', icon: '🏛️', color: 'purple' },
    { value: 'Trekking', icon: '🥾', color: 'green' },
    { value: 'Luxury', icon: '⭐', color: 'yellow' },
    { value: 'Wellness', icon: '🧘', color: 'teal' },
    { value: 'Wildlife', icon: '🦌', color: 'orange' },
    { value: 'Photography', icon: '📸', color: 'blue' },
    { value: 'Spiritual', icon: '🙏', color: 'indigo' }
  ];
  
  const budgetOptions = [
    { value: 'premium', label: 'Premium ($300-500/day)', color: 'blue' },
    { value: 'luxury', label: 'Luxury ($500-800/day)', color: 'purple' },
    { value: 'ultra-luxury', label: 'Ultra-Luxury ($800+/day)', color: 'amber' }
  ];

  // Handle form changes
  const handleInputChange = (field: keyof TripPreferences, value: string) => {
    setPreferences({ ...preferences, [field]: value });
  };

  const handleInterestToggle = (interest: string) => {
    const currentInterests = [...preferences.interests];
    if (currentInterests.includes(interest)) {
      setPreferences({
        ...preferences,
        interests: currentInterests.filter(i => i !== interest)
      });
    } else {
      setPreferences({
        ...preferences,
        interests: [...currentInterests, interest]
      });
    }
  };

  // Load sample prompt
  const loadSamplePrompt = (sample: typeof SAMPLE_PROMPTS[0]) => {
    setPreferences(sample.preferences);
    setShowSamplePrompts(false);
    toast.success('Sample preferences loaded! Adjust as needed.');
  };

  // Generate AI itinerary
  const generateItinerary = async () => {
    const startTime = Date.now();
    setIsGenerating(true);
    setError('');
    setAiResponse(null);
    setResponseTime(null);
    setShowSamplePrompts(false);

    try {
      const response = await fetch('/api/ai-itinerary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `API error: ${response.status}`);
      }

      const endTime = Date.now();
      setResponseTime(endTime - startTime);

      // Parse the AI response to extract structured data
      const parsedResponse = parseAIResponse(data.itinerary);
      setAiResponse(parsedResponse);

      toast.success('Itinerary generated successfully!');
    } catch (err) {
      console.error('❌ Generation error:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to generate itinerary. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  // Parse AI response to extract structured data
  const parseAIResponse = (text: string): AIResponse => {
    // Try to extract sections from markdown
    const sections = text.split('\n## ');
    
    // Extract title from first line
    const firstLine = text.split('\n')[0];
    const title = firstLine.replace('# ', '').replace('**', '').replace('**', '');
    
    // Try to find highlights (bullet points after "Highlights" or "Key Features")
    let highlights: string[] = [];
    const highlightsMatch = text.match(/Highlights?:?\s*\n([\s\S]*?)(?=\n## |\n\n## |$)/);
    if (highlightsMatch) {
      highlights = highlightsMatch[1]
        .split('\n')
        .filter(line => line.trim().startsWith('*') || line.trim().startsWith('-'))
        .map(line => line.replace(/^[*-]\s*/, '').trim())
        .filter(line => line.length > 0);
    }

    // Extract estimated cost if present
    let estimatedCost = '';
    const costMatch = text.match(/Estimated Cost:?\s*\$\s*([0-9,]+(?:\s*-\s*[0-9,]+)?)/i);
    if (costMatch) {
      estimatedCost = `$${costMatch[1]}`;
    }

    // Extract best season
    let bestSeason = '';
    const seasonMatch = text.match(/Best Season:?\s*([^\.\n]+)/i);
    if (seasonMatch) {
      bestSeason = seasonMatch[1].trim();
    }

    // Extract pro tips (look for section with "Tips" or "Pro Tips")
    let proTips: string[] = [];
    const tipsMatch = text.match(/(?:Pro )?Tips?:?\s*\n([\s\S]*?)(?=\n## |\n\n## |$)/i);
    if (tipsMatch) {
      proTips = tipsMatch[1]
        .split('\n')
        .filter(line => line.trim().startsWith('*') || line.trim().startsWith('-'))
        .map(line => line.replace(/^[*-]\s*/, '').trim())
        .filter(line => line.length > 0);
    }

    return {
      itinerary: text,
      estimatedCost: estimatedCost || 'Contact for personalized quote',
      bestSeason: bestSeason || 'Year-round with seasonal variations',
      proTips: proTips.length > 0 ? proTips : [
        'Book 3-6 months in advance for luxury accommodations',
        'Consider travel insurance for high-altitude destinations',
        'Pack layers for variable mountain weather'
      ],
      title,
      highlights: highlights.length > 0 ? highlights : undefined
    };
  };

  // Copy itinerary to clipboard
  const copyToClipboard = async () => {
    if (!aiResponse) return;
    
    const textToCopy = `${aiResponse.title || 'AI Generated Itinerary'}\n\n${aiResponse.itinerary}`;
    
    try {
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      toast.success('Itinerary copied to clipboard!');
      
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  // Download as text file
  const downloadAsText = () => {
    if (!aiResponse) return;
    
    const text = `${aiResponse.title || 'AI Generated Itinerary'}\n\n${aiResponse.itinerary}\n\nGenerated by Curated Ascents AI\n${window.location.origin}`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `itinerary-${preferences.destination.toLowerCase()}-${preferences.duration}days.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Itinerary downloaded!');
  };

  // Share itinerary
  const shareItinerary = () => {
    if (!aiResponse) return;
    
    const text = `Check out this AI-generated itinerary for ${preferences.destination} by Curated Ascents!`;
    const url = window.location.href;
    
    if (navigator.share) {
      navigator.share({
        title: aiResponse.title || 'AI Generated Itinerary',
        text: text,
        url: url,
      }).catch(() => {
        // Fallback to clipboard
        navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard!');
      });
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };

  // Validate form before generation
  const validateForm = (): boolean => {
    if (preferences.interests.length === 0) {
      toast.error('Please select at least one interest');
      return false;
    }
    if (preferences.duration === '') {
      toast.error('Please select a duration');
      return false;
    }
    return true;
  };

  // Handle generate with validation
  const handleGenerate = () => {
    if (validateForm()) {
      generateItinerary();
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Toaster position="top-right" />
      
      {/* Hero Section */}
      <section className="px-6 py-16 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold mb-6 animate-pulse">
            <span className="mr-2">✨</span> AI-Powered Luxury Travel Planning
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
            AI Trip Idea Generator
          </h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto mb-8">
            Experience the future of travel planning. Our AI—trained on 25 years of Himalayan expertise—will craft your perfect luxury itinerary.
          </p>
          <div className="flex items-center justify-center space-x-4 text-sm">
            <span className="flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
              AI Powered
            </span>
            <span>•</span>
            <span>25+ Years Expertise</span>
            <span>•</span>
            <span>Personalized Luxury</span>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Preferences Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Sample Prompts Section */}
            {showSamplePrompts && !aiResponse && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">💡 Need Inspiration? Try These Samples</h3>
                  <button 
                    onClick={() => setShowSamplePrompts(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  {SAMPLE_PROMPTS.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => loadSamplePrompt(prompt)}
                      className="bg-white p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition text-left"
                    >
                      <div className="text-sm font-semibold text-gray-900 mb-1">{prompt.title}</div>
                      <div className="text-xs text-gray-600 mb-2">{prompt.description}</div>
                      <div className="text-xs text-blue-600 font-medium">Try this →</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Preferences Form */}
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Travel Preferences</h2>
                <p className="text-gray-600">Complete this in 60 seconds for a personalized itinerary.</p>
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                  All fields optional - AI will provide best recommendations
                </div>
              </div>

              <div className="space-y-8">
                {/* Destination */}
                <div>
                  <label className="block text-gray-700 font-medium mb-4 flex items-center">
                    <span className="mr-2">🌍</span> Primary Destination
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {destinations.map(dest => (
                      <button
                        key={dest.value}
                        type="button"
                        onClick={() => handleInputChange('destination', dest.value)}
                        className={`p-4 rounded-xl border-2 text-center transition-all duration-200 ${preferences.destination === dest.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                          }`}
                      >
                        <div className="text-xl mb-1">{dest.icon}</div>
                        <div className="font-medium">{dest.value}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration & Travelers */}
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-gray-700 font-medium mb-4">📅 Duration</label>
                    <div className="flex flex-wrap gap-2">
                      {durations.map(({ days, label }) => (
                        <button
                          key={days}
                          type="button"
                          onClick={() => handleInputChange('duration', days)}
                          className={`px-4 py-3 rounded-lg border transition ${preferences.duration === days
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-4">👥 Travelers</label>
                    <div className="flex flex-wrap gap-2">
                      {travelerOptions.map(option => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleInputChange('travelers', option.value)}
                          className={`px-4 py-3 rounded-lg border transition ${preferences.travelers === option.value
                              ? 'border-purple-500 bg-purple-50 text-purple-700'
                              : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Interests */}
                <div>
                  <label className="block text-gray-700 font-medium mb-4">🎯 Interests (Select all that apply)</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {interestOptions.map(interest => {
                      const isSelected = preferences.interests.includes(interest.value);
                      const colorClasses = {
                        purple: isSelected ? 'bg-purple-100 border-purple-500 text-purple-700' : '',
                        green: isSelected ? 'bg-green-100 border-green-500 text-green-700' : '',
                        yellow: isSelected ? 'bg-yellow-100 border-yellow-500 text-yellow-700' : '',
                        teal: isSelected ? 'bg-teal-100 border-teal-500 text-teal-700' : '',
                        orange: isSelected ? 'bg-orange-100 border-orange-500 text-orange-700' : '',
                        blue: isSelected ? 'bg-blue-100 border-blue-500 text-blue-700' : '',
                        indigo: isSelected ? 'bg-indigo-100 border-indigo-500 text-indigo-700' : '',
                      };
                      
                      return (
                        <button
                          key={interest.value}
                          type="button"
                          onClick={() => handleInterestToggle(interest.value)}
                          className={`p-3 rounded-xl border-2 text-center transition ${isSelected
                              ? colorClasses[interest.color as keyof typeof colorClasses]
                              : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                          <div className="text-lg mb-1">{interest.icon}</div>
                          <div className="text-sm font-medium">{interest.value}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Budget */}
                <div>
                  <label className="block text-gray-700 font-medium mb-4">💰 Budget Level</label>
                  <div className="space-y-2">
                    {budgetOptions.map(option => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleInputChange('budget', option.value)}
                        className={`w-full p-4 rounded-xl border-2 text-left transition flex items-center justify-between ${preferences.budget === option.value
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        <span>{option.label}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${preferences.budget === option.value
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 text-gray-600'
                          }`}>
                          {option.value.replace('-', ' ')}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Special Requests */}
                <div>
                  <label className="block text-gray-700 font-medium mb-4">
                    ✨ Special Requests
                    <span className="text-sm font-normal text-gray-500 ml-2">(Optional)</span>
                  </label>
                  <textarea
                    value={preferences.specialRequests}
                    onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                    placeholder="Any specific requirements? Dietary restrictions, accessibility needs, celebrations, special experiences..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32 resize-none"
                  />
                </div>

                {/* Generate Button with Validation */}
                <div className="pt-4">
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-lg text-lg transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
                  >
                    {isGenerating ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 text-white mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        AI is crafting your luxury itinerary...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <span className="mr-2">✨</span>
                        Generate AI-Powered Itinerary
                      </span>
                    )}
                  </button>
                  
                  {preferences.interests.length === 0 && (
                    <p className="mt-2 text-sm text-amber-600 text-center">
                      💡 Tip: Select at least one interest for better recommendations
                    </p>
                  )}
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg animate-fadeIn">
                    <div className="flex items-center">
                      <span className="text-red-500 mr-2">⚠️</span>
                      <p className="text-red-800">{error}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: AI Response Panel */}
          <div className="space-y-8">
            {/* How It Works */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="mr-2">📋</span> How This Works
              </h3>
              <ol className="space-y-4">
                {[
                  "Share your preferences (60 seconds)",
                  "AI analyzes using 25+ years of expertise",
                  "Receive personalized itinerary outline",
                  "Refine with expert for final planning"
                ].map((step, index) => (
                  <li key={index} className="flex items-start">
                    <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-gray-700 leading-tight">{step}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-6 p-4 bg-white/50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">ℹ️ About Our AI</div>
                <div className="text-xs text-gray-500">
                  Trained on 25 years of Himalayan travel expertise + DeepSeek AI
                </div>
              </div>
            </div>

            {/* AI Response Display */}
            {aiResponse && (
              <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border-2 border-green-200 animate-fadeIn">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold mr-3 flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                      AI Generated
                    </div>
                    {responseTime && (
                      <span className="text-xs text-gray-500">
                        Generated in {(responseTime / 1000).toFixed(1)}s
                      </span>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={copyToClipboard}
                      className="p-2 text-gray-500 hover:text-blue-600 transition"
                      title="Copy itinerary"
                    >
                      {isCopied ? '✓' : '📋'}
                    </button>
                    <button
                      onClick={downloadAsText}
                      className="p-2 text-gray-500 hover:text-green-600 transition"
                      title="Download as text"
                    >
                      ⬇️
                    </button>
                    <button
                      onClick={shareItinerary}
                      className="p-2 text-gray-500 hover:text-purple-600 transition"
                      title="Share itinerary"
                    >
                      ↗️
                    </button>
                  </div>
                </div>

                <div className="space-y-8">
                  {/* Title */}
                  {aiResponse.title && (
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">{aiResponse.title}</h2>
                      <div className="flex flex-wrap gap-2 mb-6">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {preferences.duration} days
                        </span>
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                          {preferences.travelers} {preferences.travelers === '1' ? 'person' : 'people'}
                        </span>
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          {preferences.budget.replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Highlights */}
                  {aiResponse.highlights && aiResponse.highlights.length > 0 && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <span className="mr-2">✨</span> Trip Highlights
                      </h3>
                      <ul className="space-y-2">
                        {aiResponse.highlights.map((highlight, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-blue-500 mr-3 mt-1">•</span>
                            <span className="text-gray-700">{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Quick Info Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-xl">
                      <div className="text-sm text-gray-600 mb-1 flex items-center">
                        <span className="mr-2">💰</span> Estimated Cost
                      </div>
                      <div className="text-lg font-bold text-gray-900">{aiResponse.estimatedCost}</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-xl">
                      <div className="text-sm text-gray-600 mb-1 flex items-center">
                        <span className="mr-2">🌤️</span> Best Season
                      </div>
                      <div className="text-lg font-bold text-gray-900">{aiResponse.bestSeason}</div>
                    </div>
                  </div>

                  {/* Itinerary with Markdown Rendering */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <span className="mr-2">🗺️</span> Detailed Itinerary
                    </h3>
                    <div className="bg-gray-50 p-5 rounded-xl prose prose-lg max-w-none">
                      <ReactMarkdown
                        components={{
                          h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-6 mb-4 text-blue-800 border-b pb-2" {...props} />,
                          h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-5 mb-3 text-gray-900" {...props} />,
                          h3: ({node, ...props}) => <h3 className="text-lg font-bold mt-4 mb-2 text-gray-800" {...props} />,
                          p: ({node, ...props}) => <p className="mb-4 leading-relaxed text-gray-700" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4 space-y-2" {...props} />,
                          li: ({node, ...props}) => <li className="pl-2 text-gray-700" {...props} />,
                          strong: ({node, ...props}) => <strong className="font-bold text-gray-900" {...props} />,
                          em: ({node, ...props}) => <em className="italic text-gray-700" {...props} />,
                          blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-blue-400 pl-4 py-1 italic text-gray-600 my-4" {...props} />,
                        }}
                      >
                        {aiResponse.itinerary}
                      </ReactMarkdown>
                    </div>
                  </div>

                  {/* Pro Tips */}
                  {aiResponse.proTips.length > 0 && (
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-5 rounded-xl">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <span className="mr-2">💎</span> Expert Tips
                      </h3>
                      <ul className="space-y-3">
                        {aiResponse.proTips.map((tip, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-amber-500 mr-3 mt-1">•</span>
                            <span className="text-gray-700">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* CTA */}
                  <div className="pt-6 border-t border-gray-200">
                    <p className="text-gray-700 mb-4 text-center">
                      Ready to make this itinerary a reality?
                    </p>
                    <div className="space-y-3">
                      <a 
                        href="/contact" 
                        className="block w-full bg-green-600 hover:bg-green-700 text-white text-center font-semibold py-3 px-6 rounded-lg transition transform hover:-translate-y-0.5 shadow-md hover:shadow-lg"
                      >
                        📞 Contact for Detailed Planning
                      </a>
                      <button
                        onClick={() => {
                          setShowSamplePrompts(true);
                          toast.success('Try another sample or modify your preferences');
                        }}
                        className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-800 text-center font-medium py-3 px-6 rounded-lg transition"
                      >
                        🔄 Generate Another Itinerary
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Placeholder when no response yet */}
            {!aiResponse && !isGenerating && (
              <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-dashed border-gray-300">
                <div className="text-center py-8">
                  <div className="text-5xl mb-4">✨</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Your AI Itinerary Awaits</h3>
                  <p className="text-gray-600 mb-6">
                    Complete the form to see your personalized itinerary crafted by AI trained on 25 years of expertise.
                  </p>
                  <div className="inline-flex items-center text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-full">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
                    Real-time AI generation
                  </div>
                </div>
              </div>
            )}

            {/* Generating State */}
            {isGenerating && (
              <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-blue-200">
                <div className="text-center py-8">
                  <div className="inline-block relative mb-6">
                    <div className="w-20 h-20 border-4 border-blue-100 rounded-full"></div>
                    <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full absolute top-0 left-0 animate-spin"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl">
                      🤖
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Crafting Your Perfect Itinerary</h3>
                  <p className="text-gray-600 mb-4">
                    Our AI is analyzing 25+ years of travel data to create your personalized luxury experience...
                  </p>
                  <div className="space-y-2">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse w-3/4"></div>
                    </div>
                    <div className="text-xs text-gray-500">
                      Processing your preferences...
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="text-3xl mb-4">🤖</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">AI-Powered</h3>
            <p className="text-gray-600">
              Trained on 25+ years of Himalayan travel expertise for authentic recommendations.
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Instant Generation</h3>
            <p className="text-gray-600">
              Get detailed itineraries in seconds, not days. Perfect for initial planning.
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="text-3xl mb-4">💎</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Expert Refinement</h3>
            <p className="text-gray-600">
              AI provides the blueprint, our experts perfect every detail for your luxury journey.
            </p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">From AI Ideas to Reality</h2>
          <p className="text-gray-700 max-w-2xl mx-auto mb-8 text-lg">
            This AI generator provides the initial inspiration. We'll then work with you personally to refine every detail, 
            leveraging 25 years of on-the-ground experience and industry connections.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/packages/nepal-luxury" 
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition transform hover:-translate-y-0.5 shadow-md hover:shadow-lg"
            >
              <span className="mr-2">⭐</span>
              View Sample Luxury Package
            </a>
            <a 
              href="/contact" 
              className="inline-flex items-center bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition transform hover:-translate-y-0.5 shadow-md hover:shadow-lg"
            >
              <span className="mr-2">✉️</span>
              Start Custom Planning
            </a>
          </div>
        </div>
      </div>

      {/* Add CSS for animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </main>
  );
}