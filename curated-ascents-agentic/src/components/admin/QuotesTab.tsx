"use client";

import { useState, useEffect } from "react";
import QuoteDetailModal from "./QuoteDetailModal";
import QuoteModal from "./QuoteModal";

interface Quote {
  id: number;
  quoteNumber: string | null;
  quoteName: string | null;
  destination: string | null;
  clientName: string | null;
  clientEmail: string | null;
  numberOfPax: number | null;
  totalSellPrice: string | null;
  currency: string | null;
  status: string | null;
  validUntil: string | null;
  createdAt: string;
  [key: string]: unknown;
}

interface AuditItem {
  id: number;
  serviceType: string;
  serviceName: string | null;
  rateSource: string | null;
  sellPrice: string | null;
  costPrice: string | null;
  marginPercent: string | null;
  calculationNote: string | null;
  quantity: number | null;
  [key: string]: unknown;
}

interface AuditEntry {
  id: number;
  eventType: string;
  changedBy: string | null;
  toolsUsed: Array<{ tool: string; success: boolean; timestamp: string; resultSummary?: string }> | null;
  rateSourceSummary: Record<string, number> | null;
  calculationSummary: string | null;
  createdAt: string;
}

interface AuditData {
  items: AuditItem[];
  auditEntries: AuditEntry[];
  rateSourceSummary: Record<string, number>;
  blendedMarginPercent: string | null;
}

interface QuotesTabProps {
  apiBasePath?: string;
}

const rateSourceBadge = (src: string | null) => {
  if (src === "internal_db") return { label: "DB", color: "bg-green-900 text-green-300", emoji: "🟢" };
  if (src === "external_research") return { label: "Research", color: "bg-yellow-900 text-yellow-300", emoji: "🟡" };
  return { label: "AI Est.", color: "bg-red-900 text-red-300", emoji: "🔴" };
};

function AuditModal({ quoteId, quoteNumber, onClose, apiBasePath }: {
  quoteId: number;
  quoteNumber: string | null;
  onClose: () => void;
  apiBasePath: string;
}) {
  const [data, setData] = useState<AuditData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${apiBasePath}/quotes/${quoteId}/audit`)
      .then(r => r.json())
      .then(d => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [quoteId, apiBasePath]);

  const summary = data?.rateSourceSummary || {};
  const dbCount = summary["internal_db"] || 0;
  const extCount = summary["external_research"] || 0;
  const aiCount = summary["ai_estimate"] || 0;
  const total = (data?.items || []).length;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">Quote Audit — {quoteNumber || `#${quoteId}`}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl">✕</button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading audit data...</div>
        ) : !data ? (
          <div className="p-8 text-center text-slate-400">No audit data available.</div>
        ) : (
          <div className="p-5 space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-slate-800 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-white">{total}</div>
                <div className="text-xs text-slate-400 mt-1">Total Items</div>
              </div>
              <div className="bg-green-900/30 border border-green-800 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-400">{dbCount}</div>
                <div className="text-xs text-slate-400 mt-1">🟢 Internal DB</div>
              </div>
              <div className="bg-yellow-900/30 border border-yellow-800 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-yellow-400">{extCount}</div>
                <div className="text-xs text-slate-400 mt-1">🟡 External Research</div>
              </div>
              <div className="bg-red-900/30 border border-red-800 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-red-400">{aiCount}</div>
                <div className="text-xs text-slate-400 mt-1">🔴 AI Estimate</div>
              </div>
            </div>

            {data.blendedMarginPercent && (
              <div className="bg-slate-800 rounded-lg px-4 py-3 flex items-center gap-3">
                <span className="text-slate-400 text-sm">Blended Margin:</span>
                <span className="text-emerald-400 font-bold text-lg">{data.blendedMarginPercent}%</span>
              </div>
            )}

            {/* Cost Breakdown Table */}
            <div>
              <h4 className="text-white font-medium mb-3">Cost Breakdown</h4>
              <div className="bg-slate-800 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-700">
                    <tr>
                      <th className="text-left p-3">Service</th>
                      <th className="text-left p-3">Source</th>
                      <th className="text-right p-3">Sell Price</th>
                      <th className="text-right p-3">Margin %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.items.map(item => {
                      const badge = rateSourceBadge(item.rateSource);
                      return (
                        <tr key={item.id} className="border-t border-slate-700">
                          <td className="p-3">
                            <div className="text-white">{item.serviceName || item.serviceType}</div>
                            {item.calculationNote && (
                              <div className="text-xs text-slate-500 mt-0.5">{item.calculationNote}</div>
                            )}
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-xs ${badge.color}`}>
                              {badge.emoji} {badge.label}
                            </span>
                          </td>
                          <td className="p-3 text-right text-emerald-400">
                            {item.sellPrice ? `$${parseFloat(item.sellPrice).toLocaleString()}` : "-"}
                          </td>
                          <td className="p-3 text-right text-slate-300">
                            {item.marginPercent ? `${parseFloat(item.marginPercent).toFixed(1)}%` : "-"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tool Call History */}
            {data.auditEntries.length > 0 && data.auditEntries[0].toolsUsed && (
              <div>
                <h4 className="text-white font-medium mb-3">Tool Call History</h4>
                <div className="space-y-2">
                  {data.auditEntries[0].toolsUsed.map((t, i) => (
                    <div key={i} className="flex items-center gap-3 bg-slate-800 rounded-lg px-3 py-2 text-sm">
                      <span className={t.success ? "text-green-400" : "text-red-400"}>
                        {t.success ? "✓" : "✗"}
                      </span>
                      <span className="text-white font-mono">{t.tool}</span>
                      {t.resultSummary && (
                        <span className="text-slate-400 text-xs">— {t.resultSummary}</span>
                      )}
                      <span className="ml-auto text-slate-500 text-xs">
                        {new Date(t.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Audit Log */}
            {data.auditEntries.map(entry => (
              <div key={entry.id} className="bg-slate-800 rounded-lg px-4 py-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-400">Event:</span>
                  <span className="text-white capitalize">{entry.eventType.replace(/_/g, " ")}</span>
                  <span className="text-slate-500 ml-auto">{new Date(entry.createdAt).toLocaleString()}</span>
                </div>
                {entry.calculationSummary && (
                  <div className="text-slate-300 text-sm mt-1">{entry.calculationSummary}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function QuotesTab({ apiBasePath = "/api/admin" }: QuotesTabProps) {
  const [allQuotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [showAddQuote, setShowAddQuote] = useState(false);
  const [auditQuote, setAuditQuote] = useState<Quote | null>(null);

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      const res = await fetch(`${apiBasePath}/quotes`);
      const data = await res.json();
      setQuotes(data.quotes || []);
    } catch (error) {
      console.error("Error fetching quotes:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuotes = allQuotes.filter((q) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      q.quoteNumber?.toLowerCase().includes(term) ||
      q.quoteName?.toLowerCase().includes(term) ||
      q.clientName?.toLowerCase().includes(term) ||
      q.destination?.toLowerCase().includes(term);
    const matchesStatus = filterStatus === "all" || q.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const statusColor = (status: string | null) => {
    switch (status) {
      case "accepted": return "bg-green-900 text-green-300";
      case "sent": return "bg-blue-900 text-blue-300";
      case "expired": return "bg-red-900 text-red-300";
      default: return "bg-slate-600 text-slate-300";
    }
  };

  if (loading) {
    return <div className="text-center text-slate-400 py-8">Loading quotes...</div>;
  }

  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search quotes by number, name, client, destination..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2"
        >
          <option value="all">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="accepted">Accepted</option>
          <option value="expired">Expired</option>
        </select>
        <button
          onClick={() => setShowAddQuote(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors"
        >
          + Create Quote
        </button>
      </div>

      <div className="bg-slate-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-700">
            <tr>
              <th className="text-left p-4 font-medium">Quote #</th>
              <th className="text-left p-4 font-medium">Client</th>
              <th className="text-left p-4 font-medium">Destination</th>
              <th className="text-left p-4 font-medium">Pax</th>
              <th className="text-left p-4 font-medium">Total</th>
              <th className="text-left p-4 font-medium">Status</th>
              <th className="text-left p-4 font-medium">Valid Until</th>
              <th className="text-left p-4 font-medium">Audit</th>
            </tr>
          </thead>
          <tbody>
            {filteredQuotes.map((q) => (
              <tr
                key={q.id}
                className="border-t border-slate-700 hover:bg-slate-700 cursor-pointer transition-colors"
                onClick={() => setSelectedQuote(q)}
              >
                <td className="p-4 text-emerald-400 font-medium">{q.quoteNumber || `#${q.id}`}</td>
                <td className="p-4">{q.clientName || q.clientEmail || "-"}</td>
                <td className="p-4 text-slate-300">{q.destination || "-"}</td>
                <td className="p-4 text-slate-300">{q.numberOfPax || "-"}</td>
                <td className="p-4 text-emerald-400 font-medium">
                  {q.totalSellPrice ? `$${parseFloat(q.totalSellPrice).toLocaleString()}` : "-"}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-sm capitalize ${statusColor(q.status)}`}>
                    {q.status || "draft"}
                  </span>
                </td>
                <td className="p-4 text-slate-400 text-sm">
                  {q.validUntil ? new Date(q.validUntil).toLocaleDateString() : "-"}
                </td>
                <td className="p-4" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setAuditQuote(q)}
                    className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs text-slate-300 transition-colors"
                  >
                    Audit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredQuotes.length === 0 && (
          <div className="p-8 text-center text-slate-400">
            {searchTerm || filterStatus !== "all" ? "No quotes match your search." : 'No quotes found.'}
          </div>
        )}
      </div>

      {selectedQuote && (
        <QuoteDetailModal
          quoteId={selectedQuote.id}
          onClose={() => setSelectedQuote(null)}
          onUpdate={fetchQuotes}
          apiBasePath={apiBasePath}
        />
      )}

      {showAddQuote && (
        <QuoteModal
          onClose={() => setShowAddQuote(false)}
          onSave={() => {
            setShowAddQuote(false);
            fetchQuotes();
          }}
          apiBasePath={apiBasePath}
        />
      )}

      {auditQuote && (
        <AuditModal
          quoteId={auditQuote.id}
          quoteNumber={auditQuote.quoteNumber}
          onClose={() => setAuditQuote(null)}
          apiBasePath={apiBasePath}
        />
      )}
    </>
  );
}
