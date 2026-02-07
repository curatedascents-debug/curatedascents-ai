"use client";

import ReactMarkdown from 'react-markdown';
import { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";
import CuratedAscentsLogo from "@/components/icons/CuratedAscentsLogo";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatInterfaceProps {
  isWidget?: boolean;
  initialMessage?: string;
}

export default function ChatInterface({ isWidget = false, initialMessage }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: isWidget
        ? "Hello! I'm your Expedition Architect. How can I help you plan your perfect Himalayan adventure today?"
        : "Welcome to CuratedAscents! I'm your Expedition Architect. I specialize in crafting bespoke luxury adventures across Nepal, Tibet, Bhutan, and India. Whether you're dreaming of trekking to Everest Base Camp, finding peace in a Bhutanese monastery, or tracking tigers in Ranthambore, I'm here to design your perfect journey. What kind of adventure speaks to you?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [clientEmail, setClientEmail] = useState("");
  const [clientName, setClientName] = useState("");
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);

  // ── NEW: states for the personalization save flow ────────────────────────
  const [personalizeLoading, setPersonalizeLoading] = useState(false);
  const [personalizeSuccess, setPersonalizeSuccess] = useState(false);
  // ─────────────────────────────────────────────────────────────────────────

  // ── Lead scoring integration ─────────────────────────────────────────────
  const [clientId, setClientId] = useState<number | null>(null);
  const [conversationId] = useState(() => `conv_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`);
  // ─────────────────────────────────────────────────────────────────────────

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialMessageSent = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const newMessages = [...messages, { role: "user" as const, content: text.trim() }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          clientEmail: clientEmail || undefined,
          clientName: clientName || undefined,
          clientId: clientId || undefined,
          conversationId,
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();

      setMessages([...newMessages, { role: "assistant", content: data.message }]);

      if (!clientEmail && newMessages.length >= 4) {
        setShowEmailPrompt(true);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-send initial message when provided
  useEffect(() => {
    if (initialMessage && !initialMessageSent.current) {
      initialMessageSent.current = true;
      sendMessage(initialMessage);
    }
  }, [initialMessage]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    sendMessage(userMessage);
  };

  // ── REPLACED: was just setShowEmailPrompt(false) ────────────────────────
  const handleEmailSubmit = async () => {
    if (!clientName.trim() || !clientEmail.trim()) return;

    setPersonalizeLoading(true);

    try {
      const res = await fetch("/api/personalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: clientName.trim(),
          email: clientEmail.trim(),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to save. Please try again.");
        setPersonalizeLoading(false);
        return;
      }

      // ✅ success - store clientId for lead scoring
      const data = await res.json();
      if (data.clientId) {
        setClientId(data.clientId);
      }

      setPersonalizeSuccess(true);
      setPersonalizeLoading(false);

      // close dialog after a beat so the user sees the confirmation
      setTimeout(() => {
        setShowEmailPrompt(false);
        setPersonalizeSuccess(false);
      }, 1400);

    } catch {
      setPersonalizeLoading(false);
      alert("Network error — please check your connection and try again.");
    }
  };
  // ─────────────────────────────────────────────────────────────────────────

  // Widget mode styling
  if (isWidget) {
    return (
      <div className="flex flex-col h-full bg-slate-900">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-custom">
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-800 border border-slate-700 text-slate-100"
                  }`}
                >
                  {msg.role === "user" ? (
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  ) : (
                    <div className="markdown-content text-sm">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3">
                  <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Email Prompt Modal */}
        {showEmailPrompt && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-sm w-full">
              <h3 className="text-lg font-bold text-white mb-3">
                Let's personalize your experience
              </h3>
              <p className="text-slate-300 text-sm mb-4">
                Share your details to save our conversation.
              </p>

              {personalizeSuccess ? (
                <div className="flex flex-col items-center py-4 gap-2">
                  <div className="text-3xl">✅</div>
                  <p className="text-emerald-400 font-semibold text-center text-sm">
                    Details saved!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Your name"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    disabled={personalizeLoading}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                  />
                  <input
                    type="email"
                    placeholder="Your email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    disabled={personalizeLoading}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowEmailPrompt(false)}
                      disabled={personalizeLoading}
                      className="flex-1 px-3 py-2 bg-slate-700 text-white text-sm rounded-lg hover:bg-slate-600 transition disabled:opacity-50"
                    >
                      Skip
                    </button>
                    <button
                      onClick={handleEmailSubmit}
                      disabled={personalizeLoading || !clientName.trim() || !clientEmail.trim()}
                      className="flex-1 px-3 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {personalizeLoading ? "Saving…" : "Continue"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-slate-700 bg-slate-800 px-4 py-3">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Full-page mode (original layout)
  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <CuratedAscentsLogo className="text-emerald-400" size={32} />
          <div>
            <h1 className="text-2xl font-bold text-white">CuratedAscents</h1>
            <p className="text-sm text-slate-400">Luxury Adventure Travel</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="max-w-4xl mx-auto space-y-6" style={{ paddingLeft: 0, paddingRight: 0 }}>
      {messages.map((msg, idx) => (
  <div
    key={idx}
    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
  >
    <div
      className="rounded-2xl shadow-lg"
      style={{
        maxWidth: '85%',
        padding: '1.5rem 2rem',
        backgroundColor: msg.role === "user" ? '#059669' : '#1e293b',
        color: '#f1f5f9',
        border: msg.role === "assistant" ? '1px solid #334155' : 'none',
        overflow: 'hidden',
        wordWrap: 'break-word',
      }}
    >
      {msg.role === "user" ? (
        <p style={{ margin: 0, padding: 0, lineHeight: 1.6 }}>{msg.content}</p>
      ) : (
        <div className="markdown-content" style={{ margin: 0, padding: 0 }}>
          <ReactMarkdown>{msg.content}</ReactMarkdown>
        </div>
      )}
    </div>
  </div>
))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl px-6 py-4">
              <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
      </div>

      {/* Email Prompt Modal */}
      {showEmailPrompt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">
              Let's personalize your experience
            </h3>
            <p className="text-slate-300 mb-6">
              Share your details so I can create a tailored itinerary and save our conversation.
            </p>

            {/* ── NEW: success state shown for ~1.4s before dialog closes ── */}
            {personalizeSuccess ? (
              <div className="flex flex-col items-center py-6 gap-3">
                <div className="text-4xl">✅</div>
                <p className="text-emerald-400 font-semibold text-center">
                  Details saved! Tailoring your experience…
                </p>
              </div>
            ) : (
              // ── original form, with the Continue button wired up ─────────
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Your name"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  disabled={personalizeLoading}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                />
                <input
                  type="email"
                  placeholder="Your email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  disabled={personalizeLoading}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowEmailPrompt(false)}
                    disabled={personalizeLoading}
                    className="flex-1 px-4 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition disabled:opacity-50"
                  >
                    Skip for now
                  </button>
                  <button
                    onClick={handleEmailSubmit}
                    disabled={personalizeLoading || !clientName.trim() || !clientEmail.trim()}
                    className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {personalizeLoading ? "Saving…" : "Continue"}
                  </button>
                </div>
              </div>
            )}
            {/* ──────────────────────────────────────────────────────────── */}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-slate-700 bg-slate-900/80 backdrop-blur-sm px-4 py-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tell me about your dream adventure..."
              disabled={isLoading}
              className="flex-1 px-6 py-4 bg-slate-800 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-6 py-4 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
