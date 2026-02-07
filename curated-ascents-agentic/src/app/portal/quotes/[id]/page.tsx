"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";

interface QuoteItem {
  id: number;
  serviceType: string;
  description: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
}

interface QuoteDetail {
  id: number;
  quoteNumber: string;
  quoteName: string | null;
  destination: string | null;
  startDate: string | null;
  endDate: string | null;
  numberOfPax: number | null;
  totalSellPrice: string;
  perPersonPrice: string | null;
  currency: string;
  status: string;
  inclusionsSummary: string | null;
  exclusionsSummary: string | null;
  items: QuoteItem[];
}

export default function QuoteDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [quote, setQuote] = useState<QuoteDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/portal/quotes/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then(setQuote)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="p-4 text-center py-16">
        <p className="text-slate-400">Quote not found</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Back */}
      <button onClick={() => router.back()} className="flex items-center gap-1 text-slate-400 hover:text-white transition text-sm">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Header */}
      <div>
        <p className="text-slate-500 text-xs font-mono">{quote.quoteNumber}</p>
        <h2 className="text-white font-bold text-xl">{quote.quoteName || quote.destination || "Quote"}</h2>
        {quote.startDate && (
          <p className="text-slate-400 text-sm mt-1">{quote.startDate}{quote.endDate ? ` - ${quote.endDate}` : ""}</p>
        )}
      </div>

      {/* Summary Card */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-slate-500 text-xs">Total Price</p>
            <p className="text-white text-lg font-bold">{quote.currency} {parseFloat(quote.totalSellPrice).toLocaleString()}</p>
          </div>
          {quote.perPersonPrice && (
            <div>
              <p className="text-slate-500 text-xs">Per Person</p>
              <p className="text-white text-lg font-bold">{quote.currency} {parseFloat(quote.perPersonPrice).toLocaleString()}</p>
            </div>
          )}
          {quote.numberOfPax && (
            <div>
              <p className="text-slate-500 text-xs">Travelers</p>
              <p className="text-white text-sm">{quote.numberOfPax}</p>
            </div>
          )}
          <div>
            <p className="text-slate-500 text-xs">Status</p>
            <p className="text-emerald-400 text-sm capitalize">{quote.status}</p>
          </div>
        </div>
      </div>

      {/* Items */}
      {quote.items.length > 0 && (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-700">
            <h3 className="text-white font-semibold text-sm">Services Included</h3>
          </div>
          {quote.items.map((item) => (
            <div key={item.id} className="px-5 py-3 flex items-center justify-between border-b border-slate-700/50 last:border-0">
              <div>
                <p className="text-slate-300 text-sm">{item.description}</p>
                <p className="text-slate-500 text-xs">{item.serviceType} &middot; Qty: {item.quantity}</p>
              </div>
              <p className="text-white text-sm font-medium">${parseFloat(item.totalPrice).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}

      {/* Inclusions / Exclusions */}
      {quote.inclusionsSummary && (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
          <h3 className="text-white font-semibold text-sm mb-2">Inclusions</h3>
          <p className="text-slate-400 text-sm whitespace-pre-line">{quote.inclusionsSummary}</p>
        </div>
      )}
      {quote.exclusionsSummary && (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
          <h3 className="text-white font-semibold text-sm mb-2">Exclusions</h3>
          <p className="text-slate-400 text-sm whitespace-pre-line">{quote.exclusionsSummary}</p>
        </div>
      )}
    </div>
  );
}
