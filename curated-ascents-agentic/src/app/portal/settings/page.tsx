"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut, Save, FileText, HelpCircle, Shield } from "lucide-react";

interface Profile {
  id: number;
  email: string;
  name: string | null;
  phone: string | null;
  country: string | null;
  preferredCurrency: string | null;
}

const CURRENCIES = ["USD", "EUR", "GBP", "NPR", "INR", "AUD", "CAD", "CHF", "JPY", "SGD"];

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", country: "", preferredCurrency: "USD" });

  useEffect(() => {
    fetch("/api/portal/profile")
      .then((res) => res.json())
      .then((data) => {
        setProfile(data);
        setForm({
          name: data.name || "",
          phone: data.phone || "",
          country: data.country || "",
          preferredCurrency: data.preferredCurrency || "USD",
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/portal/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/portal/auth/logout", { method: "POST" });
    router.push("/portal/login");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-white font-bold text-lg px-1">Settings</h2>

      {/* Profile Form */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-4">
        <h3 className="text-white font-semibold text-sm">Profile</h3>

        <div>
          <label className="block text-slate-400 text-xs mb-1">Email</label>
          <input
            type="email"
            value={profile?.email || ""}
            disabled
            className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-slate-400 text-xs mb-1">Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-slate-400 text-xs mb-1">Phone</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-slate-400 text-xs mb-1">Country</label>
          <input
            type="text"
            value={form.country}
            onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-slate-400 text-xs mb-1">Preferred Currency</label>
          <select
            value={form.preferredCurrency}
            onChange={(e) => setForm((f) => ({ ...f, preferredCurrency: e.target.value }))}
            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-2.5 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-500 transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      {/* Links */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
        <button
          onClick={() => router.push("/faq")}
          className="w-full px-5 py-3.5 flex items-center gap-3 text-left hover:bg-slate-700/50 transition border-b border-slate-700/50"
        >
          <HelpCircle className="w-4 h-4 text-slate-400" />
          <span className="text-slate-300 text-sm">FAQ</span>
        </button>
        <button
          onClick={() => router.push("/terms")}
          className="w-full px-5 py-3.5 flex items-center gap-3 text-left hover:bg-slate-700/50 transition border-b border-slate-700/50"
        >
          <FileText className="w-4 h-4 text-slate-400" />
          <span className="text-slate-300 text-sm">Terms & Conditions</span>
        </button>
        <button
          onClick={() => router.push("/privacy-policy")}
          className="w-full px-5 py-3.5 flex items-center gap-3 text-left hover:bg-slate-700/50 transition"
        >
          <Shield className="w-4 h-4 text-slate-400" />
          <span className="text-slate-300 text-sm">Privacy Policy</span>
        </button>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full py-3 bg-red-600/10 border border-red-600/30 text-red-400 font-medium rounded-2xl hover:bg-red-600/20 transition flex items-center justify-center gap-2"
      >
        <LogOut className="w-4 h-4" />
        Sign Out
      </button>
    </div>
  );
}
