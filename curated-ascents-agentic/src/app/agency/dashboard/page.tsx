"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Users,
  FileText,
  Calendar,
  LogOut,
  Loader2,
  BarChart3,
} from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import ClientsTab from "@/components/admin/ClientsTab";
import QuotesTab from "@/components/admin/QuotesTab";
import BookingsTab from "@/components/admin/BookingsTab";

type TabType = "clients" | "quotes" | "bookings" | "reports";

interface AgencyUser {
  id: number;
  email: string;
  name: string | null;
  role: string;
}

interface Agency {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
  currency: string;
}

export default function AgencyDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("clients");
  const [user, setUser] = useState<AgencyUser | null>(null);
  const [agency, setAgency] = useState<Agency | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();
  const { theme } = useTheme();

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const res = await fetch("/api/agency/auth/me");
      if (!res.ok) {
        router.push("/agency/login");
        return;
      }
      const data = await res.json();
      setUser(data.user);
      setAgency(data.agency);
    } catch (error) {
      console.error("Error fetching user info:", error);
      router.push("/agency/login");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/agency/auth/logout", { method: "POST" });
      router.push("/agency/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoggingOut(false);
    }
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: "clients", label: "Clients", icon: <Users className="w-4 h-4" /> },
    { id: "quotes", label: "Quotes", icon: <FileText className="w-4 h-4" /> },
    { id: "bookings", label: "Bookings", icon: <Calendar className="w-4 h-4" /> },
    { id: "reports", label: "Reports", icon: <BarChart3 className="w-4 h-4" /> },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: theme.primaryColor }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Agency Name */}
            <div className="flex items-center gap-3">
              {agency?.logo ? (
                <img
                  src={agency.logo}
                  alt={agency.name}
                  className="h-8 w-auto"
                />
              ) : (
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${theme.primaryColor}20` }}
                >
                  <Building2 className="w-5 h-5" style={{ color: theme.primaryColor }} />
                </div>
              )}
              <div>
                <h1 className="text-lg font-semibold text-white">
                  {agency?.name || "Agency Portal"}
                </h1>
                <p className="text-xs text-slate-400">Agency Dashboard</p>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-white">
                  {user?.name || user?.email}
                </p>
                <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                title="Sign Out"
              >
                {loggingOut ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <LogOut className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-slate-800/50 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-1 -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-current text-white"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
                style={activeTab === tab.id ? { borderColor: theme.primaryColor, color: theme.primaryColor } : undefined}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "clients" && <ClientsTab apiBasePath="/api/agency" />}
        {activeTab === "quotes" && <QuotesTab apiBasePath="/api/agency" />}
        {activeTab === "bookings" && <BookingsTab apiBasePath="/api/agency" />}
        {activeTab === "reports" && (
          <div className="bg-slate-800 rounded-lg p-8 text-center">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 text-slate-500" />
            <h3 className="text-lg font-medium text-white mb-2">Reports Coming Soon</h3>
            <p className="text-slate-400">
              Analytics and reporting features will be available in a future update.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
