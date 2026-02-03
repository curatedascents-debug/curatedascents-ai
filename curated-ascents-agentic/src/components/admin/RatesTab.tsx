"use client";

import { useState, useEffect, useMemo } from "react";
import RateDetailModal from "@/components/RateDetailModal";
import EditRateModal from "@/components/EditRateModal";
import AddRateModal from "@/components/AddRateModal";
import TransportationTable from "./rate-views/TransportationTable";
import GuidesTable from "./rate-views/GuidesTable";
import FlightsTable from "./rate-views/FlightsTable";
import PermitsTable from "./rate-views/PermitsTable";
import PackagesTable from "./rate-views/PackagesTable";
import HelicopterTable from "./rate-views/HelicopterTable";
import PortersTable from "./rate-views/PortersTable";
import ServiceSubNav from "./ServiceSubNav";
import ServiceStats from "./ServiceStats";

interface Rate {
  id: number;
  serviceType: string;
  [key: string]: any;
}

interface RatesTabProps {
  suppliers: any[];
  hotels: any[];
  destinations: any[];
}

export const getDisplayName = (rate: Rate): string => {
  switch (rate.serviceType) {
    case "hotel":
      return `${rate.hotelName || "Hotel"} - ${rate.roomType || ""} (${rate.mealPlan || ""})`;
    case "transportation":
      return `${rate.vehicleName || rate.vehicleType || "Vehicle"}: ${rate.routeFrom} → ${rate.routeTo}`;
    case "guide":
      return `${rate.guideType?.charAt(0).toUpperCase() + rate.guideType?.slice(1) || "Guide"} Guide - ${rate.destination || ""}`;
    case "porter":
      return `Porter - ${rate.region || ""}`;
    case "flight":
      return `${rate.airlineName || "Flight"}: ${rate.flightSector || `${rate.departureCity} → ${rate.arrivalCity}`}`;
    case "helicopter_sharing":
      return `Heli Sharing: ${rate.routeName || ""}`;
    case "helicopter_charter":
      return `Heli Charter: ${rate.routeName || ""}`;
    case "permit":
      return rate.name || "Permit";
    case "package":
      return `${rate.name || "Package"} (${rate.durationDays}D)`;
    case "miscellaneous":
      return rate.name || "Service";
    default:
      return rate.name || "Unknown";
  }
};

export const getDisplayPrice = (rate: Rate): string => {
  if (rate.sellDouble) return `$${rate.sellDouble}/night`;
  if (rate.sellPerDay) return `$${rate.sellPerDay}/day`;
  if (rate.sellPerSeat) return `$${rate.sellPerSeat}/seat`;
  if (rate.sellPerCharter) return `$${rate.sellPerCharter}/charter`;
  if (rate.sellPrice) return `$${rate.sellPrice}${rate.priceType === "per_person" ? "/pp" : ""}`;
  return "N/A";
};

const getMargin = (rate: Rate): string => {
  if (rate.marginPercent) return `${rate.marginPercent}%`;
  const cost = parseFloat(rate.costPrice || rate.costDouble || rate.costPerDay || rate.costPerSeat || "0");
  const sell = parseFloat(rate.sellPrice || rate.sellDouble || rate.sellPerDay || rate.sellPerSeat || "0");
  if (cost > 0 && sell > 0) {
    return `${(((sell - cost) / cost) * 100).toFixed(0)}%`;
  }
  return "-";
};

export const getDisplayLocation = (rate: Rate): string => {
  if (rate.destination) return rate.destination;
  if (rate.routeFrom && rate.routeTo) return `${rate.routeFrom} → ${rate.routeTo}`;
  if (rate.region) return rate.region;
  if (rate.country) return rate.country;
  return "-";
};

// Quick filter configurations per service type
const QUICK_FILTER_CONFIG: Record<string, { field: string; label: string }[]> = {
  transportation: [{ field: "vehicleType", label: "Vehicle" }],
  guide: [{ field: "guideType", label: "Type" }],
  porter: [{ field: "region", label: "Region" }],
  flight: [{ field: "airlineName", label: "Airline" }],
  permit: [{ field: "country", label: "Country" }],
  package: [
    { field: "packageType", label: "Type" },
    { field: "difficulty", label: "Difficulty" },
  ],
  hotel: [{ field: "roomType", label: "Room" }],
};

export default function RatesTab({ suppliers, hotels, destinations }: RatesTabProps) {
  const [rates, setRates] = useState<Rate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [quickFilters, setQuickFilters] = useState<Record<string, string>>({});
  const [selectedRate, setSelectedRate] = useState<Rate | null>(null);
  const [editingRate, setEditingRate] = useState<Rate | null>(null);
  const [showAddRate, setShowAddRate] = useState(false);

  useEffect(() => {
    fetchRates();
  }, []);

  // Reset quick filters when category changes
  useEffect(() => {
    setQuickFilters({});
  }, [filterCategory]);

  const fetchRates = async () => {
    try {
      const res = await fetch("/api/admin/rates");
      const data = await res.json();
      setRates(data.rates || []);
    } catch (error) {
      console.error("Error fetching rates:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate service counts for the sub-nav
  const serviceCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const rate of rates) {
      counts[rate.serviceType] = (counts[rate.serviceType] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);
  }, [rates]);

  // Get available quick filter options for current category
  const quickFilterOptions = useMemo(() => {
    const configs = QUICK_FILTER_CONFIG[filterCategory] || [];
    const options: Record<string, string[]> = {};

    const categoryRates = rates.filter(
      (r) => filterCategory === "all" || r.serviceType === filterCategory
    );

    for (const config of configs) {
      const values = categoryRates
        .map((r) => r[config.field])
        .filter((v) => v !== null && v !== undefined && v !== "");
      options[config.field] = [...new Set(values)] as string[];
    }

    return { configs, options };
  }, [rates, filterCategory]);

  const filteredRates = useMemo(() => {
    return rates.filter((rate) => {
      const displayName = getDisplayName(rate).toLowerCase();
      const matchesSearch = displayName.includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === "all" || rate.serviceType === filterCategory;

      // Apply quick filters
      let matchesQuickFilters = true;
      for (const [field, value] of Object.entries(quickFilters)) {
        if (value && rate[field] !== value) {
          matchesQuickFilters = false;
          break;
        }
      }

      return matchesSearch && matchesCategory && matchesQuickFilters;
    });
  }, [rates, searchTerm, filterCategory, quickFilters]);

  const handleEditClick = () => setEditingRate(selectedRate);

  const handleSaveEdit = (updatedRate: Rate) => {
    setRates(rates.map((r) =>
      r.serviceType === editingRate?.serviceType && r.id === editingRate?.id
        ? { ...r, ...updatedRate, serviceType: editingRate.serviceType }
        : r
    ));
    setEditingRate(null);
    setSelectedRate(null);
    fetchRates();
  };

  const handleDeleteRate = async (rate: Rate) => {
    if (!confirm(`Are you sure you want to delete this ${rate.serviceType}?`)) return;
    try {
      const response = await fetch(`/api/admin/rates/${rate.serviceType}/${rate.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete");
      setRates(rates.filter((r) => !(r.serviceType === rate.serviceType && r.id === rate.id)));
      setSelectedRate(null);
    } catch (error) {
      alert("Failed to delete rate.");
      console.error(error);
    }
  };

  const handleQuickFilterChange = (field: string, value: string) => {
    setQuickFilters((prev) => ({
      ...prev,
      [field]: value === "" ? "" : value,
    }));
  };

  const clearQuickFilters = () => {
    setQuickFilters({});
  };

  if (loading) {
    return <div className="text-center text-slate-400 py-8">Loading rates...</div>;
  }

  const hasActiveQuickFilters = Object.values(quickFilters).some((v) => v);

  return (
    <>
      {/* Service Sub-Navigation */}
      <ServiceSubNav
        activeCategory={filterCategory}
        onCategoryChange={setFilterCategory}
        serviceCounts={serviceCounts}
      />

      {/* Service Stats */}
      <ServiceStats rates={rates} activeCategory={filterCategory} />

      {/* Search and Actions */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <input
          type="text"
          placeholder="Search rates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500"
        />
        <button
          onClick={() => setShowAddRate(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors whitespace-nowrap"
        >
          + Add Rate
        </button>
      </div>

      {/* Quick Filters */}
      {quickFilterOptions.configs.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-4 items-center">
          <span className="text-sm text-slate-400">Filter by:</span>
          {quickFilterOptions.configs.map((config) => (
            <select
              key={config.field}
              value={quickFilters[config.field] || ""}
              onChange={(e) => handleQuickFilterChange(config.field, e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-500"
            >
              <option value="">All {config.label}s</option>
              {quickFilterOptions.options[config.field]?.map((opt) => (
                <option key={opt} value={opt}>
                  {opt.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          ))}
          {hasActiveQuickFilters && (
            <button
              onClick={clearQuickFilters}
              className="text-sm text-slate-400 hover:text-white underline"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Results count */}
      <div className="text-sm text-slate-400 mb-4">
        Showing {filteredRates.length} of {rates.length} rates
        {filterCategory !== "all" && ` in ${filterCategory.replace("_", " ")}`}
      </div>

      {/* Specialized table views by service type */}
      {filterCategory === "transportation" ? (
        <TransportationTable rates={filteredRates} onSelect={setSelectedRate} />
      ) : filterCategory === "guide" ? (
        <GuidesTable rates={filteredRates} onSelect={setSelectedRate} />
      ) : filterCategory === "porter" ? (
        <PortersTable rates={filteredRates} onSelect={setSelectedRate} />
      ) : filterCategory === "flight" ? (
        <FlightsTable rates={filteredRates} onSelect={setSelectedRate} />
      ) : filterCategory === "permit" ? (
        <PermitsTable rates={filteredRates} onSelect={setSelectedRate} />
      ) : filterCategory === "package" ? (
        <PackagesTable rates={filteredRates} onSelect={setSelectedRate} />
      ) : filterCategory === "helicopter_sharing" || filterCategory === "helicopter_charter" ? (
        <HelicopterTable rates={filteredRates} onSelect={setSelectedRate} />
      ) : (
        <div className="bg-slate-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-700">
              <tr>
                <th className="text-left p-4 font-medium">Service</th>
                <th className="text-left p-4 font-medium">Type</th>
                <th className="text-left p-4 font-medium">Location</th>
                <th className="text-left p-4 font-medium">Sell Price</th>
                <th className="text-left p-4 font-medium">Margin</th>
                <th className="text-left p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredRates.map((rate, index) => (
                <tr
                  key={`${rate.serviceType}-${rate.id}-${index}`}
                  className="border-t border-slate-700 hover:bg-slate-700 cursor-pointer transition-colors"
                  onClick={() => setSelectedRate(rate)}
                >
                  <td className="p-4">
                    <div className="font-medium">{getDisplayName(rate)}</div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-slate-600 rounded text-sm capitalize">
                      {rate.serviceType?.replace("_", " ")}
                    </span>
                  </td>
                  <td className="p-4 text-slate-300">{getDisplayLocation(rate)}</td>
                  <td className="p-4 text-emerald-400 font-medium">{getDisplayPrice(rate)}</td>
                  <td className="p-4 text-yellow-400 font-medium">{getMargin(rate)}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-sm ${rate.isActive !== false ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"}`}>
                      {rate.isActive !== false ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredRates.length === 0 && (
            <div className="p-8 text-center text-slate-400">No rates found.</div>
          )}
        </div>
      )}

      {selectedRate && !editingRate && (
        <RateDetailModal
          rate={selectedRate}
          onClose={() => setSelectedRate(null)}
          onEdit={handleEditClick}
          onDelete={() => handleDeleteRate(selectedRate)}
        />
      )}

      {editingRate && (
        <EditRateModal
          rate={editingRate}
          onClose={() => setEditingRate(null)}
          onSave={handleSaveEdit}
        />
      )}

      {showAddRate && (
        <AddRateModal
          suppliers={suppliers}
          hotels={hotels}
          destinations={destinations}
          onClose={() => setShowAddRate(false)}
          onSave={() => {
            setShowAddRate(false);
            fetchRates();
          }}
        />
      )}
    </>
  );
}
