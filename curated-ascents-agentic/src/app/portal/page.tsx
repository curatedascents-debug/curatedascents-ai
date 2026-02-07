"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, MessageCircle, DollarSign, Award, ChevronRight, Loader2 } from "lucide-react";

interface DashboardData {
  upcomingBooking: {
    id: number;
    reference: string;
    destination: string;
    startDate: string;
    daysUntil: number;
  } | null;
  recentQuotes: { id: number; quoteName: string; destination: string; status: string; totalSellPrice: string }[];
  loyalty: { tier: string; points: number } | null;
  recentPayments: { id: number; description: string; amount: string; status: string }[];
}

export default function PortalDashboard() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/portal/dashboard")
      .then((res) => res.json())
      .then(setData)
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

  return (
    <div className="p-4 space-y-4">
      {/* Upcoming Trip */}
      {data?.upcomingBooking && (
        <button
          onClick={() => router.push(`/portal/trips/${data.upcomingBooking!.id}`)}
          className="w-full bg-gradient-to-r from-emerald-600/20 to-emerald-600/5 border border-emerald-600/30 rounded-2xl p-5 text-left"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-emerald-400 text-xs font-semibold uppercase tracking-wider">Upcoming Trip</span>
            <ChevronRight className="w-4 h-4 text-emerald-400" />
          </div>
          <h3 className="text-white font-bold text-lg">{data.upcomingBooking.destination}</h3>
          <p className="text-slate-400 text-sm mt-1">
            {data.upcomingBooking.startDate} &middot; {data.upcomingBooking.daysUntil} days away
          </p>
        </button>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => router.push("/portal/chat")}
          className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col items-center gap-2 hover:border-emerald-600/50 transition"
        >
          <MessageCircle className="w-5 h-5 text-emerald-400" />
          <span className="text-slate-300 text-xs font-medium">Chat</span>
        </button>
        <button
          onClick={() => router.push("/portal/quotes")}
          className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col items-center gap-2 hover:border-emerald-600/50 transition"
        >
          <DollarSign className="w-5 h-5 text-emerald-400" />
          <span className="text-slate-300 text-xs font-medium">Quotes</span>
        </button>
        <button
          onClick={() => router.push("/portal/currency")}
          className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col items-center gap-2 hover:border-emerald-600/50 transition"
        >
          <Calendar className="w-5 h-5 text-emerald-400" />
          <span className="text-slate-300 text-xs font-medium">Currency</span>
        </button>
      </div>

      {/* Loyalty Summary */}
      {data?.loyalty && (
        <button
          onClick={() => router.push("/portal/loyalty")}
          className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-5 text-left"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Award className="w-5 h-5 text-amber-400" />
              <div>
                <p className="text-white font-semibold text-sm">{data.loyalty.tier} Member</p>
                <p className="text-slate-400 text-xs">{data.loyalty.points.toLocaleString()} points</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </div>
        </button>
      )}

      {/* Recent Quotes */}
      {data?.recentQuotes && data.recentQuotes.length > 0 && (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-700">
            <h3 className="text-white font-semibold text-sm">Recent Quotes</h3>
          </div>
          {data.recentQuotes.map((quote) => (
            <button
              key={quote.id}
              onClick={() => router.push(`/portal/quotes/${quote.id}`)}
              className="w-full px-5 py-3 flex items-center justify-between hover:bg-slate-700/50 transition border-b border-slate-700/50 last:border-0"
            >
              <div>
                <p className="text-white text-sm font-medium">{quote.quoteName || quote.destination}</p>
                <p className="text-slate-400 text-xs">${parseFloat(quote.totalSellPrice || "0").toLocaleString()}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                quote.status === "accepted" ? "bg-emerald-600/20 text-emerald-400" :
                quote.status === "sent" ? "bg-blue-600/20 text-blue-400" :
                "bg-slate-600/20 text-slate-400"
              }`}>
                {quote.status}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Recent Payments */}
      {data?.recentPayments && data.recentPayments.length > 0 && (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-700">
            <h3 className="text-white font-semibold text-sm">Recent Payments</h3>
          </div>
          {data.recentPayments.map((payment) => (
            <div
              key={payment.id}
              className="px-5 py-3 flex items-center justify-between border-b border-slate-700/50 last:border-0"
            >
              <p className="text-slate-300 text-sm">{payment.description}</p>
              <div className="text-right">
                <p className="text-white text-sm font-medium">${parseFloat(payment.amount).toLocaleString()}</p>
                <p className={`text-xs ${payment.status === "paid" ? "text-emerald-400" : "text-amber-400"}`}>
                  {payment.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!data?.upcomingBooking && (!data?.recentQuotes || data.recentQuotes.length === 0) && (
        <div className="text-center py-12">
          <p className="text-slate-400 mb-4">Start planning your next adventure</p>
          <button
            onClick={() => router.push("/portal/chat")}
            className="px-6 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-500 transition"
          >
            Chat with Expedition Architect
          </button>
        </div>
      )}
    </div>
  );
}
