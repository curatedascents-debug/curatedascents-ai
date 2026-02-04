"use client";

import { useState, useEffect } from "react";
import BookingDetailModal from "./BookingDetailModal";

interface Booking {
  id: number;
  bookingReference: string | null;
  clientName: string | null;
  clientEmail: string | null;
  destination: string | null;
  quoteName: string | null;
  status: string | null;
  paymentStatus: string | null;
  totalAmount: string | null;
  paidAmount: string | null;
  balanceAmount: string | null;
  currency: string | null;
  createdAt: string;
}

interface BookingsTabProps {
  apiBasePath?: string;
}

export default function BookingsTab({ apiBasePath = "/api/admin" }: BookingsTabProps) {
  const [allBookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPayment, setFilterPayment] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await fetch(`${apiBasePath}/bookings`);
      const data = await res.json();
      setBookings(data.bookings || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = allBookings.filter((b) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      b.bookingReference?.toLowerCase().includes(term) ||
      b.clientName?.toLowerCase().includes(term) ||
      b.destination?.toLowerCase().includes(term);
    const matchesPayment = filterPayment === "all" || b.paymentStatus === filterPayment;
    const matchesStatus = filterStatus === "all" || b.status === filterStatus;
    return matchesSearch && matchesPayment && matchesStatus;
  });

  const bookingStatusColor = (status: string | null) => {
    switch (status) {
      case "confirmed": return "bg-blue-900 text-blue-300";
      case "in_progress": return "bg-purple-900 text-purple-300";
      case "completed": return "bg-green-900 text-green-300";
      case "cancelled": return "bg-red-900 text-red-300";
      default: return "bg-slate-600 text-slate-300";
    }
  };

  const paymentStatusColor = (status: string | null) => {
    switch (status) {
      case "paid": return "bg-green-900 text-green-300";
      case "partial": return "bg-yellow-900 text-yellow-300";
      default: return "bg-red-900 text-red-300";
    }
  };

  if (loading) {
    return <div className="text-center text-slate-400 py-8">Loading bookings...</div>;
  }

  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search bookings by reference, client, destination..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2"
        >
          <option value="all">All Status</option>
          <option value="confirmed">Confirmed</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          value={filterPayment}
          onChange={(e) => setFilterPayment(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2"
        >
          <option value="all">All Payment</option>
          <option value="pending">Pending</option>
          <option value="partial">Partial</option>
          <option value="paid">Paid</option>
        </select>
      </div>

      <div className="bg-slate-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-700">
            <tr>
              <th className="text-left p-4 font-medium">Booking Ref</th>
              <th className="text-left p-4 font-medium">Client</th>
              <th className="text-left p-4 font-medium">Destination</th>
              <th className="text-left p-4 font-medium">Status</th>
              <th className="text-left p-4 font-medium">Total</th>
              <th className="text-left p-4 font-medium">Paid</th>
              <th className="text-left p-4 font-medium">Balance</th>
              <th className="text-left p-4 font-medium">Payment</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((b) => (
              <tr
                key={b.id}
                className="border-t border-slate-700 hover:bg-slate-700 cursor-pointer transition-colors"
                onClick={() => setSelectedBooking(b)}
              >
                <td className="p-4 text-emerald-400 font-medium">{b.bookingReference || `#${b.id}`}</td>
                <td className="p-4">{b.clientName || b.clientEmail || "-"}</td>
                <td className="p-4 text-slate-300">{b.destination || b.quoteName || "-"}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-sm capitalize ${bookingStatusColor(b.status)}`}>
                    {(b.status || "confirmed").replace("_", " ")}
                  </span>
                </td>
                <td className="p-4 text-emerald-400 font-medium">
                  ${b.totalAmount ? parseFloat(b.totalAmount).toLocaleString() : "0"}
                </td>
                <td className="p-4 text-green-400">
                  ${b.paidAmount ? parseFloat(b.paidAmount).toLocaleString() : "0"}
                </td>
                <td className="p-4 text-yellow-400">
                  ${b.balanceAmount ? parseFloat(b.balanceAmount).toLocaleString() : "0"}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-sm capitalize ${paymentStatusColor(b.paymentStatus)}`}>
                    {b.paymentStatus || "pending"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredBookings.length === 0 && (
          <div className="p-8 text-center text-slate-400">
            {searchTerm || filterPayment !== "all"
              ? "No bookings match your search."
              : "No bookings found. Create bookings from accepted quotes."}
          </div>
        )}
      </div>

      {selectedBooking && (
        <BookingDetailModal
          bookingId={selectedBooking.id}
          onClose={() => setSelectedBooking(null)}
          onUpdate={fetchBookings}
          apiBasePath={apiBasePath}
        />
      )}
    </>
  );
}
