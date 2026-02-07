"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MapPin, Calendar, ChevronRight } from "lucide-react";

interface Booking {
  id: number;
  reference: string;
  destination: string;
  startDate: string | null;
  endDate: string | null;
  status: string;
  totalSellPrice: string | null;
  paidAmount: number;
  totalAmount: number;
}

const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-emerald-600/20 text-emerald-400",
  pending: "bg-amber-600/20 text-amber-400",
  in_progress: "bg-blue-600/20 text-blue-400",
  completed: "bg-slate-600/20 text-slate-400",
  cancelled: "bg-red-600/20 text-red-400",
};

export default function TripsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/portal/bookings")
      .then((res) => res.json())
      .then((data) => setBookings(data.bookings || []))
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

  if (bookings.length === 0) {
    return (
      <div className="p-4 text-center py-16">
        <MapPin className="w-10 h-10 text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400 mb-4">No trips yet</p>
        <button
          onClick={() => router.push("/portal/chat")}
          className="px-6 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-500 transition"
        >
          Plan Your First Trip
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      <h2 className="text-white font-bold text-lg px-1">Your Trips</h2>
      {bookings.map((booking) => (
        <button
          key={booking.id}
          onClick={() => router.push(`/portal/trips/${booking.id}`)}
          className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 text-left hover:border-emerald-600/30 transition"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-slate-500 text-xs font-mono">{booking.reference}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[booking.status] || STATUS_COLORS.pending}`}>
                  {booking.status.replace(/_/g, " ")}
                </span>
              </div>
              <h3 className="text-white font-semibold truncate">{booking.destination || "Trip"}</h3>
              {booking.startDate && (
                <div className="flex items-center gap-1 mt-1 text-slate-400 text-xs">
                  <Calendar className="w-3 h-3" />
                  <span>{booking.startDate}{booking.endDate ? ` - ${booking.endDate}` : ""}</span>
                </div>
              )}
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 mt-1 flex-shrink-0" />
          </div>
          {booking.totalAmount > 0 && (
            <div className="mt-3 bg-slate-900/50 rounded-lg p-2 flex items-center justify-between">
              <span className="text-slate-400 text-xs">Payment</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${Math.min(100, (booking.paidAmount / booking.totalAmount) * 100)}%` }}
                  />
                </div>
                <span className="text-slate-300 text-xs">{Math.round((booking.paidAmount / booking.totalAmount) * 100)}%</span>
              </div>
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
