'use client';

import { useState, useEffect } from 'react';
import {
  MapIcon,
  CurrencyDollarIcon,
  SparklesIcon,
  ClockIcon
} from '@heroicons/react/24/solid';

interface AgentStatusProps {
  agentType: 'planner' | 'negotiator' | 'concierge';
}

export default function AgentStatus({ agentType }: AgentStatusProps) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const agentConfig = {
    planner: {
      icon: MapIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      title: 'Planning Your Luxury Journey',
      messages: [
        'Analyzing optimal weather patterns',
        'Securing VIP access to exclusive sites',
        'Designing personalized itinerary',
        'Coordinating with luxury partners',
        'Optimizing for seasonal experiences'
      ]
    },
    negotiator: {
      icon: CurrencyDollarIcon,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      title: 'Negotiating Premium Rates',
      messages: [
        'Comparing multi-vendor luxury rates',
        'Securing exclusive member discounts',
        'Arranging premium upgrades',
        'Confirming private transport',
        'Finalizing exclusive access'
      ]
    },
    concierge: {
      icon: SparklesIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      title: 'Arranging Special Experiences',
      messages: [
        'Coordinating personalized surprises',
        'Confirming private dining arrangements',
        'Arranging spa and wellness treatments',
        'Preparing special occasion setups',
        'Ensuring real-time coordination'
      ]
    }
  };

  const config = agentConfig[agentType];
  const Icon = config.icon;
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex(prev => (prev + 1) % config.messages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [config.messages.length]);

  return (
    <div className={`${config.bgColor} p-4 rounded-xl border ${config.color.replace('text', 'border')} border-opacity-30`}>
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg ${config.color} bg-white`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">{config.title}</h3>
            <ClockIcon className="h-4 w-4 text-gray-400" />
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {config.messages[currentMessageIndex]}
            <span className="inline-block w-3">{dots}</span>
          </p>

          {/* Progress indicator */}
          <div className="mt-2 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${config.color.replace('text', 'bg')} rounded-full animate-pulse`}
              style={{
                width: `${((currentMessageIndex + 1) / config.messages.length) * 100}%`,
                transition: 'width 1s ease-in-out'
              }}
            />
          </div>

          {/* Expertise indicator */}
          <div className="mt-3 flex items-center text-xs text-gray-500">
            <div className="flex-1">
              <span className="font-medium">25+ Years Himalayan Expertise</span>
              <div className="flex items-center mt-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 w-6 rounded-full mx-1 ${i < 4 ? 'bg-blue-500' : 'bg-gray-300'}`}
                  />
                ))}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-medium text-gray-700">Processing</div>
              <div className="text-xs text-gray-500">AI thinking{dots}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}