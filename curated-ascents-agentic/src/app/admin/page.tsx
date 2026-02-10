"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import AdminTabs, { type TabType } from "@/components/admin/AdminTabs";
import AdminStats from "@/components/admin/AdminStats";
import RatesTab from "@/components/admin/RatesTab";
import SuppliersTab from "@/components/admin/SuppliersTab";
import HotelsTab from "@/components/admin/HotelsTab";
import ClientsTab from "@/components/admin/ClientsTab";
import QuotesTab from "@/components/admin/QuotesTab";
import BookingsTab from "@/components/admin/BookingsTab";
import AdvancedReportsTab from "@/components/admin/AdvancedReportsTab";
import SupplierPortalTab from "@/components/admin/SupplierPortalTab";
import PricingTab from "@/components/admin/PricingTab";
import NurtureTab from "@/components/admin/NurtureTab";
import CompetitorTab from "@/components/admin/CompetitorTab";
import BlogTab from "@/components/admin/BlogTab";
import WhatsAppTab from "@/components/admin/WhatsAppTab";
import MediaTab from "@/components/admin/MediaTab";

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("rates");
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [destinations, setDestinations] = useState<any[]>([]);
  const [counts, setCounts] = useState({
    rates: 0,
    suppliers: 0,
    hotels: 0,
    clients: 0,
    quotes: 0,
    bookings: 0,
    agencies: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/rates").then((r) => r.json()),
      fetch("/api/admin/suppliers").then((r) => r.json()),
      fetch("/api/admin/hotels").then((r) => r.json()),
      fetch("/api/admin/destinations").then((r) => r.json()),
      fetch("/api/admin/clients").then((r) => r.json()),
      fetch("/api/admin/quotes").then((r) => r.json()),
      fetch("/api/admin/bookings").then((r) => r.json()),
      fetch("/api/admin/agencies").then((r) => r.json()),
    ])
      .then(([ratesData, suppliersData, hotelsData, destinationsData, clientsData, quotesData, bookingsData, agenciesData]) => {
        setSuppliers(suppliersData.suppliers || []);
        setDestinations(destinationsData.destinations || []);
        setCounts({
          rates: (ratesData.rates || []).length,
          suppliers: (suppliersData.suppliers || []).length,
          hotels: (hotelsData.hotels || []).length,
          clients: (clientsData.clients || []).length,
          quotes: (quotesData.quotes || []).length,
          bookings: (bookingsData.bookings || []).length,
          agencies: (agenciesData.agencies || []).length,
        });
      })
      .catch((err) => console.error("Error loading admin data:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const stats = [
    { label: "Total Rates", value: counts.rates, color: "text-emerald-400" },
    { label: "Suppliers", value: counts.suppliers, color: "text-blue-400" },
    { label: "Hotels", value: counts.hotels, color: "text-purple-400" },
    { label: "Clients", value: counts.clients, color: "text-cyan-400" },
    { label: "Quotes", value: counts.quotes, color: "text-orange-400" },
    { label: "Bookings", value: counts.bookings, color: "text-pink-400" },
    { label: "Supplier Portal", value: counts.agencies, color: "text-orange-400" },
  ];

  const tabs = [
    { key: "rates" as TabType, label: "Rates", count: counts.rates },
    { key: "suppliers" as TabType, label: "Suppliers", count: counts.suppliers },
    { key: "hotels" as TabType, label: "Hotels", count: counts.hotels },
    { key: "clients" as TabType, label: "Clients", count: counts.clients },
    { key: "quotes" as TabType, label: "Quotes", count: counts.quotes },
    { key: "bookings" as TabType, label: "Bookings", count: counts.bookings },
    { key: "agencies" as TabType, label: "Supplier Portal" },
    { key: "pricing" as TabType, label: "Pricing" },
    { key: "nurture" as TabType, label: "Nurture" },
    { key: "competitors" as TabType, label: "Competitors" },
    { key: "blog" as TabType, label: "Blog" },
    { key: "whatsapp" as TabType, label: "WhatsApp" },
    { key: "media" as TabType, label: "Media" },
    { key: "reports" as TabType, label: "Reports" },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-emerald-400 mb-2">CuratedAscents Admin</h1>
            <p className="text-slate-400">Manage suppliers, hotels, rates, clients, quotes & bookings</p>
          </div>
          <div className="flex gap-3">
            <a href="/" className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded transition-colors">
              &larr; Back to Chat
            </a>
            <button
              onClick={async () => {
                await fetch("/api/admin/auth/logout", { method: "POST" });
                router.push("/admin/login");
                router.refresh();
              }}
              className="px-4 py-2 bg-slate-700 hover:bg-red-600 rounded transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        <AdminStats stats={stats} />
        <AdminTabs activeTab={activeTab} onTabChange={setActiveTab} tabs={tabs} />

        {activeTab === "rates" && (
          <RatesTab suppliers={suppliers} hotels={[]} destinations={destinations} />
        )}
        {activeTab === "suppliers" && <SuppliersTab />}
        {activeTab === "hotels" && <HotelsTab suppliers={suppliers} destinations={destinations} />}
        {activeTab === "clients" && <ClientsTab />}
        {activeTab === "quotes" && <QuotesTab />}
        {activeTab === "bookings" && <BookingsTab />}
        {activeTab === "agencies" && <SupplierPortalTab />}
        {activeTab === "pricing" && <PricingTab />}
        {activeTab === "nurture" && <NurtureTab />}
        {activeTab === "competitors" && <CompetitorTab />}
        {activeTab === "blog" && <BlogTab destinations={destinations} />}
        {activeTab === "whatsapp" && <WhatsAppTab />}
        {activeTab === "media" && <MediaTab />}
        {activeTab === "reports" && <AdvancedReportsTab />}
      </div>
    </div>
  );
}
