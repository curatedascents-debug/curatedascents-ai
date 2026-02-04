"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Truck, Building2, Map, DollarSign, Package, Users, Pencil, X, Save, Calendar } from "lucide-react";

interface SupplierInfo {
  id: number;
  name: string;
  type: string | null;
  country: string | null;
  city: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
}

interface UserInfo {
  id: number;
  email: string;
  name: string | null;
  role: string | null;
}

type TabType = "profile" | "rates" | "bookings" | "earnings";

export default function SupplierDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [user, setUser] = useState<UserInfo | null>(null);
  const [supplier, setSupplier] = useState<SupplierInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const res = await fetch("/api/supplier/auth/me");
      if (!res.ok) {
        router.push("/supplier/login");
        return;
      }
      const data = await res.json();
      setUser(data.user);
      setSupplier(data.supplier);
    } catch (error) {
      console.error("Error fetching user info:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/supplier/auth/logout", { method: "POST" });
    router.push("/supplier/login");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const tabs = [
    { key: "profile" as TabType, label: "Profile", icon: Building2 },
    { key: "rates" as TabType, label: "My Rates", icon: DollarSign },
    { key: "bookings" as TabType, label: "Bookings", icon: Package },
    { key: "earnings" as TabType, label: "Earnings", icon: DollarSign },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-orange-400">{supplier?.name || "Supplier Portal"}</h1>
              <p className="text-sm text-slate-400">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-slate-700 hover:bg-red-600 rounded transition-colors flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-700 pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-t transition-colors flex items-center gap-2 ${
                activeTab === tab.key
                  ? "bg-orange-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "profile" && supplier && (
          <ProfileTab supplier={supplier} user={user} />
        )}
        {activeTab === "rates" && supplier && (
          <RatesTab supplierId={supplier.id} />
        )}
        {activeTab === "bookings" && supplier && (
          <BookingsTab supplierId={supplier.id} />
        )}
        {activeTab === "earnings" && supplier && (
          <EarningsTab supplierId={supplier.id} />
        )}
      </div>
    </div>
  );
}

// Profile Tab Component
function ProfileTab({ supplier, user }: { supplier: SupplierInfo; user: UserInfo | null }) {
  return (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-orange-400 mb-4">Company Information</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div>
            <div className="text-slate-400 text-sm">Company Name</div>
            <div className="font-medium">{supplier.name}</div>
          </div>
          <div>
            <div className="text-slate-400 text-sm">Type</div>
            <div className="font-medium capitalize">{supplier.type?.replace("_", " ") || "-"}</div>
          </div>
          <div>
            <div className="text-slate-400 text-sm">Country</div>
            <div className="font-medium">{supplier.country || "-"}</div>
          </div>
          <div>
            <div className="text-slate-400 text-sm">City</div>
            <div className="font-medium">{supplier.city || "-"}</div>
          </div>
          <div>
            <div className="text-slate-400 text-sm">Email</div>
            <div className="font-medium">{supplier.email || "-"}</div>
          </div>
          <div>
            <div className="text-slate-400 text-sm">Phone</div>
            <div className="font-medium">{supplier.phone || "-"}</div>
          </div>
          <div>
            <div className="text-slate-400 text-sm">Website</div>
            <div className="font-medium">
              {supplier.website ? (
                <a href={supplier.website} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">
                  {supplier.website}
                </a>
              ) : "-"}
            </div>
          </div>
        </div>
      </div>

      {user && (
        <div className="bg-slate-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-orange-400 mb-4">Your Account</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <div className="text-slate-400 text-sm">Name</div>
              <div className="font-medium">{user.name || "-"}</div>
            </div>
            <div>
              <div className="text-slate-400 text-sm">Email</div>
              <div className="font-medium">{user.email}</div>
            </div>
            <div>
              <div className="text-slate-400 text-sm">Role</div>
              <div className="font-medium capitalize">{user.role || "staff"}</div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-slate-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-orange-400 mb-4">Need to Update Information?</h2>
        <p className="text-slate-400">
          To update your company information, please contact CuratedAscents at{" "}
          <a href="mailto:partners@curatedascents.com" className="text-orange-400 hover:underline">
            partners@curatedascents.com
          </a>
        </p>
      </div>
    </div>
  );
}

// Rate interface for type safety
interface Rate {
  id: number;
  serviceType: string;
  name: string;
  costPrice?: string | number;
  sellPrice?: string | number;
  currency?: string;
  validFrom?: string;
  validTo?: string;
  inclusions?: string;
  exclusions?: string;
  notes?: string;
  isActive?: boolean;
  [key: string]: any;
}

// Rates Tab Component
function RatesTab({ supplierId }: { supplierId: number }) {
  const [rates, setRates] = useState<Rate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRate, setEditingRate] = useState<Rate | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  useEffect(() => {
    fetchRates();
  }, [supplierId]);

  const fetchRates = async () => {
    try {
      const res = await fetch(`/api/supplier/rates`);
      if (res.ok) {
        const data = await res.json();
        setRates(data.rates || []);
      }
    } catch (error) {
      console.error("Error fetching rates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditRate = (rate: Rate) => {
    setEditingRate({ ...rate });
  };

  const handleSaveRate = async () => {
    if (!editingRate) return;

    try {
      const res = await fetch(`/api/supplier/rates/${editingRate.serviceType}/${editingRate.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          costPrice: editingRate.costPrice,
          sellPrice: editingRate.sellPrice,
          validFrom: editingRate.validFrom,
          validTo: editingRate.validTo,
          inclusions: editingRate.inclusions,
          exclusions: editingRate.exclusions,
          notes: editingRate.notes,
          isActive: editingRate.isActive,
        }),
      });

      if (res.ok) {
        await fetchRates();
        setEditingRate(null);
      } else {
        const error = await res.json();
        alert(error.error || "Failed to update rate");
      }
    } catch (error) {
      console.error("Error updating rate:", error);
      alert("Failed to update rate");
    }
  };

  // Get unique service types for filter
  const serviceTypes = Array.from(new Set(rates.map(r => r.serviceType)));

  // Filter rates
  const filteredRates = rates.filter(rate => {
    const matchesSearch = (rate.name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || rate.serviceType === filterType;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return <div className="text-center text-slate-400 py-8">Loading rates...</div>;
  }

  if (rates.length === 0) {
    return (
      <div className="bg-slate-800 rounded-lg p-8 text-center">
        <Package className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Rates Found</h3>
        <p className="text-slate-400">
          Your service rates will appear here once they are added to the system.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="flex gap-4 flex-wrap">
        <input
          type="text"
          placeholder="Search rates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 min-w-[200px] px-4 py-2 bg-slate-800 border border-slate-600 rounded focus:outline-none focus:border-orange-500"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 bg-slate-800 border border-slate-600 rounded focus:outline-none focus:border-orange-500"
        >
          <option value="all">All Types</option>
          {serviceTypes.map(type => (
            <option key={type} value={type}>
              {type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
            </option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-orange-400">{rates.length}</div>
          <div className="text-slate-400 text-sm">Total Rates</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{rates.filter(r => r.isActive).length}</div>
          <div className="text-slate-400 text-sm">Active</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-400">{rates.filter(r => !r.isActive).length}</div>
          <div className="text-slate-400 text-sm">Inactive</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">{serviceTypes.length}</div>
          <div className="text-slate-400 text-sm">Service Types</div>
        </div>
      </div>

      {/* Rates Table */}
      <div className="bg-slate-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-700">
            <tr>
              <th className="text-left p-4 font-medium">Service</th>
              <th className="text-left p-4 font-medium">Type</th>
              <th className="text-left p-4 font-medium">Cost</th>
              <th className="text-left p-4 font-medium">Sell Price</th>
              <th className="text-left p-4 font-medium">Valid Period</th>
              <th className="text-left p-4 font-medium">Status</th>
              <th className="text-left p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRates.map((rate) => (
              <tr key={`${rate.serviceType}-${rate.id}`} className="border-t border-slate-700 hover:bg-slate-750">
                <td className="p-4">
                  <div className="font-medium text-orange-400">{rate.name}</div>
                  {rate.notes && (
                    <div className="text-xs text-slate-500 mt-1 truncate max-w-[200px]">{rate.notes}</div>
                  )}
                </td>
                <td className="p-4 text-slate-300 capitalize">{rate.serviceType?.replace(/_/g, " ")}</td>
                <td className="p-4 text-slate-400">
                  ${rate.costPrice ? parseFloat(String(rate.costPrice)).toLocaleString() : "0"}
                </td>
                <td className="p-4 text-emerald-400 font-medium">
                  ${rate.sellPrice ? parseFloat(String(rate.sellPrice)).toLocaleString() : "0"}
                </td>
                <td className="p-4 text-slate-400 text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {rate.validFrom ? new Date(rate.validFrom).toLocaleDateString() : "-"}
                    {" - "}
                    {rate.validTo ? new Date(rate.validTo).toLocaleDateString() : "-"}
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs ${
                    rate.isActive ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"
                  }`}>
                    {rate.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="p-4">
                  <button
                    onClick={() => handleEditRate(rate)}
                    className="p-2 bg-slate-700 hover:bg-orange-600 rounded transition-colors"
                    title="Edit Rate"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredRates.length === 0 && (
          <div className="p-8 text-center text-slate-400">
            No rates match your search criteria
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingRate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-orange-400">Edit Rate</h2>
              <button
                onClick={() => setEditingRate(null)}
                className="p-2 hover:bg-slate-700 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-slate-700/50 rounded p-3 mb-4">
                <div className="text-sm text-slate-400">Service Name</div>
                <div className="font-medium text-orange-400">{editingRate.name}</div>
                <div className="text-xs text-slate-500 capitalize mt-1">{editingRate.serviceType?.replace(/_/g, " ")}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Cost Price ($)</label>
                  <input
                    type="number"
                    value={editingRate.costPrice || ""}
                    onChange={(e) => setEditingRate({ ...editingRate, costPrice: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded focus:outline-none focus:border-orange-500"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Sell Price ($)</label>
                  <input
                    type="number"
                    value={editingRate.sellPrice || ""}
                    onChange={(e) => setEditingRate({ ...editingRate, sellPrice: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded focus:outline-none focus:border-orange-500"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Valid From</label>
                  <input
                    type="date"
                    value={editingRate.validFrom ? editingRate.validFrom.split("T")[0] : ""}
                    onChange={(e) => setEditingRate({ ...editingRate, validFrom: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Valid To</label>
                  <input
                    type="date"
                    value={editingRate.validTo ? editingRate.validTo.split("T")[0] : ""}
                    onChange={(e) => setEditingRate({ ...editingRate, validTo: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Inclusions</label>
                <textarea
                  value={editingRate.inclusions || ""}
                  onChange={(e) => setEditingRate({ ...editingRate, inclusions: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded focus:outline-none focus:border-orange-500 min-h-[80px]"
                  placeholder="List what's included in this rate..."
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Exclusions</label>
                <textarea
                  value={editingRate.exclusions || ""}
                  onChange={(e) => setEditingRate({ ...editingRate, exclusions: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded focus:outline-none focus:border-orange-500 min-h-[80px]"
                  placeholder="List what's NOT included in this rate..."
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Notes</label>
                <textarea
                  value={editingRate.notes || ""}
                  onChange={(e) => setEditingRate({ ...editingRate, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded focus:outline-none focus:border-orange-500 min-h-[80px]"
                  placeholder="Additional notes about this rate..."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={editingRate.isActive ?? true}
                  onChange={(e) => setEditingRate({ ...editingRate, isActive: e.target.checked })}
                  className="w-4 h-4 accent-orange-500"
                />
                <label htmlFor="isActive" className="text-sm text-slate-300">Rate is Active</label>
              </div>
            </div>

            <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => setEditingRate(null)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRate}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Bookings Tab Component
function BookingsTab({ supplierId }: { supplierId: number }) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, [supplierId]);

  const fetchBookings = async () => {
    try {
      const res = await fetch(`/api/supplier/bookings`);
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center text-slate-400 py-8">Loading bookings...</div>;
  }

  if (bookings.length === 0) {
    return (
      <div className="bg-slate-800 rounded-lg p-8 text-center">
        <Package className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Bookings Yet</h3>
        <p className="text-slate-400">
          Bookings that include your services will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-700">
          <tr>
            <th className="text-left p-4 font-medium">Booking Ref</th>
            <th className="text-left p-4 font-medium">Service</th>
            <th className="text-left p-4 font-medium">Date</th>
            <th className="text-left p-4 font-medium">Pax</th>
            <th className="text-left p-4 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id} className="border-t border-slate-700">
              <td className="p-4 font-medium text-orange-400">{booking.bookingReference}</td>
              <td className="p-4 text-slate-300">{booking.serviceName || booking.destination}</td>
              <td className="p-4 text-slate-400">
                {booking.startDate ? new Date(booking.startDate).toLocaleDateString() : "-"}
              </td>
              <td className="p-4">{booking.numberOfPax || "-"}</td>
              <td className="p-4">
                <span className={`px-2 py-1 rounded text-xs capitalize ${
                  booking.status === "confirmed" ? "bg-blue-900 text-blue-300" :
                  booking.status === "completed" ? "bg-green-900 text-green-300" :
                  booking.status === "cancelled" ? "bg-red-900 text-red-300" :
                  "bg-slate-600 text-slate-300"
                }`}>
                  {booking.status || "pending"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Earnings Tab Component
function EarningsTab({ supplierId }: { supplierId: number }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-emerald-400">$0</div>
          <div className="text-slate-400 text-sm mt-1">Total Earnings (This Month)</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-yellow-400">$0</div>
          <div className="text-slate-400 text-sm mt-1">Pending Payments</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-blue-400">0</div>
          <div className="text-slate-400 text-sm mt-1">Completed Bookings</div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-lg p-8 text-center">
        <DollarSign className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Earnings Report Coming Soon</h3>
        <p className="text-slate-400">
          Detailed earnings reports and payment history will be available here.
        </p>
      </div>
    </div>
  );
}
