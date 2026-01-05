'use client';

import { useState } from 'react';
import AgentChat from '@/components/agents/AgentChat';

export default function AIGeneratorPage() {
  const [activeAgent, setActiveAgent] = useState<'trip-planner' | 'deal-negotiator' | 'vip-concierge'>('trip-planner');
  
  const agents = {
    'trip-planner': {
      name: 'Trip Planner',
      description: 'Craft your perfect luxury travel itinerary with personalized recommendations',
      gradient: 'from-emerald-500 to-teal-600',
    },
    'deal-negotiator': {
      name: 'Deal Negotiator',
      description: 'Find and secure the best travel deals, discounts, and exclusive offers',
      gradient: 'from-amber-500 to-orange-600',
    },
    'vip-concierge': {
      name: 'VIP Concierge',
      description: 'Access exclusive experiences and premium services for discerning travelers',
      gradient: 'from-purple-500 to-pink-600',
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            CuratedAscents AI
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your personal AI travel assistant. Select an agent to begin crafting your perfect journey.
          </p>
        </div>

        {/* Agent Selection */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            Select Your AI Travel Agent
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {Object.entries(agents).map(([key, agent]) => (
              <button
                key={key}
                onClick={() => setActiveAgent(key as any)}
                className={`p-6 rounded-2xl text-left transition-all duration-300 transform hover:-translate-y-1 ${
                  activeAgent === key
                    ? `bg-gradient-to-r ${agent.gradient} text-white shadow-2xl scale-105`
                    : 'bg-white text-gray-800 border-2 border-gray-200 hover:border-gray-300 shadow-lg'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">{agent.name}</h3>
                  {activeAgent === key && (
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                  )}
                </div>
                <p className={`text-sm ${activeAgent === key ? 'text-white/90' : 'text-gray-600'}`}>
                  {agent.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Active Agent Chat */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
          <div className="h-[600px] md:h-[700px]">
            <AgentChat
              agentType={activeAgent}
              agentName={agents[activeAgent].name}
              agentDescription={agents[activeAgent].description}
            />
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            All AI responses are generated in real-time and may require human verification for critical travel details.
          </p>
        </div>
      </div>
    </div>
  );
}
