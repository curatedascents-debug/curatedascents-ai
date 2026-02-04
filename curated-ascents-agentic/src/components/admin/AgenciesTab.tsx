"use client";

import { useState, useEffect } from "react";
import { Building2, Users, Package, ChevronRight } from "lucide-react";

interface Agency {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
  primaryColor: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  country: string | null;
  status: string | null;
  canAccessAllSuppliers: boolean | null;
  maxUsers: number | null;
  defaultMarginPercent: string | null;
  miceMarginPercent: string | null;
  currency: string | null;
  createdAt: string;
  userCount: number;
  supplierCount: number;
}

interface AgencyDetail {
  agency: Agency;
  users: Array<{
    id: number;
    email: string;
    name: string | null;
    phone: string | null;
    role: string | null;
    isActive: boolean | null;
    lastLoginAt: string | null;
    createdAt: string;
  }>;
  suppliers: Array<any>;
  stats: {
    clientCount: number;
    quoteCount: number;
    bookingCount: number;
    totalRevenue: string;
  };
}

export default function AgenciesTab() {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);
  const [agencyDetail, setAgencyDetail] = useState<AgencyDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetchAgencies();
  }, []);

  const fetchAgencies = async () => {
    try {
      const res = await fetch("/api/admin/agencies");
      const data = await res.json();
      setAgencies(data.agencies || []);
    } catch (error) {
      console.error("Error fetching agencies:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgencyDetail = async (agency: Agency) => {
    setSelectedAgency(agency);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/agencies/${agency.id}`);
      const data = await res.json();
      setAgencyDetail(data);
    } catch (error) {
      console.error("Error fetching agency detail:", error);
    } finally {
      setDetailLoading(false);
    }
  };

  const filteredAgencies = agencies.filter((a) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      a.name.toLowerCase().includes(term) ||
      a.slug.toLowerCase().includes(term) ||
      a.email?.toLowerCase().includes(term) ||
      a.country?.toLowerCase().includes(term);
    const matchesStatus = filterStatus === "all" || a.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const statusColor = (status: string | null) => {
    switch (status) {
      case "active":
        return "bg-green-900 text-green-300";
      case "pending":
        return "bg-yellow-900 text-yellow-300";
      case "suspended":
        return "bg-red-900 text-red-300";
      default:
        return "bg-slate-600 text-slate-300";
    }
  };

  if (loading) {
    return <div className="text-center text-slate-400 py-8">Loading agencies...</div>;
  }

  return (
    <>
      {/* Search and filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search agencies by name, slug, email, country..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="suspended">Suspended</option>
        </select>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors"
        >
          + Add Agency
        </button>
      </div>

      {/* Agencies table */}
      <div className="bg-slate-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-700">
            <tr>
              <th className="text-left p-4 font-medium">Agency</th>
              <th className="text-left p-4 font-medium">Contact</th>
              <th className="text-left p-4 font-medium">Users</th>
              <th className="text-left p-4 font-medium">Margin</th>
              <th className="text-left p-4 font-medium">Status</th>
              <th className="text-left p-4 font-medium">Created</th>
              <th className="text-left p-4 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {filteredAgencies.map((agency) => (
              <tr
                key={agency.id}
                className="border-t border-slate-700 hover:bg-slate-700 cursor-pointer transition-colors"
                onClick={() => fetchAgencyDetail(agency)}
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: agency.primaryColor || "#3b82f6" }}
                    >
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-emerald-400">{agency.name}</div>
                      <div className="text-sm text-slate-400">/{agency.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="text-sm">{agency.email || "-"}</div>
                  <div className="text-xs text-slate-400">{agency.country || "-"}</div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span>{agency.userCount}</span>
                    <span className="text-slate-500">/ {agency.maxUsers || 5}</span>
                  </div>
                </td>
                <td className="p-4">
                  <span className="text-yellow-400">{agency.defaultMarginPercent || "50"}%</span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-sm capitalize ${statusColor(agency.status)}`}>
                    {agency.status || "pending"}
                  </span>
                </td>
                <td className="p-4 text-slate-400 text-sm">
                  {new Date(agency.createdAt).toLocaleDateString()}
                </td>
                <td className="p-4">
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredAgencies.length === 0 && (
          <div className="p-8 text-center text-slate-400">
            {searchTerm || filterStatus !== "all"
              ? "No agencies match your search."
              : "No agencies found. Click '+ Add Agency' to create one."}
          </div>
        )}
      </div>

      {/* Agency Detail Modal */}
      {selectedAgency && (
        <AgencyDetailModal
          agency={selectedAgency}
          detail={agencyDetail}
          loading={detailLoading}
          onClose={() => {
            setSelectedAgency(null);
            setAgencyDetail(null);
          }}
          onUpdate={() => {
            fetchAgencies();
            if (selectedAgency) {
              fetchAgencyDetail(selectedAgency);
            }
          }}
        />
      )}

      {/* Add Agency Modal */}
      {showAddModal && (
        <AddAgencyModal
          onClose={() => setShowAddModal(false)}
          onSave={() => {
            setShowAddModal(false);
            fetchAgencies();
          }}
        />
      )}
    </>
  );
}

// Agency Detail Modal Component
function AgencyDetailModal({
  agency,
  detail,
  loading,
  onClose,
  onUpdate,
}: {
  agency: Agency;
  detail: AgencyDetail | null;
  loading: boolean;
  onClose: () => void;
  onUpdate: () => void;
}) {
  const [activeSection, setActiveSection] = useState<"overview" | "users" | "settings">("overview");
  const [showAddUser, setShowAddUser] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const updateStatus = async (newStatus: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/agencies/${agency.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        onUpdate();
      }
    } catch (error) {
      alert("Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  const addUser = async (userData: { email: string; name: string; password: string; role: string }) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/agencies/${agency.id}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to add user");
        return;
      }
      setShowAddUser(false);
      onUpdate();
    } catch (error) {
      alert("Failed to add user");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-700 flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: agency.primaryColor || "#3b82f6" }}
            >
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-emerald-400">{agency.name}</h2>
              <p className="text-slate-400">/{agency.slug}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700">
          {(["overview", "users", "settings"] as const).map((section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`px-6 py-3 capitalize transition-colors ${
                activeSection === section
                  ? "text-emerald-400 border-b-2 border-emerald-400"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {section}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading...</div>
        ) : (
          <div className="p-6">
            {activeSection === "overview" && detail && (
              <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-slate-900 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-emerald-400">{detail.stats.clientCount}</div>
                    <div className="text-sm text-slate-400">Clients</div>
                  </div>
                  <div className="bg-slate-900 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-400">{detail.stats.quoteCount}</div>
                    <div className="text-sm text-slate-400">Quotes</div>
                  </div>
                  <div className="bg-slate-900 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-400">{detail.stats.bookingCount}</div>
                    <div className="text-sm text-slate-400">Bookings</div>
                  </div>
                  <div className="bg-slate-900 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-400">
                      ${parseFloat(detail.stats.totalRevenue || "0").toLocaleString()}
                    </div>
                    <div className="text-sm text-slate-400">Revenue</div>
                  </div>
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-slate-400 text-sm">Email</div>
                    <div>{agency.email || "-"}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-sm">Phone</div>
                    <div>{agency.phone || "-"}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-sm">Website</div>
                    <div>{agency.website || "-"}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-sm">Country</div>
                    <div>{agency.country || "-"}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-sm">Default Margin</div>
                    <div className="text-yellow-400">{agency.defaultMarginPercent || "50"}%</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-sm">MICE Margin</div>
                    <div className="text-yellow-400">{agency.miceMarginPercent || "35"}%</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-sm">Currency</div>
                    <div>{agency.currency || "USD"}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-sm">Supplier Access</div>
                    <div>{agency.canAccessAllSuppliers ? "All Suppliers" : "Assigned Only"}</div>
                  </div>
                </div>

                {/* Status actions */}
                <div className="flex gap-3">
                  {agency.status === "pending" && (
                    <button
                      onClick={() => updateStatus("active")}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded transition-colors disabled:opacity-50"
                    >
                      Activate Agency
                    </button>
                  )}
                  {agency.status === "active" && (
                    <button
                      onClick={() => updateStatus("suspended")}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded transition-colors disabled:opacity-50"
                    >
                      Suspend Agency
                    </button>
                  )}
                  {agency.status === "suspended" && (
                    <button
                      onClick={() => updateStatus("active")}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded transition-colors disabled:opacity-50"
                    >
                      Reactivate Agency
                    </button>
                  )}
                </div>
              </div>
            )}

            {activeSection === "users" && detail && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">
                    Users ({detail.users.length}/{agency.maxUsers || 5})
                  </h3>
                  <button
                    onClick={() => setShowAddUser(true)}
                    disabled={detail.users.length >= (agency.maxUsers || 5)}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    + Add User
                  </button>
                </div>

                <div className="bg-slate-900 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-700">
                      <tr>
                        <th className="text-left p-3">User</th>
                        <th className="text-left p-3">Role</th>
                        <th className="text-left p-3">Status</th>
                        <th className="text-left p-3">Last Login</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.users.map((user) => (
                        <tr key={user.id} className="border-t border-slate-700">
                          <td className="p-3">
                            <div>{user.name || user.email}</div>
                            <div className="text-slate-400 text-xs">{user.email}</div>
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-xs capitalize ${
                                user.role === "owner"
                                  ? "bg-purple-900 text-purple-300"
                                  : user.role === "admin"
                                  ? "bg-blue-900 text-blue-300"
                                  : "bg-slate-600 text-slate-300"
                              }`}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-xs ${
                                user.isActive ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"
                              }`}
                            >
                              {user.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="p-3 text-slate-400">
                            {user.lastLoginAt
                              ? new Date(user.lastLoginAt).toLocaleDateString()
                              : "Never"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {detail.users.length === 0 && (
                    <div className="p-4 text-center text-slate-400">No users found.</div>
                  )}
                </div>

                {/* Add User Form */}
                {showAddUser && (
                  <AddUserForm
                    onSubmit={addUser}
                    onCancel={() => setShowAddUser(false)}
                    loading={actionLoading}
                  />
                )}
              </div>
            )}

            {activeSection === "settings" && (
              <div className="text-slate-400 text-center py-8">
                Settings editor coming soon. Use the API to update agency settings.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Add User Form Component
function AddUserForm({
  onSubmit,
  onCancel,
  loading,
}: {
  onSubmit: (data: { email: string; name: string; password: string; role: string }) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("agent");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      alert("Email and password are required");
      return;
    }
    onSubmit({ email, name, password, role });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900 rounded-lg p-4 space-y-4">
      <h4 className="font-semibold">Add New User</h4>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-400 text-sm mb-1">Email *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
            required
          />
        </div>
        <div>
          <label className="block text-slate-400 text-sm mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div>
          <label className="block text-slate-400 text-sm mb-1">Password *</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
            required
          />
        </div>
        <div>
          <label className="block text-slate-400 text-sm mb-1">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
          >
            <option value="agent">Agent</option>
            <option value="admin">Admin</option>
            <option value="viewer">Viewer</option>
          </select>
        </div>
      </div>
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded transition-colors disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add User"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// Add Agency Modal Component
function AddAgencyModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    email: "",
    phone: "",
    website: "",
    country: "",
    primaryColor: "#3b82f6",
    defaultMarginPercent: "50",
    miceMarginPercent: "35",
    currency: "USD",
    maxUsers: 5,
    canAccessAllSuppliers: false,
    ownerEmail: "",
    ownerPassword: "",
    ownerName: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.slug) {
      alert("Name and slug are required");
      return;
    }
    if (!form.ownerEmail || !form.ownerPassword) {
      alert("Owner email and password are required");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/agencies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to create agency");
        return;
      }

      onSave();
    } catch (error) {
      alert("Failed to create agency");
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-emerald-400">Add New Agency</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Agency Details */}
          <div>
            <h3 className="font-semibold mb-3 text-slate-300">Agency Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-sm mb-1">Agency Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      name: e.target.value,
                      slug: form.slug || generateSlug(e.target.value),
                    });
                  }}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-1">Slug *</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: generateSlug(e.target.value) })}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-1">Phone</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-1">Website</label>
                <input
                  type="text"
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-1">Country</label>
                <input
                  type="text"
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Business Settings */}
          <div>
            <h3 className="font-semibold mb-3 text-slate-300">Business Settings</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-400 text-sm mb-1">Default Margin %</label>
                <input
                  type="number"
                  value={form.defaultMarginPercent}
                  onChange={(e) => setForm({ ...form, defaultMarginPercent: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-1">MICE Margin %</label>
                <input
                  type="number"
                  value={form.miceMarginPercent}
                  onChange={(e) => setForm({ ...form, miceMarginPercent: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-1">Currency</label>
                <select
                  value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 focus:outline-none focus:border-emerald-500"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="NPR">NPR</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-1">Max Users</label>
                <input
                  type="number"
                  value={form.maxUsers}
                  onChange={(e) => setForm({ ...form, maxUsers: parseInt(e.target.value) || 5 })}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-1">Brand Color</label>
                <input
                  type="color"
                  value={form.primaryColor}
                  onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                  className="w-full h-10 bg-slate-700 border border-slate-600 rounded cursor-pointer"
                />
              </div>
              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.canAccessAllSuppliers}
                    onChange={(e) => setForm({ ...form, canAccessAllSuppliers: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Access All Suppliers</span>
                </label>
              </div>
            </div>
          </div>

          {/* Owner Account */}
          <div>
            <h3 className="font-semibold mb-3 text-slate-300">Owner Account</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-400 text-sm mb-1">Owner Email *</label>
                <input
                  type="email"
                  value={form.ownerEmail}
                  onChange={(e) => setForm({ ...form, ownerEmail: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-1">Owner Password *</label>
                <input
                  type="password"
                  value={form.ownerPassword}
                  onChange={(e) => setForm({ ...form, ownerPassword: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-1">Owner Name</label>
                <input
                  type="text"
                  value={form.ownerName}
                  onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-700">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 rounded transition-colors disabled:opacity-50 font-semibold"
            >
              {loading ? "Creating..." : "Create Agency"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
