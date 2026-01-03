// In app/ai-generator/page.tsx
import AgentChat from '@/components/agents/AgentChat';
import AgentStatus from '@/components/agents/AgentStatus';

export default function AIGeneratorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Your Personal AI Travel Agent
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Have a conversation with your luxury travel expert. I'll remember your preferences,
            proactively suggest upgrades, and craft the perfect itinerary through dialogue.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <AgentChat agentMode="planner" />
        </div>
        
        <AgentStatus 
          activity="Ready to plan your luxury journey" 
          reasoning="Agent initialized with 25+ years of Himalayan expertise"
        />
      </div>
    </div>
  );
}