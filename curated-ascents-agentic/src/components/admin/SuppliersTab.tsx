"use client";

import { useState, useEffect } from "react";
import SupplierModal from "@/components/SupplierModal";

interface Supplier {
  id: number;
  name: string;
  type: string;
  [key: string]: any;
}

export default function SuppliersTab() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [showAddSupplier, setShowAddSupplier] = useState(false);

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

  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesSearch =
      supplier.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.country?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || supplier.type === filterType;
    return matchesSearch && matchesType;
  });

  const supplierTypes = [...new Set(suppliers.map((s) => s.type).filter(Boolean))].sort();

  const handleDeleteSupplier = async (supplier: Supplier) => {
    if (!confirm(`Delete supplier "${supplier.name}"?`)) return;
    try {
      const response = await fetch(`/api/admin/suppliers/${supplier.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete");
      setSuppliers(suppliers.filter((s) => s.id !== supplier.id));
      setSelectedSupplier(null);
    } catch (error) {
      alert("Failed to delete supplier.");
      console.error(error);
    }
  };

  if (loading) {
    return <div className="text-center text-slate-400 py-8">Loading suppliers...</div>;
  }

  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search suppliers by name, city, country..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2"
        >
          <option value="all">All Types</option>
          {supplierTypes.map((type) => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1).replace("_", " ")}
            </option>
          ))}
        </select>
        <button
          onClick={() => setShowAddSupplier(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors"
        >
          + Add Supplier
        </button>
      </div>

      <div className="bg-slate-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-700">
            <tr>
              <th className="text-left p-4 font-medium">Name</th>
              <th className="text-left p-4 font-medium">Type</th>
              <th className="text-left p-4 font-medium">Location</th>
              <th className="text-left p-4 font-medium">Contact</th>
              <th className="text-left p-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredSuppliers.map((supplier) => (
              <tr
                key={supplier.id}
                className="border-t border-slate-700 hover:bg-slate-700 cursor-pointer transition-colors"
                onClick={() => setSelectedSupplier(supplier)}
              >
                <td className="p-4">
                  <div className="font-medium">
                    {supplier.isPreferred && <span className="text-yellow-400 mr-1">*</span>}
                    {supplier.name}
                  </div>
                </td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-slate-600 rounded text-sm capitalize">
                    {supplier.type?.replace("_", " ") || "-"}
                  </span>
                </td>
                <td className="p-4 text-slate-300">
                  {supplier.city ? `${supplier.city}, ${supplier.country || ""}` : supplier.country || "-"}
                </td>
                <td className="p-4 text-slate-300">
                  {(() => {
                    const contacts = supplier.contacts;
                    if (contacts && Array.isArray(contacts) && contacts.length > 0) {
                      const primary = contacts.find((c: any) => c.isPrimary) || contacts[0];
                      return primary.name || primary.email || "-";
                    }
                    return "-";
                  })()}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-sm ${supplier.isActive !== false ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"}`}>
                    {supplier.isActive !== false ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredSuppliers.length === 0 && (
          <div className="p-8 text-center text-slate-400">
            {searchTerm || filterType !== "all"
              ? "No suppliers match your search."
              : 'No suppliers found. Click "+ Add Supplier" to create one.'}
          </div>
        )}
      </div>

      {(selectedSupplier || showAddSupplier) && (
        <SupplierModal
          supplier={selectedSupplier}
          isNew={showAddSupplier}
          onClose={() => {
            setSelectedSupplier(null);
            setShowAddSupplier(false);
          }}
          onSave={() => {
            setSelectedSupplier(null);
            setShowAddSupplier(false);
            fetchSuppliers();
          }}
          onDelete={selectedSupplier ? () => handleDeleteSupplier(selectedSupplier) : undefined}
        />
      )}
    </>
  );
}
