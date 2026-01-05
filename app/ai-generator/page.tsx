// app/ai-generator/page.tsx
import type { Metadata } from 'next';
import { AgentChat } from '@/components/agents/AgentChat'; // FIXED: Use named import

export const metadata: Metadata = {
  title: 'AI Luxury Travel Concierge | CuratedAscents',
  description: 'Your personal AI travel assistant for luxury experiences worldwide',
};

export default function AIGeneratorPage() {
  const agents = [
    { id: 'planner', name: 'Trip Planner', description: 'Plan your perfect itinerary' },
    { id: 'negotiator', name: 'Deal Negotiator', description: 'Get the best travel deals' },
    { id: 'concierge', name: 'VIP Concierge', description: 'Luxury experiences & services' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Luxury Travel Concierge
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your personal AI assistant for planning, negotiating, and experiencing luxury travel worldwide.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow"
            >
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                {agent.name}
              </h2>
              <p className="text-gray-600 mb-4">{agent.description}</p>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800">
                Ready to assist
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="h-[600px]">
            <AgentChat agent="planner" />
          </div>
        </div>

        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Powered by DeepSeek AI • Responses are cleaned for optimal readability</p>
        </div>
      </div>
    </div>
  );
}