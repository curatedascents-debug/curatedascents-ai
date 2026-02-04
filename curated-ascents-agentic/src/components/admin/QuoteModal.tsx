"use client";

import { useState, useEffect } from "react";

interface LineItem {
  serviceType: string;
  serviceName: string;
  description: string;
  quantity: number;
  costPrice: string;
  sellPrice: string;
}

interface QuoteModalProps {
  onClose: () => void;
  onSave: () => void;
  apiBasePath?: string;
}

const emptyItem = (): LineItem => ({
  serviceType: "miscellaneous",
  serviceName: "",
  description: "",
  quantity: 1,
  costPrice: "",
  sellPrice: "",
});

export default function QuoteModal({ onClose, onSave, apiBasePath = "/api/admin" }: QuoteModalProps) {
  const [clients, setClients] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    clientId: "",
    quoteName: "",
    destination: "",
    startDate: "",
    endDate: "",
    numberOfPax: "",
    numberOfRooms: "",
    currency: "USD",
    isMICE: false,
    validUntil: "",
    inclusionsSummary: "",
    exclusionsSummary: "",
    notes: "",
  });
  const [items, setItems] = useState<LineItem[]>([emptyItem()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${apiBasePath}/clients`)
      .then((r) => r.json())
      .then((d) => setClients(d.clients || []))
      .catch(() => {});
  }, [apiBasePath]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    setItems((prev) => {
      const updated = [...prev];
      (updated[index] as any)[field] = value;
      return updated;
    });
  };

  const addItem = () => setItems((prev) => [...prev, emptyItem()]);

  const removeItem = (index: number) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");

    try {
      const res = await fetch(`${apiBasePath}/quotes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          clientId: formData.clientId ? parseInt(formData.clientId) : null,
          numberOfPax: formData.numberOfPax ? parseInt(formData.numberOfPax) : null,
          numberOfRooms: formData.numberOfRooms ? parseInt(formData.numberOfRooms) : null,
          items,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.details || data.error || "Failed to create quote");
      }

      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create quote");
    } finally {
      setSaving(false);
    }
  };

  const totalSell = items.reduce(
    (sum, item) => sum + parseFloat(item.sellPrice || "0") * (item.quantity || 1),
    0
  );

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-emerald-400">Create Quote</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">x</button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-900/50 border border-red-700 rounded p-3 text-red-300 text-sm">{error}</div>
          )}

          {/* Quote Details */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Client</label>
              <select
                value={formData.clientId}
                onChange={(e) => handleChange("clientId", e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2"
              >
                <option value="">-- Select Client --</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name || c.email}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Quote Name</label>
              <input
                type="text"
                value={formData.quoteName}
                onChange={(e) => handleChange("quoteName", e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 focus:outline-none focus:border-emerald-500"
                placeholder="e.g., Everest Base Camp Trek"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Destination</label>
              <input
                type="text"
                value={formData.destination}
                onChange={(e) => handleChange("destination", e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleChange("startDate", e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => handleChange("endDate", e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Valid Until</label>
              <input
                type="date"
                value={formData.validUntil}
                onChange={(e) => handleChange("validUntil", e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Number of Pax</label>
              <input
                type="number"
                value={formData.numberOfPax}
                onChange={(e) => handleChange("numberOfPax", e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Number of Rooms</label>
              <input
                type="number"
                value={formData.numberOfRooms}
                onChange={(e) => handleChange("numberOfRooms", e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2"
                min="0"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isMICE}
                  onChange={(e) => handleChange("isMICE", e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-slate-400">MICE Group (20+ pax)</span>
              </label>
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-slate-300">Line Items</h3>
              <button
                onClick={addItem}
                className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm transition-colors"
              >
                + Add Item
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="bg-slate-900 rounded-lg p-4 grid grid-cols-6 gap-3 items-end">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Service Type</label>
                    <select
                      value={item.serviceType}
                      onChange={(e) => handleItemChange(index, "serviceType", e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1.5 text-sm"
                    >
                      <option value="hotel">Hotel</option>
                      <option value="transportation">Transport</option>
                      <option value="guide">Guide</option>
                      <option value="porter">Porter</option>
                      <option value="flight">Flight</option>
                      <option value="helicopter_sharing">Heli Sharing</option>
                      <option value="helicopter_charter">Heli Charter</option>
                      <option value="permit">Permit</option>
                      <option value="package">Package</option>
                      <option value="miscellaneous">Misc</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Service Name</label>
                    <input
                      type="text"
                      value={item.serviceName}
                      onChange={(e) => handleItemChange(index, "serviceName", e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Qty</label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value) || 1)}
                      className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1.5 text-sm"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Cost Price</label>
                    <input
                      type="number"
                      value={item.costPrice}
                      onChange={(e) => handleItemChange(index, "costPrice", e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1.5 text-sm"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Sell Price</label>
                    <input
                      type="number"
                      value={item.sellPrice}
                      onChange={(e) => handleItemChange(index, "sellPrice", e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1.5 text-sm"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <button
                      onClick={() => removeItem(index)}
                      className="px-3 py-1.5 bg-red-800 hover:bg-red-700 rounded text-sm transition-colors"
                      disabled={items.length === 1}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 text-right text-emerald-400 font-bold">
              Total: ${totalSell.toLocaleString()}
            </div>
          </div>

          {/* Notes */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Inclusions</label>
              <textarea
                value={formData.inclusionsSummary}
                onChange={(e) => handleChange("inclusionsSummary", e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 h-24 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Exclusions</label>
              <textarea
                value={formData.exclusionsSummary}
                onChange={(e) => handleChange("exclusionsSummary", e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 h-24 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 h-20 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded transition-colors disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create Quote"}
          </button>
        </div>
      </div>
    </div>
  );
}
