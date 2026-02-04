"use client";

import { useState, useEffect } from "react";

interface ClientModalProps {
  client: any | null;
  isNew: boolean;
  onClose: () => void;
  onSave: () => void;
  apiBasePath?: string;
}

export default function ClientModal({ client, isNew, onClose, onSave, apiBasePath = "/api/admin" }: ClientModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
    source: "admin",
    isActive: true,
  });
  const [linkedQuotes, setLinkedQuotes] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (client && !isNew) {
      setFormData({
        name: client.name || "",
        email: client.email || "",
        phone: client.phone || "",
        country: client.country || "",
        source: client.source || "admin",
        isActive: client.isActive ?? true,
      });
      fetchClientDetails(client.id);
    }
  }, [client, isNew]);

  const fetchClientDetails = async (id: number) => {
    try {
      const res = await fetch(`${apiBasePath}/clients/${id}`);
      const data = await res.json();
      if (data.quotes) setLinkedQuotes(data.quotes);
    } catch (err) {
      console.error("Error fetching client details:", err);
    }
  };

  const handleSave = async () => {
    if (!formData.email) {
      setError("Email is required");
      return;
    }
    setSaving(true);
    setError("");

    try {
      const url = isNew ? `${apiBasePath}/clients` : `${apiBasePath}/clients/${client.id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.details || data.error || "Failed to save");
      }

      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save client");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this client? This cannot be undone.")) {
      return;
    }
    setDeleting(true);
    setError("");

    try {
      const res = await fetch(`${apiBasePath}/clients/${client.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete");
      }

      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete client");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-emerald-400">
            {isNew ? "Add Client" : `Client: ${client?.name || client?.email}`}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">
            x
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-900/50 border border-red-700 rounded p-3 text-red-300 text-sm">{error}</div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Country</label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => handleChange("country", e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Source</label>
              <select
                value={formData.source}
                onChange={(e) => handleChange("source", e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2"
              >
                <option value="admin">Admin</option>
                <option value="chat">Chat</option>
                <option value="referral">Referral</option>
                <option value="website">Website</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleChange("isActive", e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-slate-400">Active</span>
              </label>
            </div>
          </div>

          {/* Linked Quotes */}
          {!isNew && linkedQuotes.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-slate-300 mb-3">Linked Quotes</h3>
              <div className="bg-slate-900 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-700">
                    <tr>
                      <th className="text-left p-3">Quote #</th>
                      <th className="text-left p-3">Name</th>
                      <th className="text-left p-3">Total</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {linkedQuotes.map((q) => (
                      <tr key={q.id} className="border-t border-slate-700">
                        <td className="p-3 text-emerald-400">{q.quoteNumber || `#${q.id}`}</td>
                        <td className="p-3">{q.quoteName || q.destination || "-"}</td>
                        <td className="p-3">${q.totalSellPrice || "0"}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            q.status === "accepted" ? "bg-green-900 text-green-300" :
                            q.status === "sent" ? "bg-blue-900 text-blue-300" :
                            q.status === "expired" ? "bg-red-900 text-red-300" :
                            "bg-slate-600 text-slate-300"
                          }`}>
                            {q.status || "draft"}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400">
                          {q.createdAt ? new Date(q.createdAt).toLocaleDateString() : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Conversation History */}
          {!isNew && client?.conversationHistory && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-slate-300 mb-3">Conversation History</h3>
              <div className="bg-slate-900 rounded-lg p-4 max-h-60 overflow-y-auto">
                {Array.isArray(client.conversationHistory) ? (
                  client.conversationHistory.map((msg: any, i: number) => (
                    <div key={i} className="mb-2 text-sm">
                      <span className={`font-medium ${msg.role === "user" ? "text-blue-400" : "text-emerald-400"}`}>
                        {msg.role === "user" ? "Client" : "AI"}:
                      </span>{" "}
                      <span className="text-slate-300">{msg.content?.substring(0, 200)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-sm">No conversation history</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-700 flex justify-between">
          <div>
            {!isNew && (
              <button
                onClick={handleDelete}
                disabled={deleting || linkedQuotes.length > 0}
                title={linkedQuotes.length > 0 ? "Cannot delete client with linked quotes" : "Delete client"}
                className="px-4 py-2 bg-red-800 hover:bg-red-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : isNew ? "Create Client" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
