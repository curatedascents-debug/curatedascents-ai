// components/agents/FloatingAgentStatus.tsx
"use client";

import AgentStatus from './AgentStatus';

export default function FloatingAgentStatus() {
  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
      <div className="max-w-sm">
        <AgentStatus 
          activity="Monitoring luxury travel opportunities"
          showActions={true}
          isThinking={true}
        />
      </div>
      
      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}