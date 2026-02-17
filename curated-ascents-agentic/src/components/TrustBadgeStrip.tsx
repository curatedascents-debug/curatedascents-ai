"use client";

import { Lock, Building2, CalendarCheck, Headphones } from "lucide-react";

interface TrustBadgeStripProps {
  variant?: "light" | "dark";
}

export default function TrustBadgeStrip({ variant = "light" }: TrustBadgeStripProps) {
  const textColor = variant === "dark" ? "text-slate-400" : "text-luxury-charcoal/60";
  const iconColor = variant === "dark" ? "text-emerald-400" : "text-luxury-gold";
  const linkHover = variant === "dark" ? "hover:text-emerald-300" : "hover:text-luxury-gold";

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 py-3 px-4">
      <span className={`flex items-center gap-1.5 text-xs ${textColor}`}>
        <Lock className={`w-3.5 h-3.5 ${iconColor}`} />
        Secure Payment
      </span>
      <span className={`flex items-center gap-1.5 text-xs ${textColor}`}>
        <Building2 className={`w-3.5 h-3.5 ${iconColor}`} />
        Bank Transfer Available
      </span>
      <span className={`flex items-center gap-1.5 text-xs ${textColor}`}>
        <CalendarCheck className={`w-3.5 h-3.5 ${iconColor}`} />
        <a href="/cancellation-policy" className={`${linkHover} transition-colors`}>
          Flexible Cancellation
        </a>
      </span>
      <span className={`flex items-center gap-1.5 text-xs ${textColor}`}>
        <Headphones className={`w-3.5 h-3.5 ${iconColor}`} />
        24/7 Support
      </span>
    </div>
  );
}
