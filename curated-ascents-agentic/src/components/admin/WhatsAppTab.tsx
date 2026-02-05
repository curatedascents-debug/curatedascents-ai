"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Users, FileText, Send, Link2, ExternalLink, Clock, CheckCircle } from "lucide-react";

interface Conversation {
  id: number;
  phoneNumber: string;
  displayName: string | null;
  clientId: number | null;
  clientName: string | null;
  clientEmail: string | null;
  isSessionActive: boolean;
  messageCount: number;
  lastMessageAt: string | null;
  lastMessage: string | null;
  lastMessageDirection: string | null;
  createdAt: string;
}

interface ConversationDetail {
  id: number;
  phoneNumber: string;
  displayName: string | null;
  clientId: number | null;
  clientName: string | null;
  clientEmail: string | null;
  messageCount: number;
  isSessionActive: boolean;
  lastMessageAt: string | null;
  session: {
    isActive: boolean;
    remainingTime: string;
    requiresTemplate: boolean;
  };
}

interface Message {
  id: number;
  direction: string;
  messageType: string;
  content: string | null;
  status: string;
  createdAt: string | null;
}

interface Template {
  id: number;
  templateName: string;
  templateId: string | null;
  category: string;
  language: string;
  bodyText: string;
  footerText: string | null;
  variableCount: number;
  status: string;
  usageCount: number;
  description: string | null;
  createdAt: string;
}

interface Client {
  id: number;
  email: string;
  name: string | null;
  phone: string | null;
}

export default function WhatsAppTab() {
  const [activeSubTab, setActiveSubTab] = useState<"conversations" | "templates" | "analytics">("conversations");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<ConversationDetail | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkingConversationId, setLinkingConversationId] = useState<number | null>(null);
  const [clientSearch, setClientSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Client[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState<"all" | "unlinked" | "active">("all");

  useEffect(() => {
    if (activeSubTab === "conversations") fetchConversations();
    if (activeSubTab === "templates") fetchTemplates();
  }, [activeSubTab, filter]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/whatsapp/conversations?filter=${filter}`);
      const data = await res.json();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/whatsapp/templates");
      const data = await res.json();
      setTemplates(data.templates || []);
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const openConversation = async (conversationId: number) => {
    try {
      const res = await fetch(`/api/admin/whatsapp/conversations/${conversationId}`);
      const data = await res.json();
      setSelectedConversation(data.conversation);
      setMessages(data.messages || []);
    } catch (error) {
      console.error("Error fetching conversation:", error);
    }
  };

  const searchClients = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await fetch(`/api/admin/clients?search=${encodeURIComponent(query)}&limit=5`);
      const data = await res.json();
      setSearchResults(data.clients || []);
    } catch (error) {
      console.error("Error searching clients:", error);
    }
  };

  const linkToClient = async (conversationId: number, clientId: number) => {
    try {
      await fetch("/api/admin/whatsapp/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, clientId, action: "link" }),
      });
      setShowLinkModal(false);
      setLinkingConversationId(null);
      fetchConversations();
      if (selectedConversation?.id === conversationId) {
        openConversation(conversationId);
      }
    } catch (error) {
      console.error("Error linking client:", error);
    }
  };

  const sendMessage = async () => {
    if (!selectedConversation || !newMessage.trim()) return;
    setSending(true);
    try {
      await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          message: newMessage,
        }),
      });
      setNewMessage("");
      openConversation(selectedConversation.id);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const formatPhoneNumber = (phone: string) => {
    if (phone.length > 10) {
      return `+${phone.slice(0, -10)} ${phone.slice(-10, -7)} ${phone.slice(-7, -4)} ${phone.slice(-4)}`;
    }
    return phone;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      sent: "text-yellow-400",
      delivered: "text-blue-400",
      read: "text-green-400",
      failed: "text-red-400",
    };
    return colors[status] || "text-slate-400";
  };

  const getTemplateStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: "bg-slate-500/20 text-slate-400",
      pending: "bg-yellow-500/20 text-yellow-400",
      approved: "bg-green-500/20 text-green-400",
      rejected: "bg-red-500/20 text-red-400",
    };
    return colors[status] || "bg-slate-500/20 text-slate-400";
  };

  // Stats for analytics
  const stats = {
    totalConversations: conversations.length,
    activeConversations: conversations.filter((c) => c.isSessionActive).length,
    linkedClients: conversations.filter((c) => c.clientId).length,
    totalMessages: conversations.reduce((sum, c) => sum + c.messageCount, 0),
  };

  return (
    <div>
      {/* Sub-tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-700 pb-4">
        {[
          { key: "conversations", label: "Conversations", icon: MessageSquare },
          { key: "templates", label: "Templates", icon: FileText },
          { key: "analytics", label: "Analytics", icon: Users },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveSubTab(tab.key as typeof activeSubTab)}
            className={`px-4 py-2 rounded-t text-sm transition-colors flex items-center gap-2 ${
              activeSubTab === tab.key
                ? "bg-emerald-600 text-white"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Conversations Tab */}
      {activeSubTab === "conversations" && (
        <div className="flex gap-4">
          {/* Conversation List */}
          <div className="w-1/3">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">WhatsApp Conversations</h3>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as typeof filter)}
                className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-white"
              >
                <option value="all">All</option>
                <option value="active">Active Sessions</option>
                <option value="unlinked">Unlinked</option>
              </select>
            </div>

            {loading ? (
              <div className="text-center py-8 text-slate-400">Loading...</div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                No WhatsApp conversations yet
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => openConversation(conv.id)}
                    className={`bg-slate-800 border rounded-lg p-3 cursor-pointer transition-colors ${
                      selectedConversation?.id === conv.id
                        ? "border-emerald-500"
                        : "border-slate-700 hover:border-slate-600"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <span className="font-semibold text-white">
                          {conv.displayName || formatPhoneNumber(conv.phoneNumber)}
                        </span>
                        {conv.isSessionActive && (
                          <span className="ml-2 text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">
                            Active
                          </span>
                        )}
                      </div>
                      {!conv.clientId && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setLinkingConversationId(conv.id);
                            setShowLinkModal(true);
                          }}
                          className="text-xs text-emerald-400 hover:text-emerald-300"
                        >
                          <Link2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    {conv.clientName && (
                      <div className="text-xs text-emerald-400 mb-1">
                        Linked: {conv.clientName}
                      </div>
                    )}
                    {conv.lastMessage && (
                      <div className="text-sm text-slate-400 truncate">
                        {conv.lastMessageDirection === "inbound" ? "← " : "→ "}
                        {conv.lastMessage}
                      </div>
                    )}
                    <div className="text-xs text-slate-500 mt-1">
                      {conv.messageCount} messages · {conv.lastMessageAt
                        ? new Date(conv.lastMessageAt).toLocaleDateString()
                        : "No messages"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Conversation Detail */}
          <div className="w-2/3">
            {selectedConversation ? (
              <div className="bg-slate-800 border border-slate-700 rounded-lg h-[600px] flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-slate-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white">
                        {selectedConversation.displayName ||
                          formatPhoneNumber(selectedConversation.phoneNumber)}
                      </div>
                      <div className="text-sm text-slate-400">
                        {formatPhoneNumber(selectedConversation.phoneNumber)}
                      </div>
                    </div>
                    <div className="text-right">
                      {selectedConversation.session.isActive ? (
                        <div className="text-sm text-green-400 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          Session active ({selectedConversation.session.remainingTime})
                        </div>
                      ) : (
                        <div className="text-sm text-yellow-400 flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Template required
                        </div>
                      )}
                      {selectedConversation.clientName && (
                        <div className="text-xs text-emerald-400 mt-1">
                          Client: {selectedConversation.clientName}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.direction === "outbound" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-3 py-2 ${
                          msg.direction === "outbound"
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-700 text-white"
                        }`}
                      >
                        <div className="text-sm">{msg.content}</div>
                        <div className="text-xs mt-1 flex items-center gap-2 opacity-60">
                          {msg.createdAt &&
                            new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          {msg.direction === "outbound" && (
                            <span className={getStatusColor(msg.status)}>
                              {msg.status === "read" ? "✓✓" : msg.status === "delivered" ? "✓✓" : "✓"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-slate-700">
                  {selectedConversation.session.requiresTemplate ? (
                    <div className="text-center text-yellow-400 text-sm">
                      Session expired. Use a template message to re-engage.
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white text-sm"
                      />
                      <button
                        onClick={sendMessage}
                        disabled={sending || !newMessage.trim()}
                        className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 px-4 py-2 rounded text-white"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-slate-800 border border-slate-700 rounded-lg h-[600px] flex items-center justify-center text-slate-400">
                Select a conversation to view messages
              </div>
            )}
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeSubTab === "templates" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Message Templates</h3>
            <button className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded text-white text-sm">
              + Create Template
            </button>
          </div>

          <div className="text-sm text-slate-400 mb-4">
            Templates must be approved by Meta before they can be used for outbound messaging
            outside the 24-hour session window.
          </div>

          {loading ? (
            <div className="text-center py-8 text-slate-400">Loading...</div>
          ) : templates.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              No templates created yet. Create templates to send messages outside the 24-hour window.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="bg-slate-800 border border-slate-700 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="font-semibold text-white">{template.templateName}</span>
                      <span className={`ml-2 px-2 py-0.5 rounded text-xs ${getTemplateStatusColor(template.status)}`}>
                        {template.status}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">{template.category}</span>
                  </div>
                  <div className="bg-slate-900 rounded p-3 text-sm text-slate-300 mb-3">
                    {template.bodyText}
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>{template.variableCount} variable(s)</span>
                    <span>Used {template.usageCount} times</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Default templates info */}
          <div className="mt-6 p-4 bg-slate-800 border border-slate-700 rounded-lg">
            <h4 className="font-semibold text-white mb-2">Recommended Templates</h4>
            <ul className="text-sm text-slate-400 space-y-2">
              <li><span className="text-emerald-400">session_greeting</span> - Re-engage users after 24-hour expiry</li>
              <li><span className="text-emerald-400">quote_ready</span> - Notify when quote PDF is ready</li>
              <li><span className="text-emerald-400">booking_confirmed</span> - Booking confirmation notification</li>
              <li><span className="text-emerald-400">payment_reminder</span> - Payment due reminder</li>
              <li><span className="text-emerald-400">trip_briefing</span> - Pre-departure briefing notification</li>
            </ul>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeSubTab === "analytics" && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">WhatsApp Analytics</h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <div className="text-xs text-slate-400 mb-1">Total Conversations</div>
              <div className="text-2xl font-bold text-white">{stats.totalConversations}</div>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <div className="text-xs text-slate-400 mb-1">Active Sessions</div>
              <div className="text-2xl font-bold text-green-400">{stats.activeConversations}</div>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <div className="text-xs text-slate-400 mb-1">Linked to Clients</div>
              <div className="text-2xl font-bold text-emerald-400">{stats.linkedClients}</div>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <div className="text-xs text-slate-400 mb-1">Total Messages</div>
              <div className="text-2xl font-bold text-blue-400">{stats.totalMessages}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-slate-300 mb-4">Link Rate</h4>
              <div className="text-center py-8">
                <div className="text-4xl font-bold text-emerald-400">
                  {stats.totalConversations > 0
                    ? Math.round((stats.linkedClients / stats.totalConversations) * 100)
                    : 0}%
                </div>
                <div className="text-sm text-slate-500 mt-2">
                  {stats.linkedClients} of {stats.totalConversations} conversations linked to clients
                </div>
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-slate-300 mb-4">Session Activity</h4>
              <div className="text-center py-8">
                <div className="text-4xl font-bold text-green-400">
                  {stats.totalConversations > 0
                    ? Math.round((stats.activeConversations / stats.totalConversations) * 100)
                    : 0}%
                </div>
                <div className="text-sm text-slate-500 mt-2">
                  {stats.activeConversations} active 24-hour sessions
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Link Client Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">Link to Client</h3>
            <div className="mb-4">
              <input
                type="text"
                value={clientSearch}
                onChange={(e) => {
                  setClientSearch(e.target.value);
                  searchClients(e.target.value);
                }}
                placeholder="Search by name, email, or phone..."
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm"
              />
            </div>
            {searchResults.length > 0 && (
              <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
                {searchResults.map((client) => (
                  <div
                    key={client.id}
                    onClick={() => linkingConversationId && linkToClient(linkingConversationId, client.id)}
                    className="bg-slate-800 border border-slate-700 rounded p-3 cursor-pointer hover:border-emerald-500"
                  >
                    <div className="text-white">{client.name || "No name"}</div>
                    <div className="text-sm text-slate-400">{client.email}</div>
                    {client.phone && (
                      <div className="text-xs text-slate-500">{client.phone}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowLinkModal(false);
                  setLinkingConversationId(null);
                  setClientSearch("");
                  setSearchResults([]);
                }}
                className="px-4 py-2 text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
