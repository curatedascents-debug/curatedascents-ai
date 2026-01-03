// app/ai-generator/page.tsx
import type { Metadata } from 'next';
import AgentChat from '@/components/agents/AgentChat';

export const metadata: Metadata = {
  title: 'AI Luxury Travel Concierge | CuratedAscents',
  description: 'Your personal AI luxury travel specialist for Himalayan adventures',
};

export default function AIGeneratorPage() {
  return (
    <div>
      <AgentChat />
    </div>
  );
}
