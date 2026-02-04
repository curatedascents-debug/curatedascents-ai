"use client";

import { useState, useEffect } from "react";

interface PaymentMilestone {
  id: number;
  milestoneType: string;
  description: string;
  amount: string;
  percentage: string;
  dueDate: string;
  paidDate: string | null;
  paidAmount: string | null;
  status: string;
}

interface SupplierConfirmation {
  id: number;
  serviceName: string;
  serviceType: string;
  supplierName: string | null;
  status: string;
  confirmationNumber: string | null;
  sentAt: string | null;
  confirmedAt: string | null;
  responseNotes: string | null;
  internalNotes: string | null;
}

interface TripBriefing {
  id: number;
  briefingType: string;
  sentAt: string | null;
  createdAt: string;
}

interface BookingEvent {
  id: number;
  eventType: string;
  description: string;
  performedBy: string;
  createdAt: string;
}

interface BookingDetailModalProps {
  bookingId: number;
  onClose: () => void;
  onUpdate: () => void;
  apiBasePath?: string;
}

export default function BookingDetailModal({ bookingId, onClose, onUpdate, apiBasePath = "/api/admin" }: BookingDetailModalProps) {
  const [booking, setBooking] = useState<any>(null);
  const [quoteLineItems, setQuoteLineItems] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<PaymentMilestone[]>([]);
  const [confirmations, setConfirmations] = useState<SupplierConfirmation[]>([]);
  const [briefings, setBriefings] = useState<TripBriefing[]>([]);
  const [events, setEvents] = useState<BookingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [selectedMilestone, setSelectedMilestone] = useState<number | null>(null);
  const [operationsNotes, setOperationsNotes] = useState("");
  const [editingNotes, setEditingNotes] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [emailBanner, setEmailBanner] = useState<{ type: "sent" | "skipped"; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "payments" | "suppliers" | "briefings" | "history">("overview");
  const [showEventsExpanded, setShowEventsExpanded] = useState(false);

  useEffect(() => {
    fetchBookingDetails();
    fetchMilestones();
    fetchConfirmations();
    fetchBriefings();
    fetchEvents();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      const res = await fetch(`${apiBasePath}/bookings/${bookingId}`);
      const data = await res.json();
      setBooking(data.booking);
      setQuoteLineItems(data.quoteItems || []);
      setOperationsNotes(data.booking?.operationsNotes || "");
    } catch (error) {
      console.error("Error fetching booking:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMilestones = async () => {
    try {
      const res = await fetch(`${apiBasePath}/bookings/${bookingId}/milestones`);
      const data = await res.json();
      setMilestones(data.milestones || []);
    } catch (error) {
      console.error("Error fetching milestones:", error);
    }
  };

  const fetchConfirmations = async () => {
    try {
      const res = await fetch(`${apiBasePath}/bookings/${bookingId}/suppliers`);
      const data = await res.json();
      setConfirmations(data.confirmations || []);
    } catch (error) {
      console.error("Error fetching confirmations:", error);
    }
  };

  const fetchBriefings = async () => {
    try {
      const res = await fetch(`${apiBasePath}/bookings/${bookingId}/briefings`);
      const data = await res.json();
      setBriefings(data.briefings || []);
    } catch (error) {
      console.error("Error fetching briefings:", error);
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await fetch(`${apiBasePath}/bookings/${bookingId}/events`);
      const data = await res.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const recordMilestonePayment = async () => {
    if (!selectedMilestone) {
      alert("Please select a milestone");
      return;
    }
    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0) {
      alert("Enter a valid payment amount");
      return;
    }

    setActionLoading(true);
    setEmailBanner(null);
    try {
      const res = await fetch(`${apiBasePath}/bookings/${bookingId}/milestones/${selectedMilestone}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paidAmount: amount }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to record payment");
        return;
      }
      setEmailBanner({ type: "sent", message: "Payment recorded and receipt email sent" });
      setPaymentAmount("");
      setSelectedMilestone(null);
      await Promise.all([fetchBookingDetails(), fetchMilestones(), fetchEvents()]);
      onUpdate();
    } catch (error) {
      alert("Failed to record payment");
    } finally {
      setActionLoading(false);
    }
  };

  const sendConfirmationRequest = async (confirmationId: number) => {
    setActionLoading(true);
    try {
      const res = await fetch(`${apiBasePath}/bookings/${bookingId}/suppliers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmationId, action: "send" }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to send confirmation request");
        return;
      }
      setEmailBanner({ type: "sent", message: "Confirmation request sent to supplier" });
      await Promise.all([fetchConfirmations(), fetchEvents()]);
    } catch (error) {
      alert("Failed to send confirmation request");
    } finally {
      setActionLoading(false);
    }
  };

  const updateConfirmationStatus = async (confirmationId: number, status: string, confirmationNumber?: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`${apiBasePath}/bookings/${bookingId}/suppliers/${confirmationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, confirmationNumber }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to update confirmation");
        return;
      }
      await Promise.all([fetchBookingDetails(), fetchConfirmations(), fetchEvents()]);
      onUpdate();
    } catch (error) {
      alert("Failed to update confirmation");
    } finally {
      setActionLoading(false);
    }
  };

  const generateBriefing = async (briefingType: "7_day" | "24_hour", shouldSend: boolean) => {
    setActionLoading(true);
    try {
      const res = await fetch(`${apiBasePath}/bookings/${bookingId}/briefings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ briefingType, sendEmail: shouldSend }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to generate briefing");
        return;
      }
      const data = await res.json();
      setEmailBanner({
        type: data.emailSent ? "sent" : "skipped",
        message: data.emailSent ? "Briefing generated and sent to client" : "Briefing generated (not sent)",
      });
      await Promise.all([fetchBriefings(), fetchEvents()]);
    } catch (error) {
      alert("Failed to generate briefing");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
        <div className="bg-slate-800 rounded-lg p-8 text-slate-400">Loading...</div>
      </div>
    );
  }

  if (!booking) return null;

  const updateBookingStatus = async (newStatus: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`${apiBasePath}/bookings/${bookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to update status");
        return;
      }
      await Promise.all([fetchBookingDetails(), fetchEvents()]);
      onUpdate();
    } catch (error) {
      alert("Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  const saveOperationsNotes = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`${apiBasePath}/bookings/${bookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operationsNotes }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to save notes");
        return;
      }
      setEditingNotes(false);
      await fetchBookingDetails();
      onUpdate();
    } catch (error) {
      alert("Failed to save notes");
    } finally {
      setActionLoading(false);
    }
  };

  const bookingStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-blue-900 text-blue-300";
      case "in_progress": return "bg-purple-900 text-purple-300";
      case "completed": return "bg-green-900 text-green-300";
      case "cancelled": return "bg-red-900 text-red-300";
      default: return "bg-slate-600 text-slate-300";
    }
  };

  const paymentStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-900 text-green-300";
      case "partial": return "bg-yellow-900 text-yellow-300";
      case "overdue": return "bg-red-900 text-red-300";
      default: return "bg-slate-600 text-slate-300";
    }
  };

  const confirmationStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-900 text-green-300";
      case "sent": return "bg-blue-900 text-blue-300";
      case "declined": return "bg-red-900 text-red-300";
      default: return "bg-slate-600 text-slate-300";
    }
  };

  const formatDate = (d: string | null) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  const formatDateTime = (d: string | null) => {
    if (!d) return "-";
    return new Date(d).toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  // Calculate counts for tabs
  const pendingPayments = milestones.filter(m => m.status !== "paid").length;
  const pendingConfirmations = confirmations.filter(c => c.status !== "confirmed" && c.status !== "cancelled").length;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-700 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-emerald-400">
              {booking.bookingReference || `Booking #${booking.id}`}
            </h2>
            <p className="text-slate-400">
              {booking.quoteName || booking.destination || ""} | Quote: {booking.quoteNumber || `#${booking.quoteId}`}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">x</button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-700 px-6">
          {[
            { id: "overview", label: "Overview" },
            { id: "payments", label: "Payments", badge: pendingPayments > 0 ? pendingPayments : undefined },
            { id: "suppliers", label: "Suppliers", badge: pendingConfirmations > 0 ? pendingConfirmations : undefined },
            { id: "briefings", label: "Briefings" },
            { id: "history", label: "History" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors relative ${
                activeTab === tab.id
                  ? "border-emerald-500 text-emerald-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab.label}
              {tab.badge && (
                <span className="ml-2 px-1.5 py-0.5 text-xs bg-yellow-600 rounded-full">{tab.badge}</span>
              )}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-6">
          {/* Email status banner */}
          {emailBanner && (
            <div className={`flex items-center justify-between px-4 py-2 rounded text-sm ${
              emailBanner.type === "sent"
                ? "bg-green-900/50 text-green-300 border border-green-700"
                : "bg-yellow-900/50 text-yellow-300 border border-yellow-700"
            }`}>
              <span>{emailBanner.message}</span>
              <button onClick={() => setEmailBanner(null)} className="ml-3 hover:opacity-70">x</button>
            </div>
          )}

          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <>
              {/* Booking Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-slate-400 text-sm">Client</div>
                  <div className="font-medium">{booking.clientName || booking.clientEmail || "-"}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-sm">Destination</div>
                  <div className="font-medium">{booking.destination || "-"}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-sm">Pax</div>
                  <div className="font-medium">{booking.numberOfPax || "-"}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-sm">Status</div>
                  <div>
                    <span className={`px-2 py-1 rounded text-sm capitalize ${bookingStatusColor(booking.status || "confirmed")}`}>
                      {(booking.status || "confirmed").replace("_", " ")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Trip Dates */}
              {(booking.startDate || booking.endDate) && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-slate-400 text-sm">Start Date</div>
                    <div className="font-medium">{formatDate(booking.startDate)}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-sm">End Date</div>
                    <div className="font-medium">{formatDate(booking.endDate)}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-sm">Operations Status</div>
                    <div className="font-medium capitalize">{(booking.operationsStatus || "pending").replace("_", " ")}</div>
                  </div>
                </div>
              )}

              {/* Status Actions */}
              <div className="bg-slate-900 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-slate-300 mb-3">Booking Status</h3>
                <div className="flex flex-wrap gap-2">
                  {booking.status !== "in_progress" && booking.status !== "completed" && booking.status !== "cancelled" && (
                    <button
                      onClick={() => updateBookingStatus("in_progress")}
                      disabled={actionLoading}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 rounded text-sm transition-colors disabled:opacity-50"
                    >
                      Start Operations
                    </button>
                  )}
                  {(booking.status === "confirmed" || booking.status === "in_progress") && (
                    <button
                      onClick={() => updateBookingStatus("completed")}
                      disabled={actionLoading}
                      className="px-3 py-1.5 bg-green-600 hover:bg-green-500 rounded text-sm transition-colors disabled:opacity-50"
                    >
                      Mark Completed
                    </button>
                  )}
                  {booking.status !== "cancelled" && booking.status !== "completed" && (
                    <button
                      onClick={() => {
                        if (confirm("Are you sure you want to cancel this booking?")) {
                          updateBookingStatus("cancelled");
                        }
                      }}
                      disabled={actionLoading}
                      className="px-3 py-1.5 bg-red-800 hover:bg-red-700 rounded text-sm transition-colors disabled:opacity-50"
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-slate-900 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-slate-300 mb-3">Payment Summary</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <div className="text-slate-400 text-sm">Total</div>
                    <div className="text-xl font-bold text-emerald-400">
                      ${booking.totalAmount ? parseFloat(booking.totalAmount).toLocaleString() : "0"}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-sm">Paid</div>
                    <div className="text-xl font-bold text-green-400">
                      ${booking.paidAmount ? parseFloat(booking.paidAmount).toLocaleString() : "0"}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-sm">Balance</div>
                    <div className="text-xl font-bold text-yellow-400">
                      ${booking.balanceAmount ? parseFloat(booking.balanceAmount).toLocaleString() : "0"}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-sm">Payment Status</div>
                    <div>
                      <span className={`px-2 py-1 rounded text-sm capitalize ${paymentStatusColor(booking.paymentStatus || "pending")}`}>
                        {booking.paymentStatus || "pending"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quote Line Items */}
              {quoteLineItems.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-300 mb-3">Quote Line Items</h3>
                  <div className="bg-slate-900 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-700">
                        <tr>
                          <th className="text-left p-3">Service</th>
                          <th className="text-left p-3">Type</th>
                          <th className="text-left p-3">Qty</th>
                          <th className="text-left p-3">Sell Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {quoteLineItems.map((item) => (
                          <tr key={item.id} className="border-t border-slate-700">
                            <td className="p-3">{item.serviceName || item.description || "-"}</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 bg-slate-600 rounded text-xs capitalize">
                                {item.serviceType?.replace("_", " ")}
                              </span>
                            </td>
                            <td className="p-3">{item.quantity || 1}</td>
                            <td className="p-3 text-emerald-400">${item.sellPrice || "0"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Operations Notes */}
              <div className="bg-slate-900 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-slate-300">Operations Notes</h3>
                  {!editingNotes && (
                    <button
                      onClick={() => setEditingNotes(true)}
                      className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm transition-colors"
                    >
                      Edit
                    </button>
                  )}
                </div>
                {editingNotes ? (
                  <div className="space-y-3">
                    <textarea
                      value={operationsNotes}
                      onChange={(e) => setOperationsNotes(e.target.value)}
                      placeholder="Add operations notes, supplier confirmations, special requests..."
                      className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 focus:outline-none focus:border-emerald-500 min-h-[120px]"
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => {
                          setOperationsNotes(booking.operationsNotes || "");
                          setEditingNotes(false);
                        }}
                        className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-sm transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={saveOperationsNotes}
                        disabled={actionLoading}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded text-sm transition-colors disabled:opacity-50"
                      >
                        {actionLoading ? "Saving..." : "Save Notes"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 whitespace-pre-wrap">
                    {booking.operationsNotes || "No operations notes yet. Click Edit to add notes."}
                  </p>
                )}
              </div>
            </>
          )}

          {/* PAYMENTS TAB */}
          {activeTab === "payments" && (
            <>
              {/* Payment Timeline */}
              <div className="bg-slate-900 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-slate-300 mb-4">Payment Milestones</h3>
                {milestones.length === 0 ? (
                  <p className="text-slate-400 text-sm">No payment milestones found.</p>
                ) : (
                  <div className="space-y-4">
                    {milestones.map((milestone, index) => (
                      <div
                        key={milestone.id}
                        className={`flex items-center gap-4 p-4 rounded-lg border ${
                          milestone.status === "paid"
                            ? "bg-green-900/20 border-green-700"
                            : milestone.status === "overdue"
                            ? "bg-red-900/20 border-red-700"
                            : "bg-slate-800 border-slate-700"
                        }`}
                      >
                        {/* Timeline dot */}
                        <div className={`w-4 h-4 rounded-full flex-shrink-0 ${
                          milestone.status === "paid"
                            ? "bg-green-500"
                            : milestone.status === "overdue"
                            ? "bg-red-500"
                            : "bg-slate-500"
                        }`} />

                        {/* Milestone info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium capitalize">{milestone.milestoneType}</span>
                            <span className={`px-2 py-0.5 rounded text-xs ${paymentStatusColor(milestone.status)}`}>
                              {milestone.status}
                            </span>
                          </div>
                          <div className="text-sm text-slate-400">
                            {milestone.description} • Due: {formatDate(milestone.dueDate)}
                          </div>
                        </div>

                        {/* Amount */}
                        <div className="text-right">
                          <div className="font-bold text-lg">
                            ${parseFloat(milestone.amount).toLocaleString()}
                          </div>
                          {milestone.percentage && (
                            <div className="text-xs text-slate-400">{milestone.percentage}%</div>
                          )}
                          {milestone.paidAmount && (
                            <div className="text-xs text-green-400">
                              Paid: ${parseFloat(milestone.paidAmount).toLocaleString()}
                            </div>
                          )}
                        </div>

                        {/* Action */}
                        {milestone.status !== "paid" && (
                          <button
                            onClick={() => setSelectedMilestone(milestone.id)}
                            className={`px-3 py-1.5 rounded text-sm transition-colors ${
                              selectedMilestone === milestone.id
                                ? "bg-emerald-600 text-white"
                                : "bg-slate-700 hover:bg-slate-600"
                            }`}
                          >
                            {selectedMilestone === milestone.id ? "Selected" : "Pay"}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Record Payment */}
              {booking.paymentStatus !== "paid" && (
                <div className="bg-slate-900 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-slate-300 mb-3">Record Payment</h3>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <input
                        type="number"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        placeholder="Enter payment amount..."
                        className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 focus:outline-none focus:border-emerald-500"
                        step="0.01"
                        min="0"
                      />
                    </div>
                    <button
                      onClick={recordMilestonePayment}
                      disabled={actionLoading || !paymentAmount || !selectedMilestone}
                      className="px-6 py-2 bg-green-600 hover:bg-green-500 rounded transition-colors disabled:opacity-50"
                    >
                      {actionLoading ? "Processing..." : "Record Payment"}
                    </button>
                  </div>
                  {!selectedMilestone && (
                    <p className="text-sm text-yellow-400 mt-2">Select a milestone above to record payment</p>
                  )}
                </div>
              )}
            </>
          )}

          {/* SUPPLIERS TAB */}
          {activeTab === "suppliers" && (
            <div className="bg-slate-900 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-slate-300 mb-4">Supplier Confirmations</h3>
              {confirmations.length === 0 ? (
                <p className="text-slate-400 text-sm">No supplier confirmation requests found.</p>
              ) : (
                <div className="space-y-3">
                  {confirmations.map((conf) => (
                    <div
                      key={conf.id}
                      className={`p-4 rounded-lg border ${
                        conf.status === "confirmed"
                          ? "bg-green-900/20 border-green-700"
                          : conf.status === "declined"
                          ? "bg-red-900/20 border-red-700"
                          : "bg-slate-800 border-slate-700"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{conf.serviceName}</span>
                            <span className={`px-2 py-0.5 rounded text-xs ${confirmationStatusColor(conf.status)}`}>
                              {conf.status}
                            </span>
                          </div>
                          <div className="text-sm text-slate-400 mt-1">
                            <span className="capitalize">{conf.serviceType.replace("_", " ")}</span>
                            {conf.supplierName && <span> • {conf.supplierName}</span>}
                          </div>
                          {conf.confirmationNumber && (
                            <div className="text-sm text-emerald-400 mt-1">
                              Confirmation #: {conf.confirmationNumber}
                            </div>
                          )}
                          {conf.sentAt && (
                            <div className="text-xs text-slate-500 mt-1">
                              Sent: {formatDateTime(conf.sentAt)}
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          {conf.status === "pending" && (
                            <button
                              onClick={() => sendConfirmationRequest(conf.id)}
                              disabled={actionLoading}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-sm transition-colors disabled:opacity-50"
                            >
                              Send Request
                            </button>
                          )}
                          {conf.status === "sent" && (
                            <button
                              onClick={() => {
                                const confNum = prompt("Enter confirmation number (optional):");
                                updateConfirmationStatus(conf.id, "confirmed", confNum || undefined);
                              }}
                              disabled={actionLoading}
                              className="px-3 py-1.5 bg-green-600 hover:bg-green-500 rounded text-sm transition-colors disabled:opacity-50"
                            >
                              Mark Confirmed
                            </button>
                          )}
                          {(conf.status === "pending" || conf.status === "sent") && (
                            <button
                              onClick={() => updateConfirmationStatus(conf.id, "declined")}
                              disabled={actionLoading}
                              className="px-3 py-1.5 bg-red-800 hover:bg-red-700 rounded text-sm transition-colors disabled:opacity-50"
                            >
                              Declined
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* BRIEFINGS TAB */}
          {activeTab === "briefings" && (
            <>
              <div className="bg-slate-900 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-slate-300 mb-4">Trip Briefings</h3>

                {/* Generate Briefing Buttons */}
                <div className="flex gap-3 mb-4">
                  <button
                    onClick={() => generateBriefing("7_day", true)}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm transition-colors disabled:opacity-50"
                  >
                    Generate & Send 7-Day Briefing
                  </button>
                  <button
                    onClick={() => generateBriefing("24_hour", true)}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded text-sm transition-colors disabled:opacity-50"
                  >
                    Generate & Send 24-Hour Briefing
                  </button>
                </div>

                {/* Existing Briefings */}
                {briefings.length === 0 ? (
                  <p className="text-slate-400 text-sm">No briefings generated yet.</p>
                ) : (
                  <div className="space-y-3">
                    {briefings.map((briefing) => (
                      <div
                        key={briefing.id}
                        className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700"
                      >
                        <div>
                          <div className="font-medium capitalize">
                            {briefing.briefingType === "7_day" ? "7-Day Briefing" : "24-Hour Briefing"}
                          </div>
                          <div className="text-sm text-slate-400">
                            Created: {formatDateTime(briefing.createdAt)}
                          </div>
                        </div>
                        <div className="text-right">
                          {briefing.sentAt ? (
                            <span className="px-2 py-1 bg-green-900 text-green-300 rounded text-xs">
                              Sent: {formatDateTime(briefing.sentAt)}
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-slate-600 text-slate-300 rounded text-xs">
                              Not sent
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* HISTORY TAB */}
          {activeTab === "history" && (
            <div className="bg-slate-900 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-slate-300 mb-4">Event History</h3>
              {events.length === 0 ? (
                <p className="text-slate-400 text-sm">No events recorded yet.</p>
              ) : (
                <div className="space-y-2">
                  {events.slice(0, showEventsExpanded ? undefined : 10).map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start gap-3 p-3 bg-slate-800 rounded-lg"
                    >
                      <div className="w-2 h-2 mt-2 rounded-full bg-slate-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm">{event.description}</div>
                        <div className="text-xs text-slate-500 mt-1">
                          {formatDateTime(event.createdAt)} • {event.performedBy}
                        </div>
                      </div>
                    </div>
                  ))}
                  {events.length > 10 && (
                    <button
                      onClick={() => setShowEventsExpanded(!showEventsExpanded)}
                      className="w-full py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      {showEventsExpanded ? "Show less" : `Show all ${events.length} events`}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
