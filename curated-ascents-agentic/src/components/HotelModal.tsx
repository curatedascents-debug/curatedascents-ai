"use client";

import { useState } from "react";

interface HotelModalProps {
  hotel: any | null;
  isNew: boolean;
  suppliers: any[];
  destinations: any[];
  onClose: () => void;
  onSave: () => void;
  onDelete?: () => void;
}

export default function HotelModal({
  hotel,
  isNew,
  suppliers,
  destinations,
  onClose,
  onSave,
  onDelete,
}: HotelModalProps) {
  const [formData, setFormData] = useState(
    hotel || {
      name: "",
      supplierId: "",
      destinationId: "",
      starRating: "",
      category: "",
      address: "",
      description: "",
      amenities: [],
      checkInTime: "14:00",
      checkOutTime: "12:00",
      images: [],
      isActive: true,
    }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [amenityInput, setAmenityInput] = useState("");

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleAddAmenity = () => {
    if (amenityInput.trim()) {
      const currentAmenities = Array.isArray(formData.amenities)
        ? formData.amenities
        : [];
      handleChange("amenities", [...currentAmenities, amenityInput.trim()]);
      setAmenityInput("");
    }
  };

  const handleRemoveAmenity = (index: number) => {
    const currentAmenities = Array.isArray(formData.amenities)
      ? formData.amenities
      : [];
    handleChange(
      "amenities",
      currentAmenities.filter((_: any, i: number) => i !== index)
    );
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      setError("Hotel name is required");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const url = isNew
        ? "/api/admin/hotels"
        : `/api/admin/hotels/${hotel.id}`;
      const method = isNew ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to save hotel");
      }

      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const commonAmenities = [
    "WiFi",
    "Pool",
    "Spa",
    "Gym",
    "Restaurant",
    "Bar",
    "Room Service",
    "Parking",
    "Airport Transfer",
    "Laundry",
    "Business Center",
    "Conference Room",
    "Garden",
    "Terrace",
    "Mountain View",
    "Lake View",
    "AC",
    "Heating",
    "Safe",
    "Mini Bar",
  ];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <div>
            <h2 className="text-xl font-bold text-white">
              {isNew ? "Add New Hotel" : `Edit: ${hotel?.name}`}
            </h2>
            <p className="text-slate-400 text-sm">
              {isNew ? "Create a new hotel record" : `ID: ${hotel?.id}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-900/50 border border-red-700 rounded text-red-300">
            {error}
          </div>
        )}

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-emerald-400">
              Basic Information
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Hotel Name *">
                <Input
                  value={formData.name}
                  onChange={(v: string) => handleChange("name", v)}
                  placeholder="e.g., Dwarika's Hotel"
                />
              </FormField>

              <FormField label="Star Rating">
                <Select
                  value={formData.starRating?.toString() || ""}
                  onChange={(v: string) =>
                    handleChange("starRating", v ? parseInt(v) : null)
                  }
                  options={[
                    { value: "", label: "Select rating..." },
                    { value: "1", label: "⭐ 1 Star" },
                    { value: "2", label: "⭐⭐ 2 Stars" },
                    { value: "3", label: "⭐⭐⭐ 3 Stars" },
                    { value: "4", label: "⭐⭐⭐⭐ 4 Stars" },
                    { value: "5", label: "⭐⭐⭐⭐⭐ 5 Stars" },
                  ]}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Category">
                <Select
                  value={formData.category}
                  onChange={(v: string) => handleChange("category", v)}
                  options={[
                    { value: "", label: "Select category..." },
                    { value: "Luxury", label: "Luxury" },
                    { value: "Boutique", label: "Boutique" },
                    { value: "Heritage", label: "Heritage" },
                    { value: "Business", label: "Business" },
                    { value: "Resort", label: "Resort" },
                    { value: "Lodge", label: "Lodge" },
                    { value: "Budget", label: "Budget" },
                    { value: "Hostel", label: "Hostel" },
                  ]}
                />
              </FormField>

              <FormField label="Supplier">
                <Select
                  value={formData.supplierId?.toString() || ""}
                  onChange={(v: string) =>
                    handleChange("supplierId", v ? parseInt(v) : null)
                  }
                  options={[
                    { value: "", label: "Select supplier..." },
                    ...suppliers
                      .filter((s) => s.type === "hotel" || !s.type)
                      .map((s) => ({
                        value: s.id.toString(),
                        label: s.name,
                      })),
                  ]}
                />
              </FormField>
            </div>

            <FormField label="Destination">
              <Select
                value={formData.destinationId?.toString() || ""}
                onChange={(v: string) =>
                  handleChange("destinationId", v ? parseInt(v) : null)
                }
                options={[
                  { value: "", label: "Select destination..." },
                  ...destinations.map((d) => ({
                    value: d.id.toString(),
                    label: `${d.city}, ${d.country}${d.region ? ` (${d.region})` : ""}`,
                  })),
                ]}
              />
            </FormField>

            <FormField label="Address">
              <TextArea
                value={formData.address}
                onChange={(v: string) => handleChange("address", v)}
                placeholder="Full hotel address..."
                rows={2}
              />
            </FormField>

            <FormField label="Description">
              <TextArea
                value={formData.description}
                onChange={(v: string) => handleChange("description", v)}
                placeholder="Hotel description for clients..."
                rows={3}
              />
            </FormField>
          </div>

          {/* Check-in/out Times */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-emerald-400">
              Check-in / Check-out
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Check-in Time">
                <Input
                  type="time"
                  value={formData.checkInTime}
                  onChange={(v: string) => handleChange("checkInTime", v)}
                />
              </FormField>
              <FormField label="Check-out Time">
                <Input
                  type="time"
                  value={formData.checkOutTime}
                  onChange={(v: string) => handleChange("checkOutTime", v)}
                />
              </FormField>
            </div>
          </div>

          {/* Amenities */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-emerald-400">Amenities</h3>

            {/* Current amenities */}
            <div className="flex flex-wrap gap-2">
              {Array.isArray(formData.amenities) &&
                formData.amenities.map((amenity: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-emerald-900 text-emerald-300 rounded-full text-sm flex items-center gap-2"
                  >
                    {amenity}
                    <button
                      onClick={() => handleRemoveAmenity(index)}
                      className="text-emerald-400 hover:text-red-400"
                    >
                      ×
                    </button>
                  </span>
                ))}
            </div>

            {/* Add amenity */}
            <div className="flex gap-2">
              <Input
                value={amenityInput}
                onChange={setAmenityInput}
                placeholder="Add amenity..."
                onKeyPress={(e: any) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddAmenity();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddAmenity}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded transition-colors"
              >
                Add
              </button>
            </div>

            {/* Quick add common amenities */}
            <div>
              <p className="text-sm text-slate-400 mb-2">Quick add:</p>
              <div className="flex flex-wrap gap-1">
                {commonAmenities
                  .filter(
                    (a) =>
                      !Array.isArray(formData.amenities) ||
                      !formData.amenities.includes(a)
                  )
                  .slice(0, 10)
                  .map((amenity) => (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => {
                        const current = Array.isArray(formData.amenities)
                          ? formData.amenities
                          : [];
                        handleChange("amenities", [...current, amenity]);
                      }}
                      className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs text-slate-300"
                    >
                      + {amenity}
                    </button>
                  ))}
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="flex gap-4">
            <Checkbox
              checked={formData.isActive}
              onChange={(v: boolean) => handleChange("isActive", v)}
              label="Hotel is Active"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 flex justify-between bg-slate-800">
          {!isNew && onDelete ? (
            <button
              onClick={onDelete}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded transition-colors"
            >
              Delete Hotel
            </button>
          ) : (
            <div />
          )}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded transition-colors"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 rounded transition-colors"
              disabled={saving}
            >
              {saving ? "Saving..." : isNew ? "Create Hotel" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-slate-300">{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, type = "text", placeholder, ...props }: any) {
  return (
    <input
      type={type}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
      {...props}
    />
  );
}

function TextArea({ value, onChange, placeholder, rows = 3 }: any) {
  return (
    <textarea
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
    />
  );
}

function Select({ value, onChange, options }: any) {
  return (
    <select
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
    >
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

function Checkbox({ checked, onChange, label }: any) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked || false}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded bg-slate-700 border-slate-600"
      />
      <span className="text-slate-300">{label}</span>
    </label>
  );
}
