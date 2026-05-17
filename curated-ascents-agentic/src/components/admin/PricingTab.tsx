"use client";

import { useState, useEffect, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PricingRule {
  id: number;
  name: string;
  description?: string;
  ruleType: string;
  serviceType?: string;
  adjustmentType: string;
  adjustmentValue: string;
  minPrice?: string;
  maxPrice?: string;
  validFrom?: string;
  validTo?: string;
  priority: number;
  isActive: boolean;
  isAutoApply: boolean;
  conditions?: Record<string, unknown>;
  createdAt: string;
}

interface DemandMetric {
  id: number;
  metricDate: string;
  serviceType?: string;
  destinationId?: number;
  demandScore: string;
  searchCount: number;
  inquiryCount: number;
  quotesGenerated: number;
  bookingsConfirmed: number;
  conversionRate?: string;
  occupancyRate?: string;
}

interface SimulationResult {
  date: string;
  basePrice: number;
  finalPrice: number;
  appliedRules: Array<{
    ruleName: string;
    ruleType: string;
    adjustmentValue: number;
    priceAfterRule: number;
  }>;
  demandScore?: number;
}

interface ServiceMargin {
  id: number;
  serviceTypeKey: string;
  displayName: string | null;
  b2cMarginPercent: string;
  agentMarginPercent: string;
}

interface EarlyBirdRule {
  id: number;
  daysInAdvance: number;
  discountPercent: string;
  isActive: boolean | null;
  label: string | null;
}

interface GroupDiscountRule {
  id: number;
  minPax: number;
  maxPax: number | null;
  discountPercent: string;
  isActive: boolean | null;
  label: string | null;
}

interface LastMinuteRule {
  id: number;
  daysBeforeDeparture: number;
  discountPercent: string;
  isActive: boolean | null;
  label: string | null;
}

interface LoyaltyTier {
  id: number;
  tierName: string;
  minPoints: number;
  discountPercent: string;
  isActive: boolean | null;
}

type SubTab = "rules" | "demand" | "simulate" | "analytics" | "margins" | "discount-rules" | "pricing-config";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const marginColor = (pct: string) => {
  const n = parseFloat(pct);
  if (n >= 40) return "text-green-400";
  if (n >= 20) return "text-yellow-400";
  return "text-red-400";
};

const marginBg = (pct: string) => {
  const n = parseFloat(pct);
  if (n >= 40) return "bg-green-900/30 text-green-300";
  if (n >= 20) return "bg-yellow-900/30 text-yellow-300";
  return "bg-red-900/30 text-red-300";
};

const inputCls = "w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500";
const labelCls = "block text-xs text-slate-400 mb-1";

// ─── Sub-components ───────────────────────────────────────────────────────────

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? "bg-emerald-600" : "bg-slate-600"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function SectionCard({
  title,
  children,
  expanded,
  onToggle,
}: {
  title: string;
  children: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden mb-4">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-750"
      >
        <span className="text-white font-medium">{title}</span>
        <svg
          className={`w-5 h-5 text-slate-400 transition-transform ${expanded ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {expanded && <div className="border-t border-slate-700 px-5 pb-5 pt-4">{children}</div>}
    </div>
  );
}

// ─── Modals ───────────────────────────────────────────────────────────────────

function EditMarginModal({
  margin,
  onClose,
  onSave,
}: {
  margin: ServiceMargin;
  onClose: () => void;
  onSave: () => void;
}) {
  const [b2c, setB2c] = useState(parseFloat(margin.b2cMarginPercent).toFixed(1));
  const [agent, setAgent] = useState(parseFloat(margin.agentMarginPercent).toFixed(1));
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`/api/admin/pricing/service-margins/${margin.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ b2cMarginPercent: parseFloat(b2c), agentMarginPercent: parseFloat(agent) }),
      });
      onSave();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-sm p-6">
        <h3 className="text-white font-semibold mb-1">Edit Margins</h3>
        <p className="text-slate-400 text-sm mb-5">{margin.displayName || margin.serviceTypeKey}</p>
        <div className="space-y-4">
          <div>
            <label className={labelCls}>B2C Margin %</label>
            <input type="number" step="0.5" value={b2c} onChange={e => setB2c(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Agent Margin %</label>
            <input type="number" step="0.5" value={agent} onChange={e => setAgent(e.target.value)} className={inputCls} />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm px-4 py-2">Cancel</button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 text-white text-sm px-4 py-2 rounded"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function EarlyBirdModal({
  rule,
  onClose,
  onSave,
}: {
  rule: EarlyBirdRule | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const [form, setForm] = useState({
    daysInAdvance: rule?.daysInAdvance?.toString() ?? "",
    discountPercent: rule ? parseFloat(rule.discountPercent).toFixed(1) : "",
    isActive: rule?.isActive ?? false,
    label: rule?.label ?? "",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = rule ? `/api/admin/pricing/rules/early-bird/${rule.id}` : "/api/admin/pricing/rules/early-bird";
      await fetch(url, {
        method: rule ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          daysInAdvance: parseInt(form.daysInAdvance),
          discountPercent: parseFloat(form.discountPercent),
          isActive: form.isActive,
          label: form.label || null,
        }),
      });
      onSave();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-sm p-6">
        <h3 className="text-white font-semibold mb-5">{rule ? "Edit" : "Add"} Early Bird Rule</h3>
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Days in Advance</label>
            <input type="number" value={form.daysInAdvance} onChange={e => setForm({ ...form, daysInAdvance: e.target.value })} className={inputCls} placeholder="e.g. 90" />
          </div>
          <div>
            <label className={labelCls}>Discount %</label>
            <input type="number" step="0.5" value={form.discountPercent} onChange={e => setForm({ ...form, discountPercent: e.target.value })} className={inputCls} placeholder="e.g. 15" />
          </div>
          <div>
            <label className={labelCls}>Label (optional)</label>
            <input type="text" value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} className={inputCls} placeholder="e.g. Early Bird 90+ days" />
          </div>
          <div className="flex items-center gap-3">
            <Toggle enabled={form.isActive} onChange={() => setForm({ ...form, isActive: !form.isActive })} />
            <span className="text-sm text-slate-400">Active</span>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm px-4 py-2">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 text-white text-sm px-4 py-2 rounded">
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function GroupDiscountModal({
  rule,
  onClose,
  onSave,
}: {
  rule: GroupDiscountRule | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const [form, setForm] = useState({
    minPax: rule?.minPax?.toString() ?? "",
    maxPax: rule?.maxPax?.toString() ?? "",
    discountPercent: rule ? parseFloat(rule.discountPercent).toFixed(1) : "",
    isActive: rule?.isActive ?? false,
    label: rule?.label ?? "",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = rule ? `/api/admin/pricing/rules/group/${rule.id}` : "/api/admin/pricing/rules/group";
      await fetch(url, {
        method: rule ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          minPax: parseInt(form.minPax),
          maxPax: form.maxPax ? parseInt(form.maxPax) : null,
          discountPercent: parseFloat(form.discountPercent),
          isActive: form.isActive,
          label: form.label || null,
        }),
      });
      onSave();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-sm p-6">
        <h3 className="text-white font-semibold mb-5">{rule ? "Edit" : "Add"} Group Discount Rule</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Min Pax</label>
              <input type="number" value={form.minPax} onChange={e => setForm({ ...form, minPax: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Max Pax (blank = unlimited)</label>
              <input type="number" value={form.maxPax} onChange={e => setForm({ ...form, maxPax: e.target.value })} className={inputCls} placeholder="∞" />
            </div>
          </div>
          <div>
            <label className={labelCls}>Discount %</label>
            <input type="number" step="0.5" value={form.discountPercent} onChange={e => setForm({ ...form, discountPercent: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Label (optional)</label>
            <input type="text" value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} className={inputCls} />
          </div>
          <div className="flex items-center gap-3">
            <Toggle enabled={form.isActive} onChange={() => setForm({ ...form, isActive: !form.isActive })} />
            <span className="text-sm text-slate-400">Active</span>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm px-4 py-2">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 text-white text-sm px-4 py-2 rounded">
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function LastMinuteModal({
  rule,
  onClose,
  onSave,
}: {
  rule: LastMinuteRule | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const [form, setForm] = useState({
    daysBeforeDeparture: rule?.daysBeforeDeparture?.toString() ?? "",
    discountPercent: rule ? parseFloat(rule.discountPercent).toFixed(1) : "",
    isActive: rule?.isActive ?? false,
    label: rule?.label ?? "",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = rule ? `/api/admin/pricing/rules/last-minute/${rule.id}` : "/api/admin/pricing/rules/last-minute";
      await fetch(url, {
        method: rule ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          daysBeforeDeparture: parseInt(form.daysBeforeDeparture),
          discountPercent: parseFloat(form.discountPercent),
          isActive: form.isActive,
          label: form.label || null,
        }),
      });
      onSave();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-sm p-6">
        <h3 className="text-white font-semibold mb-5">{rule ? "Edit" : "Add"} Last Minute Rule</h3>
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Days Before Departure</label>
            <input type="number" value={form.daysBeforeDeparture} onChange={e => setForm({ ...form, daysBeforeDeparture: e.target.value })} className={inputCls} placeholder="e.g. 14" />
          </div>
          <div>
            <label className={labelCls}>Discount %</label>
            <input type="number" step="0.5" value={form.discountPercent} onChange={e => setForm({ ...form, discountPercent: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Label (optional)</label>
            <input type="text" value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} className={inputCls} />
          </div>
          <div className="flex items-center gap-3">
            <Toggle enabled={form.isActive} onChange={() => setForm({ ...form, isActive: !form.isActive })} />
            <span className="text-sm text-slate-400">Active</span>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm px-4 py-2">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 text-white text-sm px-4 py-2 rounded">
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function LoyaltyTierModal({
  rule,
  onClose,
  onSave,
}: {
  rule: LoyaltyTier | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const [form, setForm] = useState({
    tierName: rule?.tierName ?? "",
    minPoints: rule?.minPoints?.toString() ?? "",
    discountPercent: rule ? parseFloat(rule.discountPercent).toFixed(1) : "",
    isActive: rule?.isActive ?? false,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = rule ? `/api/admin/pricing/rules/loyalty/${rule.id}` : "/api/admin/pricing/rules/loyalty";
      await fetch(url, {
        method: rule ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tierName: form.tierName,
          minPoints: parseInt(form.minPoints),
          discountPercent: parseFloat(form.discountPercent),
          isActive: form.isActive,
        }),
      });
      onSave();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-sm p-6">
        <h3 className="text-white font-semibold mb-5">{rule ? "Edit" : "Add"} Loyalty Tier</h3>
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Tier Name</label>
            <input type="text" value={form.tierName} onChange={e => setForm({ ...form, tierName: e.target.value })} className={inputCls} placeholder="e.g. Gold" />
          </div>
          <div>
            <label className={labelCls}>Min Points</label>
            <input type="number" value={form.minPoints} onChange={e => setForm({ ...form, minPoints: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Discount %</label>
            <input type="number" step="0.5" value={form.discountPercent} onChange={e => setForm({ ...form, discountPercent: e.target.value })} className={inputCls} />
          </div>
          <div className="flex items-center gap-3">
            <Toggle enabled={form.isActive} onChange={() => setForm({ ...form, isActive: !form.isActive })} />
            <span className="text-sm text-slate-400">Active</span>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm px-4 py-2">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 text-white text-sm px-4 py-2 rounded">
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PricingTab() {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("rules");

  // Existing state
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [metrics, setMetrics] = useState<DemandMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [editingRule, setEditingRule] = useState<PricingRule | null>(null);

  // Service margins state
  const [serviceMargins, setServiceMargins] = useState<ServiceMargin[]>([]);
  const [marginsLoading, setMarginsLoading] = useState(false);
  const [editingMargin, setEditingMargin] = useState<ServiceMargin | null>(null);

  // Discount rules state
  const [earlyBirdRules, setEarlyBirdRules] = useState<EarlyBirdRule[]>([]);
  const [groupDiscountRules, setGroupDiscountRules] = useState<GroupDiscountRule[]>([]);
  const [lastMinuteRules, setLastMinuteRules] = useState<LastMinuteRule[]>([]);
  const [loyaltyTiers, setLoyaltyTiers] = useState<LoyaltyTier[]>([]);
  const [discountRulesLoading, setDiscountRulesLoading] = useState(false);

  // Expandable cards
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({
    earlyBird: true,
    group: true,
    lastMinute: true,
    loyalty: true,
  });

  // Discount rule modals
  const [earlyBirdModal, setEarlyBirdModal] = useState<{ open: boolean; rule: EarlyBirdRule | null }>({ open: false, rule: null });
  const [groupModal, setGroupModal] = useState<{ open: boolean; rule: GroupDiscountRule | null }>({ open: false, rule: null });
  const [lastMinuteModal, setLastMinuteModal] = useState<{ open: boolean; rule: LastMinuteRule | null }>({ open: false, rule: null });
  const [loyaltyModal, setLoyaltyModal] = useState<{ open: boolean; rule: LoyaltyTier | null }>({ open: false, rule: null });

  // Pricing config state
  const [discountsEnabled, setDiscountsEnabled] = useState<boolean | null>(null);
  const [configLoading, setConfigLoading] = useState(false);
  const [configSaving, setConfigSaving] = useState(false);

  // Simulation state
  const [simForm, setSimForm] = useState({
    serviceType: "hotel",
    basePrice: "100",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    paxCount: "2",
    loyaltyTier: "",
  });
  const [simResults, setSimResults] = useState<SimulationResult[]>([]);
  const [simLoading, setSimLoading] = useState(false);

  // Analytics state
  const [analytics, setAnalytics] = useState<{
    totalAdjustments: number;
    averageAdjustment: number;
    ruleBreakdown: Record<string, { count: number; totalImpact: number }>;
  } | null>(null);

  // ─── Fetch functions ────────────────────────────────────────────────────────

  const fetchRules = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/pricing/rules");
      const data = await res.json();
      setRules(data.rules || []);
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, []);

  const fetchDemandMetrics = useCallback(async () => {
    setLoading(true);
    try {
      const end = new Date().toISOString().split("T")[0];
      const start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      const res = await fetch(`/api/admin/pricing/demand?startDate=${start}&endDate=${end}`);
      const data = await res.json();
      setMetrics(data.metrics || []);
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const end = new Date().toISOString().split("T")[0];
      const start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      const res = await fetch(`/api/admin/pricing/analytics?startDate=${start}&endDate=${end}`);
      const data = await res.json();
      setAnalytics(data);
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, []);

  const fetchServiceMargins = useCallback(async () => {
    setMarginsLoading(true);
    try {
      const res = await fetch("/api/admin/pricing/service-margins");
      const data = await res.json();
      setServiceMargins(data.margins || []);
    } catch { /* silent */ } finally {
      setMarginsLoading(false);
    }
  }, []);

  const fetchDiscountRules = useCallback(async () => {
    setDiscountRulesLoading(true);
    try {
      const [eb, grp, lm, lt] = await Promise.all([
        fetch("/api/admin/pricing/rules/early-bird").then(r => r.json()),
        fetch("/api/admin/pricing/rules/group").then(r => r.json()),
        fetch("/api/admin/pricing/rules/last-minute").then(r => r.json()),
        fetch("/api/admin/pricing/rules/loyalty").then(r => r.json()),
      ]);
      setEarlyBirdRules(eb.rules || []);
      setGroupDiscountRules(grp.rules || []);
      setLastMinuteRules(lm.rules || []);
      setLoyaltyTiers(lt.rules || []);
    } catch { /* silent */ } finally {
      setDiscountRulesLoading(false);
    }
  }, []);

  const fetchPricingConfig = useCallback(async () => {
    setConfigLoading(true);
    try {
      const res = await fetch("/api/admin/pricing/config?key=discounts_enabled");
      const data = await res.json();
      setDiscountsEnabled(data.value === "true");
    } catch {
      setDiscountsEnabled(false);
    } finally {
      setConfigLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeSubTab === "rules") fetchRules();
    else if (activeSubTab === "demand") fetchDemandMetrics();
    else if (activeSubTab === "analytics") fetchAnalytics();
    else if (activeSubTab === "margins") fetchServiceMargins();
    else if (activeSubTab === "discount-rules") fetchDiscountRules();
    else if (activeSubTab === "pricing-config") fetchPricingConfig();
  }, [activeSubTab, fetchRules, fetchDemandMetrics, fetchAnalytics, fetchServiceMargins, fetchDiscountRules, fetchPricingConfig]);

  // ─── Actions ────────────────────────────────────────────────────────────────

  const toggleDiscountsEnabled = async () => {
    const next = !discountsEnabled;
    setConfigSaving(true);
    try {
      await fetch("/api/admin/pricing/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "discounts_enabled", value: String(next) }),
      });
      setDiscountsEnabled(next);
    } finally {
      setConfigSaving(false);
    }
  };

  const toggleRuleActive = async (
    table: "early-bird" | "group" | "last-minute" | "loyalty",
    id: number,
    current: boolean | null
  ) => {
    await fetch(`/api/admin/pricing/rules/${table}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !current }),
    });
    fetchDiscountRules();
  };

  const deleteDiscountRule = async (table: "early-bird" | "group" | "last-minute" | "loyalty", id: number) => {
    if (!confirm("Delete this rule?")) return;
    await fetch(`/api/admin/pricing/rules/${table}/${id}`, { method: "DELETE" });
    fetchDiscountRules();
  };

  const toggleRuleStatus = async (ruleId: number, current: boolean) => {
    await fetch(`/api/admin/pricing/rules/${ruleId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !current }),
    });
    fetchRules();
  };

  const deleteRule = async (ruleId: number) => {
    if (!confirm("Delete this pricing rule?")) return;
    await fetch(`/api/admin/pricing/rules/${ruleId}`, { method: "DELETE" });
    fetchRules();
  };

  const runSimulation = async () => {
    setSimLoading(true);
    try {
      const res = await fetch("/api/admin/pricing/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceType: simForm.serviceType,
          serviceId: 1,
          basePrice: parseFloat(simForm.basePrice),
          startDate: simForm.startDate,
          endDate: simForm.endDate,
          paxCount: parseInt(simForm.paxCount) || 1,
          loyaltyTier: simForm.loyaltyTier || undefined,
        }),
      });
      const data = await res.json();
      setSimResults(data.results || []);
    } finally {
      setSimLoading(false);
    }
  };

  const toggleCard = (key: string) =>
    setExpandedCards(prev => ({ ...prev, [key]: !prev[key] }));

  // ─── Misc helpers ────────────────────────────────────────────────────────────

  const getRuleTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      seasonal: "bg-blue-500/20 text-blue-400",
      demand: "bg-purple-500/20 text-purple-400",
      early_bird: "bg-green-500/20 text-green-400",
      last_minute: "bg-orange-500/20 text-orange-400",
      group: "bg-cyan-500/20 text-cyan-400",
      loyalty: "bg-yellow-500/20 text-yellow-400",
      promotional: "bg-pink-500/20 text-pink-400",
      weekend: "bg-indigo-500/20 text-indigo-400",
      peak_day: "bg-red-500/20 text-red-400",
    };
    return colors[type] || "bg-slate-500/20 text-slate-400";
  };

  const getDemandScoreColor = (score: number) => {
    if (score >= 80) return "text-red-400";
    if (score >= 60) return "text-orange-400";
    if (score >= 40) return "text-yellow-400";
    if (score >= 20) return "text-green-400";
    return "text-blue-400";
  };

  const formatAdjustment = (type: string, value: string) => {
    const num = parseFloat(value);
    if (type === "percentage") return num >= 0 ? `+${num}%` : `${num}%`;
    return num >= 0 ? `+$${num}` : `-$${Math.abs(num)}`;
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  const subTabs: { key: SubTab; label: string }[] = [
    { key: "rules", label: "Pricing Rules" },
    { key: "demand", label: "Demand Metrics" },
    { key: "simulate", label: "Price Simulator" },
    { key: "analytics", label: "Analytics" },
    { key: "margins", label: "Service Margins" },
    { key: "discount-rules", label: "Discount Rules" },
    { key: "pricing-config", label: "Pricing Config" },
  ];

  return (
    <div>
      {/* Sub-tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-700 pb-4">
        {subTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveSubTab(tab.key)}
            className={`px-4 py-2 rounded-t text-sm transition-colors ${
              activeSubTab === tab.key
                ? "bg-emerald-600 text-white"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Pricing Rules ── */}
      {activeSubTab === "rules" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Pricing Rules</h3>
            <button
              onClick={() => { setEditingRule(null); setShowRuleModal(true); }}
              className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded text-white text-sm"
            >
              + Add Rule
            </button>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-4">
            <h4 className="text-sm font-semibold text-slate-300 mb-2">Built-in Automatic Rules</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-900/50 p-2 rounded">
                <span className="text-green-400">Early Bird:</span>
                <span className="text-slate-400 ml-1">90d=15%, 60d=10%, 30d=5%</span>
              </div>
              <div className="bg-slate-900/50 p-2 rounded">
                <span className="text-cyan-400">Group:</span>
                <span className="text-slate-400 ml-1">20+=15%, 10+=10%, 6+=5%</span>
              </div>
              <div className="bg-slate-900/50 p-2 rounded">
                <span className="text-yellow-400">Loyalty:</span>
                <span className="text-slate-400 ml-1">Bronze–Platinum: 2–12%</span>
              </div>
              <div className="bg-slate-900/50 p-2 rounded">
                <span className="text-purple-400">Demand:</span>
                <span className="text-slate-400 ml-1">-10% to +15% auto</span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8 text-slate-400">Loading rules...</div>
          ) : rules.length === 0 ? (
            <div className="text-center py-8 text-slate-400">No custom rules. Built-in rules apply automatically.</div>
          ) : (
            <div className="space-y-3">
              {rules.map(rule => (
                <div
                  key={rule.id}
                  className={`bg-slate-800 border rounded-lg p-4 ${rule.isActive ? "border-slate-700" : "border-slate-700/50 opacity-60"}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-white">{rule.name}</span>
                        <span className={`px-2 py-0.5 rounded text-xs ${getRuleTypeBadgeColor(rule.ruleType)}`}>
                          {rule.ruleType.replace("_", " ")}
                        </span>
                        {rule.serviceType && <span className="text-xs text-slate-500">{rule.serviceType}</span>}
                      </div>
                      {rule.description && <p className="text-sm text-slate-400 mb-2">{rule.description}</p>}
                      <div className="flex flex-wrap gap-4 text-sm">
                        <span className={parseFloat(rule.adjustmentValue) >= 0 ? "text-red-400" : "text-green-400"}>
                          {formatAdjustment(rule.adjustmentType, rule.adjustmentValue)}
                        </span>
                        {rule.validFrom && <span className="text-slate-500">From: {new Date(rule.validFrom).toLocaleDateString()}</span>}
                        {rule.validTo && <span className="text-slate-500">To: {new Date(rule.validTo).toLocaleDateString()}</span>}
                        <span className="text-slate-500">Priority: {rule.priority}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleRuleStatus(rule.id, rule.isActive)}
                        className={`px-3 py-1 rounded text-xs ${rule.isActive ? "bg-green-500/20 text-green-400" : "bg-slate-600 text-slate-400"}`}
                      >
                        {rule.isActive ? "Active" : "Inactive"}
                      </button>
                      <button onClick={() => { setEditingRule(rule); setShowRuleModal(true); }} className="text-slate-400 hover:text-white text-sm">Edit</button>
                      <button onClick={() => deleteRule(rule.id)} className="text-red-400 hover:text-red-300 text-sm">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Demand Metrics ── */}
      {activeSubTab === "demand" && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Demand Metrics (Last 30 Days)</h3>
          {loading ? (
            <div className="text-center py-8 text-slate-400">Loading metrics...</div>
          ) : metrics.length === 0 ? (
            <div className="text-center py-8 text-slate-400">No demand metrics recorded yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    {["Date", "Service", "Demand Score", "Searches", "Quotes", "Bookings", "Conversion", "Occupancy"].map(h => (
                      <th key={h} className="text-left py-3 px-4 text-slate-400 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {metrics.map(m => {
                    const score = parseFloat(m.demandScore);
                    return (
                      <tr key={m.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                        <td className="py-3 px-4 text-white">{new Date(m.metricDate).toLocaleDateString()}</td>
                        <td className="py-3 px-4 text-slate-400">{m.serviceType || "All"}</td>
                        <td className="py-3 px-4 text-center"><span className={`font-bold ${getDemandScoreColor(score)}`}>{score.toFixed(0)}</span></td>
                        <td className="py-3 px-4 text-center text-slate-300">{m.searchCount}</td>
                        <td className="py-3 px-4 text-center text-slate-300">{m.quotesGenerated}</td>
                        <td className="py-3 px-4 text-center text-slate-300">{m.bookingsConfirmed}</td>
                        <td className="py-3 px-4 text-center text-slate-300">{m.conversionRate ? `${parseFloat(m.conversionRate).toFixed(1)}%` : "-"}</td>
                        <td className="py-3 px-4 text-center text-slate-300">{m.occupancyRate ? `${parseFloat(m.occupancyRate).toFixed(1)}%` : "-"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Price Simulator ── */}
      {activeSubTab === "simulate" && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Price Simulator</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-slate-300 mb-4">Simulation Parameters</h4>
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Service Type</label>
                  <select value={simForm.serviceType} onChange={e => setSimForm({ ...simForm, serviceType: e.target.value })} className={inputCls}>
                    <option value="hotel">Hotel</option>
                    <option value="transportation">Transportation</option>
                    <option value="guide">Guide</option>
                    <option value="flight">Flight</option>
                    <option value="helicopter">Helicopter</option>
                    <option value="package">Package</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Base Price (USD)</label>
                  <input type="number" value={simForm.basePrice} onChange={e => setSimForm({ ...simForm, basePrice: e.target.value })} className={inputCls} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Start Date</label>
                    <input type="date" value={simForm.startDate} onChange={e => setSimForm({ ...simForm, startDate: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>End Date</label>
                    <input type="date" value={simForm.endDate} onChange={e => setSimForm({ ...simForm, endDate: e.target.value })} className={inputCls} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Pax Count</label>
                    <input type="number" value={simForm.paxCount} onChange={e => setSimForm({ ...simForm, paxCount: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Loyalty Tier</label>
                    <select value={simForm.loyaltyTier} onChange={e => setSimForm({ ...simForm, loyaltyTier: e.target.value })} className={inputCls}>
                      <option value="">None</option>
                      <option value="bronze">Bronze</option>
                      <option value="silver">Silver</option>
                      <option value="gold">Gold</option>
                      <option value="platinum">Platinum</option>
                    </select>
                  </div>
                </div>
                <button onClick={runSimulation} disabled={simLoading} className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 px-4 py-2 rounded text-white text-sm">
                  {simLoading ? "Running..." : "Run Simulation"}
                </button>
              </div>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-slate-300 mb-4">Simulation Results</h4>
              {simResults.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">Run a simulation to see results</div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {simResults.map((result, i) => {
                    const savings = result.basePrice - result.finalPrice;
                    const pct = ((savings / result.basePrice) * 100).toFixed(1);
                    return (
                      <div key={i} className="bg-slate-900/50 rounded p-3 text-sm">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-slate-400">{new Date(result.date).toLocaleDateString()}</span>
                          <div>
                            <span className="text-slate-500 line-through mr-2">${result.basePrice}</span>
                            <span className="text-emerald-400 font-bold">${result.finalPrice.toFixed(2)}</span>
                            {savings !== 0 && (
                              <span className={`ml-2 text-xs ${savings > 0 ? "text-green-400" : "text-red-400"}`}>
                                ({savings > 0 ? "-" : "+"}{Math.abs(parseFloat(pct))}%)
                              </span>
                            )}
                          </div>
                        </div>
                        {result.appliedRules.length > 0 && (
                          <div className="text-xs text-slate-500">{result.appliedRules.map(r => r.ruleName).join(", ")}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Analytics ── */}
      {activeSubTab === "analytics" && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Pricing Analytics (Last 30 Days)</h3>
          {loading ? (
            <div className="text-center py-8 text-slate-400">Loading analytics...</div>
          ) : !analytics ? (
            <div className="text-center py-8 text-slate-400">No analytics data available.</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                  <div className="text-sm text-slate-400 mb-1">Total Adjustments</div>
                  <div className="text-2xl font-bold text-white">{analytics.totalAdjustments}</div>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                  <div className="text-sm text-slate-400 mb-1">Average Adjustment</div>
                  <div className={`text-2xl font-bold ${analytics.averageAdjustment >= 0 ? "text-red-400" : "text-green-400"}`}>
                    {analytics.averageAdjustment >= 0 ? "+" : ""}{analytics.averageAdjustment.toFixed(1)}%
                  </div>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                  <div className="text-sm text-slate-400 mb-1">Active Rules</div>
                  <div className="text-2xl font-bold text-white">{Object.keys(analytics.ruleBreakdown).length}</div>
                </div>
              </div>
              {Object.keys(analytics.ruleBreakdown).length > 0 && (
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-slate-300 mb-4">Rule Performance</h4>
                  <div className="space-y-3">
                    {Object.entries(analytics.ruleBreakdown).map(([name, data]) => (
                      <div key={name} className="flex items-center justify-between">
                        <div>
                          <span className="text-white">{name}</span>
                          <span className="text-slate-500 text-sm ml-2">({data.count} applications)</span>
                        </div>
                        <span className={`font-bold ${data.totalImpact >= 0 ? "text-green-400" : "text-red-400"}`}>
                          {data.totalImpact >= 0 ? "+" : ""}${data.totalImpact.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Service Margins ── */}
      {activeSubTab === "margins" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Service Type Margins</h3>
            <p className="text-slate-400 text-sm">Color: <span className="text-green-400">≥40%</span> · <span className="text-yellow-400">20–39%</span> · <span className="text-red-400">&lt;20%</span></p>
          </div>
          {marginsLoading ? (
            <div className="text-center py-8 text-slate-400">Loading margins...</div>
          ) : (
            <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-700">
                  <tr>
                    <th className="text-left p-4 font-medium text-slate-300">Service Type</th>
                    <th className="text-left p-4 font-medium text-slate-300">Display Name</th>
                    <th className="text-center p-4 font-medium text-slate-300">B2C Margin %</th>
                    <th className="text-center p-4 font-medium text-slate-300">Agent Margin %</th>
                    <th className="text-center p-4 font-medium text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {serviceMargins.map(m => (
                    <tr key={m.id} className="border-t border-slate-700 hover:bg-slate-750">
                      <td className="p-4 font-mono text-xs text-slate-400">{m.serviceTypeKey}</td>
                      <td className="p-4 text-white">{m.displayName || "—"}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-1 rounded text-sm font-semibold ${marginBg(m.b2cMarginPercent)}`}>
                          {parseFloat(m.b2cMarginPercent).toFixed(0)}%
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-1 rounded text-sm font-semibold ${marginBg(m.agentMarginPercent)}`}>
                          {parseFloat(m.agentMarginPercent).toFixed(0)}%
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => setEditingMargin(m)}
                          className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs text-slate-300 transition-colors"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {serviceMargins.length === 0 && (
                <div className="p-8 text-center text-slate-400">No margin data. Run migrations to seed defaults.</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Discount Rules ── */}
      {activeSubTab === "discount-rules" && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Discount Rules</h3>
          {discountRulesLoading ? (
            <div className="text-center py-8 text-slate-400">Loading discount rules...</div>
          ) : (
            <>
              {/* Early Bird */}
              <SectionCard title={`Early Bird Rules (${earlyBirdRules.length})`} expanded={expandedCards.earlyBird} onToggle={() => toggleCard("earlyBird")}>
                <div className="flex justify-end mb-3">
                  <button onClick={() => setEarlyBirdModal({ open: true, rule: null })} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 rounded text-white text-xs">+ Add Rule</button>
                </div>
                {earlyBirdRules.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-4">No early bird rules. Add one above.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase">
                        <th className="text-left pb-2">Days in Advance</th>
                        <th className="text-center pb-2">Discount %</th>
                        <th className="text-left pb-2 pl-4">Label</th>
                        <th className="text-center pb-2">Active</th>
                        <th className="text-right pb-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {earlyBirdRules.map(r => (
                        <tr key={r.id} className="border-b border-slate-700/50">
                          <td className="py-3 text-white font-medium">{r.daysInAdvance}+ days</td>
                          <td className="py-3 text-center"><span className="text-green-400 font-semibold">{parseFloat(r.discountPercent).toFixed(1)}%</span></td>
                          <td className="py-3 pl-4 text-slate-400 text-xs">{r.label || "—"}</td>
                          <td className="py-3 text-center">
                            <Toggle enabled={!!r.isActive} onChange={() => toggleRuleActive("early-bird", r.id, r.isActive)} />
                          </td>
                          <td className="py-3 text-right space-x-3">
                            <button onClick={() => setEarlyBirdModal({ open: true, rule: r })} className="text-slate-400 hover:text-white text-xs">Edit</button>
                            <button onClick={() => deleteDiscountRule("early-bird", r.id)} className="text-red-400 hover:text-red-300 text-xs">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </SectionCard>

              {/* Group Discounts */}
              <SectionCard title={`Group Discount Rules (${groupDiscountRules.length})`} expanded={expandedCards.group} onToggle={() => toggleCard("group")}>
                <div className="flex justify-end mb-3">
                  <button onClick={() => setGroupModal({ open: true, rule: null })} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 rounded text-white text-xs">+ Add Rule</button>
                </div>
                {groupDiscountRules.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-4">No group discount rules.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase">
                        <th className="text-left pb-2">Min Pax</th>
                        <th className="text-left pb-2">Max Pax</th>
                        <th className="text-center pb-2">Discount %</th>
                        <th className="text-left pb-2 pl-4">Label</th>
                        <th className="text-center pb-2">Active</th>
                        <th className="text-right pb-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupDiscountRules.map(r => (
                        <tr key={r.id} className="border-b border-slate-700/50">
                          <td className="py-3 text-white font-medium">{r.minPax}</td>
                          <td className="py-3 text-slate-400">{r.maxPax ?? "∞"}</td>
                          <td className="py-3 text-center"><span className="text-cyan-400 font-semibold">{parseFloat(r.discountPercent).toFixed(1)}%</span></td>
                          <td className="py-3 pl-4 text-slate-400 text-xs">{r.label || "—"}</td>
                          <td className="py-3 text-center">
                            <Toggle enabled={!!r.isActive} onChange={() => toggleRuleActive("group", r.id, r.isActive)} />
                          </td>
                          <td className="py-3 text-right space-x-3">
                            <button onClick={() => setGroupModal({ open: true, rule: r })} className="text-slate-400 hover:text-white text-xs">Edit</button>
                            <button onClick={() => deleteDiscountRule("group", r.id)} className="text-red-400 hover:text-red-300 text-xs">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </SectionCard>

              {/* Last Minute */}
              <SectionCard title={`Last Minute Rules (${lastMinuteRules.length})`} expanded={expandedCards.lastMinute} onToggle={() => toggleCard("lastMinute")}>
                <div className="flex justify-end mb-3">
                  <button onClick={() => setLastMinuteModal({ open: true, rule: null })} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 rounded text-white text-xs">+ Add Rule</button>
                </div>
                {lastMinuteRules.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-4">No last minute rules.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase">
                        <th className="text-left pb-2">Days Before Departure</th>
                        <th className="text-center pb-2">Discount %</th>
                        <th className="text-left pb-2 pl-4">Label</th>
                        <th className="text-center pb-2">Active</th>
                        <th className="text-right pb-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lastMinuteRules.map(r => (
                        <tr key={r.id} className="border-b border-slate-700/50">
                          <td className="py-3 text-white font-medium">Within {r.daysBeforeDeparture} days</td>
                          <td className="py-3 text-center"><span className="text-orange-400 font-semibold">{parseFloat(r.discountPercent).toFixed(1)}%</span></td>
                          <td className="py-3 pl-4 text-slate-400 text-xs">{r.label || "—"}</td>
                          <td className="py-3 text-center">
                            <Toggle enabled={!!r.isActive} onChange={() => toggleRuleActive("last-minute", r.id, r.isActive)} />
                          </td>
                          <td className="py-3 text-right space-x-3">
                            <button onClick={() => setLastMinuteModal({ open: true, rule: r })} className="text-slate-400 hover:text-white text-xs">Edit</button>
                            <button onClick={() => deleteDiscountRule("last-minute", r.id)} className="text-red-400 hover:text-red-300 text-xs">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </SectionCard>

              {/* Loyalty Tiers */}
              <SectionCard title={`Loyalty Tiers (${loyaltyTiers.length})`} expanded={expandedCards.loyalty} onToggle={() => toggleCard("loyalty")}>
                <div className="flex justify-end mb-3">
                  <button onClick={() => setLoyaltyModal({ open: true, rule: null })} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 rounded text-white text-xs">+ Add Tier</button>
                </div>
                {loyaltyTiers.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-4">No loyalty tiers.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase">
                        <th className="text-left pb-2">Tier Name</th>
                        <th className="text-center pb-2">Min Points</th>
                        <th className="text-center pb-2">Discount %</th>
                        <th className="text-center pb-2">Active</th>
                        <th className="text-right pb-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loyaltyTiers.map(r => (
                        <tr key={r.id} className="border-b border-slate-700/50">
                          <td className="py-3 text-white font-medium capitalize">{r.tierName}</td>
                          <td className="py-3 text-center text-slate-300">{r.minPoints.toLocaleString()}</td>
                          <td className="py-3 text-center"><span className="text-yellow-400 font-semibold">{parseFloat(r.discountPercent).toFixed(1)}%</span></td>
                          <td className="py-3 text-center">
                            <Toggle enabled={!!r.isActive} onChange={() => toggleRuleActive("loyalty", r.id, r.isActive)} />
                          </td>
                          <td className="py-3 text-right space-x-3">
                            <button onClick={() => setLoyaltyModal({ open: true, rule: r })} className="text-slate-400 hover:text-white text-xs">Edit</button>
                            <button onClick={() => deleteDiscountRule("loyalty", r.id)} className="text-red-400 hover:text-red-300 text-xs">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </SectionCard>
            </>
          )}
        </div>
      )}

      {/* ── Pricing Config ── */}
      {activeSubTab === "pricing-config" && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-6">Pricing Config</h3>

          {configLoading ? (
            <div className="text-center py-8 text-slate-400">Loading config...</div>
          ) : (
            <>
              {/* Status banner */}
              {discountsEnabled === true && (
                <div className="flex items-center gap-3 bg-green-900/30 border border-green-700 rounded-lg px-5 py-4 mb-6">
                  <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-green-300 font-medium">Discounts are active. Rules apply based on booking conditions.</span>
                </div>
              )}
              {discountsEnabled === false && (
                <div className="flex items-center gap-3 bg-amber-900/30 border border-amber-700 rounded-lg px-5 py-4 mb-6">
                  <svg className="w-5 h-5 text-amber-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                  <span className="text-amber-300 font-medium">All discounts are currently OFF. Clients receive standard sell prices only.</span>
                </div>
              )}

              {/* Master toggle card */}
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-semibold text-base">Discounts Enabled</div>
                    <div className="text-slate-400 text-sm mt-1 max-w-md">
                      Master kill-switch for all discount types: early bird, group, last minute, and loyalty.
                      When off, the pricing engine skips all discount logic and quotes show standard sell prices.
                    </div>
                  </div>
                  <div className="flex items-center gap-4 ml-6">
                    <span className={`text-sm font-medium ${discountsEnabled ? "text-green-400" : "text-slate-400"}`}>
                      {discountsEnabled ? "ON" : "OFF"}
                    </span>
                    <Toggle
                      enabled={!!discountsEnabled}
                      onChange={toggleDiscountsEnabled}
                    />
                  </div>
                </div>
                {configSaving && (
                  <div className="mt-4 text-xs text-slate-400">Saving...</div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Modals ── */}
      {showRuleModal && (
        <RuleModal
          rule={editingRule}
          onClose={() => { setShowRuleModal(false); setEditingRule(null); }}
          onSave={() => { setShowRuleModal(false); setEditingRule(null); fetchRules(); }}
        />
      )}

      {editingMargin && (
        <EditMarginModal
          margin={editingMargin}
          onClose={() => setEditingMargin(null)}
          onSave={() => { setEditingMargin(null); fetchServiceMargins(); }}
        />
      )}

      {earlyBirdModal.open && (
        <EarlyBirdModal
          rule={earlyBirdModal.rule}
          onClose={() => setEarlyBirdModal({ open: false, rule: null })}
          onSave={() => { setEarlyBirdModal({ open: false, rule: null }); fetchDiscountRules(); }}
        />
      )}

      {groupModal.open && (
        <GroupDiscountModal
          rule={groupModal.rule}
          onClose={() => setGroupModal({ open: false, rule: null })}
          onSave={() => { setGroupModal({ open: false, rule: null }); fetchDiscountRules(); }}
        />
      )}

      {lastMinuteModal.open && (
        <LastMinuteModal
          rule={lastMinuteModal.rule}
          onClose={() => setLastMinuteModal({ open: false, rule: null })}
          onSave={() => { setLastMinuteModal({ open: false, rule: null }); fetchDiscountRules(); }}
        />
      )}

      {loyaltyModal.open && (
        <LoyaltyTierModal
          rule={loyaltyModal.rule}
          onClose={() => setLoyaltyModal({ open: false, rule: null })}
          onSave={() => { setLoyaltyModal({ open: false, rule: null }); fetchDiscountRules(); }}
        />
      )}
    </div>
  );
}

// ─── RuleModal (unchanged) ────────────────────────────────────────────────────

function RuleModal({
  rule,
  onClose,
  onSave,
}: {
  rule: PricingRule | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const [form, setForm] = useState({
    name: rule?.name || "",
    description: rule?.description || "",
    ruleType: rule?.ruleType || "promotional",
    serviceType: rule?.serviceType || "",
    adjustmentType: rule?.adjustmentType || "percentage",
    adjustmentValue: rule?.adjustmentValue || "0",
    minPrice: rule?.minPrice || "",
    maxPrice: rule?.maxPrice || "",
    validFrom: rule?.validFrom?.split("T")[0] || "",
    validTo: rule?.validTo?.split("T")[0] || "",
    priority: rule?.priority?.toString() || "0",
    isActive: rule?.isActive ?? true,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = rule ? `/api/admin/pricing/rules/${rule.id}` : "/api/admin/pricing/rules";
      await fetch(url, {
        method: rule ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description || undefined,
          ruleType: form.ruleType,
          serviceType: form.serviceType || undefined,
          adjustmentType: form.adjustmentType,
          adjustmentValue: parseFloat(form.adjustmentValue),
          minPrice: form.minPrice ? parseFloat(form.minPrice) : undefined,
          maxPrice: form.maxPrice ? parseFloat(form.maxPrice) : undefined,
          validFrom: form.validFrom || undefined,
          validTo: form.validTo || undefined,
          priority: parseInt(form.priority) || 0,
          isActive: form.isActive,
        }),
      });
      onSave();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-white mb-4">{rule ? "Edit Pricing Rule" : "Create Pricing Rule"}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelCls}>Rule Name *</label>
            <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputCls} placeholder="e.g. Summer Peak Premium" />
          </div>
          <div>
            <label className={labelCls}>Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className={inputCls} rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Rule Type *</label>
              <select value={form.ruleType} onChange={e => setForm({ ...form, ruleType: e.target.value })} className={inputCls}>
                {["seasonal","demand","early_bird","last_minute","group","loyalty","promotional","weekend","peak_day"].map(t => (
                  <option key={t} value={t}>{t.replace("_", " ")}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Service Type</label>
              <select value={form.serviceType} onChange={e => setForm({ ...form, serviceType: e.target.value })} className={inputCls}>
                <option value="">All Services</option>
                {["hotel","transportation","guide","porter","flight","helicopter_sharing","helicopter_charter","permit","package"].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Adjustment Type *</label>
              <select value={form.adjustmentType} onChange={e => setForm({ ...form, adjustmentType: e.target.value })} className={inputCls}>
                <option value="percentage">Percentage</option>
                <option value="fixed_amount">Fixed Amount</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Value ({form.adjustmentType === "percentage" ? "%" : "$"})</label>
              <input type="number" step="0.01" required value={form.adjustmentValue} onChange={e => setForm({ ...form, adjustmentValue: e.target.value })} className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Min Price Floor ($)</label>
              <input type="number" step="0.01" value={form.minPrice} onChange={e => setForm({ ...form, minPrice: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Max Price Ceiling ($)</label>
              <input type="number" step="0.01" value={form.maxPrice} onChange={e => setForm({ ...form, maxPrice: e.target.value })} className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Valid From</label>
              <input type="date" value={form.validFrom} onChange={e => setForm({ ...form, validFrom: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Valid To</label>
              <input type="date" value={form.validTo} onChange={e => setForm({ ...form, validTo: e.target.value })} className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Priority (higher = first)</label>
              <input type="number" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className={inputCls} />
            </div>
            <div className="flex items-center pt-5">
              <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} className="mr-2" />
              <label htmlFor="isActive" className="text-sm text-slate-400">Rule is active</label>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white text-sm">Cancel</button>
            <button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 px-4 py-2 rounded text-white text-sm">
              {saving ? "Saving..." : rule ? "Update Rule" : "Create Rule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
