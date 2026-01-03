// components/agents/AgentStatus.tsx
"use client";

import { useState, useEffect } from 'react';
import { 
  CheckCircleIcon, 
  ClockIcon, 
  LightBulbIcon,
  SparklesIcon,
  ChartBarIcon,
  PuzzlePieceIcon,
  CpuChipIcon,
  BuildingLibraryIcon
} from '@heroicons/react/24/outline';
import { 
  FireIcon,
  GlobeAltIcon
} from '@heroicons/react/24/solid';

interface AgentStatusProps {
  activity?: string;
  reasoning?: string;
  showActions?: boolean;
  mode?: 'planner' | 'negotiator' | 'concierge';
  isThinking?: boolean;
}

export default function AgentStatus({ 
  activity = "Processing your luxury travel request", 
  reasoning, 
  showActions = true,
  mode = 'planner',
  isThinking = true
}: AgentStatusProps) {
  const [actions, setActions] = useState<string[]>([]);
  const [currentAction, setCurrentAction] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentReasoning, setCurrentReasoning] = useState<string[]>([]);
  
  // Mode-specific actions
  const modeActions = {
    planner: [
      "Designing bespoke Himalayan itinerary",
      "Optimizing weather patterns for your dates",
      "Securing VIP access to exclusive sites",
      "Curating luxury accommodation options",
      "Analyzing seasonal mountain conditions",
      "Planning helicopter transfer routes"
    ],
    negotiator: [
      "Comparing premium hotel rates",
      "Securing suite upgrades",
      "Negotiating private guide rates",
      "Checking exclusive access availability",
      "Comparing helicopter charter options",
      "Securing complimentary amenities"
    ],
    concierge: [
      "Arranging personalized surprises",
      "Coordinating with local luxury partners",
      "Confirming private dining experiences",
      "Securing last-minute reservations",
      "Preparing welcome amenities",
      "Coordinating real-time local services"
    ]
  };

  const modeIcons = {
    planner: <MapPinIcon className="w-5 h-5" />,
    negotiator: <CurrencyDollarIcon className="w-5 h-5" />,
    concierge: <UserGroupIcon className="w-5 h-5" />
  };

  const modeReasoningExamples = {
    planner: [
      "Considering elevation acclimatization for optimal comfort",
      "Balancing adventure activities with luxury relaxation",
      "Incorporating cultural immersion with privacy",
      "Optimizing travel routes for scenic impact"
    ],
    negotiator: [
      "Analyzing seasonal price variations for best value",
      "Comparing exclusive access packages",
      "Evaluating upgrade opportunities based on loyalty status",
      "Negotiating value-added amenities"
    ],
    concierge: [
      "Personalizing experiences based on detected preferences",
      "Coordinating surprise elements for maximum impact",
      "Ensuring seamless transitions between locations",
      "Anticipating needs before they arise"
    ]
  };

  // Initialize actions based on mode
  useEffect(() => {
    setActions(modeActions[mode] || modeActions.planner);
    
    // Set initial reasoning examples
    const examples = modeReasoningExamples[mode] || modeReasoningExamples.planner;
    setCurrentReasoning(examples);
  }, [mode]);

  // Progress animation
  useEffect(() => {
    if (isThinking) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) return 0;
          return prev + Math.random() * 10;
        });
      }, 300);
      return () => clearInterval(interval);
    }
  }, [isThinking]);

  // Cycle through actions
  useEffect(() => {
    if (showActions && isThinking) {
      const interval = setInterval(() => {
        setCurrentAction((prev) => (prev + 1) % actions.length);
      }, 2500);
      
      return () => clearInterval(interval);
    }
  }, [actions.length, showActions, isThinking]);

  // Cycle through reasoning examples
  useEffect(() => {
    if (reasoning === undefined && isThinking) {
      const interval = setInterval(() => {
        setCurrentReasoning(prev => {
          const newArray = [...prev];
          newArray.push(newArray.shift()!);
          return newArray;
        });
      }, 3500);
      
      return () => clearInterval(interval);
    }
  }, [reasoning, isThinking]);

  const getModeColor = () => {
    switch(mode) {
      case 'planner': return 'from-blue-500 to-cyan-400';
      case 'negotiator': return 'from-emerald-500 to-teal-400';
      case 'concierge': return 'from-purple-500 to-pink-400';
      default: return 'from-blue-500 to-cyan-400';
    }
  };

  const getModeIcon = () => {
    switch(mode) {
      case 'planner': return <MapPinIcon className="w-5 h-5" />;
      case 'negotiator': return <CurrencyDollarIcon className="w-5 h-5" />;
      case 'concierge': return <UserGroupIcon className="w-5 h-5" />;
      default: return <SparklesIcon className="w-5 h-5" />;
    }
  };

  const getModeName = () => {
    switch(mode) {
      case 'planner': return 'Planner Mode';
      case 'negotiator': return 'Negotiator Mode';
      case 'concierge': return 'Concierge Mode';
      default: return 'AI Agent';
    }
  };

  // Custom icons for cleaner display
  function MapPinIcon(props: any) { return <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>; }
  function CurrencyDollarIcon(props: any) { return <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>; }
  function UserGroupIcon(props: any) { return <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>; }

  return (
    <div className="relative">
      {/* Main Status Container */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl border border-gray-800 p-5 shadow-2xl backdrop-blur-sm">
        <div className="flex items-start space-x-4">
          {/* Animated Icon */}
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-r animate-spin-slow opacity-20 rounded-full">
              <div className="w-14 h-14 rounded-full bg-gradient-to-r from-amber-400 via-rose-500 to-purple-500"></div>
            </div>
            <div className={`relative w-12 h-12 rounded-full bg-gradient-to-r ${getModeColor()} flex items-center justify-center shadow-lg`}>
              {isThinking ? (
                <div className="animate-pulse">
                  {getModeIcon()}
                </div>
              ) : (
                <CheckCircleIcon className="w-6 h-6 text-white" />
              )}
            </div>
            
            {/* Pulsing ring effect */}
            {isThinking && (
              <div className="absolute -inset-1 border-2 border-amber-400/30 rounded-full animate-ping"></div>
            )}
          </div>
          
          {/* Content Area */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-white text-lg">
                  {getModeName()}
                </h3>
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${
                    isThinking 
                      ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 animate-pulse' 
                      : 'bg-green-500'
                  }`}></div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    isThinking 
                      ? 'bg-amber-500/20 text-amber-300' 
                      : 'bg-green-500/20 text-green-400'
                  }`}>
                    {isThinking ? 'THINKING' : 'READY'}
                  </span>
                </div>
              </div>
              
              <div className="hidden sm:flex items-center space-x-1 text-xs text-gray-400">
                <CpuChipIcon className="w-3 h-3" />
                <span>DeepSeek AI</span>
              </div>
            </div>
            
            {/* Activity Text */}
            <p className="text-sm text-gray-300 mb-4">
              {isThinking ? activity : "Ready for your next request"}
            </p>
            
            {/* Progress Bar */}
            {isThinking && (
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Processing</span>
                  <span>{Math.min(100, Math.round(progress))}%</span>
                </div>
                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, progress)}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            {/* Dynamic Reasoning Display */}
            {(reasoning || currentReasoning.length > 0) && (
              <div className="mb-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                <div className="flex items-center space-x-2 mb-2">
                  <LightBulbIcon className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-medium text-gray-300">AI Reasoning Process</span>
                </div>
                <div className="h-12 overflow-hidden">
                  <div className="space-y-2 animate-fade-slide">
                    {reasoning ? (
                      <p className="text-xs text-gray-400">{reasoning}</p>
                    ) : (
                      currentReasoning.slice(0, 2).map((reason, idx) => (
                        <p key={idx} className="text-xs text-gray-400 flex items-start space-x-2">
                          <span className="text-amber-400 mt-0.5">•</span>
                          <span>{reason}</span>
                        </p>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Actions Carousel */}
            {showActions && isThinking && (
              <div className="pt-3 border-t border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <ChartBarIcon className="w-4 h-4" />
                    <span>Current Task:</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {currentAction + 1} of {actions.length}
                  </span>
                </div>
                
                <div className="relative h-8 overflow-hidden">
                  <div 
                    className="absolute inset-0 transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateY(-${currentAction * 32}px)` }}
                  >
                    {actions.map((action, idx) => (
                      <div 
                        key={idx} 
                        className="h-8 flex items-center"
                      >
                        <div className="flex items-center space-x-2">
                          <PuzzlePieceIcon className={`w-3 h-3 ${
                            idx === currentAction ? 'text-amber-400' : 'text-gray-600'
                          }`} />
                          <span className={`text-sm ${
                            idx === currentAction 
                              ? 'text-white font-medium' 
                              : 'text-gray-500'
                          }`}>
                            {action}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Progress Dots */}
                <div className="mt-3 flex justify-center space-x-1">
                  {actions.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentAction(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx === currentAction
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 scale-125'
                          : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                      aria-label={`Go to task ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Expertise Badges */}
            <div className="mt-4 flex flex-wrap gap-2">
              <div className="flex items-center space-x-1 px-2 py-1 bg-blue-500/10 rounded-full border border-blue-500/20">
                <BuildingLibraryIcon className="w-3 h-3 text-blue-400" />
                <span className="text-xs text-blue-300">25+ Years</span>
              </div>
              <div className="flex items-center space-x-1 px-2 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                <GlobeAltIcon className="w-3 h-3 text-emerald-400" />
                <span className="text-xs text-emerald-300">Himalayan</span>
              </div>
              <div className="flex items-center space-x-1 px-2 py-1 bg-amber-500/10 rounded-full border border-amber-500/20">
                <FireIcon className="w-3 h-3 text-amber-400" />
                <span className="text-xs text-amber-300">Luxury</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating particles for thinking state */}
      {isThinking && (
        <>
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-amber-400 to-rose-500 rounded-full animate-ping opacity-70"></div>
          <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-ping opacity-70 delay-300"></div>
        </>
      )}
      
      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        @keyframes fade-slide {
          0% { opacity: 0; transform: translateY(5px); }
          20% { opacity: 1; transform: translateY(0); }
          80% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-5px); }
        }
        .animate-fade-slide {
          animation: fade-slide 7s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}