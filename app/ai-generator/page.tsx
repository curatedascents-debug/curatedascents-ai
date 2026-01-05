'use client';

import { AgentChat } from '@/components/agents/AgentChat';
import { useState } from 'react';

const agents = [
  { id: 'planner', name: 'Trip Planner', description: 'Plan your perfect itinerary', color: 'from-blue-500 to-cyan-500' },
  { id: 'negotiator', name: 'Deal Negotiator', description: 'Get the best travel deals', color: 'from-green-500 to-emerald-500' },
  { id: 'concierge', name: 'VIP Concierge', description: 'Luxury experiences & services', color: 'from-purple-500 to-pink-500' },
];

export default function AIGeneratorPage() {
  const [activeAgent, setActiveAgent] = useState('planner');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">AI Luxury Travel Concierge</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Your personal AI assistant for luxury travel worldwide</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {agents.map((agent) => (
            <button key={agent.id} onClick={() => setActiveAgent(agent.id)}
              className={`p-5 rounded-2xl border-2 transition-all ${activeAgent === agent.id ? 
                `bg-gradient-to-r ${agent.color} text-white border-transparent` : 
                'bg-white border-gray-200 hover:border-gray-300'}`}>
              <h2 className="text-xl font-semibold mb-2">{agent.name}</h2>
              <p className={activeAgent === agent.id ? 'text-white/90' : 'text-gray-600'}>{agent.description}</p>
            </button>
          ))}
        </div>

        <div className="mb-4 p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 capitalize">{agents.find(a => a.id === activeAgent)?.name}</h3>
              <p className="text-gray-600">Currently active - Ask me anything!</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-700 font-medium">Ready</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="h-[600px]">
            <AgentChat agent={activeAgent} />
          </div>
        </div>

        <div className="mt-6 text-center text-gray-500 text-sm">
          <p>Powered by DeepSeek AI • All responses cleaned for readability</p>
        </div>
      </div>
    </div>
  );
}
