"use client";

import { useState, useEffect } from "react";
import ClientModal from "./ClientModal";

interface Client {
  id: number;
  email: string;
  name: string | null;
  phone: string | null;
  country: string | null;
  source: string | null;
  isActive: boolean;
  createdAt: string;
  quotesCount: number;
}

interface ClientsTabProps {
  apiBasePath?: string;
}

export default function ClientsTab({ apiBasePath = "/api/admin" }: ClientsTabProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showAddClient, setShowAddClient] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await fetch(`${apiBasePath}/clients`);
      const data = await res.json();
      setClients(data.clients || []);
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter((client) => {
    const term = searchTerm.toLowerCase();
    return (
      client.name?.toLowerCase().includes(term) ||
      client.email?.toLowerCase().includes(term) ||
      client.country?.toLowerCase().includes(term)
    );
  });

  if (loading) {
    return <div className="text-center text-slate-400 py-8">Loading clients...</div>;
  }

  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search clients by name, email, country..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500"
        />
        <button
          onClick={() => setShowAddClient(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors"
        >
          + Add Client
        </button>
      </div>

      <div className="bg-slate-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-700">
            <tr>
              <th className="text-left p-4 font-medium">Name</th>
              <th className="text-left p-4 font-medium">Email</th>
              <th className="text-left p-4 font-medium">Country</th>
              <th className="text-left p-4 font-medium">Source</th>
              <th className="text-left p-4 font-medium">Quotes</th>
              <th className="text-left p-4 font-medium">Status</th>
              <th className="text-left p-4 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map((client) => (
              <tr
                key={client.id}
                className="border-t border-slate-700 hover:bg-slate-700 cursor-pointer transition-colors"
                onClick={() => setSelectedClient(client)}
              >
                <td className="p-4 font-medium">{client.name || "-"}</td>
                <td className="p-4 text-slate-300">{client.email}</td>
                <td className="p-4 text-slate-300">{client.country || "-"}</td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-slate-600 rounded text-sm capitalize">
                    {client.source || "chat"}
                  </span>
                </td>
                <td className="p-4 text-emerald-400 font-medium">{client.quotesCount || 0}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-sm ${client.isActive !== false ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"}`}>
                    {client.isActive !== false ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="p-4 text-slate-400 text-sm">
                  {client.createdAt ? new Date(client.createdAt).toLocaleDateString() : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredClients.length === 0 && (
          <div className="p-8 text-center text-slate-400">
            {searchTerm ? "No clients match your search." : 'No clients found. Click "+ Add Client" to create one.'}
          </div>
        )}
      </div>

      {(selectedClient || showAddClient) && (
        <ClientModal
          client={selectedClient}
          isNew={showAddClient}
          onClose={() => {
            setSelectedClient(null);
            setShowAddClient(false);
          }}
          onSave={() => {
            setSelectedClient(null);
            setShowAddClient(false);
            fetchClients();
          }}
          apiBasePath={apiBasePath}
        />
      )}
    </>
  );
}
