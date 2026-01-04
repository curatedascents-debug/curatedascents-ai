// app/ai-generator/page.tsx
import type { Metadata } from 'next';
import AgentChat from '@/components/agents/AgentChat';

export const metadata: Metadata = {
  title: 'AI Luxury Travel Concierge | CuratedAscents',
  description: 'Your personal AI luxury travel specialist for Himalayan adventures',
};

export default function AIGeneratorPage() {
  return (
    // In the return statement of /app/ai-generator/page.tsx
    // Replace the AgentChat section with:

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Planner Agent */}
      <div className="lg:col-span-1">
        <AgentChat
          agentType="planner"
          agentDescription="Designs exquisite itineraries with VIP access"
          initialMessage="Hello! I'm your Luxury Travel Planner. I'll design your perfect Himalayan itinerary with VIP access and optimal weather planning. Where shall we begin?"
        />
      </div>

      {/* Negotiator Agent */}
      <div className="lg:col-span-1">
        <AgentChat
          agentType="negotiator"
          agentDescription="Secures premium rates and exclusive upgrades"
          initialMessage="Greetings! I'm your Luxury Negotiator. I'll secure the best rates, premium upgrades, and exclusive perks for your Himalayan journey. What experiences are you seeking?"
        />
      </div>

      {/* Concierge Agent */}
      <div className="lg:col-span-1">
        <AgentChat
          agentType="concierge"
          agentDescription="Arranges personalized surprises and coordination"
          initialMessage="Welcome! I'm your Personal Concierge. I'll arrange special surprises, coordinate all details, and ensure your Himalayan experience is truly extraordinary. How may I assist?"
        />
      </div>
    </div>
  );
}
