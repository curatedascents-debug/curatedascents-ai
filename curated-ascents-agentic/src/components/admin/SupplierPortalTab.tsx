"use client";

import { useState, useEffect } from "react";
import { Truck, Users, ChevronRight, Key, Pencil, Trash2 } from "lucide-react";

interface Supplier {
  id: number;
  name: string;
  type: string | null;
  country: string | null;
  city: string | null;
  isActive: boolean | null;
}

interface SupplierUser {
  id: number;
  email: string;
  name: string | null;
  phone: string | null;
  role: string | null;
  isActive: boolean | null;
  lastLoginAt: string | null;
  createdAt: string;
}

export default function SupplierPortalTab() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [supplierUsers, setSupplierUsers] = useState<SupplierUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUser, setEditingUser] = useState<SupplierUser | null>(null);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await fetch("/api/admin/suppliers");
      const data = await res.json();
      setSuppliers(data.suppliers || []);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSupplierUsers = async (supplierId: number) => {
    setUsersLoading(true);
    try {
      const res = await fetch(`/api/admin/suppliers/${supplierId}/users`);
      const data = await res.json();
      setSupplierUsers(data.users || []);
    } catch (error) {
      console.error("Error fetching supplier users:", error);
    } finally {
      setUsersLoading(false);
    }
  };

  const selectSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    fetchSupplierUsers(supplier.id);
    setShowAddUser(false);
    setEditingUser(null);
  };

  const handleDeleteUser = async (user: SupplierUser) => {
    if (!selectedSupplier) return;
    if (!confirm(`Delete user "${user.name || user.email}"? This cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/admin/suppliers/${selectedSupplier.id}/users/${user.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to delete user");
        return;
      }

      fetchSupplierUsers(selectedSupplier.id);
    } catch (error) {
      alert("Failed to delete user");
    }
  };

  const filteredSuppliers = suppliers.filter((s) => {
    const term = searchTerm.toLowerCase();
    return (
      s.name.toLowerCase().includes(term) ||
      s.type?.toLowerCase().includes(term) ||
      s.country?.toLowerCase().includes(term) ||
      s.city?.toLowerCase().includes(term)
    );
  });

  // Count users per supplier
  const suppliersWithUserCount = filteredSuppliers.map((s) => ({
    ...s,
    hasPortalAccess: supplierUsers.length > 0 && selectedSupplier?.id === s.id,
  }));

  if (loading) {
    return <div className="text-center text-slate-400 py-8">Loading suppliers...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Suppliers List */}
      <div>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-orange-500"
          />
        </div>

        <div className="bg-slate-800 rounded-lg overflow-hidden max-h-[600px] overflow-y-auto">
          {suppliersWithUserCount.map((supplier) => (
            <div
              key={supplier.id}
              onClick={() => selectSupplier(supplier)}
              className={`p-4 border-b border-slate-700 cursor-pointer transition-colors flex items-center justify-between ${
                selectedSupplier?.id === supplier.id
                  ? "bg-slate-700"
                  : "hover:bg-slate-700/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                  <Truck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-medium">{supplier.name}</div>
                  <div className="text-sm text-slate-400">
                    {supplier.type ? `${supplier.type} • ` : ""}
                    {supplier.country || supplier.city || "No location"}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </div>
          ))}
          {suppliersWithUserCount.length === 0 && (
            <div className="p-8 text-center text-slate-400">
              {searchTerm ? "No suppliers match your search." : "No suppliers found."}
            </div>
          )}
        </div>
      </div>

      {/* Supplier Portal Users */}
      <div>
        {selectedSupplier ? (
          <div className="bg-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-orange-400">{selectedSupplier.name}</h3>
                <p className="text-sm text-slate-400">Portal Access Management</p>
              </div>
              <button
                onClick={() => setShowAddUser(true)}
                className="px-3 py-1 bg-orange-600 hover:bg-orange-500 rounded text-sm transition-colors flex items-center gap-1"
              >
                <Key className="w-4 h-4" />
                Add Portal User
              </button>
            </div>

            {usersLoading ? (
              <div className="text-center text-slate-400 py-4">Loading users...</div>
            ) : (
              <>
                {supplierUsers.length > 0 ? (
                  <div className="space-y-3">
                    {supplierUsers.map((user) => (
                      <div
                        key={user.id}
                        className="bg-slate-900 rounded-lg p-4 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-medium">{user.name || user.email}</div>
                          <div className="text-sm text-slate-400">{user.email}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-2 py-0.5 rounded text-xs capitalize ${
                              user.role === "owner"
                                ? "bg-purple-900 text-purple-300"
                                : user.role === "admin"
                                ? "bg-blue-900 text-blue-300"
                                : "bg-slate-600 text-slate-300"
                            }`}
                          >
                            {user.role || "staff"}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-xs ${
                              user.isActive
                                ? "bg-green-900 text-green-300"
                                : "bg-red-900 text-red-300"
                            }`}
                          >
                            {user.isActive ? "Active" : "Inactive"}
                          </span>
                          <button
                            onClick={() => {
                              setEditingUser(user);
                              setShowAddUser(false);
                            }}
                            className="p-1 hover:bg-slate-700 rounded transition-colors"
                            title="Edit user"
                          >
                            <Pencil className="w-4 h-4 text-slate-400 hover:text-orange-400" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="p-1 hover:bg-slate-700 rounded transition-colors"
                            title="Delete user"
                          >
                            <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400 mb-4">No portal users yet</p>
                    <p className="text-sm text-slate-500">
                      Add a user to give this supplier access to their portal
                    </p>
                  </div>
                )}

                {/* Add User Form */}
                {showAddUser && (
                  <AddSupplierUserForm
                    supplierId={selectedSupplier.id}
                    supplierName={selectedSupplier.name}
                    onClose={() => setShowAddUser(false)}
                    onSave={() => {
                      setShowAddUser(false);
                      fetchSupplierUsers(selectedSupplier.id);
                    }}
                  />
                )}

                {/* Edit User Form */}
                {editingUser && (
                  <EditSupplierUserForm
                    supplierId={selectedSupplier.id}
                    user={editingUser}
                    onClose={() => setEditingUser(null)}
                    onSave={() => {
                      setEditingUser(null);
                      fetchSupplierUsers(selectedSupplier.id);
                    }}
                  />
                )}
              </>
            )}
          </div>
        ) : (
          <div className="bg-slate-800 rounded-lg p-8 text-center">
            <Key className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Supplier Portal Access</h3>
            <p className="text-slate-400">
              Select a supplier from the list to manage their portal login credentials.
            </p>
            <p className="text-sm text-slate-500 mt-4">
              Portal URL: <code className="bg-slate-700 px-2 py-1 rounded">/supplier/login</code>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Add Supplier User Form
function AddSupplierUserForm({
  supplierId,
  supplierName,
  onClose,
  onSave,
}: {
  supplierId: number;
  supplierName: string;
  onClose: () => void;
  onSave: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("staff");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      alert("Email and password are required");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/suppliers/${supplierId}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, role }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to create user");
        return;
      }

      onSave();
    } catch (error) {
      alert("Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 bg-slate-900 rounded-lg p-4 space-y-4">
      <h4 className="font-semibold text-orange-400">Add Portal User for {supplierName}</h4>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-400 text-sm mb-1">Email *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
            required
          />
        </div>
        <div>
          <label className="block text-slate-400 text-sm mb-1">Password *</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
            required
          />
        </div>
        <div>
          <label className="block text-slate-400 text-sm mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
          />
        </div>
        <div>
          <label className="block text-slate-400 text-sm mb-1">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
          >
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
            <option value="owner">Owner</option>
            <option value="viewer">Viewer</option>
          </select>
        </div>
      </div>
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-orange-600 hover:bg-orange-500 rounded transition-colors disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create User"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// Edit Supplier User Form
function EditSupplierUserForm({
  supplierId,
  user,
  onClose,
  onSave,
}: {
  supplierId: number;
  user: SupplierUser;
  onClose: () => void;
  onSave: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(user.name || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [role, setRole] = useState(user.role || "staff");
  const [isActive, setIsActive] = useState(user.isActive ?? true);
  const [newPassword, setNewPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      const updateData: Record<string, any> = { name, phone, role, isActive };
      if (newPassword) {
        updateData.password = newPassword;
      }

      const res = await fetch(`/api/admin/suppliers/${supplierId}/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to update user");
        return;
      }

      onSave();
    } catch (error) {
      alert("Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 bg-slate-900 rounded-lg p-4 space-y-4">
      <h4 className="font-semibold text-orange-400">Edit User: {user.email}</h4>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-400 text-sm mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
          />
        </div>
        <div>
          <label className="block text-slate-400 text-sm mb-1">Phone</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
          />
        </div>
        <div>
          <label className="block text-slate-400 text-sm mb-1">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
          >
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
            <option value="owner">Owner</option>
            <option value="viewer">Viewer</option>
          </select>
        </div>
        <div>
          <label className="block text-slate-400 text-sm mb-1">Status</label>
          <select
            value={isActive ? "active" : "inactive"}
            onChange={(e) => setIsActive(e.target.value === "active")}
            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-slate-400 text-sm mb-1">New Password (leave blank to keep current)</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
          />
        </div>
      </div>
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-orange-600 hover:bg-orange-500 rounded transition-colors disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
