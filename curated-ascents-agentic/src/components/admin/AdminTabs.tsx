"use client";

export type TabType = "rates" | "suppliers" | "hotels" | "clients" | "quotes" | "bookings" | "reports" | "agencies" | "pricing" | "nurture" | "competitors" | "blog" | "whatsapp" | "media" | "price-alerts";

interface TabConfig {
  key: TabType;
  label: string;
  count?: number;
}

interface AdminTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  tabs: TabConfig[];
}

export default function AdminTabs({ activeTab, onTabChange, tabs }: AdminTabsProps) {
  return (
    <div className="flex gap-2 mb-6 border-b border-slate-700 pb-4 flex-wrap">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`px-4 py-2 rounded-t transition-colors ${
            activeTab === tab.key
              ? "bg-emerald-600 text-white"
              : "bg-slate-800 text-slate-400 hover:bg-slate-700"
          }`}
        >
          {tab.label}{tab.count !== undefined ? ` (${tab.count})` : ""}
        </button>
      ))}
    </div>
  );
}
