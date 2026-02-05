"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  TrendingUp,
  TrendingDown,
  Minus,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Filter,
  X,
} from "lucide-react";

type SubTab = "rates" | "comparison" | "insights";

interface CompetitorRate {
  id: number;
  competitorName: string;
  competitorUrl: string | null;
  serviceType: string;
  serviceName: string;
  destinationId: number | null;
  destinationName: string | null;
  price: string;
  currency: string;
  priceDate: string;
  travelDateStart: string | null;
  travelDateEnd: string | null;
  source: string | null;
  notes: string | null;
  createdAt: string;
}

interface ComparisonResult {
  serviceType: string;
  serviceName: string;
  destination: string;
  ourPrice: number;
  competitors: {
    name: string;
    price: number;
    priceDate: string;
    difference: number;
    differencePercent: number;
  }[];
  avgCompetitorPrice: number;
  ourPosition: "cheaper" | "similar" | "expensive";
  positionPercent: number;
}

interface Filters {
  competitors: string[];
  serviceTypes: string[];
}

const formatCurrency = (value: number | string) => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return `$${num.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

const SERVICE_TYPES = [
  "hotel",
  "package",
  "transportation",
  "guide",
  "flight",
  "helicopter",
  "permit",
  "misc",
];

export default function CompetitorTab() {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("rates");
  const [rates, setRates] = useState<CompetitorRate[]>([]);
  const [comparisons, setComparisons] = useState<ComparisonResult[]>([]);
  const [summary, setSummary] = useState<{
    totalComparisons: number;
    cheaper: number;
    similar: number;
    expensive: number;
    avgPositionPercent: number;
  } | null>(null);
  const [filters, setFilters] = useState<Filters>({ competitors: [], serviceTypes: [] });
  const [destinations, setDestinations] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRate, setEditingRate] = useState<CompetitorRate | null>(null);
  const [selectedServiceType, setSelectedServiceType] = useState<string>("");
  const [selectedCompetitor, setSelectedCompetitor] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchRates = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedServiceType) params.append("serviceType", selectedServiceType);
      if (selectedCompetitor) params.append("competitor", selectedCompetitor);

      const res = await fetch(`/api/admin/competitors?${params}`);
      const data = await res.json();
      if (data.success) {
        setRates(data.rates);
        setFilters(data.filters);
      }
    } catch (error) {
      console.error("Error fetching competitor rates:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedServiceType, selectedCompetitor]);

  const fetchComparisons = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/competitors/compare");
      const data = await res.json();
      if (data.success) {
        setComparisons(data.comparisons);
        setSummary(data.summary);
      }
    } catch (error) {
      console.error("Error fetching comparisons:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDestinations = async () => {
    try {
      const res = await fetch("/api/admin/destinations");
      const data = await res.json();
      if (data.destinations) {
        setDestinations(data.destinations);
      }
    } catch (error) {
      console.error("Error fetching destinations:", error);
    }
  };

  useEffect(() => {
    fetchDestinations();
  }, []);

  useEffect(() => {
    if (activeSubTab === "rates") {
      fetchRates();
    } else if (activeSubTab === "comparison") {
      fetchComparisons();
    }
  }, [activeSubTab, fetchRates, fetchComparisons]);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this competitor rate?")) return;
    try {
      await fetch(`/api/admin/competitors/${id}`, { method: "DELETE" });
      fetchRates();
    } catch (error) {
      console.error("Error deleting rate:", error);
    }
  };

  const filteredRates = rates.filter(
    (r) =>
      r.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.competitorName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const subTabs = [
    { key: "rates" as SubTab, label: "Competitor Rates" },
    { key: "comparison" as SubTab, label: "Price Comparison" },
    { key: "insights" as SubTab, label: "Market Insights" },
  ];

  return (
    <div className="space-y-6">
      {/* Sub-tabs */}
      <div className="flex gap-2 border-b border-slate-700 pb-4">
        {subTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveSubTab(tab.key)}
            className={`px-4 py-2 rounded-t text-sm font-medium transition-colors ${
              activeSubTab === tab.key
                ? "bg-emerald-600 text-white"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeSubTab === "rates" && (
        <RatesSection
          rates={filteredRates}
          filters={filters}
          destinations={destinations}
          loading={loading}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedServiceType={selectedServiceType}
          setSelectedServiceType={setSelectedServiceType}
          selectedCompetitor={selectedCompetitor}
          setSelectedCompetitor={setSelectedCompetitor}
          onRefresh={fetchRates}
          onAdd={() => {
            setEditingRate(null);
            setShowModal(true);
          }}
          onEdit={(rate) => {
            setEditingRate(rate);
            setShowModal(true);
          }}
          onDelete={handleDelete}
        />
      )}

      {activeSubTab === "comparison" && (
        <ComparisonSection
          comparisons={comparisons}
          summary={summary}
          loading={loading}
          onRefresh={fetchComparisons}
        />
      )}

      {activeSubTab === "insights" && (
        <InsightsSection comparisons={comparisons} summary={summary} />
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <RateModal
          rate={editingRate}
          destinations={destinations}
          onClose={() => setShowModal(false)}
          onSave={() => {
            setShowModal(false);
            fetchRates();
          }}
        />
      )}
    </div>
  );
}

// === RATES SECTION ===
function RatesSection({
  rates,
  filters,
  destinations,
  loading,
  searchQuery,
  setSearchQuery,
  selectedServiceType,
  setSelectedServiceType,
  selectedCompetitor,
  setSelectedCompetitor,
  onRefresh,
  onAdd,
  onEdit,
  onDelete,
}: {
  rates: CompetitorRate[];
  filters: Filters;
  destinations: { id: number; name: string }[];
  loading: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedServiceType: string;
  setSelectedServiceType: (t: string) => void;
  selectedCompetitor: string;
  setSelectedCompetitor: (c: string) => void;
  onRefresh: () => void;
  onAdd: () => void;
  onEdit: (rate: CompetitorRate) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search rates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-800 rounded-lg text-sm w-64"
            />
          </div>

          {/* Service Type Filter */}
          <select
            value={selectedServiceType}
            onChange={(e) => setSelectedServiceType(e.target.value)}
            className="px-3 py-2 bg-slate-800 rounded-lg text-sm"
          >
            <option value="">All Services</option>
            {filters.serviceTypes.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>

          {/* Competitor Filter */}
          <select
            value={selectedCompetitor}
            onChange={(e) => setSelectedCompetitor(e.target.value)}
            className="px-3 py-2 bg-slate-800 rounded-lg text-sm"
          >
            <option value="">All Competitors</option>
            {filters.competitors.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={onAdd}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 rounded-lg hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4" />
            Add Rate
          </button>
        </div>
      </div>

      {/* Rates Table */}
      <div className="bg-slate-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3 text-left">Competitor</th>
                <th className="px-4 py-3 text-left">Service</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-right">Price</th>
                <th className="px-4 py-3 text-center">Price Date</th>
                <th className="px-4 py-3 text-center">Source</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    Loading...
                  </td>
                </tr>
              ) : rates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    No competitor rates found. Add your first rate to start tracking.
                  </td>
                </tr>
              ) : (
                rates.map((rate) => (
                  <tr key={rate.id} className="hover:bg-slate-750">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{rate.competitorName}</span>
                        {rate.competitorUrl && (
                          <a
                            href={rate.competitorUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-blue-400"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">{rate.serviceName}</div>
                      {rate.destinationName && (
                        <div className="text-xs text-slate-400">{rate.destinationName}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-slate-700 rounded text-xs capitalize">
                        {rate.serviceType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatCurrency(rate.price)}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-slate-400">
                      {rate.priceDate}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-1 bg-slate-700 rounded text-xs">
                        {rate.source || "manual"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onEdit(rate)}
                          className="p-1 hover:bg-slate-700 rounded"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(rate.id)}
                          className="p-1 hover:bg-red-600 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// === COMPARISON SECTION ===
function ComparisonSection({
  comparisons,
  summary,
  loading,
  onRefresh,
}: {
  comparisons: ComparisonResult[];
  summary: { totalComparisons: number; cheaper: number; similar: number; expensive: number; avgPositionPercent: number } | null;
  loading: boolean;
  onRefresh: () => void;
}) {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="text-slate-400 text-xs uppercase mb-1">Total Comparisons</div>
            <div className="text-2xl font-bold text-white">{summary.totalComparisons}</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border-l-4 border-green-500">
            <div className="text-slate-400 text-xs uppercase mb-1">We're Cheaper</div>
            <div className="text-2xl font-bold text-green-400">{summary.cheaper}</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border-l-4 border-yellow-500">
            <div className="text-slate-400 text-xs uppercase mb-1">Similar</div>
            <div className="text-2xl font-bold text-yellow-400">{summary.similar}</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border-l-4 border-red-500">
            <div className="text-slate-400 text-xs uppercase mb-1">We're Expensive</div>
            <div className="text-2xl font-bold text-red-400">{summary.expensive}</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="text-slate-400 text-xs uppercase mb-1">Avg Position</div>
            <div className={`text-2xl font-bold ${summary.avgPositionPercent > 0 ? "text-red-400" : "text-green-400"}`}>
              {summary.avgPositionPercent > 0 ? "+" : ""}{summary.avgPositionPercent.toFixed(1)}%
            </div>
          </div>
        </div>
      )}

      {/* Comparison Chart */}
      {comparisons.length > 0 && (
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Price Position vs Competitors</h3>
            <button onClick={onRefresh} disabled={loading} className="p-2 hover:bg-slate-700 rounded">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={comparisons.slice(0, 15).map((c) => ({
                name: c.serviceName.length > 20 ? c.serviceName.slice(0, 20) + "..." : c.serviceName,
                position: c.positionPercent,
              }))}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `${v}%`} />
              <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={150} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155" }}
                formatter={(value: number) => [`${value.toFixed(1)}%`, "Position"]}
              />
              <Bar dataKey="position" radius={[0, 4, 4, 0]}>
                {comparisons.slice(0, 15).map((entry, index) => (
                  <Cell
                    key={index}
                    fill={
                      entry.positionPercent < -5
                        ? "#10b981"
                        : entry.positionPercent > 5
                        ? "#ef4444"
                        : "#f59e0b"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-6 mt-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded" />
              <span className="text-slate-400">We're Cheaper (&lt;-5%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded" />
              <span className="text-slate-400">Similar (-5% to +5%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded" />
              <span className="text-slate-400">We're Expensive (&gt;+5%)</span>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Comparison Table */}
      <div className="bg-slate-800 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-slate-700">
          <h3 className="font-semibold">Detailed Price Comparison</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3 text-left">Service</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-right">Our Price</th>
                <th className="px-4 py-3 text-right">Avg Competitor</th>
                <th className="px-4 py-3 text-center">Position</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    Loading comparisons...
                  </td>
                </tr>
              ) : comparisons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    No comparisons available. Add competitor rates to see how you compare.
                  </td>
                </tr>
              ) : (
                comparisons.map((comp, i) => (
                  <tr key={i} className="hover:bg-slate-750">
                    <td className="px-4 py-3">
                      <div className="font-medium">{comp.serviceName}</div>
                      <div className="text-xs text-slate-400">{comp.destination}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-slate-700 rounded text-xs capitalize">
                        {comp.serviceType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {comp.ourPrice > 0 ? formatCurrency(comp.ourPrice) : "N/A"}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-400">
                      {formatCurrency(comp.avgCompetitorPrice)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`font-medium ${
                          comp.positionPercent > 0 ? "text-red-400" : "text-green-400"
                        }`}
                      >
                        {comp.positionPercent > 0 ? "+" : ""}
                        {comp.positionPercent.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {comp.ourPosition === "cheaper" && (
                        <span className="flex items-center justify-center gap-1 text-green-400">
                          <TrendingDown className="w-4 h-4" />
                          Cheaper
                        </span>
                      )}
                      {comp.ourPosition === "similar" && (
                        <span className="flex items-center justify-center gap-1 text-yellow-400">
                          <Minus className="w-4 h-4" />
                          Similar
                        </span>
                      )}
                      {comp.ourPosition === "expensive" && (
                        <span className="flex items-center justify-center gap-1 text-red-400">
                          <TrendingUp className="w-4 h-4" />
                          Expensive
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// === INSIGHTS SECTION ===
function InsightsSection({
  comparisons,
  summary,
}: {
  comparisons: ComparisonResult[];
  summary: { totalComparisons: number; cheaper: number; similar: number; expensive: number; avgPositionPercent: number } | null;
}) {
  if (!summary || comparisons.length === 0) {
    return (
      <div className="bg-slate-800 rounded-lg p-8 text-center">
        <AlertTriangle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-300 mb-2">No Data for Insights</h3>
        <p className="text-slate-500">
          Add competitor rates and run comparisons to see market insights.
        </p>
      </div>
    );
  }

  // Find services needing attention (expensive)
  const needsAttention = comparisons
    .filter((c) => c.positionPercent > 10)
    .sort((a, b) => b.positionPercent - a.positionPercent);

  // Find competitive advantages (cheaper)
  const advantages = comparisons
    .filter((c) => c.positionPercent < -10)
    .sort((a, b) => a.positionPercent - b.positionPercent);

  // Group by service type for insights
  const byServiceType = comparisons.reduce((acc, c) => {
    if (!acc[c.serviceType]) acc[c.serviceType] = [];
    acc[c.serviceType].push(c);
    return acc;
  }, {} as Record<string, ComparisonResult[]>);

  return (
    <div className="space-y-6">
      {/* Overall Market Position */}
      <div className="bg-slate-800 rounded-lg p-6">
        <h3 className="font-semibold mb-4">Overall Market Position</h3>
        <div className="flex items-center gap-8">
          <div
            className={`text-5xl font-bold ${
              summary.avgPositionPercent < -5
                ? "text-green-400"
                : summary.avgPositionPercent > 5
                ? "text-red-400"
                : "text-yellow-400"
            }`}
          >
            {summary.avgPositionPercent > 0 ? "+" : ""}
            {summary.avgPositionPercent.toFixed(1)}%
          </div>
          <div className="text-slate-400">
            {summary.avgPositionPercent < -5 ? (
              <p>
                <CheckCircle className="inline w-5 h-5 text-green-400 mr-2" />
                Your prices are generally <strong className="text-green-400">competitive</strong> -
                averaging {Math.abs(summary.avgPositionPercent).toFixed(1)}% below competitors.
              </p>
            ) : summary.avgPositionPercent > 5 ? (
              <p>
                <AlertTriangle className="inline w-5 h-5 text-red-400 mr-2" />
                Your prices are <strong className="text-red-400">above market</strong> -
                averaging {summary.avgPositionPercent.toFixed(1)}% higher than competitors.
                Consider reviewing pricing strategy.
              </p>
            ) : (
              <p>
                <Minus className="inline w-5 h-5 text-yellow-400 mr-2" />
                Your prices are <strong className="text-yellow-400">in line with market</strong> -
                within 5% of competitor average.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Needs Attention */}
      {needsAttention.length > 0 && (
        <div className="bg-slate-800 rounded-lg p-6 border-l-4 border-red-500">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            Prices Needing Review ({needsAttention.length})
          </h3>
          <p className="text-slate-400 text-sm mb-4">
            These services are priced significantly higher than competitors. Consider adjusting
            or highlighting added value.
          </p>
          <div className="space-y-2">
            {needsAttention.slice(0, 5).map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
                <div>
                  <span className="font-medium">{item.serviceName}</span>
                  <span className="text-slate-400 text-sm ml-2">({item.serviceType})</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-slate-400">
                    Ours: {formatCurrency(item.ourPrice)} vs Comp: {formatCurrency(item.avgCompetitorPrice)}
                  </span>
                  <span className="text-red-400 font-medium">+{item.positionPercent.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Competitive Advantages */}
      {advantages.length > 0 && (
        <div className="bg-slate-800 rounded-lg p-6 border-l-4 border-green-500">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            Competitive Advantages ({advantages.length})
          </h3>
          <p className="text-slate-400 text-sm mb-4">
            These services are priced well below competitors. Consider highlighting in marketing
            or potentially increasing margins.
          </p>
          <div className="space-y-2">
            {advantages.slice(0, 5).map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
                <div>
                  <span className="font-medium">{item.serviceName}</span>
                  <span className="text-slate-400 text-sm ml-2">({item.serviceType})</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-slate-400">
                    Ours: {formatCurrency(item.ourPrice)} vs Comp: {formatCurrency(item.avgCompetitorPrice)}
                  </span>
                  <span className="text-green-400 font-medium">{item.positionPercent.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* By Service Type */}
      <div className="bg-slate-800 rounded-lg p-6">
        <h3 className="font-semibold mb-4">Position by Service Type</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(byServiceType).map(([type, items]) => {
            const avgPosition = items.reduce((sum, i) => sum + i.positionPercent, 0) / items.length;
            return (
              <div key={type} className="bg-slate-900 rounded-lg p-4">
                <div className="text-slate-400 text-xs uppercase mb-1 capitalize">{type}</div>
                <div
                  className={`text-xl font-bold ${
                    avgPosition < -5
                      ? "text-green-400"
                      : avgPosition > 5
                      ? "text-red-400"
                      : "text-yellow-400"
                  }`}
                >
                  {avgPosition > 0 ? "+" : ""}
                  {avgPosition.toFixed(1)}%
                </div>
                <div className="text-xs text-slate-500">{items.length} services</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// === RATE MODAL ===
function RateModal({
  rate,
  destinations,
  onClose,
  onSave,
}: {
  rate: CompetitorRate | null;
  destinations: { id: number; name: string }[];
  onClose: () => void;
  onSave: () => void;
}) {
  const [formData, setFormData] = useState({
    competitorName: rate?.competitorName || "",
    competitorUrl: rate?.competitorUrl || "",
    serviceType: rate?.serviceType || "hotel",
    serviceName: rate?.serviceName || "",
    destinationId: rate?.destinationId?.toString() || "",
    price: rate?.price || "",
    currency: rate?.currency || "USD",
    priceDate: rate?.priceDate || new Date().toISOString().split("T")[0],
    travelDateStart: rate?.travelDateStart || "",
    travelDateEnd: rate?.travelDateEnd || "",
    source: rate?.source || "manual",
    notes: rate?.notes || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = rate ? `/api/admin/competitors/${rate.id}` : "/api/admin/competitors";
      const method = rate ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        onSave();
      }
    } catch (error) {
      console.error("Error saving rate:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h3 className="font-semibold">{rate ? "Edit" : "Add"} Competitor Rate</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-700 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm text-slate-400 mb-1">Competitor Name *</label>
              <input
                type="text"
                required
                value={formData.competitorName}
                onChange={(e) => setFormData({ ...formData, competitorName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 rounded"
                placeholder="e.g., Adventure Trek Nepal"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm text-slate-400 mb-1">Competitor Website</label>
              <input
                type="url"
                value={formData.competitorUrl}
                onChange={(e) => setFormData({ ...formData, competitorUrl: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 rounded"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Service Type *</label>
              <select
                required
                value={formData.serviceType}
                onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 rounded"
              >
                {SERVICE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Destination</label>
              <select
                value={formData.destinationId}
                onChange={(e) => setFormData({ ...formData, destinationId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 rounded"
              >
                <option value="">Select destination</option>
                {destinations.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm text-slate-400 mb-1">Service Name *</label>
              <input
                type="text"
                required
                value={formData.serviceName}
                onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 rounded"
                placeholder="e.g., Everest Base Camp Trek"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Price *</label>
              <input
                type="number"
                required
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 rounded"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Currency</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 rounded"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="NPR">NPR</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Price Date *</label>
              <input
                type="date"
                required
                value={formData.priceDate}
                onChange={(e) => setFormData({ ...formData, priceDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 rounded"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Source</label>
              <select
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 rounded"
              >
                <option value="manual">Manual Entry</option>
                <option value="website">Website</option>
                <option value="email">Email</option>
                <option value="phone">Phone Inquiry</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Travel Date Start</label>
              <input
                type="date"
                value={formData.travelDateStart}
                onChange={(e) => setFormData({ ...formData, travelDateStart: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 rounded"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Travel Date End</label>
              <input
                type="date"
                value={formData.travelDateEnd}
                onChange={(e) => setFormData({ ...formData, travelDateEnd: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 rounded"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm text-slate-400 mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 rounded"
                rows={3}
                placeholder="Any additional notes..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-700 rounded hover:bg-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-emerald-600 rounded hover:bg-emerald-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : rate ? "Update" : "Add Rate"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
