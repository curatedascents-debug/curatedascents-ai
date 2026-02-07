"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, CheckCircle2, Circle, Clock, CreditCard } from "lucide-react";

interface Milestone {
  id: number;
  description: string;
  amount: string;
  dueDate: string | null;
  status: string;
  paidAt: string | null;
}

interface Briefing {
  id: number;
  title: string;
  content: string;
}

interface BookingDetail {
  id: number;
  reference: string;
  destination: string;
  startDate: string | null;
  endDate: string | null;
  status: string;
  totalSellPrice: string;
  quoteName: string | null;
  milestones: Milestone[];
  briefings: Briefing[];
}

const STATUS_STEPS = ["pending", "confirmed", "in_progress", "completed"];

export default function TripDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/portal/bookings/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then(setBooking)
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

  if (!booking) {
    return (
      <div className="p-4 text-center py-16">
        <p className="text-slate-400">Booking not found</p>
      </div>
    );
  }

  const currentStepIdx = STATUS_STEPS.indexOf(booking.status);

  return (
    <div className="p-4 space-y-4">
      {/* Back */}
      <button onClick={() => router.back()} className="flex items-center gap-1 text-slate-400 hover:text-white transition text-sm">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Header */}
      <div>
        <p className="text-slate-500 text-xs font-mono">{booking.reference}</p>
        <h2 className="text-white font-bold text-xl">{booking.quoteName || booking.destination || "Trip"}</h2>
        {booking.startDate && (
          <p className="text-slate-400 text-sm mt-1">{booking.startDate}{booking.endDate ? ` - ${booking.endDate}` : ""}</p>
        )}
      </div>

      {/* Status Timeline */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
        <h3 className="text-white font-semibold text-sm mb-4">Trip Status</h3>
        <div className="flex items-center justify-between">
          {STATUS_STEPS.map((step, i) => {
            const isComplete = i <= currentStepIdx;
            const isCurrent = i === currentStepIdx;
            return (
              <div key={step} className="flex flex-col items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isComplete ? "bg-emerald-600" : "bg-slate-700"
                } ${isCurrent ? "ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-800" : ""}`}>
                  {isComplete ? (
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-500" />
                  )}
                </div>
                <span className={`text-[10px] mt-1.5 capitalize ${isComplete ? "text-emerald-400" : "text-slate-500"}`}>
                  {step.replace(/_/g, " ")}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Milestones */}
      {booking.milestones.length > 0 && (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-700 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <h3 className="text-white font-semibold text-sm">Payment Schedule</h3>
          </div>
          {booking.milestones.map((m) => (
            <div key={m.id} className="px-5 py-3 flex items-center justify-between border-b border-slate-700/50 last:border-0">
              <div>
                <p className="text-slate-300 text-sm">{m.description}</p>
                {m.dueDate && <p className="text-slate-500 text-xs">Due: {m.dueDate}</p>}
              </div>
              <div className="text-right">
                <p className="text-white text-sm font-medium">${parseFloat(m.amount).toLocaleString()}</p>
                {m.status === "paid" ? (
                  <span className="text-emerald-400 text-xs flex items-center gap-1 justify-end">
                    <CheckCircle2 className="w-3 h-3" /> Paid
                  </span>
                ) : (
                  <span className="text-amber-400 text-xs flex items-center gap-1 justify-end">
                    <Clock className="w-3 h-3" /> {m.status}
                  </span>
                )}
              </div>
            </div>
          ))}
          {booking.milestones.some((m) => m.status !== "paid") && (
            <div className="px-5 py-3 border-t border-slate-700">
              <button
                onClick={() => {
                  const unpaid = booking.milestones.find((m) => m.status !== "paid");
                  if (unpaid) {
                    window.location.href = `/api/payments/checkout?milestoneId=${unpaid.id}`;
                  }
                }}
                className="w-full py-2.5 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-500 transition text-sm"
              >
                Pay Now
              </button>
            </div>
          )}
        </div>
      )}

      {/* Trip Briefing */}
      {booking.briefings.length > 0 && (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-700">
            <h3 className="text-white font-semibold text-sm">Trip Briefing</h3>
          </div>
          {booking.briefings.map((b) => (
            <div key={b.id} className="px-5 py-3 border-b border-slate-700/50 last:border-0">
              <h4 className="text-white text-sm font-medium mb-1">{b.title}</h4>
              <p className="text-slate-400 text-xs whitespace-pre-line">{b.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
