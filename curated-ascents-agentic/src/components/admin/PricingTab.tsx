"use client";

import { useState, useEffect } from "react";

interface PricingRule {
  id: number;
  name: string;
  description?: string;
  ruleType: string;
  serviceType?: string;
  adjustmentType: string;
  adjustmentValue: string;
  minPrice?: string;
  maxPrice?: string;
  validFrom?: string;
  validTo?: string;
  priority: number;
  isActive: boolean;
  isAutoApply: boolean;
  conditions?: Record<string, unknown>;
  createdAt: string;
}

interface DemandMetric {
  id: number;
  metricDate: string;
  serviceType?: string;
  destinationId?: number;
  demandScore: string;
  searchCount: number;
  inquiryCount: number;
  quotesGenerated: number;
  bookingsConfirmed: number;
  conversionRate?: string;
  occupancyRate?: string;
}

interface SimulationResult {
  date: string;
  basePrice: number;
  finalPrice: number;
  appliedRules: Array<{
    ruleName: string;
    ruleType: string;
    adjustmentValue: number;
    priceAfterRule: number;
  }>;
  demandScore?: number;
}

export default function PricingTab() {
  const [activeSubTab, setActiveSubTab] = useState<"rules" | "demand" | "simulate" | "analytics">("rules");
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [metrics, setMetrics] = useState<DemandMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [editingRule, setEditingRule] = useState<PricingRule | null>(null);

  // Simulation state
  const [simForm, setSimForm] = useState({
    serviceType: "hotel",
    basePrice: "100",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    paxCount: "2",
    loyaltyTier: "",
  });
  const [simResults, setSimResults] = useState<SimulationResult[]>([]);
  const [simLoading, setSimLoading] = useState(false);

  // Analytics state
  const [analytics, setAnalytics] = useState<{
    totalAdjustments: number;
    averageAdjustment: number;
    ruleBreakdown: Record<string, { count: number; totalImpact: number }>;
  } | null>(null);

  useEffect(() => {
    if (activeSubTab === "rules") fetchRules();
    if (activeSubTab === "demand") fetchDemandMetrics();
    if (activeSubTab === "analytics") fetchAnalytics();
  }, [activeSubTab]);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/pricing/rules");
      const data = await res.json();
      setRules(data.rules || []);
    } catch (error) {
      console.error("Error fetching pricing rules:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDemandMetrics = async () => {
    setLoading(true);
    try {
      const endDate = new Date().toISOString().split("T")[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      const res = await fetch(`/api/admin/pricing/demand?startDate=${startDate}&endDate=${endDate}`);
      const data = await res.json();
      setMetrics(data.metrics || []);
    } catch (error) {
      console.error("Error fetching demand metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const endDate = new Date().toISOString().split("T")[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      const res = await fetch(`/api/admin/pricing/analytics?startDate=${startDate}&endDate=${endDate}`);
      const data = await res.json();
      setAnalytics(data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const runSimulation = async () => {
    setSimLoading(true);
    try {
      const res = await fetch("/api/admin/pricing/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceType: simForm.serviceType,
          serviceId: 1,
          basePrice: parseFloat(simForm.basePrice),
          startDate: simForm.startDate,
          endDate: simForm.endDate,
          paxCount: parseInt(simForm.paxCount) || 1,
          loyaltyTier: simForm.loyaltyTier || undefined,
        }),
      });
      const data = await res.json();
      setSimResults(data.results || []);
    } catch (error) {
      console.error("Error running simulation:", error);
    } finally {
      setSimLoading(false);
    }
  };

  const toggleRuleStatus = async (ruleId: number, currentStatus: boolean) => {
    try {
      await fetch(`/api/admin/pricing/rules/${ruleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      fetchRules();
    } catch (error) {
      console.error("Error updating rule:", error);
    }
  };

  const deleteRule = async (ruleId: number) => {
    if (!confirm("Are you sure you want to delete this pricing rule?")) return;
    try {
      await fetch(`/api/admin/pricing/rules/${ruleId}`, { method: "DELETE" });
      fetchRules();
    } catch (error) {
      console.error("Error deleting rule:", error);
    }
  };

  const getRuleTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      seasonal: "bg-blue-500/20 text-blue-400",
      demand: "bg-purple-500/20 text-purple-400",
      early_bird: "bg-green-500/20 text-green-400",
      last_minute: "bg-orange-500/20 text-orange-400",
      group: "bg-cyan-500/20 text-cyan-400",
      loyalty: "bg-yellow-500/20 text-yellow-400",
      promotional: "bg-pink-500/20 text-pink-400",
      weekend: "bg-indigo-500/20 text-indigo-400",
      peak_day: "bg-red-500/20 text-red-400",
    };
    return colors[type] || "bg-slate-500/20 text-slate-400";
  };

  const getDemandScoreColor = (score: number) => {
    if (score >= 80) return "text-red-400";
    if (score >= 60) return "text-orange-400";
    if (score >= 40) return "text-yellow-400";
    if (score >= 20) return "text-green-400";
    return "text-blue-400";
  };

  const formatAdjustment = (type: string, value: string) => {
    const num = parseFloat(value);
    if (type === "percentage") {
      return num >= 0 ? `+${num}%` : `${num}%`;
    }
    return num >= 0 ? `+$${num}` : `-$${Math.abs(num)}`;
  };

  return (
    <div>
      {/* Sub-tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-700 pb-4">
        {[
          { key: "rules", label: "Pricing Rules" },
          { key: "demand", label: "Demand Metrics" },
          { key: "simulate", label: "Price Simulator" },
          { key: "analytics", label: "Analytics" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveSubTab(tab.key as typeof activeSubTab)}
            className={`px-4 py-2 rounded-t text-sm transition-colors ${
              activeSubTab === tab.key
                ? "bg-emerald-600 text-white"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Rules Tab */}
      {activeSubTab === "rules" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Pricing Rules</h3>
            <button
              onClick={() => {
                setEditingRule(null);
                setShowRuleModal(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded text-white text-sm"
            >
              + Add Rule
            </button>
          </div>

          {/* Built-in Rules Info */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-4">
            <h4 className="text-sm font-semibold text-slate-300 mb-2">Built-in Automatic Rules</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-900/50 p-2 rounded">
                <span className="text-green-400">Early Bird:</span>
                <span className="text-slate-400 ml-1">90d=15%, 60d=10%, 30d=5%</span>
              </div>
              <div className="bg-slate-900/50 p-2 rounded">
                <span className="text-cyan-400">Group:</span>
                <span className="text-slate-400 ml-1">20+=15%, 10+=10%, 6+=5%</span>
              </div>
              <div className="bg-slate-900/50 p-2 rounded">
                <span className="text-yellow-400">Loyalty:</span>
                <span className="text-slate-400 ml-1">Bronze-Platinum: 2-12%</span>
              </div>
              <div className="bg-slate-900/50 p-2 rounded">
                <span className="text-purple-400">Demand:</span>
                <span className="text-slate-400 ml-1">-10% to +15% auto</span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8 text-slate-400">Loading rules...</div>
          ) : rules.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              No custom pricing rules. Built-in rules will apply automatically.
            </div>
          ) : (
            <div className="space-y-3">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className={`bg-slate-800 border rounded-lg p-4 ${
                    rule.isActive ? "border-slate-700" : "border-slate-700/50 opacity-60"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-white">{rule.name}</span>
                        <span className={`px-2 py-0.5 rounded text-xs ${getRuleTypeBadgeColor(rule.ruleType)}`}>
                          {rule.ruleType.replace("_", " ")}
                        </span>
                        {rule.serviceType && (
                          <span className="text-xs text-slate-500">{rule.serviceType}</span>
                        )}
                      </div>
                      {rule.description && (
                        <p className="text-sm text-slate-400 mb-2">{rule.description}</p>
                      )}
                      <div className="flex flex-wrap gap-4 text-sm">
                        <span className={parseFloat(rule.adjustmentValue) >= 0 ? "text-red-400" : "text-green-400"}>
                          {formatAdjustment(rule.adjustmentType, rule.adjustmentValue)}
                        </span>
                        {rule.validFrom && (
                          <span className="text-slate-500">
                            From: {new Date(rule.validFrom).toLocaleDateString()}
                          </span>
                        )}
                        {rule.validTo && (
                          <span className="text-slate-500">
                            To: {new Date(rule.validTo).toLocaleDateString()}
                          </span>
                        )}
                        <span className="text-slate-500">Priority: {rule.priority}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleRuleStatus(rule.id, rule.isActive)}
                        className={`px-3 py-1 rounded text-xs ${
                          rule.isActive
                            ? "bg-green-500/20 text-green-400"
                            : "bg-slate-600 text-slate-400"
                        }`}
                      >
                        {rule.isActive ? "Active" : "Inactive"}
                      </button>
                      <button
                        onClick={() => {
                          setEditingRule(rule);
                          setShowRuleModal(true);
                        }}
                        className="text-slate-400 hover:text-white text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteRule(rule.id)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Demand Metrics Tab */}
      {activeSubTab === "demand" && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Demand Metrics (Last 30 Days)</h3>

          {loading ? (
            <div className="text-center py-8 text-slate-400">Loading metrics...</div>
          ) : metrics.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              No demand metrics recorded yet. Metrics are tracked automatically from user activity.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Date</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Service</th>
                    <th className="text-center py-3 px-4 text-slate-400 font-medium">Demand Score</th>
                    <th className="text-center py-3 px-4 text-slate-400 font-medium">Searches</th>
                    <th className="text-center py-3 px-4 text-slate-400 font-medium">Quotes</th>
                    <th className="text-center py-3 px-4 text-slate-400 font-medium">Bookings</th>
                    <th className="text-center py-3 px-4 text-slate-400 font-medium">Conversion</th>
                    <th className="text-center py-3 px-4 text-slate-400 font-medium">Occupancy</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.map((metric) => {
                    const score = parseFloat(metric.demandScore);
                    return (
                      <tr key={metric.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                        <td className="py-3 px-4 text-white">
                          {new Date(metric.metricDate).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          {metric.serviceType || "All"}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`font-bold ${getDemandScoreColor(score)}`}>
                            {score.toFixed(0)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-slate-300">{metric.searchCount}</td>
                        <td className="py-3 px-4 text-center text-slate-300">{metric.quotesGenerated}</td>
                        <td className="py-3 px-4 text-center text-slate-300">{metric.bookingsConfirmed}</td>
                        <td className="py-3 px-4 text-center text-slate-300">
                          {metric.conversionRate ? `${parseFloat(metric.conversionRate).toFixed(1)}%` : "-"}
                        </td>
                        <td className="py-3 px-4 text-center text-slate-300">
                          {metric.occupancyRate ? `${parseFloat(metric.occupancyRate).toFixed(1)}%` : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Simulator Tab */}
      {activeSubTab === "simulate" && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Price Simulator</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input Form */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-slate-300 mb-4">Simulation Parameters</h4>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Service Type</label>
                  <select
                    value={simForm.serviceType}
                    onChange={(e) => setSimForm({ ...simForm, serviceType: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white text-sm"
                  >
                    <option value="hotel">Hotel</option>
                    <option value="transportation">Transportation</option>
                    <option value="guide">Guide</option>
                    <option value="flight">Flight</option>
                    <option value="helicopter">Helicopter</option>
                    <option value="package">Package</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Base Price (USD)</label>
                  <input
                    type="number"
                    value={simForm.basePrice}
                    onChange={(e) => setSimForm({ ...simForm, basePrice: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={simForm.startDate}
                      onChange={(e) => setSimForm({ ...simForm, startDate: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">End Date</label>
                    <input
                      type="date"
                      value={simForm.endDate}
                      onChange={(e) => setSimForm({ ...simForm, endDate: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Number of Pax</label>
                    <input
                      type="number"
                      value={simForm.paxCount}
                      onChange={(e) => setSimForm({ ...simForm, paxCount: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Loyalty Tier</label>
                    <select
                      value={simForm.loyaltyTier}
                      onChange={(e) => setSimForm({ ...simForm, loyaltyTier: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white text-sm"
                    >
                      <option value="">None</option>
                      <option value="bronze">Bronze</option>
                      <option value="silver">Silver</option>
                      <option value="gold">Gold</option>
                      <option value="platinum">Platinum</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={runSimulation}
                  disabled={simLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 px-4 py-2 rounded text-white text-sm"
                >
                  {simLoading ? "Running Simulation..." : "Run Simulation"}
                </button>
              </div>
            </div>

            {/* Results */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-slate-300 mb-4">Simulation Results</h4>

              {simResults.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  Run a simulation to see dynamic pricing results
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {simResults.map((result, index) => {
                    const savings = result.basePrice - result.finalPrice;
                    const savingsPercent = ((savings / result.basePrice) * 100).toFixed(1);
                    return (
                      <div
                        key={index}
                        className="bg-slate-900/50 rounded p-3 text-sm"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-slate-400">
                            {new Date(result.date).toLocaleDateString()}
                          </span>
                          <div className="text-right">
                            <span className="text-slate-500 line-through mr-2">
                              ${result.basePrice}
                            </span>
                            <span className="text-emerald-400 font-bold">
                              ${result.finalPrice.toFixed(2)}
                            </span>
                            {savings !== 0 && (
                              <span className={`ml-2 text-xs ${savings > 0 ? "text-green-400" : "text-red-400"}`}>
                                ({savings > 0 ? "-" : "+"}{Math.abs(parseFloat(savingsPercent))}%)
                              </span>
                            )}
                          </div>
                        </div>
                        {result.appliedRules.length > 0 && (
                          <div className="text-xs text-slate-500">
                            Rules: {result.appliedRules.map(r => r.ruleName).join(", ")}
                          </div>
                        )}
                        {result.demandScore !== undefined && (
                          <div className="text-xs mt-1">
                            <span className="text-slate-500">Demand: </span>
                            <span className={getDemandScoreColor(result.demandScore)}>
                              {result.demandScore.toFixed(0)}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeSubTab === "analytics" && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Pricing Analytics (Last 30 Days)</h3>

          {loading ? (
            <div className="text-center py-8 text-slate-400">Loading analytics...</div>
          ) : !analytics ? (
            <div className="text-center py-8 text-slate-400">No analytics data available.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <div className="text-sm text-slate-400 mb-1">Total Adjustments</div>
                <div className="text-2xl font-bold text-white">{analytics.totalAdjustments}</div>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <div className="text-sm text-slate-400 mb-1">Average Adjustment</div>
                <div className={`text-2xl font-bold ${analytics.averageAdjustment >= 0 ? "text-red-400" : "text-green-400"}`}>
                  {analytics.averageAdjustment >= 0 ? "+" : ""}{analytics.averageAdjustment.toFixed(1)}%
                </div>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <div className="text-sm text-slate-400 mb-1">Active Rules</div>
                <div className="text-2xl font-bold text-white">
                  {Object.keys(analytics.ruleBreakdown).length}
                </div>
              </div>
            </div>
          )}

          {analytics && Object.keys(analytics.ruleBreakdown).length > 0 && (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-slate-300 mb-4">Rule Performance</h4>
              <div className="space-y-3">
                {Object.entries(analytics.ruleBreakdown).map(([ruleName, data]) => (
                  <div key={ruleName} className="flex items-center justify-between">
                    <div>
                      <span className="text-white">{ruleName}</span>
                      <span className="text-slate-500 text-sm ml-2">({data.count} applications)</span>
                    </div>
                    <span className={`font-bold ${data.totalImpact >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {data.totalImpact >= 0 ? "+" : ""}${data.totalImpact.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Rule Modal */}
      {showRuleModal && (
        <RuleModal
          rule={editingRule}
          onClose={() => {
            setShowRuleModal(false);
            setEditingRule(null);
          }}
          onSave={() => {
            setShowRuleModal(false);
            setEditingRule(null);
            fetchRules();
          }}
        />
      )}
    </div>
  );
}

// Rule Modal Component
function RuleModal({
  rule,
  onClose,
  onSave,
}: {
  rule: PricingRule | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const [form, setForm] = useState({
    name: rule?.name || "",
    description: rule?.description || "",
    ruleType: rule?.ruleType || "promotional",
    serviceType: rule?.serviceType || "",
    adjustmentType: rule?.adjustmentType || "percentage",
    adjustmentValue: rule?.adjustmentValue || "0",
    minPrice: rule?.minPrice || "",
    maxPrice: rule?.maxPrice || "",
    validFrom: rule?.validFrom?.split("T")[0] || "",
    validTo: rule?.validTo?.split("T")[0] || "",
    priority: rule?.priority?.toString() || "0",
    isActive: rule?.isActive ?? true,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = rule ? `/api/admin/pricing/rules/${rule.id}` : "/api/admin/pricing/rules";
      const method = rule ? "PUT" : "POST";

      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description || undefined,
          ruleType: form.ruleType,
          serviceType: form.serviceType || undefined,
          adjustmentType: form.adjustmentType,
          adjustmentValue: parseFloat(form.adjustmentValue),
          minPrice: form.minPrice ? parseFloat(form.minPrice) : undefined,
          maxPrice: form.maxPrice ? parseFloat(form.maxPrice) : undefined,
          validFrom: form.validFrom || undefined,
          validTo: form.validTo || undefined,
          priority: parseInt(form.priority) || 0,
          isActive: form.isActive,
        }),
      });

      onSave();
    } catch (error) {
      console.error("Error saving rule:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-white mb-4">
          {rule ? "Edit Pricing Rule" : "Create Pricing Rule"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Rule Name *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm"
              placeholder="e.g., Summer Peak Premium"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm"
              rows={2}
              placeholder="Optional description of the rule"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Rule Type *</label>
              <select
                value={form.ruleType}
                onChange={(e) => setForm({ ...form, ruleType: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm"
              >
                <option value="seasonal">Seasonal</option>
                <option value="demand">Demand</option>
                <option value="early_bird">Early Bird</option>
                <option value="last_minute">Last Minute</option>
                <option value="group">Group</option>
                <option value="loyalty">Loyalty</option>
                <option value="promotional">Promotional</option>
                <option value="weekend">Weekend</option>
                <option value="peak_day">Peak Day</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Service Type</label>
              <select
                value={form.serviceType}
                onChange={(e) => setForm({ ...form, serviceType: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm"
              >
                <option value="">All Services</option>
                <option value="hotel">Hotel</option>
                <option value="transportation">Transportation</option>
                <option value="guide">Guide</option>
                <option value="porter">Porter</option>
                <option value="flight">Flight</option>
                <option value="helicopter_sharing">Helicopter (Sharing)</option>
                <option value="helicopter_charter">Helicopter (Charter)</option>
                <option value="permit">Permit</option>
                <option value="package">Package</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Adjustment Type *</label>
              <select
                value={form.adjustmentType}
                onChange={(e) => setForm({ ...form, adjustmentType: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm"
              >
                <option value="percentage">Percentage</option>
                <option value="fixed_amount">Fixed Amount</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Adjustment Value * ({form.adjustmentType === "percentage" ? "%" : "$"})
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={form.adjustmentValue}
                onChange={(e) => setForm({ ...form, adjustmentValue: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm"
                placeholder="e.g., -10 for discount, 15 for premium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Min Price Floor ($)</label>
              <input
                type="number"
                step="0.01"
                value={form.minPrice}
                onChange={(e) => setForm({ ...form, minPrice: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Max Price Ceiling ($)</label>
              <input
                type="number"
                step="0.01"
                value={form.maxPrice}
                onChange={(e) => setForm({ ...form, maxPrice: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Valid From</label>
              <input
                type="date"
                value={form.validFrom}
                onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Valid To</label>
              <input
                type="date"
                value={form.validTo}
                onChange={(e) => setForm({ ...form, validTo: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Priority (higher = first)</label>
              <input
                type="number"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm"
              />
            </div>
            <div className="flex items-center pt-5">
              <input
                type="checkbox"
                id="isActive"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="isActive" className="text-sm text-slate-400">
                Rule is active
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 px-4 py-2 rounded text-white text-sm"
            >
              {saving ? "Saving..." : rule ? "Update Rule" : "Create Rule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
