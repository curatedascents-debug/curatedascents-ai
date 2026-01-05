'use client';
import { useState, useRef, useEffect } from 'react';
import { cleanText, aggressiveClean } from '@/lib/utils/textCleaner';

function formatMessageText(text: string): string {
  if (!text) return '';
  let cleaned = cleanText(text);
  if (cleaned.includes('#') || cleaned.includes('*') || cleaned.includes('\`')) {
    cleaned = aggressiveClean(cleaned);
  }
  // Format days properly
  cleaned = cleaned.replace(/(Day \d+):/gi, '\n\n<strong>$1:</strong>\n');
  cleaned = cleaned.replace(/(Days? \d+\s*-\s*\d+):/gi, '\n\n<strong>$1:</strong>\n');
  // Convert bullets to HTML
  cleaned = cleaned.replace(/•\s*(.+)/g, '<li>$1</li>');
  // Convert line breaks
  cleaned = cleaned.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>');
  return '<p>' + cleaned + '</p>';
}

export function AgentChat({ agent }: { agent: string }) {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch('/api/agents/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, agent: agent }),
      });
      const data = await response.json();
      let aiResponse = data.response || '';
      if (aiResponse.includes('#') || aiResponse.includes('*') || aiResponse.includes('\`')) {
        aiResponse = aggressiveClean(aiResponse);
      }
      setMessages([...newMessages, { role: 'assistant', content: aiResponse }]);
    } catch (error) {
      setMessages([...newMessages, { role: 'assistant', content: 'Error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${message.role === 'user' ? 
              'bg-gradient-to-r from-blue-500 to-purple-600 text-white' : 
              'bg-white border border-gray-200'}`}>
              {message.role === 'assistant' ? (
                <div dangerouslySetInnerHTML={{ __html: formatMessageText(message.content) }} />
              ) : (
                <p className="whitespace-pre-wrap">{message.content}</p>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex space-x-2">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()} placeholder={`Ask ${agent}...`}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <button onClick={handleSend} disabled={isLoading || !input.trim()}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-semibold disabled:opacity-50">
            {isLoading ? '...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}
