"use client";

import { useState } from "react";

interface AddRateModalProps {
  suppliers: any[];
  hotels: any[];
  destinations: any[];
  onClose: () => void;
  onSave: () => void;
}

export default function AddRateModal({
  suppliers,
  hotels,
  destinations,
  onClose,
  onSave,
}: AddRateModalProps) {
  const [serviceType, setServiceType] = useState("");
  const [formData, setFormData] = useState<any>({});
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

    // Recalculate sell prices
    if (formData.costPrice) updates.sellPrice = calculateSellPrice(formData.costPrice, margin);
    if (formData.costPerDay) updates.sellPerDay = calculateSellPrice(formData.costPerDay, margin);
    if (formData.costPerSeat) updates.sellPerSeat = calculateSellPrice(formData.costPerSeat, margin);
    if (formData.costPerCharter) updates.sellPerCharter = calculateSellPrice(formData.costPerCharter, margin);
    if (formData.costDouble) updates.sellDouble = calculateSellPrice(formData.costDouble, margin);
    if (formData.costSingle) updates.sellSingle = calculateSellPrice(formData.costSingle, margin);

    setFormData((prev: any) => ({ ...prev, ...updates }));
  };

  const handleSubmit = async () => {
    if (!serviceType) {
      setError("Please select a service type");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/admin/rates/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceType, ...formData }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create rate");
      }

      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create rate");
    } finally {
      setSaving(false);
    }
  };

  const serviceTypes = [
    { value: "hotel", label: "🏨 Hotel Room Rate" },
    { value: "transportation", label: "🚗 Transportation" },
    { value: "guide", label: "🧭 Guide" },
    { value: "porter", label: "🎒 Porter" },
    { value: "flight", label: "✈️ Domestic Flight" },
    { value: "helicopter_sharing", label: "🚁 Helicopter Sharing" },
    { value: "helicopter_charter", label: "🚁 Helicopter Charter" },
    { value: "permit", label: "📋 Permit / Fee" },
    { value: "package", label: "📦 Package" },
    { value: "miscellaneous", label: "🎯 Miscellaneous Service" },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <div>
            <h2 className="text-xl font-bold text-white">Add New Rate</h2>
            <p className="text-slate-400 text-sm">Create a new rate for any service type</p>
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Service Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Select Service Type *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {serviceTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => {
                    setServiceType(type.value);
                    setFormData({ marginPercent: "50", isActive: true });
                  }}
                  className={`p-3 rounded text-left transition-colors ${
                    serviceType === type.value
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Form Based on Service Type */}
          {serviceType && (
            <div className="space-y-4 border-t border-slate-700 pt-6">
              {/* HOTEL ROOM RATE */}
              {serviceType === "hotel" && (
                <>
                  <h3 className="text-lg font-semibold text-emerald-400">Hotel Room Rate Details</h3>
                  
                  <FormField label="Select Hotel *">
                    <Select
                      value={formData.hotelId || ""}
                      onChange={(v: string) => handleChange("hotelId", v)}
                      options={[
                        { value: "", label: "Select hotel..." },
                        ...hotels.map((h) => ({ value: h.id.toString(), label: h.name })),
                      ]}
                    />
                  </FormField>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Room Type *">
                      <Input
                        value={formData.roomType}
                        onChange={(v: string) => handleChange("roomType", v)}
                        placeholder="e.g., Deluxe, Suite"
                      />
                    </FormField>
                    <FormField label="Meal Plan *">
                      <Select
                        value={formData.mealPlan || ""}
                        onChange={(v: string) => handleChange("mealPlan", v)}
                        options={[
                          { value: "", label: "Select..." },
                          { value: "EP", label: "EP - Room Only" },
                          { value: "CP", label: "CP - Bed & Breakfast" },
                          { value: "MAP", label: "MAP - Half Board" },
                          { value: "AP", label: "AP - Full Board" },
                          { value: "AI", label: "AI - All Inclusive" },
                        ]}
                      />
                    </FormField>
                  </div>

                  <FormField label="Margin %">
                    <Input
                      type="number"
                      value={formData.marginPercent || "50"}
                      onChange={handleMarginChange}
                    />
                  </FormField>

                  <div className="bg-slate-900 p-4 rounded-lg space-y-3">
                    <p className="text-sm text-slate-400">Pricing per night (Cost → Sell auto-calculated)</p>
                    <PriceRow
                      label="Single"
                      costValue={formData.costSingle}
                      sellValue={formData.sellSingle}
                      onCostChange={(v: string) => handleCostChange("costSingle", "sellSingle", v)}
                    />
                    <PriceRow
                      label="Double"
                      costValue={formData.costDouble}
                      sellValue={formData.sellDouble}
                      onCostChange={(v: string) => handleCostChange("costDouble", "sellDouble", v)}
                    />
                    <PriceRow
                      label="Extra Bed"
                      costValue={formData.costExtraBed}
                      sellValue={formData.sellExtraBed}
                      onCostChange={(v: string) => handleCostChange("costExtraBed", "sellExtraBed", v)}
                    />
                  </div>

                  <FormField label="Inclusions">
                    <TextArea
                      value={formData.inclusions}
                      onChange={(v: string) => handleChange("inclusions", v)}
                      placeholder="What's included..."
                    />
                  </FormField>
                </>
              )}

              {/* TRANSPORTATION */}
              {serviceType === "transportation" && (
                <>
                  <h3 className="text-lg font-semibold text-emerald-400">Transportation Details</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Vehicle Type *">
                      <Select
                        value={formData.vehicleType || ""}
                        onChange={(v: string) => handleChange("vehicleType", v)}
                        options={[
                          { value: "", label: "Select..." },
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
                      <Input
                        value={formData.vehicleName}
                        onChange={(v: string) => handleChange("vehicleName", v)}
                        placeholder="e.g., Toyota Fortuner"
                      />
                    </FormField>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Route From *">
                      <Input
                        value={formData.routeFrom}
                        onChange={(v: string) => handleChange("routeFrom", v)}
                        placeholder="e.g., Kathmandu"
                      />
                    </FormField>
                    <FormField label="Route To *">
                      <Input
                        value={formData.routeTo}
                        onChange={(v: string) => handleChange("routeTo", v)}
                        placeholder="e.g., Pokhara"
                      />
                    </FormField>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <FormField label="Capacity (pax)">
                      <Input
                        type="number"
                        value={formData.capacity}
                        onChange={(v: string) => handleChange("capacity", v)}
                      />
                    </FormField>
                    <FormField label="Distance (km)">
                      <Input
                        type="number"
                        value={formData.distanceKm}
                        onChange={(v: string) => handleChange("distanceKm", v)}
                      />
                    </FormField>
                    <FormField label="Duration (hrs)">
                      <Input
                        type="number"
                        step="0.5"
                        value={formData.durationHours}
                        onChange={(v: string) => handleChange("durationHours", v)}
                      />
                    </FormField>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Margin %">
                      <Input type="number" value={formData.marginPercent || "50"} onChange={handleMarginChange} />
                    </FormField>
                    <FormField label="Price Type">
                      <Select
                        value={formData.priceType || "per_vehicle"}
                        onChange={(v: string) => handleChange("priceType", v)}
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
                    onCostChange={(v: string) => handleCostChange("costPrice", "sellPrice", v)}
                  />

                  <FormField label="Inclusions">
                    <TextArea
                      value={formData.inclusions}
                      onChange={(v: string) => handleChange("inclusions", v)}
                      placeholder="Fuel, driver, tolls..."
                    />
                  </FormField>
                </>
              )}

              {/* GUIDE */}
              {serviceType === "guide" && (
                <>
                  <h3 className="text-lg font-semibold text-emerald-400">Guide Details</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Guide Type *">
                      <Select
                        value={formData.guideType || ""}
                        onChange={(v: string) => handleChange("guideType", v)}
                        options={[
                          { value: "", label: "Select..." },
                          { value: "city", label: "City Guide" },
                          { value: "trekking", label: "Trekking Guide" },
                          { value: "mountaineering", label: "Mountaineering Guide" },
                          { value: "cultural", label: "Cultural Guide" },
                          { value: "naturalist", label: "Naturalist Guide" },
                        ]}
                      />
                    </FormField>
                    <FormField label="Destination/Region *">
                      <Input
                        value={formData.destination}
                        onChange={(v: string) => handleChange("destination", v)}
                        placeholder="e.g., Kathmandu, Everest Region"
                      />
                    </FormField>
                  </div>

                  <FormField label="Languages (comma separated)">
                    <Input
                      value={formData.languagesText || ""}
                      onChange={(v: string) => {
                        handleChange("languagesText", v);
                        handleChange("languages", v.split(",").map((s: string) => s.trim()).filter(Boolean));
                      }}
                      placeholder="English, French, German"
                    />
                  </FormField>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Margin %">
                      <Input type="number" value={formData.marginPercent || "50"} onChange={handleMarginChange} />
                    </FormField>
                    <FormField label="Max Group Size">
                      <Input
                        type="number"
                        value={formData.maxGroupSize}
                        onChange={(v: string) => handleChange("maxGroupSize", v)}
                      />
                    </FormField>
                  </div>

                  <PriceRow
                    label="Per Day"
                    costValue={formData.costPerDay}
                    sellValue={formData.sellPerDay}
                    onCostChange={(v: string) => handleCostChange("costPerDay", "sellPerDay", v)}
                  />

                  <FormField label="Inclusions">
                    <TextArea
                      value={formData.inclusions}
                      onChange={(v: string) => handleChange("inclusions", v)}
                      placeholder="Guide meals, accommodation, insurance..."
                    />
                  </FormField>
                </>
              )}

              {/* PACKAGE */}
              {serviceType === "package" && (
                <>
                  <h3 className="text-lg font-semibold text-emerald-400">Package Details</h3>
                  
                  <FormField label="Package Name *">
                    <Input
                      value={formData.name}
                      onChange={(v: string) => handleChange("name", v)}
                      placeholder="e.g., Everest Base Camp Trek 14D"
                    />
                  </FormField>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Package Type *">
                      <Select
                        value={formData.packageType || ""}
                        onChange={(v: string) => handleChange("packageType", v)}
                        options={[
                          { value: "", label: "Select..." },
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
                      <Select
                        value={formData.country || ""}
                        onChange={(v: string) => handleChange("country", v)}
                        options={[
                          { value: "", label: "Select..." },
                          { value: "Nepal", label: "Nepal" },
                          { value: "Tibet", label: "Tibet" },
                          { value: "Bhutan", label: "Bhutan" },
                          { value: "India", label: "India" },
                        ]}
                      />
                    </FormField>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <FormField label="Days">
                      <Input
                        type="number"
                        value={formData.durationDays}
                        onChange={(v: string) => handleChange("durationDays", v)}
                      />
                    </FormField>
                    <FormField label="Nights">
                      <Input
                        type="number"
                        value={formData.durationNights}
                        onChange={(v: string) => handleChange("durationNights", v)}
                      />
                    </FormField>
                    <FormField label="Difficulty">
                      <Select
                        value={formData.difficulty || ""}
                        onChange={(v: string) => handleChange("difficulty", v)}
                        options={[
                          { value: "", label: "Select..." },
                          { value: "Easy", label: "Easy" },
                          { value: "Moderate", label: "Moderate" },
                          { value: "Challenging", label: "Challenging" },
                          { value: "Extreme", label: "Extreme" },
                        ]}
                      />
                    </FormField>
                    <FormField label="Max Altitude (m)">
                      <Input
                        type="number"
                        value={formData.maxAltitude}
                        onChange={(v: string) => handleChange("maxAltitude", v)}
                      />
                    </FormField>
                  </div>

                  <FormField label="Itinerary Summary">
                    <TextArea
                      value={formData.itinerarySummary}
                      onChange={(v: string) => handleChange("itinerarySummary", v)}
                      placeholder="Brief overview of the itinerary..."
                      rows={3}
                    />
                  </FormField>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Margin %">
                      <Input type="number" value={formData.marginPercent || "50"} onChange={handleMarginChange} />
                    </FormField>
                    <FormField label="Single Supplement">
                      <Input
                        type="number"
                        value={formData.singleSupplement}
                        onChange={(v: string) => handleChange("singleSupplement", v)}
                        placeholder="0.00"
                      />
                    </FormField>
                  </div>

                  <PriceRow
                    label="Per Person"
                    costValue={formData.costPrice}
                    sellValue={formData.sellPrice}
                    onCostChange={(v: string) => handleCostChange("costPrice", "sellPrice", v)}
                  />

                  <FormField label="Inclusions">
                    <TextArea
                      value={formData.inclusions}
                      onChange={(v: string) => handleChange("inclusions", v)}
                      placeholder="What's included in the package..."
                      rows={3}
                    />
                  </FormField>

                  <FormField label="Exclusions">
                    <TextArea
                      value={formData.exclusions}
                      onChange={(v: string) => handleChange("exclusions", v)}
                      placeholder="What's not included..."
                      rows={3}
                    />
                  </FormField>
                </>
              )}

              {/* MISCELLANEOUS */}
              {serviceType === "miscellaneous" && (
                <>
                  <h3 className="text-lg font-semibold text-emerald-400">Miscellaneous Service Details</h3>
                  
                  <FormField label="Service Name *">
                    <Input
                      value={formData.name}
                      onChange={(v: string) => handleChange("name", v)}
                      placeholder="e.g., Nepalese Dinner with Cultural Show"
                    />
                  </FormField>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Category *">
                      <Select
                        value={formData.category || ""}
                        onChange={(v: string) => handleChange("category", v)}
                        options={[
                          { value: "", label: "Select..." },
                          { value: "dining", label: "Dining Experience" },
                          { value: "activity", label: "Activity" },
                          { value: "experience", label: "Cultural Experience" },
                          { value: "rental", label: "Equipment Rental" },
                          { value: "other", label: "Other" },
                        ]}
                      />
                    </FormField>
                    <FormField label="Destination">
                      <Input
                        value={formData.destination}
                        onChange={(v: string) => handleChange("destination", v)}
                        placeholder="e.g., Kathmandu"
                      />
                    </FormField>
                  </div>

                  <FormField label="Description">
                    <TextArea
                      value={formData.description}
                      onChange={(v: string) => handleChange("description", v)}
                      placeholder="Service description..."
                    />
                  </FormField>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Duration">
                      <Input
                        value={formData.duration}
                        onChange={(v: string) => handleChange("duration", v)}
                        placeholder="e.g., 3 hours"
                      />
                    </FormField>
                    <FormField label="Price Type">
                      <Select
                        value={formData.priceType || "per_person"}
                        onChange={(v: string) => handleChange("priceType", v)}
                        options={[
                          { value: "per_person", label: "Per Person" },
                          { value: "per_group", label: "Per Group" },
                          { value: "per_hour", label: "Per Hour" },
                        ]}
                      />
                    </FormField>
                  </div>

                  <FormField label="Margin %">
                    <Input type="number" value={formData.marginPercent || "50"} onChange={handleMarginChange} />
                  </FormField>

                  <PriceRow
                    label="Price"
                    costValue={formData.costPrice}
                    sellValue={formData.sellPrice}
                    onCostChange={(v: string) => handleCostChange("costPrice", "sellPrice", v)}
                  />

                  <FormField label="Inclusions">
                    <TextArea
                      value={formData.inclusions}
                      onChange={(v: string) => handleChange("inclusions", v)}
                      placeholder="What's included..."
                    />
                  </FormField>
                </>
              )}

              {/* PORTER */}
              {serviceType === "porter" && (
                <>
                  <h3 className="text-lg font-semibold text-emerald-400">Porter Details</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Region *">
                      <Input
                        value={formData.region}
                        onChange={(v: string) => handleChange("region", v)}
                        placeholder="e.g., Everest Region"
                      />
                    </FormField>
                    <FormField label="Max Weight (kg)">
                      <Input
                        type="number"
                        value={formData.maxWeightKg || "25"}
                        onChange={(v: string) => handleChange("maxWeightKg", v)}
                      />
                    </FormField>
                  </div>

                  <FormField label="Margin %">
                    <Input type="number" value={formData.marginPercent || "50"} onChange={handleMarginChange} />
                  </FormField>

                  <PriceRow
                    label="Per Day"
                    costValue={formData.costPerDay}
                    sellValue={formData.sellPerDay}
                    onCostChange={(v: string) => handleCostChange("costPerDay", "sellPerDay", v)}
                  />

                  <FormField label="Inclusions">
                    <TextArea
                      value={formData.inclusions}
                      onChange={(v: string) => handleChange("inclusions", v)}
                      placeholder="Porter meals, accommodation, insurance..."
                    />
                  </FormField>
                </>
              )}

              {/* FLIGHT */}
              {serviceType === "flight" && (
                <>
                  <h3 className="text-lg font-semibold text-emerald-400">Domestic Flight Details</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Airline *">
                      <Input
                        value={formData.airlineName}
                        onChange={(v: string) => handleChange("airlineName", v)}
                        placeholder="e.g., Buddha Air"
                      />
                    </FormField>
                    <FormField label="Sector Code">
                      <Input
                        value={formData.flightSector}
                        onChange={(v: string) => handleChange("flightSector", v)}
                        placeholder="e.g., KTM-LUA"
                      />
                    </FormField>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="From *">
                      <Input
                        value={formData.departureCity}
                        onChange={(v: string) => handleChange("departureCity", v)}
                        placeholder="e.g., Kathmandu"
                      />
                    </FormField>
                    <FormField label="To *">
                      <Input
                        value={formData.arrivalCity}
                        onChange={(v: string) => handleChange("arrivalCity", v)}
                        placeholder="e.g., Lukla"
                      />
                    </FormField>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Duration">
                      <Input
                        value={formData.flightDuration}
                        onChange={(v: string) => handleChange("flightDuration", v)}
                        placeholder="e.g., 35 mins"
                      />
                    </FormField>
                    <FormField label="Baggage (kg)">
                      <Input
                        type="number"
                        value={formData.baggageAllowanceKg}
                        onChange={(v: string) => handleChange("baggageAllowanceKg", v)}
                      />
                    </FormField>
                  </div>

                  <FormField label="Margin %">
                    <Input type="number" value={formData.marginPercent || "50"} onChange={handleMarginChange} />
                  </FormField>

                  <PriceRow
                    label="Per Ticket"
                    costValue={formData.costPrice}
                    sellValue={formData.sellPrice}
                    onCostChange={(v: string) => handleCostChange("costPrice", "sellPrice", v)}
                  />

                  <FormField label="Inclusions">
                    <TextArea
                      value={formData.inclusions}
                      onChange={(v: string) => handleChange("inclusions", v)}
                      placeholder="Baggage, taxes..."
                    />
                  </FormField>
                </>
              )}

              {/* HELICOPTER SHARING */}
              {serviceType === "helicopter_sharing" && (
                <>
                  <h3 className="text-lg font-semibold text-emerald-400">Helicopter Sharing Details</h3>
                  
                  <FormField label="Route Name *">
                    <Input
                      value={formData.routeName}
                      onChange={(v: string) => handleChange("routeName", v)}
                      placeholder="e.g., Everest Base Camp Heli Tour"
                    />
                  </FormField>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="From">
                      <Input
                        value={formData.routeFrom}
                        onChange={(v: string) => handleChange("routeFrom", v)}
                        placeholder="e.g., Kathmandu"
                      />
                    </FormField>
                    <FormField label="To">
                      <Input
                        value={formData.routeTo}
                        onChange={(v: string) => handleChange("routeTo", v)}
                        placeholder="e.g., Everest Base Camp"
                      />
                    </FormField>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <FormField label="Duration">
                      <Input
                        value={formData.flightDuration}
                        onChange={(v: string) => handleChange("flightDuration", v)}
                        placeholder="e.g., 4-5 hours"
                      />
                    </FormField>
                    <FormField label="Seats Available">
                      <Input
                        type="number"
                        value={formData.seatsAvailable}
                        onChange={(v: string) => handleChange("seatsAvailable", v)}
                      />
                    </FormField>
                    <FormField label="Min Passengers">
                      <Input
                        type="number"
                        value={formData.minPassengers}
                        onChange={(v: string) => handleChange("minPassengers", v)}
                      />
                    </FormField>
                  </div>

                  <FormField label="Margin %">
                    <Input type="number" value={formData.marginPercent || "50"} onChange={handleMarginChange} />
                  </FormField>

                  <PriceRow
                    label="Per Seat"
                    costValue={formData.costPerSeat}
                    sellValue={formData.sellPerSeat}
                    onCostChange={(v: string) => handleCostChange("costPerSeat", "sellPerSeat", v)}
                  />

                  <FormField label="Inclusions">
                    <TextArea
                      value={formData.inclusions}
                      onChange={(v: string) => handleChange("inclusions", v)}
                      placeholder="Landing fees, permits, breakfast..."
                    />
                  </FormField>
                </>
              )}

              {/* HELICOPTER CHARTER */}
              {serviceType === "helicopter_charter" && (
                <>
                  <h3 className="text-lg font-semibold text-emerald-400">Helicopter Charter Details</h3>
                  
                  <FormField label="Route Name *">
                    <Input
                      value={formData.routeName}
                      onChange={(v: string) => handleChange("routeName", v)}
                      placeholder="e.g., Everest Base Camp Charter"
                    />
                  </FormField>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="From">
                      <Input
                        value={formData.routeFrom}
                        onChange={(v: string) => handleChange("routeFrom", v)}
                      />
                    </FormField>
                    <FormField label="To">
                      <Input
                        value={formData.routeTo}
                        onChange={(v: string) => handleChange("routeTo", v)}
                      />
                    </FormField>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Duration">
                      <Input
                        value={formData.flightDuration}
                        onChange={(v: string) => handleChange("flightDuration", v)}
                      />
                    </FormField>
                    <FormField label="Max Passengers">
                      <Input
                        type="number"
                        value={formData.maxPassengers}
                        onChange={(v: string) => handleChange("maxPassengers", v)}
                      />
                    </FormField>
                  </div>

                  <FormField label="Margin %">
                    <Input type="number" value={formData.marginPercent || "50"} onChange={handleMarginChange} />
                  </FormField>

                  <PriceRow
                    label="Per Charter"
                    costValue={formData.costPerCharter}
                    sellValue={formData.sellPerCharter}
                    onCostChange={(v: string) => handleCostChange("costPerCharter", "sellPerCharter", v)}
                  />

                  <FormField label="Inclusions">
                    <TextArea
                      value={formData.inclusions}
                      onChange={(v: string) => handleChange("inclusions", v)}
                    />
                  </FormField>
                </>
              )}

              {/* PERMIT */}
              {serviceType === "permit" && (
                <>
                  <h3 className="text-lg font-semibold text-emerald-400">Permit / Fee Details</h3>
                  
                  <FormField label="Permit Name *">
                    <Input
                      value={formData.name}
                      onChange={(v: string) => handleChange("name", v)}
                      placeholder="e.g., TIMS Card, Sagarmatha Permit"
                    />
                  </FormField>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Type *">
                      <Select
                        value={formData.type || ""}
                        onChange={(v: string) => handleChange("type", v)}
                        options={[
                          { value: "", label: "Select..." },
                          { value: "permit", label: "Permit" },
                          { value: "entrance_fee", label: "Entrance Fee" },
                          { value: "visa", label: "Visa" },
                          { value: "conservation", label: "Conservation Fee" },
                        ]}
                      />
                    </FormField>
                    <FormField label="Country">
                      <Select
                        value={formData.country || ""}
                        onChange={(v: string) => handleChange("country", v)}
                        options={[
                          { value: "", label: "Select..." },
                          { value: "Nepal", label: "Nepal" },
                          { value: "Tibet", label: "Tibet" },
                          { value: "Bhutan", label: "Bhutan" },
                          { value: "India", label: "India" },
                        ]}
                      />
                    </FormField>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Region">
                      <Input
                        value={formData.region}
                        onChange={(v: string) => handleChange("region", v)}
                        placeholder="e.g., Everest, Annapurna"
                      />
                    </FormField>
                    <FormField label="Applicable To">
                      <Select
                        value={formData.applicableTo || ""}
                        onChange={(v: string) => handleChange("applicableTo", v)}
                        options={[
                          { value: "", label: "Select..." },
                          { value: "foreigners", label: "Foreigners" },
                          { value: "saarc", label: "SAARC Nationals" },
                          { value: "nepali", label: "Nepali Citizens" },
                          { value: "all", label: "All" },
                        ]}
                      />
                    </FormField>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Cost Price">
                      <Input
                        type="number"
                        value={formData.costPrice}
                        onChange={(v: string) => handleChange("costPrice", v)}
                      />
                    </FormField>
                    <FormField label="Sell Price">
                      <Input
                        type="number"
                        value={formData.sellPrice}
                        onChange={(v: string) => handleChange("sellPrice", v)}
                      />
                    </FormField>
                  </div>

                  <FormField label="Description">
                    <TextArea
                      value={formData.description}
                      onChange={(v: string) => handleChange("description", v)}
                    />
                  </FormField>
                </>
              )}

              {/* Common: Active Status */}
              <div className="pt-4 border-t border-slate-700">
                <Checkbox
                  checked={formData.isActive !== false}
                  onChange={(v: boolean) => handleChange("isActive", v)}
                  label="Rate is Active"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 flex justify-end gap-2 bg-slate-800">
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
            disabled={saving || !serviceType}
          >
            {saving ? "Creating..." : "Create Rate"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function FormField({ label, children }: { label: string; children: React.ReactNode }) {
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

function PriceRow({ label, costValue, sellValue, onCostChange }: any) {
  const cost = parseFloat(costValue) || 0;
  const sell = parseFloat(sellValue) || 0;
  const margin = cost > 0 ? ((sell - cost) / cost * 100).toFixed(1) : "0";

  return (
    <div className="grid grid-cols-4 gap-3 items-center bg-slate-900 p-3 rounded">
      <span className="text-slate-400 text-sm">{label}</span>
      <div>
        <Input type="number" value={costValue} onChange={onCostChange} placeholder="Cost" />
      </div>
      <div>
        <Input
          type="number"
          value={sellValue}
          onChange={() => {}}
          placeholder="Sell"
          disabled
          className="bg-slate-800 opacity-75"
        />
      </div>
      <div className="text-yellow-400 text-sm font-medium text-center">{margin}%</div>
    </div>
  );
}
