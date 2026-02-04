"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ReportData {
  kpis: {
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
  };
  quoteFunnel: {
    draft: number;
    sent: number;
    accepted: number;
    expired: number;
  };
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

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

const formatCurrency = (value: number | string) => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return `$${num.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

const formatMonth = (month: string) => {
  const [year, m] = month.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[parseInt(m) - 1]} '${year.slice(2)}`;
};

export default function ReportsTab() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await fetch("/api/admin/reports");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to fetch");
      setData(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center text-slate-400 py-8">Loading reports...</div>;
  }

  if (error || !data) {
    return <div className="text-center text-red-400 py-8">{error || "No data available"}</div>;
  }

  const { kpis, quoteFunnel, bookingsByStatus, bookingsByPayment, clientsBySource, trends, topDestinations, servicePopularity } = data;

  // Prepare chart data
  const funnelData = [
    { name: "Draft", value: quoteFunnel.draft, fill: "#64748b" },
    { name: "Sent", value: quoteFunnel.sent, fill: "#3b82f6" },
    { name: "Accepted", value: quoteFunnel.accepted, fill: "#10b981" },
    { name: "Expired", value: quoteFunnel.expired, fill: "#ef4444" },
  ];

  const bookingStatusData = Object.entries(bookingsByStatus).map(([name, value], i) => ({
    name: name.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    value,
    fill: COLORS[i % COLORS.length],
  }));

  const paymentStatusData = Object.entries(bookingsByPayment).map(([name, value], i) => ({
    name: name.replace(/\b\w/g, (c) => c.toUpperCase()),
    value,
    fill: COLORS[i % COLORS.length],
  }));

  const sourceData = clientsBySource.map((s, i) => ({
    name: s.source.replace(/\b\w/g, (c) => c.toUpperCase()),
    value: s.count,
    fill: COLORS[i % COLORS.length],
  }));

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <KPICard label="Total Revenue" value={formatCurrency(kpis.totalRevenue)} color="emerald" />
        <KPICard label="Collected" value={formatCurrency(kpis.totalPaid)} color="green" />
        <KPICard label="Outstanding" value={formatCurrency(kpis.totalBalance)} color="yellow" />
        <KPICard label="Collection Rate" value={`${kpis.collectionRate}%`} color="blue" />
        <KPICard label="Conversion Rate" value={`${kpis.conversionRate}%`} color="purple" />
        <KPICard label="Total Bookings" value={kpis.totalBookings.toString()} color="slate" />
        <KPICard label="Total Clients" value={kpis.totalClients.toString()} color="slate" />
        <KPICard label="New This Month" value={kpis.newClientsThisMonth.toString()} color="emerald" />
        <KPICard label="Quote Value" value={formatCurrency(kpis.totalQuoteValue)} color="blue" />
        <KPICard label="Total Margin" value={formatCurrency(kpis.totalMargin)} color="green" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <ChartCard title="Revenue Trend (6 months)">
          {trends.bookings.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trends.bookings.map((t) => ({ ...t, month: formatMonth(t.month) }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155" }}
                  formatter={(value: number) => [formatCurrency(value), ""]}
                />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenue" dot={{ fill: "#10b981" }} />
                <Line type="monotone" dataKey="collected" stroke="#3b82f6" strokeWidth={2} name="Collected" dot={{ fill: "#3b82f6" }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <NoData />
          )}
        </ChartCard>

        {/* Quote Funnel */}
        <ChartCard title="Quote Funnel">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={funnelData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" stroke="#94a3b8" fontSize={11} />
              <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} width={70} />
              <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155" }} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {funnelData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Booking Status */}
        <ChartCard title="Booking Status">
          {bookingStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={bookingStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                >
                  {bookingStatusData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155" }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <NoData />
          )}
        </ChartCard>

        {/* Payment Status */}
        <ChartCard title="Payment Status">
          {paymentStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={paymentStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                >
                  {paymentStatusData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155" }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <NoData />
          )}
        </ChartCard>

        {/* Client Source */}
        <ChartCard title="Clients by Source">
          {sourceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
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

      {/* Charts Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Destinations */}
        <ChartCard title="Top Destinations by Quotes">
          {topDestinations.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topDestinations}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="destination" stroke="#94a3b8" fontSize={10} angle={-20} textAnchor="end" height={60} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155" }}
                  formatter={(value: number, name: string) => [name === "value" ? formatCurrency(value) : value, name === "value" ? "Value" : "Quotes"]}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Quotes" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <NoData />
          )}
        </ChartCard>

        {/* Service Popularity */}
        <ChartCard title="Service Types">
          {servicePopularity.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={servicePopularity.slice(0, 8)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                <YAxis
                  dataKey="serviceType"
                  type="category"
                  stroke="#94a3b8"
                  fontSize={10}
                  width={100}
                  tickFormatter={(v) => v.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}
                />
                <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155" }} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Items" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <NoData />
          )}
        </ChartCard>
      </div>

      {/* Client Growth Trend */}
      <ChartCard title="Client Acquisition Trend">
        {trends.clients.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={trends.clients.map((t) => ({ ...t, month: formatMonth(t.month) }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155" }} />
              <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} name="New Clients" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <NoData />
        )}
      </ChartCard>
    </div>
  );
}

function KPICard({ label, value, color }: { label: string; value: string; color: string }) {
  const colorClasses: Record<string, string> = {
    emerald: "text-emerald-400",
    green: "text-green-400",
    yellow: "text-yellow-400",
    blue: "text-blue-400",
    purple: "text-purple-400",
    slate: "text-slate-300",
  };

  return (
    <div className="bg-slate-800 rounded-lg p-4">
      <div className="text-slate-400 text-xs uppercase tracking-wide mb-1">{label}</div>
      <div className={`text-xl font-bold ${colorClasses[color] || "text-white"}`}>{value}</div>
    </div>
  );
}

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
