"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, FileText, ChevronRight } from "lucide-react";

interface Quote {
  id: number;
  quoteNumber: string;
  quoteName: string | null;
  destination: string | null;
  totalSellPrice: string | null;
  status: string;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  accepted: "bg-emerald-600/20 text-emerald-400",
  sent: "bg-blue-600/20 text-blue-400",
  draft: "bg-slate-600/20 text-slate-400",
  expired: "bg-red-600/20 text-red-400",
};

export default function QuotesPage() {
  const router = useRouter();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/portal/quotes")
      .then((res) => res.json())
      .then((data) => setQuotes(data.quotes || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
      </div>
    );
  }

  if (quotes.length === 0) {
    return (
      <div className="p-4 text-center py-16">
        <FileText className="w-10 h-10 text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400 mb-4">No quotes yet</p>
        <button
          onClick={() => router.push("/portal/chat")}
          className="px-6 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-500 transition"
        >
          Request a Quote
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      <h2 className="text-white font-bold text-lg px-1">Your Quotes</h2>
      {quotes.map((quote) => (
        <button
          key={quote.id}
          onClick={() => router.push(`/portal/quotes/${quote.id}`)}
          className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 text-left hover:border-emerald-600/30 transition"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-slate-500 text-xs font-mono">{quote.quoteNumber}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[quote.status] || STATUS_COLORS.draft}`}>
                  {quote.status}
                </span>
              </div>
              <h3 className="text-white font-semibold truncate">{quote.quoteName || quote.destination || "Quote"}</h3>
              {quote.totalSellPrice && (
                <p className="text-emerald-400 text-sm font-medium mt-1">
                  ${parseFloat(quote.totalSellPrice).toLocaleString()}
                </p>
              )}
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 mt-1 flex-shrink-0" />
          </div>
        </button>
      ))}
    </div>
  );
}
