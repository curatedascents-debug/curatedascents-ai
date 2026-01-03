'use client';

import React, { useState, useRef, useEffect } from 'react';
import AgentStatus from './AgentStatus';
import { 
  PaperAirplaneIcon, 
  ArrowPathIcon, 
  DocumentArrowDownIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  MapPinIcon,
  SunIcon,
  MoonIcon,
  DevicePhoneMobileIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { 
  StarIcon,
  FireIcon,
  TrophyIcon
} from '@heroicons/react/24/solid';

type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    mode?: string;
    budgetTier?: string;
    suggestions?: string[];
    followUpQuestion?: string;
  };
};

type AgentMode = 'planner' | 'negotiator' | 'concierge';
type BudgetTier = 'ultra-luxury' | 'luxury' | 'premium';

interface TravelPreferences {
  destination?: string;
  duration?: string;
  travelers?: number;
  interests?: string[];
  budget?: BudgetTier;
  travelDates?: string;
}

export default function AgentChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `🌟 **Welcome to CuratedAscents AI** - Your Personal Himalayan Luxury Concierge!

With 25+ years of exclusive Himalayan travel expertise, I'm here to craft your perfect luxury experience. I operate in three specialized modes:

🏔️ **Planner Mode**: Bespoke itinerary design, weather optimization, VIP access scoring, and exclusive retreat curation
💎 **Negotiator Mode**: Premium upgrades, multi-vendor rate comparison, exclusive access negotiation, and value optimization
🛎️ **Concierge Mode**: Personalized surprises, real-time local coordination, unique experiences, and guest delight management

**How can I assist you today?** Tell me about your dream Himalayan adventure, and I'll make it a reality.`,
      timestamp: new Date(),
      metadata: {
        mode: 'planner',
        suggestions: [
          "Private villa in Bhutan with butler service",
          "Helicopter tour of Everest Base Camp",
          "Luxury spa retreat in Rishikesh",
          "Monastery stay with meditation masters"
        ]
      }
    }
  ]);
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [agentMode, setAgentMode] = useState<AgentMode>('planner');
  const [sessionId, setSessionId] = useState<string>('');
  const [travelPreferences, setTravelPreferences] = useState<TravelPreferences>({});
  const [showBudgetInfo, setShowBudgetInfo] = useState(false);
  const [isTypingIndicator, setIsTypingIndicator] = useState(false);
  const [conversationSummary, setConversationSummary] = useState<string>('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Initialize session and load from memory
  useEffect(() => {
    const initializeSession = async () => {
      const id = `curated_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setSessionId(id);
      
      // Try to load previous conversation from localStorage
      try {
        const savedSession = localStorage.getItem(`curated_session_${id.substring(0, 8)}`);
        if (savedSession) {
          const parsed = JSON.parse(savedSession);
          if (parsed.messages && parsed.messages.length > 0) {
            setMessages(parsed.messages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            })));
          }
          if (parsed.preferences) {
            setTravelPreferences(parsed.preferences);
          }
        }
      } catch (error) {
        console.log('Starting fresh session');
      }
    };
    
    initializeSession();
  }, []);

  // Auto-save conversation to localStorage
  useEffect(() => {
    if (messages.length > 1 && sessionId) {
      const saveData = {
        messages: messages.map(msg => ({
          ...msg,
          timestamp: msg.timestamp.toISOString()
        })),
        preferences: travelPreferences,
        lastUpdated: new Date().toISOString()
      };
      
      try {
        localStorage.setItem(`curated_session_${sessionId.substring(0, 8)}`, JSON.stringify(saveData));
      } catch (error) {
        console.error('Failed to save conversation:', error);
      }
    }
  }, [messages, travelPreferences, sessionId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current && chatContainerRef.current) {
      const container = chatContainerRef.current;
      const isScrolledNearBottom = 
        container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      
      if (isScrolledNearBottom) {
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [messages, isLoading]);

  // Focus input on load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Generate conversation summary when enough messages
  useEffect(() => {
    if (messages.length >= 3) {
      const userMessages = messages
        .filter(m => m.role === 'user')
        .map(m => m.content)
        .join(' ');
      
      if (userMessages.length > 0) {
        const summary = `Interests: ${userMessages.substring(0, 150)}...`;
        setConversationSummary(summary);
      }
    }
  }, [messages]);

  const simulateTyping = async (duration: number = 800) => {
    setIsTypingIndicator(true);
    await new Promise(resolve => setTimeout(resolve, duration));
    setIsTypingIndicator(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    // Update messages immediately for responsive UI
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    // Add typing indicator
    await simulateTyping(600);

    try {
      // Extract preferences from user input
      const newPreferences = extractPreferences(input, travelPreferences);
      if (Object.keys(newPreferences).length > 0) {
        setTravelPreferences(prev => ({ ...prev, ...newPreferences }));
      }

      const response = await fetch('/api/agents/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Session-ID': sessionId
        },
        body: JSON.stringify({
          messages: messages.slice(-6).concat(userMessage).map(m => ({ 
            role: m.role, 
            content: m.content 
          })),
          agentMode,
          sessionId,
          travelPreferences: { ...travelPreferences, ...newPreferences }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'API request failed');
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        metadata: {
          mode: agentMode,
          budgetTier: data.budgetTier,
          suggestions: data.suggestions,
          followUpQuestion: data.followUpQuestion
        }
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Chat error:', error);
      
      // Create a fallback response based on agent mode
      const fallbackResponses = {
        planner: "I apologize for the technical issue. Based on our conversation, I recommend our signature **'Himalayan Royal Retreat'** featuring private helicopter transfers, a luxury villa with personal butler, and exclusive monastery access. Shall I elaborate on this itinerary?",
        negotiator: "I'm experiencing a brief technical issue. However, I can secure you **preferential rates** at Aman Resorts, Six Senses, and Taj properties in the Himalayas with complimentary upgrades. Would you like me to check availability?",
        concierge: "Please excuse the interruption. As your personal concierge, I'm arranging **exclusive experiences** like private yoga with masters, helicopter picnics at remote locations, and VIP cultural performances. What specific surprise would delight you?"
      };

      const assistantMessage: Message = {
        id: `fallback_${Date.now()}`,
        role: 'assistant',
        content: fallbackResponses[agentMode],
        timestamp: new Date(),
        metadata: {
          mode: agentMode,
          suggestions: ['Retry connection', 'Continue with cached expertise', 'Schedule a callback']
        }
      };

      setMessages(prev => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
      // Refocus input after response
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const extractPreferences = (text: string, current: TravelPreferences): Partial<TravelPreferences> => {
    const preferences: Partial<TravelPreferences> = {};
    const lowerText = text.toLowerCase();

    // Destination detection
    const destinations = ['bhutan', 'nepal', 'tibet', 'ladakh', 'sikkim', 'darjeeling', 'rishikesh', 'everest'];
    destinations.forEach(dest => {
      if (lowerText.includes(dest)) {
        preferences.destination = dest.charAt(0).toUpperCase() + dest.slice(1);
      }
    });

    // Duration detection
    const durationMatch = lowerText.match(/(\d+)\s*(days?|weeks?|months?)/);
    if (durationMatch) {
      preferences.duration = `${durationMatch[1]} ${durationMatch[2]}`;
    }

    // Travelers detection
    const travelersMatch = lowerText.match(/(\d+)\s*(people|persons|travelers|guests)/);
    if (travelersMatch) {
      preferences.travelers = parseInt(travelersMatch[1]);
    }

    // Budget detection
    if (lowerText.includes('$25') || lowerText.includes('25k') || lowerText.includes('ultra luxury')) {
      preferences.budget = 'ultra-luxury';
    } else if (lowerText.includes('$10') || lowerText.includes('10k') || lowerText.includes('luxury')) {
      preferences.budget = 'luxury';
    } else if (lowerText.includes('$5') || lowerText.includes('5k') || lowerText.includes('premium')) {
      preferences.budget = 'premium';
    }

    return preferences;
  };

  const handleQuickAction = (action: string) => {
    const quickActions: Record<string, string> = {
      'Everest Base Camp': "I'd like a luxury Everest Base Camp experience with helicopter transfers",
      'Bhutan Retreat': "Plan a private luxury retreat in Bhutan with cultural immersion",
      'Yoga & Spa': "Design a premium yoga and spa retreat in the Himalayas",
      'Family Adventure': "Create a family-friendly luxury adventure in the mountains",
      'Honeymoon': "Design a romantic Himalayan honeymoon with privacy and luxury"
    };

    if (quickActions[action]) {
      setInput(quickActions[action]);
    }
  };

  const handleExport = () => {
    const chatContent = `CuratedAscents AI - Luxury Travel Consultation
Session: ${sessionId}
Date: ${new Date().toLocaleDateString()}
Agent Mode: ${agentMode}
${travelPreferences.destination ? `Destination: ${travelPreferences.destination}\n` : ''}
${travelPreferences.budget ? `Budget Tier: ${travelPreferences.budget}\n` : ''}

CONVERSATION SUMMARY:
${conversationSummary || 'No summary available'}

DETAILED CONVERSATION:
${messages.map(m => 
  `${m.role === 'user' ? 'CLIENT' : 'CURATEDASCENTS AI'}: ${m.content}\n${'-'.repeat(50)}`
).join('\n\n')}

NEXT STEPS:
1. Schedule expert consultation
2. Receive detailed itinerary proposal
3. Secure exclusive bookings
4. Prepare for luxury Himalayan journey

Contact: curatedascents.com | +1 (555) 123-4567`;

    const blob = new Blob([chatContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CuratedAscents-Consultation-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearChat = () => {
    if (confirm('Clear this conversation and start fresh?')) {
      setMessages([messages[0]]);
      setTravelPreferences({});
      setConversationSummary('');
      localStorage.removeItem(`curated_session_${sessionId.substring(0, 8)}`);
    }
  };

  const handleModeChange = (mode: AgentMode) => {
    setAgentMode(mode);
    
    const modeAnnouncements = {
      planner: "🏔️ **Switched to Planner Mode**: Ready to design your bespoke Himalayan itinerary with VIP access and weather optimization.",
      negotiator: "💎 **Switched to Negotiator Mode**: Actively securing premium upgrades and exclusive rates for your luxury experience.",
      concierge: "🛎️ **Switched to Concierge Mode**: Now managing personalized surprises and real-time coordination for your journey."
    };

    const announcement: Message = {
      id: `mode_${Date.now()}`,
      role: 'system',
      content: modeAnnouncements[mode],
      timestamp: new Date()
    };

    setMessages(prev => [...prev, announcement]);
  };

  const modeConfigs = {
    planner: {
      icon: MapPinIcon,
      color: 'from-blue-500 to-cyan-400',
      bgColor: 'bg-blue-500/20',
      title: 'Planner Mode',
      description: 'Bespoke itinerary design & VIP access'
    },
    negotiator: {
      icon: CurrencyDollarIcon,
      color: 'from-emerald-500 to-teal-400',
      bgColor: 'bg-emerald-500/20',
      title: 'Negotiator Mode',
      description: 'Premium upgrades & exclusive rates'
    },
    concierge: {
      icon: UserGroupIcon,
      color: 'from-purple-500 to-pink-400',
      bgColor: 'bg-purple-500/20',
      title: 'Concierge Mode',
      description: 'Personalized surprises & coordination'
    }
  };

  const budgetTiers = [
    { 
      tier: 'Ultra-Luxury', 
      range: '$25,000+', 
      icon: StarIcon,
      color: 'from-amber-400 to-yellow-300',
      features: ['Helicopter Transfers', 'Private Villas', '24/7 Butler', 'Michelin Dining', 'Exclusive Access']
    },
    { 
      tier: 'Luxury', 
      range: '$10,000 - $25,000', 
      icon: TrophyIcon,
      color: 'from-purple-500 to-pink-400',
      features: ['Premium Hotels', 'Private Guides', 'VIP Access', 'Fine Dining', 'Luxury Transfers']
    },
    { 
      tier: 'Premium', 
      range: '$5,000 - $10,000', 
      icon: FireIcon,
      color: 'from-rose-500 to-orange-400',
      features: ['Boutique Hotels', 'Small Groups', 'Curated Experiences', 'Comfort Transfers', 'Local Experts']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-950 text-white">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-60 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-rose-500 rounded-full blur-md opacity-70"></div>
              <ChatBubbleLeftRightIcon className="relative w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-300 via-rose-400 to-purple-400 bg-clip-text text-transparent">
              CuratedAscents AI
            </h1>
          </div>
          <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto">
            Your Agentic Luxury Travel Specialist • 25+ Years Himalayan Expertise
          </p>
          
          {/* Session Info */}
          <div className="mt-4 flex items-center justify-center gap-4 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span>AI Assistant Active</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-2">
              <DevicePhoneMobileIcon className="w-4 h-4" />
              <span>Session: {sessionId.substring(0, 12)}...</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
          {/* Left Sidebar - Mode Selector & Quick Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Mode Selector */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <SparklesIcon className="w-5 h-5 text-amber-300" />
                Agent Mode
              </h3>
              <div className="space-y-3">
                {(Object.keys(modeConfigs) as AgentMode[]).map((mode) => {
                  const config = modeConfigs[mode];
                  const Icon = config.icon;
                  return (
                    <button
                      key={mode}
                      onClick={() => handleModeChange(mode)}
                      className={`w-full p-4 rounded-xl text-left transition-all duration-300 ${
                        agentMode === mode
                          ? `bg-gradient-to-r ${config.color} border border-transparent shadow-lg`
                          : 'bg-gray-900/50 hover:bg-gray-800 border border-gray-700/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${config.bgColor}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-semibold">{config.title}</div>
                          <div className="text-xs text-slate-300 mt-1">{config.description}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <CalendarDaysIcon className="w-5 h-5 text-blue-400" />
                Quick Start
              </h3>
              <div className="space-y-2">
                {['Everest Base Camp', 'Bhutan Retreat', 'Yoga & Spa', 'Family Adventure', 'Honeymoon'].map((action) => (
                  <button
                    key={action}
                    onClick={() => handleQuickAction(action)}
                    className="w-full p-3 rounded-lg bg-gray-900/50 hover:bg-gray-800 border border-gray-700/50 text-left text-sm transition-colors flex items-center justify-between group"
                  >
                    <span>{action}</span>
                    <ArrowRightIcon className="w-4 h-4 text-slate-400 group-hover:text-amber-400 transition-colors" />
                  </button>
                ))}
              </div>
            </div>

            {/* Budget Tiers */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <CurrencyDollarIcon className="w-5 h-5 text-emerald-400" />
                  Budget Tiers
                </h3>
                <button
                  onClick={() => setShowBudgetInfo(!showBudgetInfo)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  {showBudgetInfo ? 'Hide' : 'Show'} Details
                </button>
              </div>
              
              <div className="space-y-3">
                {budgetTiers.map((tier, index) => (
                  <div
                    key={tier.tier}
                    className={`p-4 rounded-xl border ${
                      travelPreferences.budget === tier.tier.toLowerCase().replace(' ', '-')
                        ? 'border-amber-500 bg-amber-500/10'
                        : 'border-gray-700/50 bg-gray-900/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <tier.icon className={`w-5 h-5 bg-gradient-to-r ${tier.color} bg-clip-text text-transparent`} />
                        <span className="font-semibold">{tier.tier}</span>
                      </div>
                      <span className="text-lg font-bold">{tier.range}</span>
                    </div>
                    
                    {showBudgetInfo && (
                      <div className="mt-3 pt-3 border-t border-gray-700/50">
                        <ul className="space-y-1 text-xs text-slate-300">
                          {tier.features.map((feature, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <CheckCircleIcon className="w-3 h-3 text-emerald-400" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-3 flex flex-col">
            {/* Active Mode Display */}
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${modeConfigs[agentMode].bgColor}`}>
                    {React.createElement(modeConfigs[agentMode].icon, { className: "w-6 h-6" })}
                  </div>
                  <div>
                    <div className="font-bold text-lg">{modeConfigs[agentMode].title}</div>
                    <div className="text-sm text-slate-300">{modeConfigs[agentMode].description}</div>
                  </div>
                </div>
                
                {conversationSummary && (
                  <div className="hidden md:block text-right">
                    <div className="text-xs text-slate-400">Conversation Summary</div>
                    <div className="text-sm text-slate-300 max-w-xs truncate">{conversationSummary}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Container */}
            <div className="flex-1 flex flex-col bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/50 shadow-2xl overflow-hidden">
              {/* Messages Area */}
              <div 
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6"
              >
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600'
                          : message.role === 'system'
                          ? 'bg-gray-900/80 border border-amber-500/30'
                          : 'bg-gray-900/80 border border-gray-700'
                      }`}
                    >
                      {/* Message Header */}
                      <div className="flex items-center gap-2 mb-3">
                        {message.role === 'assistant' && (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full animate-pulse"></div>
                            <span className="font-bold bg-gradient-to-r from-amber-300 to-rose-400 bg-clip-text text-transparent">
                              CuratedAscents AI
                            </span>
                          </div>
                        )}
                        {message.role === 'user' && (
                          <span className="font-bold text-blue-200">You</span>
                        )}
                        {message.role === 'system' && (
                          <span className="font-bold text-amber-300">System</span>
                        )}
                        <span className="text-xs text-slate-400 ml-auto">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Message Content */}
                      <div className="whitespace-pre-wrap leading-relaxed">
                        {message.content}
                      </div>

                      {/* Message Metadata */}
                      {message.metadata?.suggestions && (
                        <div className="mt-4 pt-4 border-t border-gray-700/50">
                          <div className="text-xs text-slate-400 mb-2">Suggestions:</div>
                          <div className="flex flex-wrap gap-2">
                            {message.metadata.suggestions.map((suggestion, idx) => (
                              <button
                                key={idx}
                                onClick={() => setInput(suggestion)}
                                className="px-3 py-1 text-xs bg-gray-800 hover:bg-gray-700 rounded-full border border-gray-700 transition-colors"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTypingIndicator && (
                  <div className="flex justify-start">
                    <div className="bg-gray-900/80 border border-gray-700 rounded-2xl p-4">
                      <AgentStatus />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-gray-700/50 p-4 md:p-6 bg-gray-900/50 backdrop-blur-sm">
                <form onSubmit={handleSubmit} className="flex gap-3">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={`Ask about luxury Himalayan experiences... ${
                      agentMode === 'planner' ? 'Try: "Private villa in Bhutan"' :
                      agentMode === 'negotiator' ? 'Try: "Upgrade to suite at Aman"' :
                      'Try: "Arrange surprise anniversary dinner"'
                    }`}
                    className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-5 py-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    disabled={isLoading}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl px-6 py-4 transition-all duration-300 font-semibold flex items-center gap-2 shadow-lg hover:shadow-amber-500/25 disabled:shadow-none"
                  >
                    {isLoading ? (
                      <ArrowPathIcon className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <PaperAirplaneIcon className="w-5 h-5" />
                        <span className="hidden md:inline">Send</span>
                      </>
                    )}
                  </button>
                </form>
                
                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleClearChat}
                      className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-2 px-3 py-2 hover:bg-gray-800 rounded-lg"
                    >
                      <ArrowPathIcon className="w-4 h-4" />
                      Clear Chat
                    </button>
                    
                    <button
                      onClick={handleExport}
                      className="text-amber-300 hover:text-amber-200 transition-colors text-sm flex items-center gap-2 px-3 py-2 hover:bg-gray-800 rounded-lg"
                    >
                      <DocumentArrowDownIcon className="w-4 h-4" />
                      Export
                    </button>
                  </div>
                  
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <SunIcon className="w-3 h-3" />
                      <span>Real-time AI</span>
                    </div>
                    <span>•</span>
                    <span>{messages.length} messages</span>
                    <span>•</span>
                    <span>DeepSeek AI</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Travel Preferences Display */}
            {Object.keys(travelPreferences).length > 0 && (
              <div className="mt-6 p-4 rounded-2xl bg-gray-800/30 backdrop-blur-sm border border-gray-700/50">
                <h4 className="font-bold mb-3 flex items-center gap-2">
                  <SparklesIcon className="w-4 h-4 text-amber-300" />
                  Your Travel Preferences
                </h4>
                <div className="flex flex-wrap gap-4">
                  {travelPreferences.destination && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 rounded-full">
                      <MapPinIcon className="w-3 h-3" />
                      <span className="text-sm">{travelPreferences.destination}</span>
                    </div>
                  )}
                  {travelPreferences.duration && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 rounded-full">
                      <CalendarDaysIcon className="w-3 h-3" />
                      <span className="text-sm">{travelPreferences.duration}</span>
                    </div>
                  )}
                  {travelPreferences.travelers && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 rounded-full">
                      <UserGroupIcon className="w-3 h-3" />
                      <span className="text-sm">{travelPreferences.travelers} travelers</span>
                    </div>
                  )}
                  {travelPreferences.budget && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/20 rounded-full">
                      <CurrencyDollarIcon className="w-3 h-3" />
                      <span className="text-sm">{travelPreferences.budget.replace('-', ' ')}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-800 text-center">
          <p className="text-slate-400 text-sm">
            CuratedAscents AI • 25+ Years Himalayan Expertise • 
            <span className="text-amber-300 ml-2">Agentic AI Assistant v1.0</span>
          </p>
          <div className="flex justify-center gap-4 mt-3 text-xs text-slate-500">
            <span>Privacy Secured</span>
            <span>•</span>
            <span>Conversation Saved</span>
            <span>•</span>
            <span>Real-time Processing</span>
          </div>
        </div>
      </div>
    </div>
  );
}