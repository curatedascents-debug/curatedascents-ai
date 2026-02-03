"use client";

import React from "react";

interface ServiceCount {
  type: string;
  count: number;
}

interface ServiceSubNavProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  serviceCounts: ServiceCount[];
}

// Service type configuration with icons and display names
const SERVICE_CONFIG: Record<string, { label: string; icon: string }> = {
  all: { label: "All", icon: "grid-2x2" },
  hotel: { label: "Hotels", icon: "building" },
  transportation: { label: "Transport", icon: "car" },
  guide: { label: "Guides", icon: "compass" },
  porter: { label: "Porters", icon: "backpack" },
  flight: { label: "Flights", icon: "plane" },
  helicopter_sharing: { label: "Heli Share", icon: "helicopter" },
  helicopter_charter: { label: "Heli Charter", icon: "helicopter" },
  permit: { label: "Permits", icon: "file-text" },
  package: { label: "Packages", icon: "package" },
  miscellaneous: { label: "Misc", icon: "box" },
};

// SVG icons for each service type
function ServiceIcon({ name, className = "" }: { name: string; className?: string }) {
  const icons: Record<string, React.ReactElement> = {
    "grid-2x2": (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
    building: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <path d="M9 22v-4h6v4" />
        <path d="M8 6h.01" />
        <path d="M16 6h.01" />
        <path d="M12 6h.01" />
        <path d="M8 10h.01" />
        <path d="M16 10h.01" />
        <path d="M12 10h.01" />
        <path d="M8 14h.01" />
        <path d="M16 14h.01" />
        <path d="M12 14h.01" />
      </svg>
    ),
    car: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8c-.3.5-.1 1.2.4 1.5.5.3 1.1.1 1.5-.4l1.4-2.6h3.6L7 14H3c-.5 0-1 .4-1 1v2c0 .6.4 1 1 1h2" />
        <circle cx="7" cy="17" r="2" />
        <path d="M9 17h6" />
        <circle cx="17" cy="17" r="2" />
      </svg>
    ),
    compass: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
      </svg>
    ),
    backpack: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10z" />
        <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
        <path d="M8 21v-5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v5" />
        <path d="M8 10h8" />
        <path d="M8 18h8" />
      </svg>
    ),
    plane: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
      </svg>
    ),
    helicopter: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16" />
        <path d="M12 4v8" />
        <path d="M18 12a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4 4 4 0 0 1 4-4h8a4 4 0 0 1 4 4z" />
        <path d="M18 16v4" />
        <path d="M16 20h4" />
      </svg>
    ),
    "file-text": (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <line x1="10" y1="9" x2="8" y2="9" />
      </svg>
    ),
    package: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m7.5 4.27 9 5.15" />
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <path d="m3.3 7 8.7 5 8.7-5" />
        <path d="M12 22V12" />
      </svg>
    ),
    box: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <path d="m3.3 7 8.7 5 8.7-5" />
        <path d="M12 22V12" />
      </svg>
    ),
  };

  return icons[name] || null;
}

export default function ServiceSubNav({
  activeCategory,
  onCategoryChange,
  serviceCounts,
}: ServiceSubNavProps) {
  // Calculate total count for "All"
  const totalCount = serviceCounts.reduce((sum, sc) => sum + sc.count, 0);

  // Build the list of service types to display (only those with data or "all")
  const serviceTypes = ["all", ...serviceCounts.map((sc) => sc.type)];

  // Get count for a service type
  const getCount = (type: string): number => {
    if (type === "all") return totalCount;
    const found = serviceCounts.find((sc) => sc.type === type);
    return found?.count || 0;
  };

  return (
    <div className="mb-6">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
        {serviceTypes.map((type) => {
          const config = SERVICE_CONFIG[type] || { label: type, icon: "box" };
          const count = getCount(type);
          const isActive = activeCategory === type;

          return (
            <button
              key={type}
              onClick={() => onCategoryChange(type)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                isActive
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
              }`}
            >
              <ServiceIcon name={config.icon} className="w-4 h-4" />
              <span className="font-medium">{config.label}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  isActive
                    ? "bg-emerald-500/30 text-white"
                    : "bg-slate-700 text-slate-300"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
