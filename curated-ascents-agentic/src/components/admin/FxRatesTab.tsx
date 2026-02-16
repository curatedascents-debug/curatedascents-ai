"use client";

import { useState, useEffect } from "react";
import { RefreshCw, TrendingUp, DollarSign, Globe } from "lucide-react";

type SubTab = "daily" | "historical" | "currencies";

interface DailyRate {
  id: number;
  rateDate: string;
  baseCurrency: string;
  rates: Record<string, number>;
  source: string | null;
  fetchedAt: string | null;
}

interface Currency {
  id: number;
  code: string;
  name: string;
  symbol: string;
  isActive: boolean;
  sortOrder: number;
}

export default function FxRatesTab() {
  const [subTab, setSubTab] = useState<SubTab>("daily");
  const [dailyRates, setDailyRates] = useState<DailyRate[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [historyDays, setHistoryDays] = useState(30);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (subTab === "historical") {
      loadHistoricalRates();
    }
  }, [subTab, historyDays]);

  async function loadData() {
    setLoading(true);
    try {
      const [ratesRes, currencyRes] = await Promise.all([
        fetch("/api/admin/fx-rates?days=1"),
        fetch("/api/currency/rates"),
      ]);
      const ratesData = await ratesRes.json();
      const currencyData = await currencyRes.json();
      setDailyRates(ratesData.rates || []);
      setCurrencies(currencyData.currencies || []);
    } catch (err) {
      console.error("Failed to load FX data:", err);
    } finally {
      setLoading(false);
    }
  }

  async function loadHistoricalRates() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/fx-rates?days=${historyDays}`);
      const data = await res.json();
      setDailyRates(data.rates || []);
    } catch (err) {
      console.error("Failed to load historical rates:", err);
    } finally {
      setLoading(false);
    }
  }

  async function refreshRates() {
    setRefreshing(true);
    try {
      const res = await fetch("/api/cron/update-exchange-rates", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.CRON_SECRET || "manual"}` },
      });
      const data = await res.json();
      if (data.success) {
        await loadData();
      }
    } catch (err) {
      console.error("Failed to refresh rates:", err);
    } finally {
      setRefreshing(false);
    }
  }

  const latestRate = dailyRates[0];
  const rateEntries = latestRate
    ? Object.entries(latestRate.rates as Record<string, number>).sort(([a], [b]) => a.localeCompare(b))
    : [];

  const currencyMap = new Map(currencies.map((c) => [c.code, c]));

  const subTabs: { key: SubTab; label: string; icon: React.ReactNode }[] = [
    { key: "daily", label: "Daily Rates", icon: <DollarSign className="w-4 h-4" /> },
    { key: "historical", label: "Historical", icon: <TrendingUp className="w-4 h-4" /> },
    { key: "currencies", label: "Currencies", icon: <Globe className="w-4 h-4" /> },
  ];

  if (loading && dailyRates.length === 0) {
    return <div className="text-slate-400 text-center py-12">Loading FX rates...</div>;
  }

  return (
    <div>
      {/* Sub-tab navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          {subTabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setSubTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
                subTab === t.key
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
        <button
          onClick={refreshRates}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white rounded-lg text-sm transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing..." : "Refresh Rates"}
        </button>
      </div>

      {/* Daily Rates Tab */}
      {subTab === "daily" && (
        <div>
          {latestRate && (
            <div className="mb-4 text-sm text-slate-400">
              Base: <span className="text-emerald-400 font-medium">{latestRate.baseCurrency}</span>
              {" | "}Date: <span className="text-white">{latestRate.rateDate}</span>
              {latestRate.source && (
                <>
                  {" | "}Source: <span className="text-white">{latestRate.source}</span>
                </>
              )}
            </div>
          )}
          <div className="overflow-x-auto rounded-lg border border-slate-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-800 text-left">
                  <th className="px-4 py-3 text-slate-300 font-medium">Currency</th>
                  <th className="px-4 py-3 text-slate-300 font-medium">Symbol</th>
                  <th className="px-4 py-3 text-slate-300 font-medium">Rate (1 USD =)</th>
                  <th className="px-4 py-3 text-slate-300 font-medium">Inverse (1 X = USD)</th>
                  <th className="px-4 py-3 text-slate-300 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {rateEntries.map(([code, rate]) => {
                  const cur = currencyMap.get(code);
                  return (
                    <tr key={code} className="border-t border-slate-700 hover:bg-slate-800/50">
                      <td className="px-4 py-3">
                        <span className="text-white font-medium">{code}</span>
                        {cur && <span className="text-slate-400 ml-2">{cur.name}</span>}
                      </td>
                      <td className="px-4 py-3 text-slate-300">{cur?.symbol || "—"}</td>
                      <td className="px-4 py-3 text-emerald-400 font-mono">{Number(rate).toFixed(4)}</td>
                      <td className="px-4 py-3 text-blue-400 font-mono">{(1 / Number(rate)).toFixed(6)}</td>
                      <td className="px-4 py-3">
                        {cur ? (
                          <span className={`px-2 py-0.5 rounded text-xs ${cur.isActive ? "bg-green-900/50 text-green-400" : "bg-red-900/50 text-red-400"}`}>
                            {cur.isActive ? "Active" : "Inactive"}
                          </span>
                        ) : (
                          <span className="text-slate-500 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {rateEntries.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                      No rates available. Click &quot;Refresh Rates&quot; to fetch latest.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Historical Tab */}
      {subTab === "historical" && (
        <div>
          <div className="flex gap-2 mb-4">
            {[30, 90, 365].map((d) => (
              <button
                key={d}
                onClick={() => setHistoryDays(d)}
                className={`px-3 py-1.5 rounded text-sm transition-colors ${
                  historyDays === d
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                }`}
              >
                {d} days
              </button>
            ))}
          </div>
          <div className="text-sm text-slate-400 mb-4">
            Showing {dailyRates.length} snapshots over last {historyDays} days
          </div>
          <div className="overflow-x-auto rounded-lg border border-slate-700 max-h-[600px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0">
                <tr className="bg-slate-800 text-left">
                  <th className="px-4 py-3 text-slate-300 font-medium">Date</th>
                  <th className="px-4 py-3 text-slate-300 font-medium">Base</th>
                  <th className="px-4 py-3 text-slate-300 font-medium">Currencies</th>
                  <th className="px-4 py-3 text-slate-300 font-medium">Source</th>
                </tr>
              </thead>
              <tbody>
                {dailyRates.map((dr) => {
                  const rates = dr.rates as Record<string, number>;
                  const count = Object.keys(rates).length;
                  const preview = Object.entries(rates)
                    .slice(0, 4)
                    .map(([code, rate]) => `${code}: ${Number(rate).toFixed(2)}`)
                    .join(", ");
                  return (
                    <tr key={dr.id} className="border-t border-slate-700 hover:bg-slate-800/50">
                      <td className="px-4 py-3 text-white font-mono">{dr.rateDate}</td>
                      <td className="px-4 py-3 text-emerald-400">{dr.baseCurrency}</td>
                      <td className="px-4 py-3 text-slate-300">
                        <span className="text-slate-500">{count} rates</span>
                        <span className="ml-2 text-xs text-slate-500">{preview}...</span>
                      </td>
                      <td className="px-4 py-3 text-slate-400">{dr.source || "—"}</td>
                    </tr>
                  );
                })}
                {dailyRates.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                      No historical data for this period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Currencies Tab */}
      {subTab === "currencies" && (
        <div>
          <div className="text-sm text-slate-400 mb-4">
            {currencies.length} supported currencies ({currencies.filter((c) => c.isActive).length} active)
          </div>
          <div className="overflow-x-auto rounded-lg border border-slate-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-800 text-left">
                  <th className="px-4 py-3 text-slate-300 font-medium">Code</th>
                  <th className="px-4 py-3 text-slate-300 font-medium">Name</th>
                  <th className="px-4 py-3 text-slate-300 font-medium">Symbol</th>
                  <th className="px-4 py-3 text-slate-300 font-medium">Sort Order</th>
                  <th className="px-4 py-3 text-slate-300 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {currencies.map((c) => (
                  <tr key={c.id} className="border-t border-slate-700 hover:bg-slate-800/50">
                    <td className="px-4 py-3 text-white font-medium font-mono">{c.code}</td>
                    <td className="px-4 py-3 text-slate-300">{c.name}</td>
                    <td className="px-4 py-3 text-slate-300">{c.symbol}</td>
                    <td className="px-4 py-3 text-slate-400">{c.sortOrder}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs ${c.isActive ? "bg-green-900/50 text-green-400" : "bg-red-900/50 text-red-400"}`}>
                        {c.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
                {currencies.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                      No currencies configured. Refresh rates to seed currencies.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
