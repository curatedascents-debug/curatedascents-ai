"use client";

import { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon, SparklesIcon, UserCircleIcon, ChatBubbleLeftRightIcon, ClockIcon } from '@heroicons/react/24/outline';
import { AgentMemory } from '@/lib/agents/memory';

// Define types for our chat messages
interface ChatMessage {
  id: string;
  role: 'user' | 'agent' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    thinking?: string;
    suggestions?: string[];
    actions?: string[];
  };
}

// Agent capabilities for different modes
const AGENT_CAPABILITIES = {
  planner: [
    "Real-time availability checks for luxury properties",
    "Weather-optimized itinerary planning",
    "Activity intensity balancing",
    "Local festival & event integration",
    "VIP access and exclusivity scoring"
  ],
  negotiator: [
    "Multi-vendor rate comparison",
    "Bulk booking discount identification",
    "Premium upgrade opportunities",
    "Flexible cancellation term negotiation",
    "Value-added service inclusion"
  ],
  concierge: [
    "Personalized surprise planning",
    "Dietary & preference tracking",
    "Real-time local concierge coordination",
    "Emergency contingency planning",
    "Cultural sensitivity verification"
  ]
};

interface AgentChatProps {
  agentMode?: 'planner' | 'negotiator' | 'concierge';
  initialItinerary?: string;
}

export default function AgentChat({ 
  agentMode = 'planner', 
  initialItinerary 
}: AgentChatProps) {
  // State management
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'agent',
      content: initialItinerary 
        ? `I see you've generated an itinerary! I'm your personal ${agentMode} AI agent. How can I enhance or modify this plan for you?`
        : `Hello! I'm your personal ${agentMode} AI travel agent. Tell me about your dream luxury trip - destinations, dates, interests, and budget. I'll craft something extraordinary for you.`,
      timestamp: new Date(),
      metadata: {
        suggestions: [
          "What's your travel budget range?",
          "Any specific destinations in mind?",
          "Preferred travel dates?",
          "Special interests (wellness, adventure, culture)?"
        ]
      }
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [agentThinking, setAgentThinking] = useState<string>('');
  const [agentMemory] = useState(() => new AgentMemory());
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize memory with any existing data
  useEffect(() => {
    if (initialItinerary) {
      agentMemory.remember('initial_itinerary', initialItinerary);
    }
    agentMemory.remember('agent_mode', agentMode);
    
    // Store agent's self-awareness
    agentMemory.remember('capabilities', AGENT_CAPABILITIES[agentMode]);
  }, [agentMode, initialItinerary, agentMemory]);

  // Simulate agent thinking process
  const simulateThinking = async (userInput: string) => {
    const thinkingSteps = [
      "Analyzing your preferences and past conversations...",
      "Checking real-time availability for luxury properties...",
      "Consulting local expert networks...",
      "Optimizing for weather and seasonal events...",
      "Securing exclusive access and VIP treatments..."
    ];
    
    for (const step of thinkingSteps) {
      setAgentThinking(step);
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
    }
    
    setAgentThinking('');
  };

  // Handle user message submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    
    // Store in memory
    await agentMemory.remember(`message_${userMessage.id}`, {
      content: input,
      context: 'user_query'
    });
    
    const userInput = input;
    setInput('');
    setIsLoading(true);

    // Show agent thinking process
    await simulateThinking(userInput);

    // Generate agent response
    try {
      // First, recall relevant context from memory
      const recentMessages = messages.slice(-5).map(m => `${m.role}: ${m.content}`).join('\n');
      const memoryContext = await agentMemory.getRelevantMemories(userInput, 3);
      
      // Call your AI API with conversational context
      const response = await fetch('/api/agents/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userInput,
          context: {
            recentMessages,
            memoryContext,
            agentMode,
            capabilities: AGENT_CAPABILITIES[agentMode]
          }
        })
      });

      const data = await response.json();
      
      // Extract agent's internal reasoning if available
      const agentReasoning = data.metadata?.reasoning || 
        `As your ${agentMode}, I'm considering ${AGENT_CAPABILITIES[agentMode][0].toLowerCase()}`;
      
      const agentMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: data.response || `I've processed your request about "${userInput}". As your ${agentMode}, I'm working on optimizing this for luxury standards.`,
        timestamp: new Date(),
        metadata: {
          thinking: agentReasoning,
          suggestions: data.suggestions || [
            "Would you like me to check specific dates?",
            "Should I focus more on wellness or adventure?",
            "Any dietary restrictions I should know about?",
            "Would you prefer boutique hotels or luxury chains?"
          ],
          actions: data.actions || []
        }
      };

      // Store agent's reasoning in memory
      await agentMemory.remember(`reasoning_${agentMessage.id}`, {
        query: userInput,
        reasoning: agentReasoning,
        response: agentMessage.content
      });

      setMessages(prev => [...prev, agentMessage]);
      
      // Auto-suggest based on conversation flow
      if (data.autoSuggest) {
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: (Date.now() + 2).toString(),
            role: 'agent',
            content: data.autoSuggest,
            timestamp: new Date(),
            metadata: { isAutoSuggestion: true }
          }]);
        }, 1000);
      }
      
    } catch (error) {
      console.error('Agent chat error:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: 'I encountered a technical issue. While I resolve that, here are some immediate suggestions based on our conversation...',
        timestamp: new Date(),
        metadata: {
          suggestions: [
            "Consider visiting during the dry season (Oct-Nov) for optimal weather",
            "Luxury lodges in the Annapurna region often book 6+ months in advance",
            "Helicopter tours provide exclusive access to remote areas",
            "Private guides can customize daily pacing to your preference"
          ]
        }
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick suggestion handler
  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  // Render thinking indicator
  const renderThinkingIndicator = () => {
    if (!agentThinking) return null;
    
    return (
      <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-100 animate-pulse">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
        <div className="text-sm text-blue-700 flex-1">
          <span className="font-medium">Agent Thinking:</span> {agentThinking}
        </div>
        <ClockIcon className="w-4 h-4 text-blue-500" />
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
      {/* Agent Header */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <ChatBubbleLeftRightIcon className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">AI Travel Agent</h3>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full capitalize">
                  {agentMode} Mode
                </span>
                <span className="text-xs text-gray-500">
                  Memory: {messages.length} exchanges
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <SparklesIcon className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-medium text-gray-700">Agent Active</span>
          </div>
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl p-4 ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-br-none'
                  : 'bg-gray-50 border border-gray-100 text-gray-800 rounded-bl-none'
              }`}
            >
              <div className="flex items-center space-x-2 mb-2">
                {message.role === 'agent' ? (
                  <>
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center">
                      <span className="text-xs font-bold text-white">AI</span>
                    </div>
                    <span className="text-sm font-medium">Travel Agent</span>
                  </>
                ) : (
                  <>
                    <UserCircleIcon className="w-6 h-6 text-blue-200" />
                    <span className="text-sm font-medium text-blue-100">You</span>
                  </>
                )}
                <span className="text-xs opacity-70">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              
              <div className="whitespace-pre-wrap">{message.content}</div>
              
              {/* Show agent reasoning if available */}
              {message.role === 'agent' && message.metadata?.thinking && (
                <div className="mt-3 p-3 bg-white/30 rounded-lg border border-white/20">
                  <div className="text-xs font-medium mb-1">Agent's Reasoning:</div>
                  <div className="text-xs opacity-90">{message.metadata.thinking}</div>
                </div>
              )}
              
              {/* Show suggestions if available */}
              {message.role === 'agent' && message.metadata?.suggestions && (
                <div className="mt-3 space-y-2">
                  <div className="text-xs font-medium text-gray-500">Quick suggestions:</div>
                  <div className="flex flex-wrap gap-2">
                    {message.metadata.suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="px-3 py-1.5 text-sm bg-white/90 text-gray-700 rounded-full border border-gray-200 hover:bg-white hover:border-gray-300 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Thinking Indicator */}
        {isLoading && renderThinkingIndicator()}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t bg-gray-50">
        <form onSubmit={handleSubmit} className="flex space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask your ${agentMode} agent anything about your luxury trip...`}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              disabled={isLoading}
            />
            {!input && (
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <span className="text-xs text-gray-400">Press Enter to send</span>
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={`px-5 py-3 rounded-xl font-medium transition-all flex items-center space-x-2 ${
              isLoading || !input.trim()
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600'
            }`}
          >
            <PaperAirplaneIcon className="w-5 h-5" />
            <span>Send</span>
          </button>
        </form>
        
        {/* Quick Action Prompts */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          {[
            "Add spa experiences",
            "Upgrade to helicopter tours",
            "Check availability for Dec 2026",
            "Find exclusive cultural access"
          ].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSuggestionClick(prompt)}
              className="text-sm px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}