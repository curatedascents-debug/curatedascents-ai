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
  travelerType: string;
  pace: string;
  accommodationStyle: string;
};

type AIResponse = {
  itinerary: string;
  estimatedCost: string;
  bestSeason: string;
  proTips: string[];
  title?: string;
  highlights?: string[];
};

// Enhanced sample prompts with Kiran's expertise
const ENHANCED_SAMPLE_PROMPTS = [
  {
    title: "Luxury Nepal Culture & Wellness",
    description: "7-day luxury cultural tour with spa retreat & private access",
    expertiseNote: "Includes Kiran's private contacts at heritage properties",
    preferences: {
      destination: "Nepal",
      duration: "7",
      travelers: "2",
      interests: ["Culture", "Wellness", "Luxury", "Photography"],
      budget: "luxury",
      specialRequests: "Private guided tours, luxury spa experiences, heritage hotel access, photography sessions",
      travelerType: "luxury-couple",
      pace: "moderate",
      accommodationStyle: "boutique-heritage"
    }
  },
  {
    title: "Bhutan Spiritual Journey",
    description: "10-day spiritual & photography tour with monastery access",
    expertiseNote: "Based on 28 years of Bhutan operations",
    preferences: {
      destination: "Bhutan",
      duration: "10",
      travelers: "4",
      interests: ["Spiritual", "Photography", "Culture", "Wellness"],
      budget: "ultra-luxury",
      specialRequests: "Private monastery visits, meditation with masters, local family experiences, photography guidance",
      travelerType: "spiritual-group",
      pace: "leisurely",
      accommodationStyle: "luxury-lodge"
    }
  },
  {
    title: "Everest Luxury Trek",
    description: "14-day luxury trek with helicopter access & gourmet dining",
    expertiseNote: "Kiran's altitude expertise applied",
    preferences: {
      destination: "Nepal",
      duration: "14",
      travelers: "2",
      interests: ["Trekking", "Luxury", "Adventure", "Photography"],
      budget: "ultra-luxury",
      specialRequests: "Private chef, luxury lodges, helicopter transfers, altitude expert guide",
      travelerType: "adventure-luxury",
      pace: "active",
      accommodationStyle: "luxury-lodge"
    }
  }
];

export default function EnhancedAIGeneratorPage() {
  // Enhanced form state
  const [preferences, setPreferences] = useState<TripPreferences>({
    destination: 'Nepal',
    duration: '7',
    travelers: '2',
    interests: ['Culture', 'Luxury'],
    budget: 'luxury',
    specialRequests: '',
    travelerType: 'luxury-couple',
    pace: 'moderate',
    accommodationStyle: 'luxury-lodge'
  });

  // AI response state
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [showSamplePrompts, setShowSamplePrompts] = useState(true);
  const [responseTime, setResponseTime] = useState<number | null>(null);

  // Enhanced options
  const destinations = [
    { value: 'Nepal', icon: '🇳🇵', description: 'Everest, Annapurna, Culture' },
    { value: 'Bhutan', icon: '🇧🇹', description: 'Dragon Kingdom, Monasteries' },
    { value: 'Tibet', icon: '🇨🇳', description: 'Lhasa, Mount Kailash' },
    { value: 'Multiple', icon: '🌏', description: 'Combined Himalayan Journey' }
  ];
  
  const durations = [
    { days: '5', label: '5 days', description: 'Short luxury getaway' },
    { days: '7', label: '7 days', description: 'Week-long immersion' },
    { days: '10', label: '10 days', description: 'In-depth exploration' },
    { days: '14', label: '2 weeks', description: 'Comprehensive journey' },
    { days: '21', label: '3 weeks', description: 'Ultimate Himalayan experience' }
  ];
  
  const travelerOptions = [
    { value: '1', label: 'Solo', description: 'Personal journey' },
    { value: '2', label: 'Couple', description: 'Romantic getaway' },
    { value: '4', label: 'Family (4)', description: 'Family adventure' },
    { value: '6', label: 'Group (6)', description: 'Friends circle' },
    { value: '8+', label: 'Large Group', description: 'Corporate or special' }
  ];
  
  const travelerTypes = [
    { value: 'luxury-couple', label: 'Luxury Couple', icon: '💑' },
    { value: 'family-luxury', label: 'Luxury Family', icon: '👨‍👩‍👧‍👦' },
    { value: 'adventure-luxury', label: 'Adventure Luxury', icon: '🧗' },
    { value: 'spiritual-group', label: 'Spiritual Group', icon: '🕉️' },
    { value: 'corporate-retreat', label: 'Corporate Retreat', icon: '🏢' }
  ];
  
  const paceOptions = [
    { value: 'leisurely', label: 'Leisurely', description: 'Relaxed pace, luxury focus' },
    { value: 'moderate', label: 'Moderate', description: 'Balanced activities' },
    { value: 'active', label: 'Active', description: 'Adventure-focused' }
  ];
  
  const accommodationStyles = [
    { value: '5-star', label: '5-Star Hotels', icon: '⭐' },
    { value: 'boutique-heritage', label: 'Boutique Heritage', icon: '🏯' },
    { value: 'luxury-lodge', label: 'Luxury Lodges', icon: '🏔️' },
    { value: 'private-villa', label: 'Private Villas', icon: '🏡' },
    { value: 'luxury-tented', label: 'Luxury Tented', icon: '⛺' }
  ];
  
  const interestOptions = [
    { value: 'Culture', icon: '🏛️', color: 'purple', description: 'Heritage & traditions' },
    { value: 'Trekking', icon: '🥾', color: 'green', description: 'Mountain adventures' },
    { value: 'Luxury', icon: '✨', color: 'yellow', description: 'Premium experiences' },
    { value: 'Wellness', icon: '🧘', color: 'teal', description: 'Spa & relaxation' },
    { value: 'Wildlife', icon: '🦌', color: 'orange', description: 'Nature & animals' },
    { value: 'Photography', icon: '📸', color: 'blue', description: 'Photo opportunities' },
    { value: 'Spiritual', icon: '🙏', color: 'indigo', description: 'Religious sites' },
    { value: 'Food', icon: '🍲', color: 'red', description: 'Culinary experiences' },
    { value: 'Adventure', icon: '🧗', color: 'amber', description: 'Thrilling activities' }
  ];
  
  const budgetOptions = [
    { 
      value: 'premium', 
      label: 'Premium ($300-500/day)', 
      color: 'blue',
      description: 'Boutique hotels & guided experiences'
    },
    { 
      value: 'luxury', 
      label: 'Luxury ($500-800/day)', 
      color: 'purple',
      description: '5-star properties & exclusive access'
    },
    { 
      value: 'ultra-luxury', 
      label: 'Ultra-Luxury ($800+/day)', 
      color: 'amber',
      description: 'Private charters & bespoke services'
    }
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
  const loadSamplePrompt = (sample: typeof ENHANCED_SAMPLE_PROMPTS[0]) => {
    setPreferences(sample.preferences);
    setShowSamplePrompts(false);
    toast.success(`Loaded "${sample.title}" with Kiran's ${sample.expertiseNote}`, {
      icon: '✨',
    });
  };

  // Generate AI itinerary with enhanced prompt
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

      // Parse the AI response
      const parsedResponse = parseAIResponse(data.itinerary);
      setAiResponse(parsedResponse);

      // Save to localStorage for contact form
      localStorage.setItem('ai-itinerary', data.itinerary);
      localStorage.setItem('ai-preferences', JSON.stringify(preferences));

      toast.success('Itinerary generated with Kiran\'s expertise!', {
        icon: '🏔️',
        duration: 4000,
      });
    } catch (err) {
      console.error('Generation error:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to generate itinerary. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  // Parse AI response with enhanced formatting
  const parseAIResponse = (text: string): AIResponse => {
    // Enhanced parsing logic
    const sections = text.split('\n## ');
    
    // Extract title
    const firstLine = text.split('\n')[0];
    const title = firstLine.replace('# ', '').replace('**', '').replace('**', '');
    
    // Extract highlights
    let highlights: string[] = [];
    const highlightsMatch = text.match(/Highlights?:?\s*\n([\s\S]*?)(?=\n## |\n\n## |$)/i);
    if (highlightsMatch) {
      highlights = highlightsMatch[1]
        .split('\n')
        .filter(line => line.trim().startsWith('*') || line.trim().startsWith('-'))
        .map(line => line.replace(/^[*-]\s*/, '').trim())
        .filter(line => line.length > 0);
    }

    // Extract estimated cost
    let estimatedCost = '';
    const costMatch = text.match(/Estimated Cost:?\s*\$\s*([0-9,]+(?:\s*-\s*[0-9,]+)?)/i);
    if (costMatch) {
      estimatedCost = `$${costMatch[1]}`;
    } else {
      // Default based on budget
      const defaults = {
        'premium': '$4,000 - $6,000',
        'luxury': '$7,000 - $12,000',
        'ultra-luxury': '$12,000+'
      };
      estimatedCost = defaults[preferences.budget as keyof typeof defaults] || 'Contact for personalized quote';
    }

    // Extract best season
    let bestSeason = '';
    const seasonMatch = text.match(/Best Season:?\s*([^\.\n]+)/i);
    if (seasonMatch) {
      bestSeason = seasonMatch[1].trim();
    } else {
      bestSeason = 'Year-round with seasonal variations (Kiran will advise)';
    }

    // Extract pro tips
    let proTips: string[] = [];
    const tipsMatch = text.match(/(?:Pro )?Tips?:?\s*\n([\s\S]*?)(?=\n## |\n\n## |$)/i);
    if (tipsMatch) {
      proTips = tipsMatch[1]
        .split('\n')
        .filter(line => line.trim().startsWith('*') || line.trim().startsWith('-'))
        .map(line => line.replace(/^[*-]\s*/, '').trim())
        .filter(line => line.length > 0);
    }

    // Add Kiran's expertise tips if none found
    if (proTips.length === 0) {
      proTips = [
        'Based on 28 years experience: Book luxury properties 6+ months in advance',
        'Altitude advice: Include proper acclimatization days for comfort',
        'Travel insurance is essential for high-altitude luxury travel',
        'Private guides make all the difference for exclusive access'
      ];
    }

    return {
      itinerary: text,
      estimatedCost,
      bestSeason,
      proTips,
      title: title || `AI-Generated ${preferences.destination} Luxury Journey`,
      highlights: highlights.length > 0 ? highlights : undefined
    };
  };

  // Copy itinerary to clipboard
  const copyToClipboard = async () => {
    if (!aiResponse) return;
    
    const textToCopy = `${aiResponse.title}\n\nGenerated by CuratedAscents AI\nPowered by Kiran Pokhrel's 28+ Years Expertise\n\n${aiResponse.itinerary}`;
    
    try {
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      toast.success('Itinerary copied! Ready to share with Kiran\'s team.', {
        icon: '📋',
      });
      
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  // Download as text file
  const downloadAsText = () => {
    if (!aiResponse) return;
    
    const text = `${aiResponse.title}\n\nGenerated by CuratedAscents AI\nPowered by Kiran Pokhrel's 28+ Years Himalayan Expertise\n\n${aiResponse.itinerary}\n\nContact: kiran@curatedascents.com\nWebsite: ${window.location.origin}`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `curatedascents-${preferences.destination.toLowerCase()}-luxury-itinerary.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Itinerary downloaded! Ready for your consultation.', {
      icon: '💾',
    });
  };

  // Share itinerary
  const shareItinerary = () => {
    if (!aiResponse) return;
    
    const text = `Check out my AI-generated luxury itinerary for ${preferences.destination} by CuratedAscents AI! Powered by Kiran Pokhrel's 28+ years of Himalayan expertise.`;
    const url = window.location.href;
    
    if (navigator.share) {
      navigator.share({
        title: aiResponse.title || 'AI Generated Luxury Itinerary',
        text: text,
        url: url,
      }).catch(() => {
        navigator.clipboard.writeText(url);
        toast.success('Link copied! Share with travel companions.');
      });
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copied! Share with travel companions.');
    }
  };

  // Validate form
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
      
      {/* Enhanced Hero Section */}
      <section className="relative px-6 py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <span className="mr-2">✨</span> AI-Powered Luxury Travel Planning
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-8">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
              AI Luxury Journey Generator
            </span>
          </h1>
          
          <p className="text-xl opacity-90 max-w-4xl mx-auto mb-8">
            Experience the future of travel planning. Our AI—trained on <strong>28 years of Himalayan expertise</strong>—will craft your perfect luxury itinerary with Kiran's insider knowledge.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <span className="flex items-center bg-white/10 px-3 py-1 rounded-full">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
              Powered by Kiran's Expertise
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="bg-white/10 px-3 py-1 rounded-full">28+ Years Experience</span>
            <span className="hidden sm:inline">•</span>
            <span className="bg-white/10 px-3 py-1 rounded-full">Enterprise-Grade AI</span>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Enhanced Preferences Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Kiran's Expertise Note */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-blue-600">👨‍💼</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Kiran's AI Advantage</h3>
                  <p className="text-sm text-gray-600">Every itinerary encodes 28 years of Himalayan operational knowledge</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                {['Altitude Expertise', 'Luxury Access', 'Safety Protocols', 'Cultural Insights'].map((item, idx) => (
                  <div key={idx} className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sample Prompts Section */}
            {showSamplePrompts && !aiResponse && (
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="p-6 bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">💡 Need Inspiration? Try Kiran's Curated Samples</h3>
                    <button 
                      onClick={() => setShowSamplePrompts(false)}
                      className="text-white/80 hover:text-white text-xl"
                    >
                      ×
                    </button>
                  </div>
                  <p className="text-sm opacity-90 mt-2">Based on 28 years of successful luxury journeys</p>
                </div>
                <div className="p-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    {ENHANCED_SAMPLE_PROMPTS.map((prompt, index) => (
                      <button
                        key={index}
                        onClick={() => loadSamplePrompt(prompt)}
                        className="bg-white p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition text-left"
                      >
                        <div className="text-sm font-semibold text-gray-900 mb-1">{prompt.title}</div>
                        <div className="text-xs text-gray-600 mb-2">{prompt.description}</div>
                        <div className="text-xs text-blue-600 font-medium flex items-center">
                          Try with Kiran's expertise →
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Preferences Form */}
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Luxury Travel Profile</h2>
                <p className="text-gray-600">
                  The more details you provide, the better our AI can apply Kiran's 28 years of expertise.
                </p>
              </div>

              {/* Form Sections */}
              <div className="space-y-10">
                {/* Destination & Duration */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">Destination & Duration</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-3">Destination</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {destinations.map((dest) => (
                          <button
                            key={dest.value}
                            type="button"
                            onClick={() => handleInputChange('destination', dest.value)}
                            className={`p-4 rounded-xl border transition ${
                              preferences.destination === dest.value
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 hover:border-blue-300'
                            }`}
                          >
                            <div className="text-2xl mb-2">{dest.icon}</div>
                            <div className="font-medium text-sm">{dest.value}</div>
                            <div className="text-xs text-gray-500 mt-1">{dest.description}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-3">Duration</label>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {durations.map((dur) => (
                          <button
                            key={dur.days}
                            type="button"
                            onClick={() => handleInputChange('duration', dur.days)}
                            className={`p-3 rounded-lg border transition ${
                              preferences.duration === dur.days
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="font-bold">{dur.label}</div>
                            <div className="text-xs text-gray-500">{dur.description}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Traveler Profile */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">Traveler Profile</h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-3">Group Type</label>
                      <div className="space-y-2">
                        {travelerTypes.map((type) => (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => handleInputChange('travelerType', type.value)}
                            className={`w-full p-3 rounded-lg border transition flex items-center justify-between ${
                              preferences.travelerType === type.value
                                ? 'border-purple-500 bg-purple-50 text-purple-700'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center">
                              <span className="mr-3">{type.icon}</span>
                              <span>{type.label}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-3">Pace Preference</label>
                      <div className="space-y-2">
                        {paceOptions.map((pace) => (
                          <button
                            key={pace.value}
                            type="button"
                            onClick={() => handleInputChange('pace', pace.value)}
                            className={`w-full p-3 rounded-lg border transition text-left ${
                              preferences.pace === pace.value
                                ? 'border-green-500 bg-green-50 text-green-700'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="font-medium">{pace.label}</div>
                            <div className="text-xs text-gray-500">{pace.description}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-3">Accommodation Style</label>
                      <div className="space-y-2">
                        {accommodationStyles.map((style) => (
                          <button
                            key={style.value}
                            type="button"
                            onClick={() => handleInputChange('accommodationStyle', style.value)}
                            className={`w-full p-3 rounded-lg border transition flex items-center ${
                              preferences.accommodationStyle === style.value
                                ? 'border-amber-500 bg-amber-50 text-amber-700'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <span className="mr-3">{style.icon}</span>
                            <span>{style.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interests */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">Interests & Experiences</h3>
                  <p className="text-sm text-gray-600 mb-4">Select all that interest you</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {interestOptions.map((interest) => (
                      <button
                        key={interest.value}
                        type="button"
                        onClick={() => handleInterestToggle(interest.value)}
                        className={`p-4 rounded-xl border transition flex flex-col items-center ${
                          preferences.interests.includes(interest.value)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-2xl mb-2">{interest.icon}</div>
                        <div className="font-medium text-sm">{interest.value}</div>
                        <div className="text-xs text-gray-500 mt-1">{interest.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Budget & Special Requests */}
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">Budget Level</h3>
                    <div className="space-y-3">
                      {budgetOptions.map((budget) => (
                        <button
                          key={budget.value}
                          type="button"
                          onClick={() => handleInputChange('budget', budget.value)}
                          className={`w-full p-4 rounded-xl border transition text-left ${
                            preferences.budget === budget.value
                              ? 'border-amber-500 bg-amber-50 text-amber-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="font-bold">{budget.label}</div>
                          <div className="text-sm text-gray-600">{budget.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-lg font-semibold mb-4 text-gray-900">
                      Special Requests & Preferences
                    </label>
                    <textarea
                      value={preferences.specialRequests}
                      onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                      placeholder="Any specific requirements? Dietary restrictions, accessibility needs, celebrations, special occasions..."
                      className="w-full h-40 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Kiran's team will personally review all special requests
                    </p>
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <div className="mt-10 pt-8 border-t border-gray-200">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="bg-gradient-to-r from-blue-600 to-teal-600 text-white font-semibold py-5 px-8 rounded-xl text-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-xl w-full flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <span className="animate-spin">⟳</span>
                      <span>Applying Kiran's Expertise...</span>
                    </>
                  ) : (
                    <>
                      <span>✨</span>
                      <span>Generate AI-Powered Itinerary</span>
                      <span>→</span>
                    </>
                  )}
                </button>
                <p className="text-center text-sm text-gray-500 mt-4">
                  Your itinerary will be generated using Kiran's 28+ years of Himalayan expertise
                </p>
              </div>
            </div>
          </div>

          {/* Right: Results & How It Works */}
          <div className="space-y-8">
            {/* Results Panel */}
            {aiResponse && (
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="p-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold">✨ Your AI Luxury Itinerary</h3>
                      <p className="text-sm opacity-90">Powered by Kiran's 28+ years expertise</p>
                    </div>
                    {responseTime && (
                      <div className="text-xs bg-white/20 px-3 py-1 rounded-full">
                        Generated in {responseTime}ms
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="p-6">
                  {/* Title & Highlights */}
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">{aiResponse.title}</h2>
                    
                    {aiResponse.highlights && aiResponse.highlights.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-700 mb-3">Key Highlights</h4>
                        <ul className="space-y-2">
                          {aiResponse.highlights.map((highlight, idx) => (
                            <li key={idx} className="flex items-center text-gray-600">
                              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                              {highlight}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  {/* Quick Facts */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-xl">
                      <div className="text-sm text-gray-600">Estimated Cost</div>
                      <div className="font-bold text-gray-900">{aiResponse.estimatedCost}</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl">
                      <div className="text-sm text-gray-600">Best Season</div>
                      <div className="font-bold text-gray-900">{aiResponse.bestSeason}</div>
                    </div>
                  </div>
                  
                  {/* Pro Tips */}
                  <div className="mb-8">
                    <h4 className="font-semibold text-gray-700 mb-3">Kiran's Pro Tips</h4>
                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                      <ul className="space-y-2">
                        {aiResponse.proTips.map((tip, idx) => (
                          <li key={idx} className="flex items-start text-amber-800">
                            <span className="mr-2">💡</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <button
                      onClick={copyToClipboard}
                      className="w-full border-2 border-blue-600 text-blue-600 font-semibold py-3 px-8 rounded-xl hover:bg-blue-50 transition"
                    >
                      📋 Copy Itinerary
                    </button>
                    <button
                      onClick={downloadAsText}
                      className="w-full border-2 border-blue-600 text-blue-600 font-semibold py-3 px-8 rounded-xl hover:bg-blue-50 transition"
                    >
                      💾 Download for Planning
                    </button>
                    <button
                      onClick={shareItinerary}
                      className="w-full border-2 border-blue-600 text-blue-600 font-semibold py-3 px-8 rounded-xl hover:bg-blue-50 transition"
                    >
                      🔗 Share with Companions
                    </button>
                    <a
                      href={`/contact?itinerary=${encodeURIComponent(aiResponse.title || '')}`}
                      className="block w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white font-semibold py-3 px-8 rounded-xl hover:from-blue-700 hover:to-teal-700 transition-all text-center"
                    >
                      ✨ Consult with Kiran's Team
                    </a>
                  </div>
                </div>
                
                {/* Itinerary Preview */}
                <div className="border-t border-gray-200">
                  <div className="p-6">
                    <h4 className="font-semibold text-gray-700 mb-4">Itinerary Preview</h4>
                    <div className="bg-gray-50 p-4 rounded-xl max-h-64 overflow-y-auto">
                      <div className="prose prose-sm max-w-none">
                        <ReactMarkdown>
                          {aiResponse.itinerary.substring(0, 500) + '...'}
                        </ReactMarkdown>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Full itinerary saved for your consultation with Kiran's team
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* How It Works Panel */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-xl font-bold mb-6 text-gray-900">How Our AI Works</h3>
              
              <div className="space-y-6">
                {[
                  {
                    step: 1,
                    title: 'Share Your Preferences',
                    description: 'Tell us about your luxury travel style, interests, and budget.',
                    icon: '🎯'
                  },
                  {
                    step: 2,
                    title: 'AI Applies Kiran\'s Expertise',
                    description: 'Our AI uses 28 years of Himalayan knowledge to craft your itinerary.',
                    icon: '🧠'
                  },
                  {
                    step: 3,
                    title: 'Receive Personalized Itinerary',
                    description: 'Get a detailed luxury journey plan in minutes, not weeks.',
                    icon: '📋'
                  },
                  {
                    step: 4,
                    title: 'Consult with Kiran\'s Team',
                    description: 'Refine and perfect your journey with human expertise.',
                    icon: '👨‍💼'
                  }
                ].map((item) => (
                  <div key={item.step} className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                        {item.step}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center mb-2">
                        <span className="text-xl mr-2">{item.icon}</span>
                        <h4 className="font-semibold text-gray-900">{item.title}</h4>
                      </div>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Why Unique */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-4">Why We're Different</h4>
                <ul className="space-y-3">
                  {[
                    'AI trained on 28+ years of actual luxury travel operations',
                    'Enterprise-grade technology from Kiran\'s IT background',
                    'Direct access to Kiran\'s luxury supplier network',
                    'Human review and refinement guaranteed'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-600">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Need Help Panel */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-8 border border-blue-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Need Personal Assistance?</h3>
              <p className="text-gray-700 mb-6">
                While our AI is powerful, Kiran's Nepal-based team provides the human touch for perfecting every detail.
              </p>
              <a 
                href="/contact" 
                className="block w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white font-semibold py-3 px-8 rounded-xl hover:from-blue-700 hover:to-teal-700 transition-all text-center"
              >
                Talk to Kiran's Team
              </a>
              <p className="text-sm text-gray-600 mt-4 text-center">
                Response within 24 hours • Direct access to 28 years expertise
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}