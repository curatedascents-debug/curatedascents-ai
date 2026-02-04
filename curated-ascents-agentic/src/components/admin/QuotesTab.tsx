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

interface QuotesTabProps {
  apiBasePath?: string;
}

export default function QuotesTab({ apiBasePath = "/api/admin" }: QuotesTabProps) {
  const [allQuotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [showAddQuote, setShowAddQuote] = useState(false);

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
    </>
  );
}
