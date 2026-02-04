"use client";

import { useState, useEffect } from "react";

interface QuoteDetailModalProps {
  quoteId: number;
  onClose: () => void;
  onUpdate: () => void;
  apiBasePath?: string;
}

interface EditableItem {
  id?: number;
  serviceType: string;
  serviceName: string;
  description: string;
  quantity: number;
  costPrice: string;
  sellPrice: string;
  isNew?: boolean;
}

export default function QuoteDetailModal({ quoteId, onClose, onUpdate, apiBasePath = "/api/admin" }: QuoteDetailModalProps) {
  const [quote, setQuote] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [emailBanner, setEmailBanner] = useState<{ type: "sent" | "skipped"; message: string } | null>(null);
  const [bookingBanner, setBookingBanner] = useState<{ type: "success" | "error"; message: string; bookingRef?: string } | null>(null);

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    quoteName: "",
    destination: "",
    startDate: "",
    endDate: "",
    numberOfPax: 1,
    numberOfRooms: 1,
    validUntil: "",
    notes: "",
    inclusionsSummary: "",
    exclusionsSummary: "",
  });
  const [editItems, setEditItems] = useState<EditableItem[]>([]);

  useEffect(() => {
    fetchQuoteDetails();
  }, [quoteId]);

  const fetchQuoteDetails = async () => {
    try {
      const res = await fetch(`${apiBasePath}/quotes/${quoteId}`);
      const data = await res.json();
      setQuote(data.quote);
      setItems(data.items || []);
    } catch (error) {
      console.error("Error fetching quote details:", error);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = () => {
    setEditForm({
      quoteName: quote.quoteName || "",
      destination: quote.destination || "",
      startDate: quote.startDate ? quote.startDate.split("T")[0] : "",
      endDate: quote.endDate ? quote.endDate.split("T")[0] : "",
      numberOfPax: quote.numberOfPax || 1,
      numberOfRooms: quote.numberOfRooms || 1,
      validUntil: quote.validUntil ? quote.validUntil.split("T")[0] : "",
      notes: quote.notes || "",
      inclusionsSummary: quote.inclusionsSummary || "",
      exclusionsSummary: quote.exclusionsSummary || "",
    });
    setEditItems(
      items.map((item) => ({
        id: item.id,
        serviceType: item.serviceType || "miscellaneous",
        serviceName: item.serviceName || "",
        description: item.description || "",
        quantity: item.quantity || 1,
        costPrice: item.costPrice || "0",
        sellPrice: item.sellPrice || "0",
      }))
    );
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditForm({
      quoteName: "",
      destination: "",
      startDate: "",
      endDate: "",
      numberOfPax: 1,
      numberOfRooms: 1,
      validUntil: "",
      notes: "",
      inclusionsSummary: "",
      exclusionsSummary: "",
    });
    setEditItems([]);
  };

  const addLineItem = () => {
    setEditItems([
      ...editItems,
      {
        serviceType: "miscellaneous",
        serviceName: "",
        description: "",
        quantity: 1,
        costPrice: "0",
        sellPrice: "0",
        isNew: true,
      },
    ]);
  };

  const removeLineItem = (index: number) => {
    setEditItems(editItems.filter((_, i) => i !== index));
  };

  const updateLineItem = (index: number, field: keyof EditableItem, value: string | number) => {
    const updated = [...editItems];
    updated[index] = { ...updated[index], [field]: value };
    setEditItems(updated);
  };

  const saveChanges = async () => {
    setActionLoading(true);
    try {
      // Calculate totals from edited items
      let totalCost = 0;
      let totalSell = 0;
      for (const item of editItems) {
        const qty = item.quantity || 1;
        const cost = parseFloat(item.costPrice || "0");
        const sell = parseFloat(item.sellPrice || "0");
        totalCost += cost * qty;
        totalSell += sell * qty;
      }
      const totalMargin = totalSell - totalCost;
      const marginPercent = totalCost > 0 ? ((totalMargin / totalCost) * 100).toFixed(2) : "0";
      const perPersonPrice = editForm.numberOfPax > 0 ? (totalSell / editForm.numberOfPax).toFixed(2) : null;

      const res = await fetch(`${apiBasePath}/quotes/${quoteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editForm,
          totalSellPrice: totalSell.toFixed(2),
          totalCostPrice: totalCost.toFixed(2),
          totalMargin: totalMargin.toFixed(2),
          marginPercent,
          perPersonPrice,
          items: editItems.map((item) => ({
            id: item.isNew ? undefined : item.id,
            serviceType: item.serviceType,
            serviceName: item.serviceName,
            description: item.description,
            quantity: item.quantity,
            costPrice: item.costPrice,
            sellPrice: item.sellPrice,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to save changes");
        return;
      }

      await fetchQuoteDetails();
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      alert("Failed to save changes");
    } finally {
      setActionLoading(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    setActionLoading(true);
    setEmailBanner(null);
    try {
      const res = await fetch(`${apiBasePath}/quotes/${quoteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to update status");
        return;
      }
      const data = await res.json();
      if (data.emailStatus?.sent) {
        setEmailBanner({ type: "sent", message: `Email notification sent to client` });
      } else if (newStatus === "sent" || newStatus === "expired") {
        setEmailBanner({ type: "skipped", message: data.emailStatus?.error || "Email skipped (no client email or API key)" });
      }
      await fetchQuoteDetails();
      onUpdate();
    } catch (error) {
      alert("Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this quote? This cannot be undone.")) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${apiBasePath}/quotes/${quoteId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to delete");
        return;
      }
      onUpdate();
      onClose();
    } catch (error) {
      alert("Failed to delete quote");
    } finally {
      setActionLoading(false);
    }
  };

  const downloadPDF = () => {
    window.open(`${apiBasePath}/quotes/${quoteId}/pdf`, "_blank");
  };

  const convertToBooking = async () => {
    if (!confirm("Convert this quote to a booking? This will create a new booking record.")) return;
    setActionLoading(true);
    setBookingBanner(null);
    try {
      const res = await fetch(`${apiBasePath}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quoteId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setBookingBanner({ type: "error", message: data.error || "Failed to create booking" });
        return;
      }
      setBookingBanner({
        type: "success",
        message: "Booking created successfully!",
        bookingRef: data.booking?.bookingReference
      });
      onUpdate();
    } catch (error) {
      setBookingBanner({ type: "error", message: "Failed to create booking" });
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

  if (!quote) return null;

  const statusActions: Record<string, { label: string; next: string; color: string }[]> = {
    draft: [
      { label: "Mark as Sent", next: "sent", color: "bg-blue-600 hover:bg-blue-500" },
      { label: "Mark Expired", next: "expired", color: "bg-red-600 hover:bg-red-500" },
    ],
    sent: [
      { label: "Mark Accepted", next: "accepted", color: "bg-green-600 hover:bg-green-500" },
      { label: "Mark Expired", next: "expired", color: "bg-red-600 hover:bg-red-500" },
    ],
    accepted: [
      { label: "Mark Expired", next: "expired", color: "bg-red-600 hover:bg-red-500" },
    ],
    expired: [],
  };

  const actions = statusActions[quote.status || "draft"] || [];

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-700 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-emerald-400">
              {quote.quoteNumber || `Quote #${quote.id}`}
            </h2>
            <p className="text-slate-400">{quote.quoteName || quote.destination || ""}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">x</button>
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

          {/* Booking creation banner */}
          {bookingBanner && (
            <div className={`flex items-center justify-between px-4 py-2 rounded text-sm ${
              bookingBanner.type === "success"
                ? "bg-green-900/50 text-green-300 border border-green-700"
                : "bg-red-900/50 text-red-300 border border-red-700"
            }`}>
              <span>
                {bookingBanner.message}
                {bookingBanner.bookingRef && (
                  <span className="ml-2 font-semibold">Ref: {bookingBanner.bookingRef}</span>
                )}
              </span>
              <button onClick={() => setBookingBanner(null)} className="ml-3 hover:opacity-70">x</button>
            </div>
          )}

          {/* Edit Mode View */}
          {isEditing ? (
            <div className="space-y-6">
              {/* Edit form fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-1">Quote Name</label>
                  <input
                    type="text"
                    value={editForm.quoteName}
                    onChange={(e) => setEditForm({ ...editForm, quoteName: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 focus:outline-none focus:border-emerald-500"
                    placeholder="Enter quote name"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-1">Destination</label>
                  <input
                    type="text"
                    value={editForm.destination}
                    onChange={(e) => setEditForm({ ...editForm, destination: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 focus:outline-none focus:border-emerald-500"
                    placeholder="Enter destination"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-1">Start Date</label>
                  <input
                    type="date"
                    value={editForm.startDate}
                    onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-1">End Date</label>
                  <input
                    type="date"
                    value={editForm.endDate}
                    onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-1">Number of Pax</label>
                  <input
                    type="number"
                    min="1"
                    value={editForm.numberOfPax}
                    onChange={(e) => setEditForm({ ...editForm, numberOfPax: parseInt(e.target.value) || 1 })}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-1">Number of Rooms</label>
                  <input
                    type="number"
                    min="1"
                    value={editForm.numberOfRooms}
                    onChange={(e) => setEditForm({ ...editForm, numberOfRooms: parseInt(e.target.value) || 1 })}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-slate-400 text-sm mb-1">Valid Until</label>
                  <input
                    type="date"
                    value={editForm.validUntil}
                    onChange={(e) => setEditForm({ ...editForm, validUntil: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Editable Line Items */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-slate-300">Line Items</h3>
                  <button
                    onClick={addLineItem}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 rounded text-sm transition-colors"
                  >
                    + Add Item
                  </button>
                </div>
                <div className="space-y-3">
                  {editItems.map((item, index) => (
                    <div key={index} className="bg-slate-900 rounded-lg p-4">
                      <div className="grid grid-cols-6 gap-3">
                        <div className="col-span-2">
                          <label className="block text-slate-400 text-xs mb-1">Service Name</label>
                          <input
                            type="text"
                            value={item.serviceName}
                            onChange={(e) => updateLineItem(index, "serviceName", e.target.value)}
                            className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm focus:outline-none focus:border-emerald-500"
                            placeholder="Service name"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 text-xs mb-1">Type</label>
                          <select
                            value={item.serviceType}
                            onChange={(e) => updateLineItem(index, "serviceType", e.target.value)}
                            className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm focus:outline-none focus:border-emerald-500"
                          >
                            <option value="hotel">Hotel</option>
                            <option value="transportation">Transport</option>
                            <option value="guide">Guide</option>
                            <option value="flight">Flight</option>
                            <option value="permit">Permit</option>
                            <option value="helicopter">Helicopter</option>
                            <option value="miscellaneous">Misc</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-slate-400 text-xs mb-1">Qty</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateLineItem(index, "quantity", parseInt(e.target.value) || 1)}
                            className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 text-xs mb-1">Cost $</label>
                          <input
                            type="number"
                            step="0.01"
                            value={item.costPrice}
                            onChange={(e) => updateLineItem(index, "costPrice", e.target.value)}
                            className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 text-xs mb-1">Sell $</label>
                          <input
                            type="number"
                            step="0.01"
                            value={item.sellPrice}
                            onChange={(e) => updateLineItem(index, "sellPrice", e.target.value)}
                            className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>
                      <div className="mt-2 flex justify-between items-end">
                        <div className="flex-1 mr-3">
                          <label className="block text-slate-400 text-xs mb-1">Description</label>
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateLineItem(index, "description", e.target.value)}
                            className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm focus:outline-none focus:border-emerald-500"
                            placeholder="Optional description"
                          />
                        </div>
                        <button
                          onClick={() => removeLineItem(index)}
                          className="px-2 py-1 bg-red-800 hover:bg-red-700 rounded text-sm transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  {editItems.length === 0 && (
                    <div className="text-center text-slate-500 py-4">
                      No line items. Click &quot;+ Add Item&quot; to add services.
                    </div>
                  )}
                </div>
              </div>

              {/* Inclusions/Exclusions */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-1">Inclusions</label>
                  <textarea
                    value={editForm.inclusionsSummary}
                    onChange={(e) => setEditForm({ ...editForm, inclusionsSummary: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 focus:outline-none focus:border-emerald-500 h-24"
                    placeholder="What's included..."
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-1">Exclusions</label>
                  <textarea
                    value={editForm.exclusionsSummary}
                    onChange={(e) => setEditForm({ ...editForm, exclusionsSummary: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 focus:outline-none focus:border-emerald-500 h-24"
                    placeholder="What's not included..."
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-slate-400 text-sm mb-1">Notes</label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 focus:outline-none focus:border-emerald-500 h-20"
                  placeholder="Internal notes..."
                />
              </div>

              {/* Calculated Totals Preview */}
              <div className="bg-slate-900 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-slate-300 mb-2">Price Summary (Preview)</h4>
                {(() => {
                  let totalCost = 0;
                  let totalSell = 0;
                  for (const item of editItems) {
                    totalCost += parseFloat(item.costPrice || "0") * (item.quantity || 1);
                    totalSell += parseFloat(item.sellPrice || "0") * (item.quantity || 1);
                  }
                  const margin = totalSell - totalCost;
                  const marginPct = totalCost > 0 ? ((margin / totalCost) * 100).toFixed(1) : "0";
                  const perPerson = editForm.numberOfPax > 0 ? (totalSell / editForm.numberOfPax).toFixed(2) : "0";
                  return (
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-slate-400">Total Cost:</span>
                        <span className="ml-2">${totalCost.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Total Sell:</span>
                        <span className="ml-2 text-emerald-400">${totalSell.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Margin:</span>
                        <span className="ml-2 text-yellow-400">${margin.toLocaleString()} ({marginPct}%)</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Per Person:</span>
                        <span className="ml-2">${perPerson}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          ) : (
            <>
          {/* Quote info grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-slate-400 text-sm">Client</div>
              <div className="font-medium">{quote.clientName || quote.clientEmail || "-"}</div>
            </div>
            <div>
              <div className="text-slate-400 text-sm">Destination</div>
              <div className="font-medium">{quote.destination || "-"}</div>
            </div>
            <div>
              <div className="text-slate-400 text-sm">Pax</div>
              <div className="font-medium">{quote.numberOfPax || "-"}</div>
            </div>
            <div>
              <div className="text-slate-400 text-sm">Status</div>
              <div>
                <span className={`px-2 py-1 rounded text-sm capitalize ${
                  quote.status === "accepted" ? "bg-green-900 text-green-300" :
                  quote.status === "sent" ? "bg-blue-900 text-blue-300" :
                  quote.status === "expired" ? "bg-red-900 text-red-300" :
                  "bg-slate-600 text-slate-300"
                }`}>
                  {quote.status || "draft"}
                </span>
              </div>
            </div>
            <div>
              <div className="text-slate-400 text-sm">Travel Dates</div>
              <div className="font-medium">
                {quote.startDate && quote.endDate
                  ? `${new Date(quote.startDate).toLocaleDateString()} - ${new Date(quote.endDate).toLocaleDateString()}`
                  : "-"}
              </div>
            </div>
            <div>
              <div className="text-slate-400 text-sm">Valid Until</div>
              <div className="font-medium">
                {quote.validUntil ? new Date(quote.validUntil).toLocaleDateString() : "-"}
              </div>
            </div>
            <div>
              <div className="text-slate-400 text-sm">Per Person</div>
              <div className="font-medium text-emerald-400">
                {quote.perPersonPrice ? `$${parseFloat(quote.perPersonPrice).toLocaleString()}` : "-"}
              </div>
            </div>
            <div>
              <div className="text-slate-400 text-sm">Margin</div>
              <div className="font-medium text-yellow-400">
                {quote.marginPercent ? `${quote.marginPercent}%` : "-"}
              </div>
            </div>
          </div>

          {/* Line Items */}
          {items.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-slate-300 mb-3">Line Items</h3>
              <div className="bg-slate-900 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-700">
                    <tr>
                      <th className="text-left p-3">Service</th>
                      <th className="text-left p-3">Type</th>
                      <th className="text-left p-3">Qty</th>
                      <th className="text-left p-3">Cost</th>
                      <th className="text-left p-3">Sell</th>
                      <th className="text-left p-3">Margin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-t border-slate-700">
                        <td className="p-3">{item.serviceName || item.description || "-"}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-slate-600 rounded text-xs capitalize">
                            {item.serviceType?.replace("_", " ")}
                          </span>
                        </td>
                        <td className="p-3">{item.quantity || 1}</td>
                        <td className="p-3 text-slate-400">${item.costPrice || "0"}</td>
                        <td className="p-3 text-emerald-400">${item.sellPrice || "0"}</td>
                        <td className="p-3 text-yellow-400">${item.margin || "0"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Totals */}
          <div className="bg-slate-900 rounded-lg p-4">
            <div className="flex justify-between items-center text-lg">
              <span className="text-slate-300">Total Sell Price:</span>
              <span className="text-emerald-400 font-bold">
                ${quote.totalSellPrice ? parseFloat(quote.totalSellPrice).toLocaleString() : "0"}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm mt-2">
              <span className="text-slate-400">Total Cost:</span>
              <span className="text-slate-400">
                ${quote.totalCostPrice ? parseFloat(quote.totalCostPrice).toLocaleString() : "0"}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm mt-1">
              <span className="text-slate-400">Total Margin:</span>
              <span className="text-yellow-400">
                ${quote.totalMargin ? parseFloat(quote.totalMargin).toLocaleString() : "0"}
                {quote.marginPercent ? ` (${quote.marginPercent}%)` : ""}
              </span>
            </div>
          </div>

          {/* Inclusions/Exclusions */}
          {(quote.inclusionsSummary || quote.exclusionsSummary) && (
            <div className="grid grid-cols-2 gap-4">
              {quote.inclusionsSummary && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-300 mb-2">Inclusions</h4>
                  <p className="text-sm text-slate-400 whitespace-pre-wrap">{quote.inclusionsSummary}</p>
                </div>
              )}
              {quote.exclusionsSummary && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-300 mb-2">Exclusions</h4>
                  <p className="text-sm text-slate-400 whitespace-pre-wrap">{quote.exclusionsSummary}</p>
                </div>
              )}
            </div>
          )}

          {quote.notes && (
            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-2">Notes</h4>
              <p className="text-sm text-slate-400">{quote.notes}</p>
            </div>
          )}
            </>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-slate-700 flex flex-wrap gap-3 justify-between">
          {isEditing ? (
            <>
              <div className="flex gap-3">
                <button
                  onClick={saveChanges}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded transition-colors disabled:opacity-50 font-semibold"
                >
                  {actionLoading ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={cancelEditing}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
              <div />
            </>
          ) : (
            <>
              <div className="flex gap-3">
                {actions.map((action) => (
                  <button
                    key={action.next}
                    onClick={() => updateStatus(action.next)}
                    disabled={actionLoading}
                    className={`px-4 py-2 rounded transition-colors disabled:opacity-50 ${action.color}`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                {quote.status === "draft" && (
                  <button
                    onClick={startEditing}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 rounded transition-colors font-semibold"
                  >
                    Edit Quote
                  </button>
                )}
                {quote.status === "accepted" && !bookingBanner?.bookingRef && (
                  <button
                    onClick={convertToBooking}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded transition-colors disabled:opacity-50 font-semibold"
                  >
                    {actionLoading ? "Creating..." : "Convert to Booking"}
                  </button>
                )}
                <button
                  onClick={downloadPDF}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded transition-colors"
                >
                  Download PDF
                </button>
                {quote.status === "draft" && (
                  <button
                    onClick={handleDelete}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-red-800 hover:bg-red-700 rounded transition-colors disabled:opacity-50"
                  >
                    Delete
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded transition-colors"
                >
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
