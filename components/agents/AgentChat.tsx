'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Trash2, Loader2 } from 'lucide-react';
import { cleanText, formatForDisplay, textToHtml } from '@/lib/utils/textCleaner';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface AgentChatProps {
  agentType: 'trip-planner' | 'deal-negotiator' | 'vip-concierge';
  agentName: string;
  agentDescription: string;
}

const AgentChat = ({ agentType, agentName, agentDescription }: AgentChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `Hello! I'm your ${agentName}. ${agentDescription}`,
      role: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Quick prompts based on agent type
  const quickPrompts = {
    'trip-planner': [
      'Plan a 7-day luxury trip to Japan',
      'Family vacation to Europe this summer',
      'Romantic getaway to Maldives',
      'Adventure trip to New Zealand',
    ],
    'deal-negotiator': [
      'Find best deals for flights to Paris',
      'Hotel discounts in Tokyo',
      'All-inclusive resort promotions',
      'Last-minute cruise deals',
    ],
    'vip-concierge': [
      'Arrange private jet service',
      'Book Michelin star restaurant',
      'VIP event access in London',
      'Personal shopper in Milan',
    ],
  };

  // Format message text with proper cleaning and HTML
  const formatMessageText = (text: string): string => {
    if (!text) return '';
    
    // Clean and format the text
    const cleaned = cleanText(text);
    const formatted = formatForDisplay(cleaned);
    
    // Convert to HTML with proper structure
    return textToHtml(formatted);
  };

  // Handle sending a message
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/agents/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          agentType,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response || data.message || 'No response received',
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle quick prompt click
  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
  };

  // Clear chat history
  const handleClearChat = () => {
    setMessages([
      {
        id: '1',
        content: `Hello! I'm your ${agentName}. ${agentDescription}`,
        role: 'assistant',
        timestamp: new Date(),
      },
    ]);
  };

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-xl overflow-hidden">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{agentName}</h2>
            <p className="text-blue-100 mt-1">{agentDescription}</p>
          </div>
          <button
            onClick={handleClearChat}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
            title="Clear chat history"
          >
            <Trash2 size={18} />
            <span className="hidden sm:inline">Clear Chat</span>
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] lg:max-w-[75%] rounded-2xl p-5 ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-br-none'
                  : 'bg-white border border-gray-200 shadow-sm rounded-bl-none'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-full ${message.role === 'user' ? 'bg-blue-400' : 'bg-indigo-100'}`}>
                  {message.role === 'user' ? (
                    <User size={18} className={message.role === 'user' ? 'text-white' : 'text-indigo-600'} />
                  ) : (
                    <Bot size={18} className={message.role === 'user' ? 'text-white' : 'text-indigo-600'} />
                  )}
                </div>
                <div>
                  <span className="font-semibold">
                    {message.role === 'user' ? 'You' : agentName}
                  </span>
                  <span className="text-sm opacity-75 ml-3">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
              
              {/* Message Content with Proper Formatting */}
              <div 
                className={`message-content ${message.role === 'user' ? 'text-white' : 'text-gray-800'}`}
                dangerouslySetInnerHTML={{ 
                  __html: message.role === 'assistant' 
                    ? formatMessageText(message.content)
                    : `<p>${cleanText(message.content)}</p>`
                }}
              />
            </div>
          </div>
        ))}
        
        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[85%] lg:max-w-[75%] rounded-2xl p-5 bg-white border border-gray-200 shadow-sm rounded-bl-none">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-indigo-100">
                  <Bot size={18} className="text-indigo-600" />
                </div>
                <div className="flex items-center gap-2">
                  <Loader2 size={20} className="animate-spin text-indigo-600" />
                  <span className="text-gray-600">{agentName} is thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="mb-3">
          <p className="text-sm font-medium text-gray-600 mb-2">Quick Prompts:</p>
          <div className="flex flex-wrap gap-2">
            {quickPrompts[agentType].map((prompt, index) => (
              <button
                key={index}
                onClick={() => handleQuickPrompt(prompt)}
                className="text-sm bg-white hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-full border border-gray-300 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-6 bg-white">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={`Ask ${agentName} anything...`}
              className="w-full p-4 pr-12 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              rows={3}
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-4 bottom-4 p-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-full hover:from-blue-700 hover:to-indigo-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Send size={20} />
              )}
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3 text-center">
          Press Enter to send • Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

export default AgentChat;
