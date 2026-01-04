'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { PaperAirplaneIcon, ArrowPathIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { ChatBubbleLeftRightIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import AgentStatus from './AgentStatus';
import { formatTextForHTML, extractBudgetTier } from '@/lib/utils/textCleaner';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface AgentChatProps {
  agentType: 'planner' | 'negotiator' | 'concierge';
  agentDescription: string;
  initialMessage?: string;
}

export default function AgentChat({
  agentType,
  agentDescription,
  initialMessage = "Hello! I'm your luxury travel assistant. How can I help you plan your extraordinary Himalayan journey today?"
}: AgentChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: initialMessage,
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [budgetTier, setBudgetTier] = useState<'Ultra-Luxury' | 'Luxury' | 'Premium' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Initialize session
  useEffect(() => {
    const storedSessionId = localStorage.getItem(`curatedascents_${agentType}_session`);
    const storedMessages = localStorage.getItem(`curatedascents_${agentType}_messages`);

    if (storedSessionId) {
      setSessionId(storedSessionId);
      if (storedMessages) {
        try {
          const parsedMessages = JSON.parse(storedMessages);
          setMessages(parsedMessages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })));
        } catch (e) {
          console.error('Error parsing stored messages:', e);
        }
      }
    } else {
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setSessionId(newSessionId);
      localStorage.setItem(`curatedascents_${agentType}_session`, newSessionId);
    }
  }, [agentType]);

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 1) {
      localStorage.setItem(`curatedascents_${agentType}_messages`, JSON.stringify(messages));

      // Extract budget tier from latest AI message
      const latestAiMessage = [...messages].reverse().find(msg => !msg.isUser);
      if (latestAiMessage) {
        const tier = extractBudgetTier(latestAiMessage.content);
        if (tier) {
          setBudgetTier(tier);
          localStorage.setItem(`curatedascents_${agentType}_budget`, tier);
        }
      }
    }
  }, [messages, agentType]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      content: userMessage,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/agents/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          sessionId,
          agentType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      // Add AI response
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMsg]);

    } catch (err) {
      console.error('Error sending message:', err);
      setError('Unable to connect to AI service. Please try again.');

      // Add error message
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        content: "I apologize for the technical difficulty. Please try your message again, or contact our luxury concierge team directly for immediate assistance.",
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([{
      id: '1',
      content: initialMessage,
      isUser: false,
      timestamp: new Date(),
    }]);
    setBudgetTier(null);
    localStorage.removeItem(`curatedascents_${agentType}_messages`);
    localStorage.removeItem(`curatedascents_${agentType}_budget`);
    setError(null);
  };

  const handleExportItinerary = () => {
    const aiMessages = messages.filter(msg => !msg.isUser).map(msg => msg.content).join('\n\n');
    const blob = new Blob([aiMessages], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `curatedascents-${agentType}-itinerary-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const MessageDisplay = ({ content, isUser }: { content: string; isUser: boolean }) => {
    if (isUser) {
      return (
        <div className="flex justify-end mb-4">
          <div className="flex items-end space-x-2 max-w-[80%]">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-2xl rounded-tr-none">
              <p className="whitespace-pre-wrap">{content}</p>
            </div>
            <UserCircleIcon className="h-8 w-8 text-gray-400 flex-shrink-0" />
          </div>
        </div>
      );
    }

    return (
      <div className="flex justify-start mb-4">
        <div className="flex items-start space-x-2 max-w-[80%]">
          <div className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-200">
            <div
              className="prose prose-sm max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: formatTextForHTML(content) }}
            />
          </div>
          <ChatBubbleLeftRightIcon className="h-8 w-8 text-blue-400 flex-shrink-0 mt-1" />
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-50 to-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-4 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold capitalize">{agentType} Agent</h2>
            <p className="text-gray-300 text-sm">{agentDescription}</p>
          </div>
          <div className="flex items-center space-x-3">
            {budgetTier && (
              <div className="bg-gradient-to-r from-amber-600 to-amber-700 px-3 py-1 rounded-full text-xs font-semibold">
                {budgetTier} Tier
              </div>
            )}
            <button
              onClick={handleClearChat}
              className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-lg text-sm transition-colors"
            >
              Clear Chat
            </button>
          </div>
        </div>
      </div>

      {/* Chat Messages Container */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-2"
        style={{ maxHeight: '500px' }}
      >
        {messages.map((message) => (
          <MessageDisplay
            key={message.id}
            content={message.content}
            isUser={message.isUser}
          />
        ))}

        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="flex items-start space-x-2 max-w-[80%]">
              <div className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-200">
                <AgentStatus agentType={agentType} />
              </div>
              <ChatBubbleLeftRightIcon className="h-8 w-8 text-blue-400 flex-shrink-0 mt-1" />
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex space-x-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={`Ask the ${agentType} about luxury travel...`}
            className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={2}
            disabled={isLoading}
          />
          <div className="flex flex-col space-y-2">
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
            >
              {isLoading ? (
                <ArrowPathIcon className="h-5 w-5 animate-spin" />
              ) : (
                <PaperAirplaneIcon className="h-5 w-5" />
              )}
            </button>

            {messages.length > 1 && (
              <button
                onClick={handleExportItinerary}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-3 rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all text-sm"
              >
                Export
              </button>
            )}
          </div>
        </div>

        {/* Tips */}
        <div className="mt-3 text-xs text-gray-500">
          <p>Try: &quot;Plan a 7-day luxury Everest Base Camp trip&quot; or &quot;Get VIP access to Kathmandu palaces&quot;</p>
        </div>
      </div>
    </div>
  );
}