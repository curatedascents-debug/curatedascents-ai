"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";
import {
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  BarChart3,
  PieChartIcon,
  Target,
  Truck,
  FileText,
  RefreshCw,
  Filter,
  ChevronDown,
} from "lucide-react";

type SubTab = "overview" | "financial" | "suppliers" | "leads" | "operations";

interface DateRange {
  startDate: string;
  endDate: string;
  preset: string;
}

interface KPIs {
  totalRevenue: string;
  totalPaid: string;
  totalBalance: string;
  collectionRate: number;
  totalQuoteValue: string;
  totalMargin: string;
  conversionRate: number;
  totalBookings: number;
  totalClients: number;
  newClientsThisMonth: number;
  avgDealSize?: number;
  avgMarginPercent?: number;
}

interface ReportData {
  kpis: KPIs;
  quoteFunnel: Record<string, number>;
  bookingsByStatus: Record<string, number>;
  bookingsByPayment: Record<string, number>;
  clientsBySource: { source: string; count: number }[];
  trends: {
    quotes: { month: string; count: number; value: number }[];
    bookings: { month: string; count: number; revenue: number; collected: number }[];
    clients: { month: string; count: number }[];
  };
  topDestinations: { destination: string; count: number; value: number }[];
  servicePopularity: { serviceType: string; count: number; value: number }[];
}

interface SupplierPerformance {
  supplierId: number;
  supplierName: string;
  totalRequests: number;
  respondedRequests: number;
  confirmedRequests: number;
  avgResponseTime: number;
  satisfactionScore: number;
  reliabilityScore: number;
  revenue: number;
}

interface LeadMetrics {
  scoreDistribution: { range: string; count: number }[];
  statusDistribution: { status: string; count: number }[];
  conversionByScore: { scoreRange: string; converted: number; total: number }[];
  avgTimeToConversion: number;
  hotLeads: number;
  warmLeads: number;
  coldLeads: number;
}

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

const formatCurrency = (value: number | string) => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return `$${num.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

const formatMonth = (month: string) => {
  const [year, m] = month.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[parseInt(m) - 1]} '${year.slice(2)}`;
};

const formatPercent = (value: number) => `${value.toFixed(1)}%`;

export default function AdvancedReportsTab() {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("overview");
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    preset: "6months",
  });
  const [data, setData] = useState<ReportData | null>(null);
  const [supplierData, setSupplierData] = useState<SupplierPerformance[]>([]);
  const [leadData, setLeadData] = useState<LeadMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });

      const [reportsRes, suppliersRes, leadsRes] = await Promise.all([
        fetch(`/api/admin/reports?${params}`),
        fetch(`/api/admin/reports/suppliers?${params}`),
        fetch(`/api/admin/reports/leads?${params}`),
      ]);

      const reportsJson = await reportsRes.json();
      if (!reportsRes.ok) throw new Error(reportsJson.error || "Failed to fetch reports");
      setData(reportsJson.data);

      if (suppliersRes.ok) {
        const suppliersJson = await suppliersRes.json();
        setSupplierData(suppliersJson.data || []);
      }

      if (leadsRes.ok) {
        const leadsJson = await leadsRes.json();
        setLeadData(leadsJson.data || null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reports");
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handlePresetChange = (preset: string) => {
    const endDate = new Date();
    let startDate = new Date();

    switch (preset) {
      case "7days":
        startDate.setDate(endDate.getDate() - 7);
        break;
      case "30days":
        startDate.setDate(endDate.getDate() - 30);
        break;
      case "90days":
        startDate.setDate(endDate.getDate() - 90);
        break;
      case "6months":
        startDate.setMonth(endDate.getMonth() - 6);
        break;
      case "1year":
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      case "ytd":
        startDate = new Date(endDate.getFullYear(), 0, 1);
        break;
      default:
        return;
    }

    setDateRange({
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
      preset,
    });
    setShowDatePicker(false);
  };

  const exportCSV = (dataType: string) => {
    if (!data) return;

    let csvContent = "";
    let filename = "";

    switch (dataType) {
      case "kpis":
        csvContent = "Metric,Value\n";
        Object.entries(data.kpis).forEach(([key, value]) => {
          csvContent += `${key},${value}\n`;
        });
        filename = "kpis_report.csv";
        break;
      case "trends":
        csvContent = "Month,Quotes,Quote Value,Bookings,Revenue,Collected,New Clients\n";
        const months = [...new Set([
          ...data.trends.quotes.map(q => q.month),
          ...data.trends.bookings.map(b => b.month),
          ...data.trends.clients.map(c => c.month),
        ])].sort();
        months.forEach(month => {
          const quote = data.trends.quotes.find(q => q.month === month);
          const booking = data.trends.bookings.find(b => b.month === month);
          const client = data.trends.clients.find(c => c.month === month);
          csvContent += `${month},${quote?.count || 0},${quote?.value || 0},${booking?.count || 0},${booking?.revenue || 0},${booking?.collected || 0},${client?.count || 0}\n`;
        });
        filename = "trends_report.csv";
        break;
      case "destinations":
        csvContent = "Destination,Quote Count,Total Value\n";
        data.topDestinations.forEach(d => {
          csvContent += `${d.destination},${d.count},${d.value}\n`;
        });
        filename = "destinations_report.csv";
        break;
      case "suppliers":
        csvContent = "Supplier,Total Requests,Confirmed,Response Rate,Avg Response Time,Revenue\n";
        supplierData.forEach(s => {
          const responseRate = s.totalRequests > 0 ? ((s.confirmedRequests / s.totalRequests) * 100).toFixed(1) : "0";
          csvContent += `${s.supplierName},${s.totalRequests},${s.confirmedRequests},${responseRate}%,${s.avgResponseTime}h,$${s.revenue}\n`;
        });
        filename = "suppliers_report.csv";
        break;
      default:
        return;
    }

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const subTabs = [
    { key: "overview" as SubTab, label: "Overview", icon: BarChart3 },
    { key: "financial" as SubTab, label: "Financial", icon: DollarSign },
    { key: "suppliers" as SubTab, label: "Suppliers", icon: Truck },
    { key: "leads" as SubTab, label: "Lead Intelligence", icon: Target },
    { key: "operations" as SubTab, label: "Operations", icon: FileText },
  ];

  const presets = [
    { key: "7days", label: "Last 7 Days" },
    { key: "30days", label: "Last 30 Days" },
    { key: "90days", label: "Last 90 Days" },
    { key: "6months", label: "Last 6 Months" },
    { key: "1year", label: "Last Year" },
    { key: "ytd", label: "Year to Date" },
  ];

  if (loading && !data) {
    return <div className="text-center text-slate-400 py-8">Loading reports...</div>;
  }

  if (error && !data) {
    return <div className="text-center text-red-400 py-8">{error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with Date Filter */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2">
          {subTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveSubTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSubTab === tab.key
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {/* Date Range Selector */}
          <div className="relative">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg text-sm hover:bg-slate-700"
            >
              <Calendar className="w-4 h-4" />
              {presets.find(p => p.key === dateRange.preset)?.label || "Custom"}
              <ChevronDown className="w-4 h-4" />
            </button>
            {showDatePicker && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-slate-800 rounded-lg shadow-xl border border-slate-700 p-4 z-50">
                <div className="space-y-2 mb-4">
                  {presets.map((preset) => (
                    <button
                      key={preset.key}
                      onClick={() => handlePresetChange(preset.key)}
                      className={`w-full text-left px-3 py-2 rounded text-sm ${
                        dateRange.preset === preset.key
                          ? "bg-emerald-600 text-white"
                          : "hover:bg-slate-700"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                <div className="border-t border-slate-700 pt-4 space-y-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Start Date</label>
                    <input
                      type="date"
                      value={dateRange.startDate}
                      onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value, preset: "custom" })}
                      className="w-full px-3 py-2 bg-slate-900 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">End Date</label>
                    <input
                      type="date"
                      value={dateRange.endDate}
                      onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value, preset: "custom" })}
                      className="w-full px-3 py-2 bg-slate-900 rounded text-sm"
                    />
                  </div>
                  <button
                    onClick={() => {
                      fetchReports();
                      setShowDatePicker(false);
                    }}
                    className="w-full py-2 bg-emerald-600 rounded text-sm font-medium hover:bg-emerald-700"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Refresh */}
          <button
            onClick={fetchReports}
            disabled={loading}
            className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          {/* Export */}
          <div className="relative group">
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg text-sm hover:bg-slate-700">
              <Download className="w-4 h-4" />
              Export
            </button>
            <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800 rounded-lg shadow-xl border border-slate-700 py-2 hidden group-hover:block z-50">
              <button onClick={() => exportCSV("kpis")} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-700">
                KPIs (CSV)
              </button>
              <button onClick={() => exportCSV("trends")} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-700">
                Trends (CSV)
              </button>
              <button onClick={() => exportCSV("destinations")} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-700">
                Destinations (CSV)
              </button>
              <button onClick={() => exportCSV("suppliers")} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-700">
                Suppliers (CSV)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {activeSubTab === "overview" && data && <OverviewSection data={data} />}
      {activeSubTab === "financial" && data && <FinancialSection data={data} />}
      {activeSubTab === "suppliers" && <SuppliersSection data={supplierData} />}
      {activeSubTab === "leads" && <LeadsSection data={leadData} />}
      {activeSubTab === "operations" && data && <OperationsSection data={data} />}
    </div>
  );
}

// === OVERVIEW SECTION ===
function OverviewSection({ data }: { data: ReportData }) {
  const { kpis, trends, topDestinations, servicePopularity } = data;

  // Calculate period-over-period changes (mock for now - would need historical data)
  const kpiCards = [
    { label: "Total Revenue", value: formatCurrency(kpis.totalRevenue), change: 12.5, icon: DollarSign, color: "emerald" },
    { label: "Collected", value: formatCurrency(kpis.totalPaid), change: 8.3, icon: TrendingUp, color: "green" },
    { label: "Outstanding", value: formatCurrency(kpis.totalBalance), change: -5.2, icon: TrendingDown, color: "yellow" },
    { label: "Conversion Rate", value: `${kpis.conversionRate}%`, change: 3.1, icon: Target, color: "purple" },
    { label: "Total Bookings", value: kpis.totalBookings.toString(), change: 15.0, icon: FileText, color: "blue" },
    { label: "Total Clients", value: kpis.totalClients.toString(), change: 22.0, icon: Users, color: "cyan" },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards with Trends */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpiCards.map((kpi) => (
          <div key={kpi.label} className="bg-slate-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <kpi.icon className={`w-5 h-5 text-${kpi.color}-400`} />
              {kpi.change !== 0 && (
                <span className={`text-xs ${kpi.change > 0 ? "text-green-400" : "text-red-400"}`}>
                  {kpi.change > 0 ? "+" : ""}{kpi.change}%
                </span>
              )}
            </div>
            <div className="text-slate-400 text-xs uppercase tracking-wide mb-1">{kpi.label}</div>
            <div className={`text-xl font-bold text-${kpi.color}-400`}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Revenue & Booking Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Revenue & Collection Trend">
          {trends.bookings.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={trends.bookings.map((t) => ({ ...t, month: formatMonth(t.month) }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155" }}
                  formatter={(value: number) => [formatCurrency(value), ""]}
                />
                <Legend />
                <Area type="monotone" dataKey="revenue" fill="#10b98133" stroke="#10b981" name="Revenue" />
                <Line type="monotone" dataKey="collected" stroke="#3b82f6" strokeWidth={2} name="Collected" dot={{ fill: "#3b82f6" }} />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <NoData />
          )}
        </ChartCard>

        <ChartCard title="Quote & Client Growth">
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={[
              ...trends.quotes.map((q, i) => ({
                month: formatMonth(q.month),
                quotes: q.count,
                clients: trends.clients[i]?.count || 0,
              }))
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155" }} />
              <Legend />
              <Bar dataKey="quotes" fill="#8b5cf6" name="Quotes" radius={[4, 4, 0, 0]} />
              <Line type="monotone" dataKey="clients" stroke="#f59e0b" strokeWidth={2} name="New Clients" dot={{ fill: "#f59e0b" }} />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Top Destinations & Services */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Top Destinations by Revenue">
          {topDestinations.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topDestinations} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <YAxis dataKey="destination" type="category" stroke="#94a3b8" fontSize={10} width={100} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155" }}
                  formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {topDestinations.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <NoData />
          )}
        </ChartCard>

        <ChartCard title="Service Type Distribution">
          {servicePopularity.length > 0 ? (
            <div className="flex items-center">
              <ResponsiveContainer width="60%" height={250}>
                <PieChart>
                  <Pie
                    data={servicePopularity.slice(0, 6)}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {servicePopularity.slice(0, 6).map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155" }}
                    formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="w-[40%] space-y-2">
                {servicePopularity.slice(0, 6).map((service, i) => (
                  <div key={service.serviceType} className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-slate-400 truncate capitalize">{service.serviceType.replace(/_/g, " ")}</span>
                    <span className="text-white ml-auto">{service.count}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <NoData />
          )}
        </ChartCard>
      </div>
    </div>
  );
}

// === FINANCIAL SECTION ===
function FinancialSection({ data }: { data: ReportData }) {
  const { kpis, quoteFunnel, trends } = data;

  const marginPercent = parseFloat(kpis.totalQuoteValue) > 0
    ? (parseFloat(kpis.totalMargin) / parseFloat(kpis.totalQuoteValue) * 100).toFixed(1)
    : "0";

  const avgDealSize = kpis.totalBookings > 0
    ? parseFloat(kpis.totalRevenue) / kpis.totalBookings
    : 0;

  const pipelineValue = parseFloat(String(quoteFunnel.draft || 0)) + parseFloat(String(quoteFunnel.sent || 0));

  const financialKPIs = [
    { label: "Total Revenue", value: formatCurrency(kpis.totalRevenue), color: "emerald" },
    { label: "Total Margin", value: formatCurrency(kpis.totalMargin), color: "green" },
    { label: "Margin %", value: `${marginPercent}%`, color: "blue" },
    { label: "Avg Deal Size", value: formatCurrency(avgDealSize), color: "purple" },
    { label: "Collection Rate", value: `${kpis.collectionRate}%`, color: "cyan" },
    { label: "Pipeline Value", value: formatCurrency(pipelineValue), color: "yellow" },
  ];

  // Calculate monthly margin trends
  const marginTrends = trends.bookings.map((b, i) => {
    const quote = trends.quotes[i];
    const margin = quote ? quote.value * 0.3 : 0; // Estimated 30% margin
    return {
      month: formatMonth(b.month),
      revenue: b.revenue,
      margin: margin,
      collected: b.collected,
    };
  });

  return (
    <div className="space-y-6">
      {/* Financial KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {financialKPIs.map((kpi) => (
          <div key={kpi.label} className="bg-slate-800 rounded-lg p-4">
            <div className="text-slate-400 text-xs uppercase tracking-wide mb-1">{kpi.label}</div>
            <div className={`text-xl font-bold text-${kpi.color}-400`}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Revenue vs Margin Chart */}
      <ChartCard title="Revenue, Margin & Collection Analysis">
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={marginTrends}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
            <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155" }}
              formatter={(value: number) => [formatCurrency(value), ""]}
            />
            <Legend />
            <Bar dataKey="revenue" fill="#10b981" name="Revenue" radius={[4, 4, 0, 0]} />
            <Bar dataKey="margin" fill="#8b5cf6" name="Est. Margin" radius={[4, 4, 0, 0]} />
            <Line type="monotone" dataKey="collected" stroke="#f59e0b" strokeWidth={2} name="Collected" dot={{ fill: "#f59e0b" }} />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Quote Funnel Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Quote Pipeline Funnel">
          <div className="space-y-4">
            {["draft", "sent", "accepted", "expired"].map((stage, i) => {
              const value = quoteFunnel[stage] || 0;
              const maxValue = Math.max(...Object.values(quoteFunnel));
              const width = maxValue > 0 ? (value / maxValue) * 100 : 0;
              const colors = { draft: "#64748b", sent: "#3b82f6", accepted: "#10b981", expired: "#ef4444" };
              return (
                <div key={stage}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400 capitalize">{stage}</span>
                    <span className="text-white">{value}</span>
                  </div>
                  <div className="h-8 bg-slate-900 rounded overflow-hidden">
                    <div
                      className="h-full rounded transition-all duration-500"
                      style={{ width: `${width}%`, backgroundColor: colors[stage as keyof typeof colors] }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </ChartCard>

        <ChartCard title="Payment Status Distribution">
          {Object.keys(data.bookingsByPayment).length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={Object.entries(data.bookingsByPayment).map(([name, value], i) => ({
                    name: name.replace(/\b\w/g, (c) => c.toUpperCase()),
                    value,
                  }))}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                >
                  {Object.keys(data.bookingsByPayment).map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155" }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <NoData />
          )}
        </ChartCard>
      </div>
    </div>
  );
}

// === SUPPLIERS SECTION ===
function SuppliersSection({ data }: { data: SupplierPerformance[] }) {
  if (data.length === 0) {
    return (
      <div className="bg-slate-800 rounded-lg p-8 text-center">
        <Truck className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-300 mb-2">No Supplier Data Available</h3>
        <p className="text-slate-500">Supplier performance data will appear once bookings are processed through suppliers.</p>
      </div>
    );
  }

  // Calculate aggregate metrics
  const totalRequests = data.reduce((sum, s) => sum + s.totalRequests, 0);
  const totalConfirmed = data.reduce((sum, s) => sum + s.confirmedRequests, 0);
  const avgResponseTime = data.reduce((sum, s) => sum + s.avgResponseTime, 0) / data.length;
  const avgSatisfaction = data.reduce((sum, s) => sum + s.satisfactionScore, 0) / data.length;

  return (
    <div className="space-y-6">
      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="text-slate-400 text-xs uppercase mb-1">Total Requests</div>
          <div className="text-2xl font-bold text-blue-400">{totalRequests}</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="text-slate-400 text-xs uppercase mb-1">Confirmed</div>
          <div className="text-2xl font-bold text-green-400">{totalConfirmed}</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="text-slate-400 text-xs uppercase mb-1">Avg Response Time</div>
          <div className="text-2xl font-bold text-yellow-400">{avgResponseTime.toFixed(1)}h</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="text-slate-400 text-xs uppercase mb-1">Avg Satisfaction</div>
          <div className="text-2xl font-bold text-emerald-400">{avgSatisfaction.toFixed(1)}/5</div>
        </div>
      </div>

      {/* Supplier Performance Table */}
      <div className="bg-slate-800 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-slate-700">
          <h3 className="font-semibold">Supplier Performance Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3 text-left">Supplier</th>
                <th className="px-4 py-3 text-center">Requests</th>
                <th className="px-4 py-3 text-center">Confirmed</th>
                <th className="px-4 py-3 text-center">Success Rate</th>
                <th className="px-4 py-3 text-center">Avg Response</th>
                <th className="px-4 py-3 text-center">Reliability</th>
                <th className="px-4 py-3 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {data.map((supplier) => {
                const successRate = supplier.totalRequests > 0
                  ? (supplier.confirmedRequests / supplier.totalRequests * 100)
                  : 0;
                return (
                  <tr key={supplier.supplierId} className="hover:bg-slate-750">
                    <td className="px-4 py-3 font-medium">{supplier.supplierName}</td>
                    <td className="px-4 py-3 text-center">{supplier.totalRequests}</td>
                    <td className="px-4 py-3 text-center text-green-400">{supplier.confirmedRequests}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs ${
                        successRate >= 80 ? "bg-green-900 text-green-300" :
                        successRate >= 60 ? "bg-yellow-900 text-yellow-300" :
                        "bg-red-900 text-red-300"
                      }`}>
                        {successRate.toFixed(0)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">{supplier.avgResponseTime}h</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <div
                            key={star}
                            className={`w-2 h-2 rounded-full ${
                              star <= supplier.reliabilityScore ? "bg-emerald-400" : "bg-slate-600"
                            }`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">{formatCurrency(supplier.revenue)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Supplier Performance Chart */}
      <ChartCard title="Supplier Response Rate Comparison">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.slice(0, 10).map(s => ({
            name: s.supplierName.length > 15 ? s.supplierName.slice(0, 15) + "..." : s.supplierName,
            confirmed: s.confirmedRequests,
            declined: s.totalRequests - s.confirmedRequests,
          }))} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis type="number" stroke="#94a3b8" fontSize={11} />
            <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={120} />
            <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155" }} />
            <Legend />
            <Bar dataKey="confirmed" stackId="a" fill="#10b981" name="Confirmed" />
            <Bar dataKey="declined" stackId="a" fill="#ef4444" name="Declined/Pending" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

// === LEADS SECTION ===
function LeadsSection({ data }: { data: LeadMetrics | null }) {
  if (!data) {
    return (
      <div className="bg-slate-800 rounded-lg p-8 text-center">
        <Target className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-300 mb-2">Lead Intelligence Coming Soon</h3>
        <p className="text-slate-500">Lead scoring and intelligence metrics will appear once the system processes client interactions.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Lead Score Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-lg p-4 border-l-4 border-red-500">
          <div className="text-slate-400 text-xs uppercase mb-1">Hot Leads (80+)</div>
          <div className="text-2xl font-bold text-red-400">{data.hotLeads}</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border-l-4 border-yellow-500">
          <div className="text-slate-400 text-xs uppercase mb-1">Warm Leads (40-79)</div>
          <div className="text-2xl font-bold text-yellow-400">{data.warmLeads}</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border-l-4 border-blue-500">
          <div className="text-slate-400 text-xs uppercase mb-1">Cold Leads (&lt;40)</div>
          <div className="text-2xl font-bold text-blue-400">{data.coldLeads}</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border-l-4 border-green-500">
          <div className="text-slate-400 text-xs uppercase mb-1">Avg Days to Convert</div>
          <div className="text-2xl font-bold text-green-400">{data.avgTimeToConversion}</div>
        </div>
      </div>

      {/* Score Distribution & Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Lead Score Distribution">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.scoreDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="range" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155" }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {data.scoreDistribution.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Lead Status Breakdown">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data.statusDistribution}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={2}
                dataKey="count"
                nameKey="status"
                label={({ status, count }) => `${status}: ${count}`}
                labelLine={false}
              >
                {data.statusDistribution.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155" }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Conversion by Score */}
      <ChartCard title="Conversion Rate by Lead Score">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data.conversionByScore}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="scoreRange" stroke="#94a3b8" fontSize={11} />
            <YAxis stroke="#94a3b8" fontSize={11} />
            <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155" }} />
            <Legend />
            <Bar dataKey="total" fill="#64748b" name="Total Leads" radius={[4, 4, 0, 0]} />
            <Bar dataKey="converted" fill="#10b981" name="Converted" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

// === OPERATIONS SECTION ===
function OperationsSection({ data }: { data: ReportData }) {
  const { bookingsByStatus, bookingsByPayment, kpis } = data;

  return (
    <div className="space-y-6">
      {/* Operations KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="text-slate-400 text-xs uppercase mb-1">Total Bookings</div>
          <div className="text-2xl font-bold text-blue-400">{kpis.totalBookings}</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="text-slate-400 text-xs uppercase mb-1">Conversion Rate</div>
          <div className="text-2xl font-bold text-green-400">{kpis.conversionRate}%</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="text-slate-400 text-xs uppercase mb-1">Collection Rate</div>
          <div className="text-2xl font-bold text-emerald-400">{kpis.collectionRate}%</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="text-slate-400 text-xs uppercase mb-1">Outstanding</div>
          <div className="text-2xl font-bold text-yellow-400">{formatCurrency(kpis.totalBalance)}</div>
        </div>
      </div>

      {/* Booking Status & Payment Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Booking Status Distribution">
          {Object.keys(bookingsByStatus).length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={Object.entries(bookingsByStatus).map(([name, value]) => ({
                    name: name.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
                    value,
                  }))}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                >
                  {Object.keys(bookingsByStatus).map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155" }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <NoData />
          )}
        </ChartCard>

        <ChartCard title="Payment Status Overview">
          {Object.keys(bookingsByPayment).length > 0 ? (
            <div className="space-y-4 pt-4">
              {Object.entries(bookingsByPayment).map(([status, count], i) => {
                const total = Object.values(bookingsByPayment).reduce((a, b) => a + b, 0);
                const percent = total > 0 ? (count / total * 100) : 0;
                return (
                  <div key={status}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400 capitalize">{status}</span>
                      <span className="text-white">{count} ({percent.toFixed(0)}%)</span>
                    </div>
                    <div className="h-6 bg-slate-900 rounded overflow-hidden">
                      <div
                        className="h-full rounded transition-all duration-500"
                        style={{ width: `${percent}%`, backgroundColor: COLORS[i % COLORS.length] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <NoData />
          )}
        </ChartCard>
      </div>

      {/* Client Sources */}
      <ChartCard title="Client Acquisition Sources">
        {data.clientsBySource.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.clientsBySource.map(s => ({
              source: s.source.replace(/\b\w/g, c => c.toUpperCase()),
              count: s.count,
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="source" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155" }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {data.clientsBySource.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <NoData />
        )}
      </ChartCard>
    </div>
  );
}

// === HELPER COMPONENTS ===
function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-800 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-slate-300 mb-4">{title}</h3>
      {children}
    </div>
  );
}

function NoData() {
  return <div className="h-[200px] flex items-center justify-center text-slate-500">No data available</div>;
}
