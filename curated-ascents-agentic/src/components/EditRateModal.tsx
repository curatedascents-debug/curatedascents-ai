"use client";

import { useState } from "react";

interface EditRateModalProps {
  rate: any;
  onClose: () => void;
  onSave: (updatedRate: any) => void;
}

export default function EditRateModal({ rate, onClose, onSave }: EditRateModalProps) {
  const [formData, setFormData] = useState({ ...rate });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  // Auto-calculate sell price based on cost and margin
  const calculateSellPrice = (cost: string, marginPercent: number = 50): string => {
    const costNum = parseFloat(cost) || 0;
    const sell = costNum * (1 + marginPercent / 100);
    return sell.toFixed(2);
  };

  const handleCostChange = (costField: string, sellField: string, value: string) => {
    const margin = parseFloat(formData.marginPercent) || 50;
    setFormData((prev: any) => ({
      ...prev,
      [costField]: value,
      [sellField]: calculateSellPrice(value, margin),
    }));
  };

  const handleMarginChange = (value: string) => {
    const margin = parseFloat(value) || 50;
    const updates: any = { marginPercent: value };

    // Recalculate all sell prices based on new margin
    if (formData.costPrice) {
      updates.sellPrice = calculateSellPrice(formData.costPrice, margin);
    }
    if (formData.costPerDay) {
      updates.sellPerDay = calculateSellPrice(formData.costPerDay, margin);
    }
    if (formData.costPerSeat) {
      updates.sellPerSeat = calculateSellPrice(formData.costPerSeat, margin);
    }
    if (formData.costPerCharter) {
      updates.sellPerCharter = calculateSellPrice(formData.costPerCharter, margin);
    }
    if (formData.costDouble) {
      updates.sellDouble = calculateSellPrice(formData.costDouble, margin);
    }
    if (formData.costSingle) {
      updates.sellSingle = calculateSellPrice(formData.costSingle, margin);
    }

    setFormData((prev: any) => ({ ...prev, ...updates }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/rates/${rate.serviceType}/${rate.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to save changes");
      }

      const result = await response.json();
      onSave(result.rate);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  // Render form based on service type
  const renderForm = () => {
    switch (rate.serviceType) {
      case "hotel":
        return <HotelForm formData={formData} onChange={handleChange} onCostChange={handleCostChange} onMarginChange={handleMarginChange} />;
      case "transportation":
        return <TransportForm formData={formData} onChange={handleChange} onCostChange={handleCostChange} onMarginChange={handleMarginChange} />;
      case "guide":
        return <GuideForm formData={formData} onChange={handleChange} onCostChange={handleCostChange} onMarginChange={handleMarginChange} />;
      case "porter":
        return <PorterForm formData={formData} onChange={handleChange} onCostChange={handleCostChange} onMarginChange={handleMarginChange} />;
      case "flight":
        return <FlightForm formData={formData} onChange={handleChange} onCostChange={handleCostChange} onMarginChange={handleMarginChange} />;
      case "helicopter_sharing":
        return <HeliSharingForm formData={formData} onChange={handleChange} onCostChange={handleCostChange} onMarginChange={handleMarginChange} />;
      case "helicopter_charter":
        return <HeliCharterForm formData={formData} onChange={handleChange} onCostChange={handleCostChange} onMarginChange={handleMarginChange} />;
      case "permit":
        return <PermitForm formData={formData} onChange={handleChange} onCostChange={handleCostChange} />;
      case "package":
        return <PackageForm formData={formData} onChange={handleChange} onCostChange={handleCostChange} onMarginChange={handleMarginChange} />;
      case "miscellaneous":
        return <MiscForm formData={formData} onChange={handleChange} onCostChange={handleCostChange} onMarginChange={handleMarginChange} />;
      default:
        return <GenericForm formData={formData} onChange={handleChange} />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-700 sticky top-0 bg-slate-800 z-10">
          <div>
            <h2 className="text-xl font-bold text-white">Edit {rate.serviceType?.replace("_", " ")}</h2>
            <p className="text-slate-400 text-sm">ID: {rate.id}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">
            ×
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-900/50 border border-red-700 rounded text-red-300">
            {error}
          </div>
        )}

        {/* Form */}
        <div className="p-6">{renderForm()}</div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 flex justify-end gap-3 sticky bottom-0 bg-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded transition-colors"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 rounded transition-colors flex items-center gap-2"
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="animate-spin">⏳</span> Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// FORM COMPONENTS FOR EACH SERVICE TYPE
// ============================================

// Input wrapper component
function FormField({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-slate-300">{label}</label>
      {children}
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
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

function Select({ value, onChange, options, placeholder }: any) {
  return (
    <select
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
    >
      {placeholder && <option value="">{placeholder}</option>}
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
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded bg-slate-700 border-slate-600"
      />
      <span className="text-slate-300">{label}</span>
    </label>
  );
}

// Price input with auto-calculation display
function PriceRow({ label, costValue, sellValue, onCostChange, currency = "USD" }: any) {
  const cost = parseFloat(costValue) || 0;
  const sell = parseFloat(sellValue) || 0;
  const margin = cost > 0 ? ((sell - cost) / cost * 100).toFixed(1) : "0";

  return (
    <div className="grid grid-cols-4 gap-3 items-center">
      <span className="text-slate-400 text-sm">{label}</span>
      <div>
        <Input
          type="number"
          value={costValue}
          onChange={onCostChange}
          placeholder="Cost"
        />
      </div>
      <div>
        <Input
          type="number"
          value={sellValue}
          onChange={() => {}} // Read-only, auto-calculated
          placeholder="Sell"
          disabled
          className="bg-slate-800 opacity-75"
        />
      </div>
      <div className="text-yellow-400 text-sm font-medium">{margin}%</div>
    </div>
  );
}

// ============================================
// HOTEL FORM
// ============================================
function HotelForm({ formData, onChange, onCostChange, onMarginChange }: any) {
  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Room Type">
          <Input value={formData.roomType} onChange={(v: string) => onChange("roomType", v)} />
        </FormField>
        <FormField label="Meal Plan">
          <Select
            value={formData.mealPlan}
            onChange={(v: string) => onChange("mealPlan", v)}
            options={[
              { value: "EP", label: "EP - Room Only" },
              { value: "CP", label: "CP - Bed & Breakfast" },
              { value: "MAP", label: "MAP - Half Board" },
              { value: "AP", label: "AP - Full Board" },
              { value: "AI", label: "AI - All Inclusive" },
            ]}
          />
        </FormField>
      </div>

      {/* Margin */}
      <div className="bg-slate-900 p-4 rounded-lg">
        <FormField label="Default Margin %" hint="Changing this recalculates all sell prices">
          <Input
            type="number"
            value={formData.marginPercent || "50"}
            onChange={onMarginChange}
          />
        </FormField>
      </div>

      {/* Pricing Table */}
      <div className="bg-slate-900 p-4 rounded-lg space-y-3">
        <h4 className="text-sm font-medium text-slate-300 mb-3">
          Pricing (per night) - <span className="text-red-400">Cost</span> → <span className="text-emerald-400">Sell</span> → <span className="text-yellow-400">Margin</span>
        </h4>
        
        <PriceRow
          label="Single"
          costValue={formData.costSingle}
          sellValue={formData.sellSingle}
          onCostChange={(v: string) => onCostChange("costSingle", "sellSingle", v)}
        />
        <PriceRow
          label="Double"
          costValue={formData.costDouble}
          sellValue={formData.sellDouble}
          onCostChange={(v: string) => onCostChange("costDouble", "sellDouble", v)}
        />
        <PriceRow
          label="Triple"
          costValue={formData.costTriple}
          sellValue={formData.sellTriple}
          onCostChange={(v: string) => onCostChange("costTriple", "sellTriple", v)}
        />
        <PriceRow
          label="Extra Bed"
          costValue={formData.costExtraBed}
          sellValue={formData.sellExtraBed}
          onCostChange={(v: string) => onCostChange("costExtraBed", "sellExtraBed", v)}
        />
        <PriceRow
          label="Child w/ Bed"
          costValue={formData.costChildWithBed}
          sellValue={formData.sellChildWithBed}
          onCostChange={(v: string) => onCostChange("costChildWithBed", "sellChildWithBed", v)}
        />
        <PriceRow
          label="Child no Bed"
          costValue={formData.costChildNoBed}
          sellValue={formData.sellChildNoBed}
          onCostChange={(v: string) => onCostChange("costChildNoBed", "sellChildNoBed", v)}
        />
      </div>

      {/* Taxes */}
      <div className="grid grid-cols-2 gap-4">
        <FormField label="VAT %" hint="Nepal: 13%">
          <Input type="number" value={formData.vatPercent || "13"} onChange={(v: string) => onChange("vatPercent", v)} />
        </FormField>
        <FormField label="Service Charge %" hint="Nepal: 10%">
          <Input type="number" value={formData.serviceChargePercent || "10"} onChange={(v: string) => onChange("serviceChargePercent", v)} />
        </FormField>
      </div>

      {/* Validity */}
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Valid From">
          <Input type="date" value={formData.validFrom?.split("T")[0]} onChange={(v: string) => onChange("validFrom", v)} />
        </FormField>
        <FormField label="Valid To">
          <Input type="date" value={formData.validTo?.split("T")[0]} onChange={(v: string) => onChange("validTo", v)} />
        </FormField>
      </div>

      {/* Inclusions & Exclusions */}
      <FormField label="Inclusions">
        <TextArea value={formData.inclusions} onChange={(v: string) => onChange("inclusions", v)} placeholder="What's included in this rate..." />
      </FormField>
      <FormField label="Exclusions">
        <TextArea value={formData.exclusions} onChange={(v: string) => onChange("exclusions", v)} placeholder="What's not included..." />
      </FormField>

      {/* Notes & Status */}
      <FormField label="Internal Notes">
        <TextArea value={formData.notes} onChange={(v: string) => onChange("notes", v)} placeholder="Internal notes (not shown to clients)" />
      </FormField>
      <Checkbox checked={formData.isActive !== false} onChange={(v: boolean) => onChange("isActive", v)} label="Rate is Active" />
    </div>
  );
}

// ============================================
// TRANSPORTATION FORM
// ============================================
function TransportForm({ formData, onChange, onCostChange, onMarginChange }: any) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Vehicle Type">
          <Select
            value={formData.vehicleType}
            onChange={(v: string) => onChange("vehicleType", v)}
            options={[
              { value: "sedan", label: "Sedan" },
              { value: "suv", label: "SUV" },
              { value: "hiace", label: "Hiace Van" },
              { value: "coaster", label: "Coaster Bus" },
              { value: "bus", label: "Full Size Bus" },
              { value: "land_cruiser", label: "Land Cruiser" },
              { value: "4wd", label: "4WD Vehicle" },
            ]}
          />
        </FormField>
        <FormField label="Vehicle Name">
          <Input value={formData.vehicleName} onChange={(v: string) => onChange("vehicleName", v)} placeholder="e.g., Toyota Fortuner" />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Route From">
          <Input value={formData.routeFrom} onChange={(v: string) => onChange("routeFrom", v)} />
        </FormField>
        <FormField label="Route To">
          <Input value={formData.routeTo} onChange={(v: string) => onChange("routeTo", v)} />
        </FormField>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <FormField label="Capacity (pax)">
          <Input type="number" value={formData.capacity} onChange={(v: string) => onChange("capacity", parseInt(v))} />
        </FormField>
        <FormField label="Distance (km)">
          <Input type="number" value={formData.distanceKm} onChange={(v: string) => onChange("distanceKm", parseInt(v))} />
        </FormField>
        <FormField label="Duration (hours)">
          <Input type="number" step="0.5" value={formData.durationHours} onChange={(v: string) => onChange("durationHours", v)} />
        </FormField>
      </div>

      {/* Pricing */}
      <div className="bg-slate-900 p-4 rounded-lg space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Margin %">
            <Input type="number" value={formData.marginPercent || "50"} onChange={onMarginChange} />
          </FormField>
          <FormField label="Price Type">
            <Select
              value={formData.priceType || "per_vehicle"}
              onChange={(v: string) => onChange("priceType", v)}
              options={[
                { value: "per_vehicle", label: "Per Vehicle" },
                { value: "per_person", label: "Per Person" },
                { value: "per_day", label: "Per Day" },
              ]}
            />
          </FormField>
        </div>
        <PriceRow
          label="Price"
          costValue={formData.costPrice}
          sellValue={formData.sellPrice}
          onCostChange={(v: string) => onCostChange("costPrice", "sellPrice", v)}
        />
      </div>

      <FormField label="Inclusions">
        <TextArea value={formData.inclusions} onChange={(v: string) => onChange("inclusions", v)} />
      </FormField>
      <FormField label="Exclusions">
        <TextArea value={formData.exclusions} onChange={(v: string) => onChange("exclusions", v)} />
      </FormField>

      <Checkbox checked={formData.isActive !== false} onChange={(v: boolean) => onChange("isActive", v)} label="Rate is Active" />
    </div>
  );
}

// ============================================
// GUIDE FORM
// ============================================
function GuideForm({ formData, onChange, onCostChange, onMarginChange }: any) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Guide Type">
          <Select
            value={formData.guideType}
            onChange={(v: string) => onChange("guideType", v)}
            options={[
              { value: "city", label: "City Guide" },
              { value: "trekking", label: "Trekking Guide" },
              { value: "mountaineering", label: "Mountaineering Guide" },
              { value: "cultural", label: "Cultural Guide" },
              { value: "naturalist", label: "Naturalist Guide" },
            ]}
          />
        </FormField>
        <FormField label="Destination/Region">
          <Input value={formData.destination} onChange={(v: string) => onChange("destination", v)} />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Experience (years)">
          <Input type="number" value={formData.experienceYears} onChange={(v: string) => onChange("experienceYears", parseInt(v))} />
        </FormField>
        <FormField label="Max Group Size">
          <Input type="number" value={formData.maxGroupSize} onChange={(v: string) => onChange("maxGroupSize", parseInt(v))} />
        </FormField>
      </div>

      <FormField label="Languages (comma separated)">
        <Input
          value={Array.isArray(formData.languages) ? formData.languages.join(", ") : formData.languages}
          onChange={(v: string) => onChange("languages", v.split(",").map((s: string) => s.trim()))}
          placeholder="English, French, German"
        />
      </FormField>

      <FormField label="Specializations (comma separated)">
        <Input
          value={Array.isArray(formData.specializations) ? formData.specializations.join(", ") : formData.specializations}
          onChange={(v: string) => onChange("specializations", v.split(",").map((s: string) => s.trim()))}
          placeholder="Everest, Photography, Wildlife"
        />
      </FormField>

      {/* Pricing */}
      <div className="bg-slate-900 p-4 rounded-lg space-y-3">
        <FormField label="Margin %">
          <Input type="number" value={formData.marginPercent || "50"} onChange={onMarginChange} />
        </FormField>
        <PriceRow
          label="Per Day"
          costValue={formData.costPerDay}
          sellValue={formData.sellPerDay}
          onCostChange={(v: string) => onCostChange("costPerDay", "sellPerDay", v)}
        />
      </div>

      <FormField label="Inclusions">
        <TextArea value={formData.inclusions} onChange={(v: string) => onChange("inclusions", v)} placeholder="Guide meals, accommodation, insurance..." />
      </FormField>
      <FormField label="Exclusions">
        <TextArea value={formData.exclusions} onChange={(v: string) => onChange("exclusions", v)} />
      </FormField>

      <Checkbox checked={formData.isActive !== false} onChange={(v: boolean) => onChange("isActive", v)} label="Rate is Active" />
    </div>
  );
}

// ============================================
// PORTER FORM
// ============================================
function PorterForm({ formData, onChange, onCostChange, onMarginChange }: any) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Region">
          <Input value={formData.region} onChange={(v: string) => onChange("region", v)} placeholder="Everest Region" />
        </FormField>
        <FormField label="Max Weight (kg)">
          <Input type="number" value={formData.maxWeightKg} onChange={(v: string) => onChange("maxWeightKg", parseInt(v))} />
        </FormField>
      </div>

      <div className="bg-slate-900 p-4 rounded-lg space-y-3">
        <FormField label="Margin %">
          <Input type="number" value={formData.marginPercent || "50"} onChange={onMarginChange} />
        </FormField>
        <PriceRow
          label="Per Day"
          costValue={formData.costPerDay}
          sellValue={formData.sellPerDay}
          onCostChange={(v: string) => onCostChange("costPerDay", "sellPerDay", v)}
        />
      </div>

      <FormField label="Inclusions">
        <TextArea value={formData.inclusions} onChange={(v: string) => onChange("inclusions", v)} />
      </FormField>

      <Checkbox checked={formData.isActive !== false} onChange={(v: boolean) => onChange("isActive", v)} label="Rate is Active" />
    </div>
  );
}

// ============================================
// FLIGHT FORM
// ============================================
function FlightForm({ formData, onChange, onCostChange, onMarginChange }: any) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Airline">
          <Input value={formData.airlineName} onChange={(v: string) => onChange("airlineName", v)} />
        </FormField>
        <FormField label="Flight Sector">
          <Input value={formData.flightSector} onChange={(v: string) => onChange("flightSector", v)} placeholder="KTM-LUA" />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="From">
          <Input value={formData.departureCity} onChange={(v: string) => onChange("departureCity", v)} />
        </FormField>
        <FormField label="To">
          <Input value={formData.arrivalCity} onChange={(v: string) => onChange("arrivalCity", v)} />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Duration">
          <Input value={formData.flightDuration} onChange={(v: string) => onChange("flightDuration", v)} placeholder="35 mins" />
        </FormField>
        <FormField label="Baggage (kg)">
          <Input type="number" value={formData.baggageAllowanceKg} onChange={(v: string) => onChange("baggageAllowanceKg", parseInt(v))} />
        </FormField>
      </div>

      <div className="bg-slate-900 p-4 rounded-lg space-y-3">
        <FormField label="Margin %">
          <Input type="number" value={formData.marginPercent || "50"} onChange={onMarginChange} />
        </FormField>
        <PriceRow
          label="Per Ticket"
          costValue={formData.costPrice}
          sellValue={formData.sellPrice}
          onCostChange={(v: string) => onCostChange("costPrice", "sellPrice", v)}
        />
      </div>

      <FormField label="Inclusions">
        <TextArea value={formData.inclusions} onChange={(v: string) => onChange("inclusions", v)} />
      </FormField>

      <Checkbox checked={formData.isActive !== false} onChange={(v: boolean) => onChange("isActive", v)} label="Rate is Active" />
    </div>
  );
}

// ============================================
// HELICOPTER SHARING FORM
// ============================================
function HeliSharingForm({ formData, onChange, onCostChange, onMarginChange }: any) {
  return (
    <div className="space-y-6">
      <FormField label="Route Name">
        <Input value={formData.routeName} onChange={(v: string) => onChange("routeName", v)} placeholder="Everest Base Camp Heli Tour" />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="From">
          <Input value={formData.routeFrom} onChange={(v: string) => onChange("routeFrom", v)} />
        </FormField>
        <FormField label="To">
          <Input value={formData.routeTo} onChange={(v: string) => onChange("routeTo", v)} />
        </FormField>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <FormField label="Duration">
          <Input value={formData.flightDuration} onChange={(v: string) => onChange("flightDuration", v)} />
        </FormField>
        <FormField label="Seats Available">
          <Input type="number" value={formData.seatsAvailable} onChange={(v: string) => onChange("seatsAvailable", parseInt(v))} />
        </FormField>
        <FormField label="Min Passengers">
          <Input type="number" value={formData.minPassengers} onChange={(v: string) => onChange("minPassengers", parseInt(v))} />
        </FormField>
      </div>

      <div className="bg-slate-900 p-4 rounded-lg space-y-3">
        <FormField label="Margin %">
          <Input type="number" value={formData.marginPercent || "50"} onChange={onMarginChange} />
        </FormField>
        <PriceRow
          label="Per Seat"
          costValue={formData.costPerSeat}
          sellValue={formData.sellPerSeat}
          onCostChange={(v: string) => onCostChange("costPerSeat", "sellPerSeat", v)}
        />
      </div>

      <FormField label="Inclusions">
        <TextArea value={formData.inclusions} onChange={(v: string) => onChange("inclusions", v)} />
      </FormField>

      <Checkbox checked={formData.isActive !== false} onChange={(v: boolean) => onChange("isActive", v)} label="Rate is Active" />
    </div>
  );
}

// ============================================
// HELICOPTER CHARTER FORM
// ============================================
function HeliCharterForm({ formData, onChange, onCostChange, onMarginChange }: any) {
  return (
    <div className="space-y-6">
      <FormField label="Route Name">
        <Input value={formData.routeName} onChange={(v: string) => onChange("routeName", v)} />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="From">
          <Input value={formData.routeFrom} onChange={(v: string) => onChange("routeFrom", v)} />
        </FormField>
        <FormField label="To">
          <Input value={formData.routeTo} onChange={(v: string) => onChange("routeTo", v)} />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Duration">
          <Input value={formData.flightDuration} onChange={(v: string) => onChange("flightDuration", v)} />
        </FormField>
        <FormField label="Max Passengers">
          <Input type="number" value={formData.maxPassengers} onChange={(v: string) => onChange("maxPassengers", parseInt(v))} />
        </FormField>
      </div>

      <div className="bg-slate-900 p-4 rounded-lg space-y-3">
        <FormField label="Margin %">
          <Input type="number" value={formData.marginPercent || "50"} onChange={onMarginChange} />
        </FormField>
        <PriceRow
          label="Per Charter"
          costValue={formData.costPerCharter}
          sellValue={formData.sellPerCharter}
          onCostChange={(v: string) => onCostChange("costPerCharter", "sellPerCharter", v)}
        />
      </div>

      <FormField label="Inclusions">
        <TextArea value={formData.inclusions} onChange={(v: string) => onChange("inclusions", v)} />
      </FormField>

      <Checkbox checked={formData.isActive !== false} onChange={(v: boolean) => onChange("isActive", v)} label="Rate is Active" />
    </div>
  );
}

// ============================================
// PERMIT FORM
// ============================================
function PermitForm({ formData, onChange, onCostChange }: any) {
  return (
    <div className="space-y-6">
      <FormField label="Permit/Fee Name">
        <Input value={formData.name} onChange={(v: string) => onChange("name", v)} />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Type">
          <Select
            value={formData.type}
            onChange={(v: string) => onChange("type", v)}
            options={[
              { value: "permit", label: "Permit" },
              { value: "entrance_fee", label: "Entrance Fee" },
              { value: "visa", label: "Visa" },
              { value: "conservation", label: "Conservation Fee" },
            ]}
          />
        </FormField>
        <FormField label="Country">
          <Input value={formData.country} onChange={(v: string) => onChange("country", v)} />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Region">
          <Input value={formData.region} onChange={(v: string) => onChange("region", v)} />
        </FormField>
        <FormField label="Applicable To">
          <Select
            value={formData.applicableTo}
            onChange={(v: string) => onChange("applicableTo", v)}
            options={[
              { value: "foreigners", label: "Foreigners" },
              { value: "saarc", label: "SAARC Nationals" },
              { value: "nepali", label: "Nepali Citizens" },
              { value: "all", label: "All" },
            ]}
          />
        </FormField>
      </div>

      <div className="bg-slate-900 p-4 rounded-lg">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Cost Price">
            <Input type="number" value={formData.costPrice} onChange={(v: string) => onChange("costPrice", v)} />
          </FormField>
          <FormField label="Sell Price">
            <Input type="number" value={formData.sellPrice} onChange={(v: string) => onChange("sellPrice", v)} />
          </FormField>
        </div>
      </div>

      <FormField label="Description">
        <TextArea value={formData.description} onChange={(v: string) => onChange("description", v)} />
      </FormField>

      <Checkbox checked={formData.isActive !== false} onChange={(v: boolean) => onChange("isActive", v)} label="Rate is Active" />
    </div>
  );
}

// ============================================
// PACKAGE FORM
// ============================================
function PackageForm({ formData, onChange, onCostChange, onMarginChange }: any) {
  return (
    <div className="space-y-6">
      <FormField label="Package Name">
        <Input value={formData.name} onChange={(v: string) => onChange("name", v)} />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Package Type">
          <Select
            value={formData.packageType}
            onChange={(v: string) => onChange("packageType", v)}
            options={[
              { value: "fixed_departure_trek", label: "Fixed Departure Trek" },
              { value: "expedition", label: "Expedition" },
              { value: "tibet_tour", label: "Tibet Tour" },
              { value: "bhutan_program", label: "Bhutan Program" },
              { value: "india_program", label: "India Program" },
              { value: "multi_country", label: "Multi-Country" },
            ]}
          />
        </FormField>
        <FormField label="Country">
          <Input value={formData.country} onChange={(v: string) => onChange("country", v)} />
        </FormField>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <FormField label="Days">
          <Input type="number" value={formData.durationDays} onChange={(v: string) => onChange("durationDays", parseInt(v))} />
        </FormField>
        <FormField label="Nights">
          <Input type="number" value={formData.durationNights} onChange={(v: string) => onChange("durationNights", parseInt(v))} />
        </FormField>
        <FormField label="Difficulty">
          <Select
            value={formData.difficulty}
            onChange={(v: string) => onChange("difficulty", v)}
            options={[
              { value: "Easy", label: "Easy" },
              { value: "Moderate", label: "Moderate" },
              { value: "Challenging", label: "Challenging" },
              { value: "Extreme", label: "Extreme" },
            ]}
          />
        </FormField>
        <FormField label="Max Altitude (m)">
          <Input type="number" value={formData.maxAltitude} onChange={(v: string) => onChange("maxAltitude", parseInt(v))} />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Min Group Size">
          <Input type="number" value={formData.groupSizeMin} onChange={(v: string) => onChange("groupSizeMin", parseInt(v))} />
        </FormField>
        <FormField label="Max Group Size">
          <Input type="number" value={formData.groupSizeMax} onChange={(v: string) => onChange("groupSizeMax", parseInt(v))} />
        </FormField>
      </div>

      <FormField label="Itinerary Summary">
        <TextArea value={formData.itinerarySummary} onChange={(v: string) => onChange("itinerarySummary", v)} rows={4} />
      </FormField>

      {/* Pricing */}
      <div className="bg-slate-900 p-4 rounded-lg space-y-3">
        <FormField label="Margin %">
          <Input type="number" value={formData.marginPercent || "50"} onChange={onMarginChange} />
        </FormField>
        <PriceRow
          label="Per Person"
          costValue={formData.costPrice}
          sellValue={formData.sellPrice}
          onCostChange={(v: string) => onCostChange("costPrice", "sellPrice", v)}
        />
        <FormField label="Single Supplement">
          <Input type="number" value={formData.singleSupplement} onChange={(v: string) => onChange("singleSupplement", v)} />
        </FormField>
      </div>

      <FormField label="Inclusions">
        <TextArea value={formData.inclusions} onChange={(v: string) => onChange("inclusions", v)} rows={4} />
      </FormField>
      <FormField label="Exclusions">
        <TextArea value={formData.exclusions} onChange={(v: string) => onChange("exclusions", v)} rows={4} />
      </FormField>

      <Checkbox checked={formData.isFixedDeparture} onChange={(v: boolean) => onChange("isFixedDeparture", v)} label="Fixed Departure (has specific dates)" />

      <Checkbox checked={formData.isActive !== false} onChange={(v: boolean) => onChange("isActive", v)} label="Package is Active" />
    </div>
  );
}

// ============================================
// MISCELLANEOUS FORM
// ============================================
function MiscForm({ formData, onChange, onCostChange, onMarginChange }: any) {
  return (
    <div className="space-y-6">
      <FormField label="Service Name">
        <Input value={formData.name} onChange={(v: string) => onChange("name", v)} />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Category">
          <Select
            value={formData.category}
            onChange={(v: string) => onChange("category", v)}
            options={[
              { value: "dining", label: "Dining Experience" },
              { value: "activity", label: "Activity" },
              { value: "experience", label: "Cultural Experience" },
              { value: "rental", label: "Equipment Rental" },
              { value: "other", label: "Other" },
            ]}
          />
        </FormField>
        <FormField label="Destination">
          <Input value={formData.destination} onChange={(v: string) => onChange("destination", v)} />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Duration">
          <Input value={formData.duration} onChange={(v: string) => onChange("duration", v)} placeholder="3 hours" />
        </FormField>
        <FormField label="Min Participants">
          <Input type="number" value={formData.minParticipants} onChange={(v: string) => onChange("minParticipants", parseInt(v))} />
        </FormField>
      </div>

      <FormField label="Description">
        <TextArea value={formData.description} onChange={(v: string) => onChange("description", v)} />
      </FormField>

      {/* Pricing */}
      <div className="bg-slate-900 p-4 rounded-lg space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Margin %">
            <Input type="number" value={formData.marginPercent || "50"} onChange={onMarginChange} />
          </FormField>
          <FormField label="Price Type">
            <Select
              value={formData.priceType || "per_person"}
              onChange={(v: string) => onChange("priceType", v)}
              options={[
                { value: "per_person", label: "Per Person" },
                { value: "per_group", label: "Per Group" },
                { value: "per_hour", label: "Per Hour" },
              ]}
            />
          </FormField>
        </div>
        <PriceRow
          label="Price"
          costValue={formData.costPrice}
          sellValue={formData.sellPrice}
          onCostChange={(v: string) => onCostChange("costPrice", "sellPrice", v)}
        />
      </div>

      <FormField label="Inclusions">
        <TextArea value={formData.inclusions} onChange={(v: string) => onChange("inclusions", v)} />
      </FormField>

      <Checkbox checked={formData.isActive !== false} onChange={(v: boolean) => onChange("isActive", v)} label="Service is Active" />
    </div>
  );
}

// ============================================
// GENERIC FORM (fallback)
// ============================================
function GenericForm({ formData, onChange }: any) {
  return (
    <div className="space-y-4">
      <p className="text-slate-400">Edit form for this service type is not yet available.</p>
      <pre className="bg-slate-900 p-4 rounded text-xs overflow-auto max-h-96">
        {JSON.stringify(formData, null, 2)}
      </pre>
    </div>
  );
}