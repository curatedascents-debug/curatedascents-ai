"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Map, MessageCircle, Award, MoreHorizontal } from "lucide-react";
import CuratedAscentsLogo from "@/components/icons/CuratedAscentsLogo";

interface ClientProfile {
  id: number;
  email: string;
  name: string | null;
}

const NAV_ITEMS = [
  { href: "/portal", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/portal/trips", icon: Map, label: "Trips" },
  { href: "/portal/chat", icon: MessageCircle, label: "Chat" },
  { href: "/portal/loyalty", icon: Award, label: "Loyalty" },
  { href: "/portal/settings", icon: MoreHorizontal, label: "More" },
];

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [client, setClient] = useState<ClientProfile | null>(null);

  // Don't show shell on login page
  const isLoginPage = pathname === "/portal/login";

  useEffect(() => {
    if (isLoginPage) return;
    fetch("/api/portal/auth/me")
      .then((res) => {
        if (!res.ok) throw new Error("Not authenticated");
        return res.json();
      })
      .then(setClient)
      .catch(() => router.push("/portal/login"));
  }, [isLoginPage, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Top header */}
      <header className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 px-4 py-3 flex items-center gap-3 sticky top-0 z-40">
        <CuratedAscentsLogo className="text-emerald-400" size={28} />
        <div className="flex-1 min-w-0">
          <h1 className="text-white font-semibold text-sm truncate">CuratedAscents</h1>
          {client?.name && (
            <p className="text-slate-400 text-xs truncate">{client.name}</p>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-800/95 backdrop-blur-sm border-t border-slate-700 z-50" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = item.href === "/portal"
              ? pathname === "/portal"
              : pathname.startsWith(item.href);
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`flex flex-col items-center py-2 px-3 min-w-[64px] transition ${
                  isActive ? "text-emerald-400" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] mt-1 font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
