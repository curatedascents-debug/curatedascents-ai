"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, TrendingDown, TrendingUp, DollarSign, Check, X, Eye, RefreshCw } from "lucide-react";

interface PriceAlert {
  id: number;
  alertType: string;
  serviceType: string;
  serviceName: string;
  currentPrice: string | null;
  previousPrice: string | null;
  changePercent: string | null;
  marketAverage: string | null;
  priority: string;
  status: string;
  recommendation: string | null;
  createdAt: string;
}

interface AlertStats {
  total: number;
  newCount: number;
  highPriority: number;
  acknowledgedCount: number;
}

const ALERT_TYPE_CONFIG: Record<string, { label: string; color: string; icon: typeof AlertTriangle }> = {
  negotiation_opportunity: { label: "Negotiate", color: "bg-amber-500/20 text-amber-400", icon: DollarSign },
  price_increase: { label: "Low Margin", color: "bg-red-500/20 text-red-400", icon: TrendingUp },
  price_drop: { label: "Great Rate", color: "bg-emerald-500/20 text-emerald-400", icon: TrendingDown },
  seasonal_trend: { label: "Seasonal", color: "bg-blue-500/20 text-blue-400", icon: TrendingDown },
  competitor_undercut: { label: "Competitor", color: "bg-purple-500/20 text-purple-400", icon: AlertTriangle },
};

const PRIORITY_CONFIG: Record<string, string> = {
  high: "border-l-red-500",
  medium: "border-l-amber-500",
  low: "border-l-blue-500",
};

export default function PriceAlertsTab() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [stats, setStats] = useState<AlertStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<{ status?: string; priority?: string; alertType?: string }>({});
  const [runningMonitor, setRunningMonitor] = useState(false);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter.status) params.set("status", filter.status);
      if (filter.priority) params.set("priority", filter.priority);
      if (filter.alertType) params.set("alertType", filter.alertType);

      const res = await fetch(`/api/admin/price-alerts?${params}`);
      const data = await res.json();
      setAlerts(data.alerts || []);
      setStats(data.stats || null);
    } catch (err) {
      console.error("Failed to fetch alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [filter]);

  const updateAlert = async (alertId: number, status: string) => {
    try {
      await fetch("/api/admin/price-alerts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertId, status }),
      });
      fetchAlerts();
    } catch (err) {
      console.error("Failed to update alert:", err);
    }
  };

  const bulkDismiss = async () => {
    const ids = alerts.filter((a) => a.status === "new" && a.priority === "low").map((a) => a.id);
    if (ids.length === 0) return;
    try {
      await fetch("/api/admin/price-alerts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bulkIds: ids, status: "dismissed" }),
      });
      fetchAlerts();
    } catch (err) {
      console.error("Failed to bulk dismiss:", err);
    }
  };

  const runMonitor = async () => {
    setRunningMonitor(true);
    try {
      await fetch("/api/cron/price-monitoring", { method: "POST" });
      await fetchAlerts();
    } catch (err) {
      console.error("Failed to run monitor:", err);
    } finally {
      setRunningMonitor(false);
    }
  };

  const formatPrice = (val: string | null) => {
    if (!val) return "-";
    return `$${parseFloat(val).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      {stats && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <p className="text-xs text-slate-400 uppercase">Total Alerts</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <p className="text-xs text-slate-400 uppercase">New</p>
            <p className="text-2xl font-bold text-emerald-400">{stats.newCount}</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <p className="text-xs text-slate-400 uppercase">High Priority</p>
            <p className="text-2xl font-bold text-red-400">{stats.highPriority}</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <p className="text-xs text-slate-400 uppercase">Acknowledged</p>
            <p className="text-2xl font-bold text-blue-400">{stats.acknowledgedCount}</p>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2 flex-wrap">
          <select
            value={filter.status || ""}
            onChange={(e) => setFilter((f) => ({ ...f, status: e.target.value || undefined }))}
            className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white"
          >
            <option value="">All Statuses</option>
            <option value="new">New</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="dismissed">Dismissed</option>
            <option value="actioned">Actioned</option>
          </select>
          <select
            value={filter.priority || ""}
            onChange={(e) => setFilter((f) => ({ ...f, priority: e.target.value || undefined }))}
            className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white"
          >
            <option value="">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select
            value={filter.alertType || ""}
            onChange={(e) => setFilter((f) => ({ ...f, alertType: e.target.value || undefined }))}
            className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white"
          >
            <option value="">All Types</option>
            <option value="negotiation_opportunity">Negotiation</option>
            <option value="price_increase">Low Margin</option>
            <option value="price_drop">Great Rate</option>
            <option value="seasonal_trend">Seasonal</option>
            <option value="competitor_undercut">Competitor</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button
            onClick={bulkDismiss}
            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm transition-colors"
          >
            Dismiss Low Priority
          </button>
          <button
            onClick={runMonitor}
            disabled={runningMonitor}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 rounded text-sm transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${runningMonitor ? "animate-spin" : ""}`} />
            {runningMonitor ? "Analyzing..." : "Run Analysis"}
          </button>
        </div>
      </div>

      {/* Alerts List */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading alerts...</div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No price alerts found.</p>
          <p className="text-sm mt-1">Run the analysis to generate alerts from your hotel database.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const typeConfig = ALERT_TYPE_CONFIG[alert.alertType] || ALERT_TYPE_CONFIG.negotiation_opportunity;
            const Icon = typeConfig.icon;

            return (
              <div
                key={alert.id}
                className={`bg-slate-800 border border-slate-700 rounded-lg p-4 border-l-4 ${PRIORITY_CONFIG[alert.priority] || ""} ${
                  alert.status === "dismissed" ? "opacity-50" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${typeConfig.color}`}>
                        <Icon className="w-3 h-3" />
                        {typeConfig.label}
                      </span>
                      <span className="text-xs text-slate-500 uppercase">{alert.priority} priority</span>
                      <span className="text-xs text-slate-600">
                        {new Date(alert.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="text-white font-medium truncate">{alert.serviceName}</h4>
                    <div className="flex items-center gap-4 mt-1 text-sm">
                      {alert.currentPrice && (
                        <span className="text-slate-300">Current: {formatPrice(alert.currentPrice)}</span>
                      )}
                      {alert.marketAverage && (
                        <span className="text-slate-400">Market: {formatPrice(alert.marketAverage)}</span>
                      )}
                      {alert.changePercent && (
                        <span className={parseFloat(alert.changePercent) > 0 ? "text-red-400" : "text-emerald-400"}>
                          {parseFloat(alert.changePercent) > 0 ? "+" : ""}
                          {parseFloat(alert.changePercent).toFixed(0)}%
                        </span>
                      )}
                    </div>
                    {alert.recommendation && (
                      <p className="text-sm text-slate-400 mt-2">{alert.recommendation}</p>
                    )}
                  </div>
                  {alert.status === "new" && (
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => updateAlert(alert.id, "acknowledged")}
                        title="Acknowledge"
                        className="p-2 bg-slate-700 hover:bg-blue-600 rounded transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => updateAlert(alert.id, "actioned")}
                        title="Mark as Actioned"
                        className="p-2 bg-slate-700 hover:bg-emerald-600 rounded transition-colors"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => updateAlert(alert.id, "dismissed")}
                        title="Dismiss"
                        className="p-2 bg-slate-700 hover:bg-red-600 rounded transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
