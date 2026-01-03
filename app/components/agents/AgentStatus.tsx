// components/agents/AgentStatus.tsx
"use client";

import { useState, useEffect } from 'react';
import { CheckCircleIcon, ClockIcon, LightBulbIcon } from '@heroicons/react/24/outline';

interface AgentStatusProps {
  activity: string;
  reasoning?: string;
  showActions?: boolean;
}

export default function AgentStatus({ activity, reasoning, showActions = true }: AgentStatusProps) {
  const [actions, setActions] = useState<string[]>([
    "Monitoring availability",
    "Optimizing luxury options",
    "Checking local insights"
  ]);
  
  const [currentAction, setCurrentAction] = useState(0);
  
  useEffect(() => {
    if (showActions) {
      const interval = setInterval(() => {
        setCurrentAction((prev) => (prev + 1) % actions.length);
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [actions.length, showActions]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-white rounded-xl shadow-2xl p-5 border border-gray-200 max-w-sm">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
              <CheckCircleIcon className="w-6 h-6 text-white" />
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900">AI Agent Active</h3>
              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                LIVE
              </span>
            </div>
            
            <p className="text-sm text-gray-700 mt-1">{activity}</p>
            
            {reasoning && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center space-x-2 mb-1">
                  <LightBulbIcon className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-medium text-blue-800">Agent's Reasoning</span>
                </div>
                <p className="text-xs text-blue-700">{reasoning}</p>
              </div>
            )}
            
            {showActions && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <ClockIcon className="w-4 h-4" />
                  <span>Currently: {actions[currentAction]}</span>
                </div>
                <div className="mt-2 flex space-x-1">
                  {actions.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1 flex-1 rounded-full ${
                        idx === currentAction
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
                          : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}