"use client";

import { useState, useEffect } from "react";
import { Brain, Plus, Pencil, Trash2, ChevronDown, ChevronUp, ToggleLeft, ToggleRight } from "lucide-react";

interface AIRule {
  id: number;
  category: string;
  ruleKey: string;
  ruleTitle: string;
  ruleText: string;
  appliesTo: string;
  priority: number;
  isActive: boolean;
  country: string | null;
  serviceType: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

interface RuleStats {
  total: number;
  active: number;
  inactive: number;
  byCategory: Record<string, number>;
}

const CATEGORIES = [
  "pricing_display", "component_checklist", "route_planning",
  "quantity_rules", "communication", "escalation",
  "country_specific", "search_strategy",
];

const APPLIES_TO_OPTIONS = ["all", "customer_chat", "agency_chat", "whatsapp"];

const CATEGORY_COLORS: Record<string, string> = {
  pricing_display: "bg-red-500/20 text-red-400",
  component_checklist: "bg-blue-500/20 text-blue-400",
  route_planning: "bg-emerald-500/20 text-emerald-400",
  quantity_rules: "bg-purple-500/20 text-purple-400",
  communication: "bg-cyan-500/20 text-cyan-400",
  escalation: "bg-amber-500/20 text-amber-400",
  country_specific: "bg-orange-500/20 text-orange-400",
  search_strategy: "bg-indigo-500/20 text-indigo-400",
};

function formatCategory(cat: string) {
  return cat.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

const emptyForm = {
  ruleKey: "",
  ruleTitle: "",
  ruleText: "",
  category: "pricing_display",
  appliesTo: "all",
  priority: 100,
  country: "",
  serviceType: "",
  isActive: true,
};

export default function AIRulesTab() {
  const [rules, setRules] = useState<AIRule[]>([]);
  const [stats, setStats] = useState<RuleStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<{ category?: string; appliesTo?: string; isActive?: string }>({});
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState<AIRule | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter.category) params.set("category", filter.category);
      if (filter.appliesTo) params.set("appliesTo", filter.appliesTo);
      if (filter.isActive) params.set("isActive", filter.isActive);

      const res = await fetch(`/api/admin/ai-rules?${params}`);
      const data = await res.json();
      setRules(data.rules || []);
      setStats(data.stats || null);
    } catch (err) {
      console.error("Failed to fetch AI rules:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, [filter]);

  const toggleActive = async (rule: AIRule) => {
    try {
      await fetch("/api/admin/ai-rules", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: rule.id, isActive: !rule.isActive }),
      });
      fetchRules();
    } catch (err) {
      console.error("Failed to toggle rule:", err);
    }
  };

  const openCreate = () => {
    setEditingRule(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (rule: AIRule) => {
    setEditingRule(rule);
    setForm({
      ruleKey: rule.ruleKey,
      ruleTitle: rule.ruleTitle,
      ruleText: rule.ruleText,
      category: rule.category,
      appliesTo: rule.appliesTo,
      priority: rule.priority,
      country: rule.country || "",
      serviceType: rule.serviceType || "",
      isActive: rule.isActive,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingRule) {
        await fetch("/api/admin/ai-rules", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingRule.id, ...form }),
        });
      } else {
        const res = await fetch("/api/admin/ai-rules", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) {
          const data = await res.json();
          alert(data.error || "Failed to create rule");
          setSaving(false);
          return;
        }
      }
      setShowModal(false);
      fetchRules();
    } catch (err) {
      console.error("Failed to save rule:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`/api/admin/ai-rules?id=${id}`, { method: "DELETE" });
      setDeleteConfirm(null);
      fetchRules();
    } catch (err) {
      console.error("Failed to delete rule:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-emerald-400">{stats.total}</div>
            <div className="text-sm text-slate-400">Total Rules</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-400">{stats.active}</div>
            <div className="text-sm text-slate-400">Active</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-red-400">{stats.inactive}</div>
            <div className="text-sm text-slate-400">Inactive</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-400">{Object.keys(stats.byCategory).length}</div>
            <div className="text-sm text-slate-400">Categories</div>
          </div>
        </div>
      )}

      {/* Category breakdown */}
      {stats && Object.keys(stats.byCategory).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(stats.byCategory).map(([cat, cnt]) => (
            <span key={cat} className={`px-3 py-1 rounded-full text-xs font-medium ${CATEGORY_COLORS[cat] || "bg-slate-700 text-slate-300"}`}>
              {formatCategory(cat)}: {cnt}
            </span>
          ))}
        </div>
      )}

      {/* Filters + Create */}
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={filter.category || ""}
          onChange={e => setFilter(f => ({ ...f, category: e.target.value || undefined }))}
          className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{formatCategory(c)}</option>)}
        </select>

        <select
          value={filter.appliesTo || ""}
          onChange={e => setFilter(f => ({ ...f, appliesTo: e.target.value || undefined }))}
          className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm"
        >
          <option value="">All Channels</option>
          {APPLIES_TO_OPTIONS.map(a => <option key={a} value={a}>{formatCategory(a)}</option>)}
        </select>

        <select
          value={filter.isActive ?? ""}
          onChange={e => setFilter(f => ({ ...f, isActive: e.target.value || undefined }))}
          className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm"
        >
          <option value="">Active & Inactive</option>
          <option value="true">Active Only</option>
          <option value="false">Inactive Only</option>
        </select>

        <div className="flex-1" />

        <button
          onClick={openCreate}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded text-sm font-medium flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Rule
        </button>
      </div>

      {/* Rules Table */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading rules...</div>
      ) : rules.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          No rules found. Seed rules via POST /api/admin/seed-ai-rules or create one above.
        </div>
      ) : (
        <div className="space-y-2">
          {rules.map(rule => (
            <div key={rule.id} className="bg-slate-800 rounded-lg border border-slate-700">
              {/* Row */}
              <div className="flex items-center gap-3 p-4">
                <span className="text-slate-500 text-xs w-8 text-right">{rule.priority}</span>

                <button
                  onClick={() => toggleActive(rule)}
                  title={rule.isActive ? "Deactivate" : "Activate"}
                >
                  {rule.isActive ? (
                    <ToggleRight className="w-6 h-6 text-emerald-400" />
                  ) : (
                    <ToggleLeft className="w-6 h-6 text-slate-500" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${rule.isActive ? "text-white" : "text-slate-500"}`}>
                      {rule.ruleTitle}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs ${CATEGORY_COLORS[rule.category] || "bg-slate-700 text-slate-300"}`}>
                      {formatCategory(rule.category)}
                    </span>
                    {rule.appliesTo !== "all" && (
                      <span className="px-2 py-0.5 rounded text-xs bg-slate-700 text-slate-300">
                        {formatCategory(rule.appliesTo)}
                      </span>
                    )}
                    {rule.country && (
                      <span className="px-2 py-0.5 rounded text-xs bg-slate-700 text-slate-300">
                        {rule.country}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{rule.ruleKey}</div>
                </div>

                <button onClick={() => openEdit(rule)} className="p-2 hover:bg-slate-700 rounded" title="Edit">
                  <Pencil className="w-4 h-4 text-slate-400" />
                </button>

                {deleteConfirm === rule.id ? (
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleDelete(rule.id)} className="px-2 py-1 bg-red-600 rounded text-xs">Confirm</button>
                    <button onClick={() => setDeleteConfirm(null)} className="px-2 py-1 bg-slate-700 rounded text-xs">Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => setDeleteConfirm(rule.id)} className="p-2 hover:bg-slate-700 rounded" title="Delete">
                    <Trash2 className="w-4 h-4 text-slate-400" />
                  </button>
                )}

                <button onClick={() => setExpandedId(expandedId === rule.id ? null : rule.id)} className="p-2 hover:bg-slate-700 rounded">
                  {expandedId === rule.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
              </div>

              {/* Expanded rule text */}
              {expandedId === rule.id && (
                <div className="px-4 pb-4 border-t border-slate-700 pt-3">
                  <pre className="text-sm text-slate-300 whitespace-pre-wrap font-sans">{rule.ruleText}</pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <h3 className="text-lg font-bold">{editingRule ? "Edit Rule" : "Create Rule"}</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Rule Key</label>
                <input
                  value={form.ruleKey}
                  onChange={e => setForm(f => ({ ...f, ruleKey: e.target.value }))}
                  disabled={!!editingRule}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm disabled:opacity-50"
                  placeholder="e.g. require_return_flight"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Title</label>
                <input
                  value={form.ruleTitle}
                  onChange={e => setForm(f => ({ ...f, ruleTitle: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm"
                  placeholder="Admin-friendly label"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Rule Text (injected into system prompt)</label>
              <textarea
                value={form.ruleText}
                onChange={e => setForm(f => ({ ...f, ruleText: e.target.value }))}
                rows={5}
                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm font-mono"
                placeholder="The actual instruction text the AI will see..."
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{formatCategory(c)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Applies To</label>
                <select
                  value={form.appliesTo}
                  onChange={e => setForm(f => ({ ...f, appliesTo: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm"
                >
                  {APPLIES_TO_OPTIONS.map(a => <option key={a} value={a}>{formatCategory(a)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Priority</label>
                <input
                  type="number"
                  value={form.priority}
                  onChange={e => setForm(f => ({ ...f, priority: parseInt(e.target.value) || 100 }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Active</label>
                <select
                  value={form.isActive ? "true" : "false"}
                  onChange={e => setForm(f => ({ ...f, isActive: e.target.value === "true" }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Country (optional)</label>
                <input
                  value={form.country}
                  onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm"
                  placeholder="e.g. Nepal"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Service Type (optional)</label>
                <input
                  value={form.serviceType}
                  onChange={e => setForm(f => ({ ...f, serviceType: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm"
                  placeholder="e.g. hotel, guide"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-slate-700 rounded text-sm">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.ruleKey || !form.ruleTitle || !form.ruleText}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded text-sm font-medium disabled:opacity-50"
              >
                {saving ? "Saving..." : editingRule ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
