"use client";

import { useState, useEffect } from "react";

interface NurtureEmail {
  dayOffset: number;
  subject: string;
  templateId: string;
  conditions?: Record<string, unknown>;
}

interface NurtureSequence {
  id: number;
  name: string;
  description?: string;
  triggerType: string;
  triggerConditions?: Record<string, unknown>;
  emails: NurtureEmail[];
  totalEmails: number;
  isActive: boolean;
  createdAt: string;
  stats?: {
    totalEnrollments: number;
    activeEnrollments: number;
    completedEnrollments: number;
    cancelledEnrollments: number;
    totalEmailsSent: number;
    totalEmailsOpened: number;
    totalLinksClicked: number;
  };
}

interface Enrollment {
  id: number;
  clientId: number;
  clientName?: string;
  clientEmail?: string;
  sequenceId: number;
  sequenceName?: string;
  currentStep: number;
  status: string;
  emailsSent: number;
  emailsOpened: number;
  linksClicked: number;
  enrolledAt: string;
  nextEmailAt?: string;
  completedAt?: string;
}

const TRIGGER_TYPES = [
  { value: "new_lead", label: "New Lead", description: "When a new client is created" },
  { value: "abandoned_conversation", label: "Abandoned Conversation", description: "After X days of inactivity" },
  { value: "post_quote", label: "Post Quote", description: "After a quote is sent" },
  { value: "post_inquiry", label: "Post Inquiry", description: "After initial inquiry" },
  { value: "high_value_lead", label: "High Value Lead", description: "When lead score reaches threshold" },
];

const EMAIL_TEMPLATES = [
  { id: "welcome_series_1", name: "Welcome Email" },
  { id: "destination_inspiration", name: "Destination Inspiration" },
  { id: "quote_followup", name: "Quote Follow-up" },
  { id: "seasonal_deals", name: "Seasonal Deals" },
  { id: "testimonial_showcase", name: "Testimonial Showcase" },
  { id: "last_chance", name: "Last Chance Offer" },
  { id: "trip_planning_tips", name: "Trip Planning Tips" },
  { id: "custom", name: "Custom Template" },
];

export default function NurtureTab() {
  const [activeSubTab, setActiveSubTab] = useState<"sequences" | "enrollments" | "analytics">("sequences");
  const [sequences, setSequences] = useState<NurtureSequence[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSequenceModal, setShowSequenceModal] = useState(false);
  const [editingSequence, setEditingSequence] = useState<NurtureSequence | null>(null);

  useEffect(() => {
    if (activeSubTab === "sequences") fetchSequences();
    if (activeSubTab === "enrollments") fetchEnrollments();
  }, [activeSubTab]);

  const fetchSequences = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/nurture-sequences?includeStats=true");
      const data = await res.json();
      setSequences(data.sequences || []);
    } catch (error) {
      console.error("Error fetching sequences:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      // This would need an API endpoint - for now using mock data
      // In production: const res = await fetch("/api/admin/nurture-enrollments");
      setEnrollments([]);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSequenceStatus = async (sequenceId: number, currentStatus: boolean) => {
    try {
      await fetch(`/api/admin/nurture-sequences/${sequenceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      fetchSequences();
    } catch (error) {
      console.error("Error updating sequence:", error);
    }
  };

  const deleteSequence = async (sequenceId: number) => {
    if (!confirm("Are you sure you want to delete this nurture sequence?")) return;
    try {
      await fetch(`/api/admin/nurture-sequences/${sequenceId}`, { method: "DELETE" });
      fetchSequences();
    } catch (error) {
      console.error("Error deleting sequence:", error);
    }
  };

  const seedDefaultSequences = async () => {
    try {
      await fetch("/api/admin/nurture-sequences/seed", { method: "POST" });
      fetchSequences();
    } catch (error) {
      console.error("Error seeding sequences:", error);
    }
  };

  const getTriggerLabel = (type: string) => {
    return TRIGGER_TYPES.find(t => t.value === type)?.label || type;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-green-500/20 text-green-400",
      completed: "bg-blue-500/20 text-blue-400",
      paused: "bg-yellow-500/20 text-yellow-400",
      cancelled: "bg-red-500/20 text-red-400",
    };
    return colors[status] || "bg-slate-500/20 text-slate-400";
  };

  // Calculate aggregate stats
  const aggregateStats = sequences.reduce(
    (acc, seq) => {
      if (seq.stats) {
        acc.totalEnrollments += seq.stats.totalEnrollments;
        acc.activeEnrollments += seq.stats.activeEnrollments;
        acc.emailsSent += seq.stats.totalEmailsSent;
        acc.emailsOpened += seq.stats.totalEmailsOpened;
        acc.conversions += seq.stats.completedEnrollments;
      }
      return acc;
    },
    { totalEnrollments: 0, activeEnrollments: 0, emailsSent: 0, emailsOpened: 0, conversions: 0 }
  );

  const openRate = aggregateStats.emailsSent > 0
    ? ((aggregateStats.emailsOpened / aggregateStats.emailsSent) * 100).toFixed(1)
    : "0";

  return (
    <div>
      {/* Sub-tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-700 pb-4">
        {[
          { key: "sequences", label: "Nurture Sequences" },
          { key: "enrollments", label: "Active Enrollments" },
          { key: "analytics", label: "Campaign Analytics" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveSubTab(tab.key as typeof activeSubTab)}
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

      {/* Sequences Tab */}
      {activeSubTab === "sequences" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Email Nurture Sequences</h3>
            <div className="flex gap-2">
              <button
                onClick={seedDefaultSequences}
                className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded text-white text-sm"
              >
                Seed Defaults
              </button>
              <button
                onClick={() => {
                  setEditingSequence(null);
                  setShowSequenceModal(true);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded text-white text-sm"
              >
                + Create Sequence
              </button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
              <div className="text-xs text-slate-400 mb-1">Total Sequences</div>
              <div className="text-xl font-bold text-white">{sequences.length}</div>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
              <div className="text-xs text-slate-400 mb-1">Total Enrollments</div>
              <div className="text-xl font-bold text-cyan-400">{aggregateStats.totalEnrollments}</div>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
              <div className="text-xs text-slate-400 mb-1">Active Now</div>
              <div className="text-xl font-bold text-green-400">{aggregateStats.activeEnrollments}</div>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
              <div className="text-xs text-slate-400 mb-1">Emails Sent</div>
              <div className="text-xl font-bold text-blue-400">{aggregateStats.emailsSent}</div>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
              <div className="text-xs text-slate-400 mb-1">Open Rate</div>
              <div className="text-xl font-bold text-purple-400">{openRate}%</div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8 text-slate-400">Loading sequences...</div>
          ) : sequences.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              No nurture sequences yet. Click &quot;Seed Defaults&quot; to create starter sequences.
            </div>
          ) : (
            <div className="space-y-4">
              {sequences.map((sequence) => (
                <div
                  key={sequence.id}
                  className={`bg-slate-800 border rounded-lg p-4 ${
                    sequence.isActive ? "border-slate-700" : "border-slate-700/50 opacity-60"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold text-white text-lg">{sequence.name}</span>
                        <span className="px-2 py-0.5 rounded text-xs bg-indigo-500/20 text-indigo-400">
                          {getTriggerLabel(sequence.triggerType)}
                        </span>
                        <span className="text-xs text-slate-500">
                          {sequence.totalEmails} email{sequence.totalEmails !== 1 ? "s" : ""}
                        </span>
                      </div>
                      {sequence.description && (
                        <p className="text-sm text-slate-400 mb-3">{sequence.description}</p>
                      )}

                      {/* Email Timeline */}
                      <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-2">
                        {sequence.emails.map((email, idx) => (
                          <div
                            key={idx}
                            className="flex items-center"
                          >
                            <div className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs min-w-[120px]">
                              <div className="text-slate-500 mb-1">Day {email.dayOffset}</div>
                              <div className="text-slate-300 truncate">{email.subject}</div>
                            </div>
                            {idx < sequence.emails.length - 1 && (
                              <div className="w-4 h-px bg-slate-600 mx-1" />
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Stats */}
                      {sequence.stats && (
                        <div className="flex gap-4 text-xs text-slate-500">
                          <span>
                            <span className="text-cyan-400">{sequence.stats.totalEnrollments}</span> enrolled
                          </span>
                          <span>
                            <span className="text-green-400">{sequence.stats.activeEnrollments}</span> active
                          </span>
                          <span>
                            <span className="text-blue-400">{sequence.stats.totalEmailsSent}</span> sent
                          </span>
                          <span>
                            <span className="text-purple-400">
                              {sequence.stats.totalEmailsSent > 0
                                ? ((sequence.stats.totalEmailsOpened / sequence.stats.totalEmailsSent) * 100).toFixed(0)
                                : 0}%
                            </span> opened
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => toggleSequenceStatus(sequence.id, sequence.isActive)}
                        className={`px-3 py-1 rounded text-xs ${
                          sequence.isActive
                            ? "bg-green-500/20 text-green-400"
                            : "bg-slate-600 text-slate-400"
                        }`}
                      >
                        {sequence.isActive ? "Active" : "Paused"}
                      </button>
                      <button
                        onClick={() => {
                          setEditingSequence(sequence);
                          setShowSequenceModal(true);
                        }}
                        className="text-slate-400 hover:text-white text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteSequence(sequence.id)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Enrollments Tab */}
      {activeSubTab === "enrollments" && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Active Enrollments</h3>

          {loading ? (
            <div className="text-center py-8 text-slate-400">Loading enrollments...</div>
          ) : enrollments.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              No active enrollments. Clients are automatically enrolled based on sequence triggers.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Client</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Sequence</th>
                    <th className="text-center py-3 px-4 text-slate-400 font-medium">Progress</th>
                    <th className="text-center py-3 px-4 text-slate-400 font-medium">Status</th>
                    <th className="text-center py-3 px-4 text-slate-400 font-medium">Opens</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Next Email</th>
                    <th className="text-right py-3 px-4 text-slate-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map((enrollment) => (
                    <tr key={enrollment.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                      <td className="py-3 px-4">
                        <div className="text-white">{enrollment.clientName || "Unknown"}</div>
                        <div className="text-xs text-slate-500">{enrollment.clientEmail}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-300">{enrollment.sequenceName}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-slate-300">
                          {enrollment.emailsSent}/{enrollment.currentStep + 1}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(enrollment.status)}`}>
                          {enrollment.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-slate-300">{enrollment.emailsOpened}</td>
                      <td className="py-3 px-4 text-slate-400 text-sm">
                        {enrollment.nextEmailAt
                          ? new Date(enrollment.nextEmailAt).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button className="text-slate-400 hover:text-white text-sm mr-2">
                          Pause
                        </button>
                        <button className="text-red-400 hover:text-red-300 text-sm">
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeSubTab === "analytics" && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Campaign Analytics</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Performance by Sequence */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-slate-300 mb-4">Sequence Performance</h4>
              {sequences.length === 0 ? (
                <div className="text-center py-4 text-slate-500 text-sm">No data available</div>
              ) : (
                <div className="space-y-3">
                  {sequences.map((sequence) => {
                    const seqOpenRate = sequence.stats && sequence.stats.totalEmailsSent > 0
                      ? (sequence.stats.totalEmailsOpened / sequence.stats.totalEmailsSent) * 100
                      : 0;
                    return (
                      <div key={sequence.id} className="bg-slate-900/50 rounded p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-white text-sm">{sequence.name}</span>
                          <span className={`text-sm font-bold ${
                            seqOpenRate >= 30 ? "text-green-400" :
                            seqOpenRate >= 20 ? "text-yellow-400" : "text-red-400"
                          }`}>
                            {seqOpenRate.toFixed(1)}% open
                          </span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div
                            className="bg-emerald-500 h-2 rounded-full transition-all"
                            style={{ width: `${Math.min(seqOpenRate, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-slate-500 mt-1">
                          <span>{sequence.stats?.totalEmailsSent || 0} sent</span>
                          <span>{sequence.stats?.totalEmailsOpened || 0} opened</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Trigger Breakdown */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-slate-300 mb-4">Enrollments by Trigger</h4>
              {sequences.length === 0 ? (
                <div className="text-center py-4 text-slate-500 text-sm">No data available</div>
              ) : (
                <div className="space-y-3">
                  {TRIGGER_TYPES.map((trigger) => {
                    const triggerSequences = sequences.filter(s => s.triggerType === trigger.value);
                    const totalEnrollments = triggerSequences.reduce(
                      (sum, s) => sum + (s.stats?.totalEnrollments || 0), 0
                    );
                    return (
                      <div key={trigger.value} className="flex items-center justify-between">
                        <div>
                          <span className="text-white text-sm">{trigger.label}</span>
                          <span className="text-slate-500 text-xs ml-2">
                            ({triggerSequences.length} sequence{triggerSequences.length !== 1 ? "s" : ""})
                          </span>
                        </div>
                        <span className="text-cyan-400 font-bold">{totalEnrollments}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Email Funnel */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 md:col-span-2">
              <h4 className="text-sm font-semibold text-slate-300 mb-4">Email Engagement Funnel</h4>
              <div className="flex items-end justify-around h-40">
                <div className="flex flex-col items-center">
                  <div
                    className="w-16 bg-cyan-500/50 rounded-t"
                    style={{ height: `${Math.min(100, aggregateStats.totalEnrollments)}%` }}
                  />
                  <div className="text-center mt-2">
                    <div className="text-lg font-bold text-cyan-400">{aggregateStats.totalEnrollments}</div>
                    <div className="text-xs text-slate-500">Enrolled</div>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <div
                    className="w-16 bg-blue-500/50 rounded-t"
                    style={{
                      height: `${aggregateStats.totalEnrollments > 0
                        ? (aggregateStats.emailsSent / aggregateStats.totalEnrollments) * 100
                        : 0}%`
                    }}
                  />
                  <div className="text-center mt-2">
                    <div className="text-lg font-bold text-blue-400">{aggregateStats.emailsSent}</div>
                    <div className="text-xs text-slate-500">Sent</div>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <div
                    className="w-16 bg-purple-500/50 rounded-t"
                    style={{
                      height: `${aggregateStats.emailsSent > 0
                        ? (aggregateStats.emailsOpened / aggregateStats.emailsSent) * 100
                        : 0}%`
                    }}
                  />
                  <div className="text-center mt-2">
                    <div className="text-lg font-bold text-purple-400">{aggregateStats.emailsOpened}</div>
                    <div className="text-xs text-slate-500">Opened</div>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <div
                    className="w-16 bg-green-500/50 rounded-t"
                    style={{
                      height: `${aggregateStats.emailsOpened > 0
                        ? (aggregateStats.conversions / aggregateStats.emailsOpened) * 100
                        : 0}%`
                    }}
                  />
                  <div className="text-center mt-2">
                    <div className="text-lg font-bold text-green-400">{aggregateStats.conversions}</div>
                    <div className="text-xs text-slate-500">Completed</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sequence Modal */}
      {showSequenceModal && (
        <SequenceModal
          sequence={editingSequence}
          onClose={() => {
            setShowSequenceModal(false);
            setEditingSequence(null);
          }}
          onSave={() => {
            setShowSequenceModal(false);
            setEditingSequence(null);
            fetchSequences();
          }}
        />
      )}
    </div>
  );
}

// Sequence Modal Component
function SequenceModal({
  sequence,
  onClose,
  onSave,
}: {
  sequence: NurtureSequence | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const [form, setForm] = useState({
    name: sequence?.name || "",
    description: sequence?.description || "",
    triggerType: sequence?.triggerType || "new_lead",
    emails: sequence?.emails || [{ dayOffset: 0, subject: "", templateId: "welcome_series_1" }],
  });
  const [saving, setSaving] = useState(false);

  const addEmail = () => {
    const lastDay = form.emails.length > 0
      ? Math.max(...form.emails.map(e => e.dayOffset))
      : -1;
    setForm({
      ...form,
      emails: [...form.emails, { dayOffset: lastDay + 3, subject: "", templateId: "destination_inspiration" }],
    });
  };

  const removeEmail = (index: number) => {
    setForm({
      ...form,
      emails: form.emails.filter((_, i) => i !== index),
    });
  };

  const updateEmail = (index: number, field: string, value: string | number) => {
    const updated = [...form.emails];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, emails: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = sequence
        ? `/api/admin/nurture-sequences/${sequence.id}`
        : "/api/admin/nurture-sequences";
      const method = sequence ? "PUT" : "POST";

      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description || undefined,
          triggerType: form.triggerType,
          emails: form.emails,
        }),
      });

      onSave();
    } catch (error) {
      console.error("Error saving sequence:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-white mb-4">
          {sequence ? "Edit Nurture Sequence" : "Create Nurture Sequence"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Sequence Name *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm"
              placeholder="e.g., Welcome Series"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm"
              rows={2}
              placeholder="Brief description of this nurture campaign"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Trigger Type *</label>
            <select
              value={form.triggerType}
              onChange={(e) => setForm({ ...form, triggerType: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm"
            >
              {TRIGGER_TYPES.map((trigger) => (
                <option key={trigger.value} value={trigger.value}>
                  {trigger.label} - {trigger.description}
                </option>
              ))}
            </select>
          </div>

          {/* Email Sequence Builder */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs text-slate-400">Email Sequence *</label>
              <button
                type="button"
                onClick={addEmail}
                className="text-xs text-emerald-400 hover:text-emerald-300"
              >
                + Add Email
              </button>
            </div>

            <div className="space-y-3">
              {form.emails.map((email, index) => (
                <div key={index} className="bg-slate-800 border border-slate-700 rounded p-3">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs text-slate-500">Email {index + 1}</span>
                    {form.emails.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeEmail(index)}
                        className="text-red-400 hover:text-red-300 text-xs"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Day</label>
                      <input
                        type="number"
                        min="0"
                        value={email.dayOffset}
                        onChange={(e) => updateEmail(index, "dayOffset", parseInt(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-sm"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs text-slate-500 mb-1">Subject</label>
                      <input
                        type="text"
                        required
                        value={email.subject}
                        onChange={(e) => updateEmail(index, "subject", e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-sm"
                        placeholder="Email subject line"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Template</label>
                      <select
                        value={email.templateId}
                        onChange={(e) => updateEmail(index, "templateId", e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-sm"
                      >
                        {EMAIL_TEMPLATES.map((template) => (
                          <option key={template.id} value={template.id}>
                            {template.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 px-4 py-2 rounded text-white text-sm"
            >
              {saving ? "Saving..." : sequence ? "Update Sequence" : "Create Sequence"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
