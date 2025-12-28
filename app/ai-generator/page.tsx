"use client";

import { useState } from 'react';

// Type definitions for our form and AI response
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
};

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

  // Available options
  const destinations = ['Nepal', 'Bhutan', 'Tibet', 'Multiple'];
  const durations = ['5', '7', '10', '14', '21'];
  const travelerOptions = ['1', '2', '4', '6', '8+'];
  const interestOptions = ['Culture', 'Trekking', 'Luxury', 'Wellness', 'Wildlife', 'Photography', 'Spiritual'];
  const budgetOptions = [
    { value: 'premium', label: 'Premium ($300-500/day)' },
    { value: 'luxury', label: 'Luxury ($500-800/day)' },
    { value: 'ultra-luxury', label: 'Ultra-Luxury ($800+/day)' }
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

  // Generate AI itinerary
 const generateItinerary = async () => {
  setIsGenerating(true);
  setError('');
  setAiResponse(null);

  try {
    console.log('📤 Sending request to API with preferences:', preferences);
    
    // Call our API route
    const response = await fetch('/api/ai-itinerary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferences),
    });

    console.log('📥 API response status:', response.status);
    
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `API error: ${response.status}`);
    }

    console.log('✅ API call successful, received data:', data);
    
        // The AI response comes back as a text block
    const aiText = data.itinerary;

    // Show the FULL AI response
        const aiResponse: AIResponse = {
      itinerary: aiText,
      estimatedCost: '',
      bestSeason: '',  
      proTips: [],
    };

    setAiResponse(aiResponse);
  } catch (err) {
    console.error('❌ Generation error:', err);
    const errorMsg = err instanceof Error ? err.message : 'Failed to generate itinerary. Please try again.';
    setError(errorMsg);
  } finally {
    setIsGenerating(false);
  }
};

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="px-6 py-16 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <span className="mr-2">🤖</span> AI-Powered Travel Curation
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            AI Trip Idea Generator
          </h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto">
            Experience the future of travel planning. Share your preferences, and our AI—trained on 25 years of Himalayan expertise—will craft your perfect itinerary.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Left: Preferences Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Travel Preferences</h2>
              <p className="text-gray-600 mb-8">Complete this in 60 seconds for a personalized itinerary.</p>

              <div className="space-y-8">
                {/* Destination */}
                <div>
                  <label className="block text-gray-700 font-medium mb-4">Primary Destination</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {destinations.map(dest => (
                      <button
                        key={dest}
                        type="button"
                        onClick={() => handleInputChange('destination', dest)}
                        className={`p-4 rounded-xl border-2 text-center transition ${preferences.destination === dest ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'}`}
                      >
                        {dest}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration & Travelers */}
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-gray-700 font-medium mb-4">Duration (Days)</label>
                    <div className="flex flex-wrap gap-3">
                      {durations.map(days => (
                        <button
                          key={days}
                          type="button"
                          onClick={() => handleInputChange('duration', days)}
                          className={`px-5 py-3 rounded-lg border transition ${preferences.duration === days ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                          {days}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-4">Travelers</label>
                    <div className="flex flex-wrap gap-3">
                      {travelerOptions.map(num => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => handleInputChange('travelers', num)}
                          className={`px-5 py-3 rounded-lg border transition ${preferences.travelers === num ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                          {num} {num === '1' ? 'Person' : 'People'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Interests */}
                <div>
                  <label className="block text-gray-700 font-medium mb-4">Interests (Select all that apply)</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {interestOptions.map(interest => (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => handleInterestToggle(interest)}
                        className={`p-4 rounded-xl border-2 text-center transition ${preferences.interests.includes(interest) ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 hover:border-gray-300'}`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Budget */}
                <div>
                  <label className="block text-gray-700 font-medium mb-4">Budget Level</label>
                  <div className="space-y-3">
                    {budgetOptions.map(option => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleInputChange('budget', option.value)}
                        className={`w-full p-4 rounded-xl border-2 text-left transition ${preferences.budget === option.value ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-gray-300'}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Special Requests */}
                <div>
                  <label className="block text-gray-700 font-medium mb-4">Special Requests</label>
                  <textarea
                    value={preferences.specialRequests}
                    onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                    placeholder="Any specific requirements? (dietary, accessibility, celebrations, etc.)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32"
                  />
                </div>

                {/* Generate Button */}
                <button
                  onClick={generateItinerary}
                  disabled={isGenerating || preferences.interests.length === 0}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-lg text-lg transition disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <span className="flex items-center justify-center">
                      <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></span>
                      AI is crafting your itinerary...
                    </span>
                  ) : (
                    '✨ Generate AI-Powered Itinerary'
                  )}
                </button>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800">{error}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: AI Response Panel */}
          <div className="space-y-8">
            {/* How It Works */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">How This Works</h3>
              <ol className="space-y-4">
                <li className="flex items-start">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">1</span>
                  <span className="text-gray-700">Share your preferences (60 seconds)</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">2</span>
                  <span className="text-gray-700">AI analyzes using 25+ years of expertise</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">3</span>
                  <span className="text-gray-700">Receive personalized itinerary outline</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">4</span>
                  <span className="text-gray-700">Refine with me directly for final planning</span>
                </li>
              </ol>
            </div>

            {/* AI Response Display */}
            {aiResponse && (
              <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-green-200">
                <div className="flex items-center mb-6">
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold mr-3">
                    AI Generated
                  </div>
                  <span className="text-gray-600">Powered by DeepSeek + 25 years expertise</span>
                </div>

                <div className="space-y-8">
                  {/* Itinerary */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Your Personalized Itinerary</h3>
                    <div className="bg-gray-50 p-6 rounded-xl whitespace-pre-line text-gray-700">
                      {aiResponse.itinerary}
                    </div>
                  </div>

                  {/* Only show these sections if they have content */}
{aiResponse.estimatedCost && (
  <div className="grid grid-cols-2 gap-4">
    <div className="bg-blue-50 p-4 rounded-xl">
      <div className="text-sm text-gray-600 mb-1">Estimated Cost</div>
      <div className="text-lg font-bold text-gray-900">{aiResponse.estimatedCost}</div>
    </div>
    <div className="bg-purple-50 p-4 rounded-xl">
      <div className="text-sm text-gray-600 mb-1">Best Season</div>
      <div className="text-lg font-bold text-gray-900">{aiResponse.bestSeason}</div>
    </div>
  </div>
)}

{aiResponse.proTips.length > 0 && (
  <div>
    <h3 className="text-lg font-bold text-gray-900 mb-4">Expert Tips</h3>
    <ul className="space-y-3">
      {aiResponse.proTips.map((tip, index) => (
        <li key={index} className="flex items-start">
          <span className="text-blue-500 mr-3">•</span>
          <span className="text-gray-700">{tip}</span>
        </li>
      ))}
    </ul>
  </div>
)}
                  {/* CTA */}
                  <div className="pt-6 border-t border-gray-200">
                    <p className="text-gray-700 mb-4">Ready to make this itinerary a reality?</p>
                    <a 
                      href="/contact" 
                      className="block w-full bg-green-600 hover:bg-green-700 text-white text-center font-semibold py-3 px-6 rounded-lg transition"
                    >
                      Contact for Detailed Planning
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Placeholder when no response yet */}
            {!aiResponse && !isGenerating && (
              <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-dashed border-gray-300">
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">🤖</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">AI Response Will Appear Here</h3>
                  <p className="text-gray-600">
                    Complete the form and click "Generate" to see your personalized itinerary crafted by AI trained on 25 years of expertise.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">From AI Ideas to Reality</h2>
          <p className="text-gray-700 max-w-2xl mx-auto mb-8">
            This AI generator provides the initial inspiration. I'll then work with you personally to refine every detail, 
            leveraging my 25 years of on-the-ground experience and industry connections.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/packages/nepal-luxury" 
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition"
            >
              View Sample Luxury Package
            </a>
            <a 
              href="/contact" 
              className="inline-block bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 px-8 rounded-lg text-lg transition"
            >
              Start Custom Planning
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
