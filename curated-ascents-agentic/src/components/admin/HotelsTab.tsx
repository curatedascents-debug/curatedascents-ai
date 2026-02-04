"use client";

import { useState, useEffect } from "react";
import HotelModal from "@/components/HotelModal";

interface Hotel {
  id: number;
  name: string;
  [key: string]: any;
}

interface HotelsTabProps {
  suppliers: any[];
  destinations: any[];
}

export default function HotelsTab({ suppliers, destinations }: HotelsTabProps) {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStar, setFilterStar] = useState("all");
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [showAddHotel, setShowAddHotel] = useState(false);

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      const res = await fetch("/api/admin/hotels");
      const data = await res.json();
      setHotels(data.hotels || []);
    } catch (error) {
      console.error("Error fetching hotels:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredHotels = hotels.filter((hotel) => {
    const matchesSearch =
      hotel.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hotel.destinationCity?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hotel.supplierName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStar = filterStar === "all" || hotel.starRating?.toString() === filterStar;
    return matchesSearch && matchesStar;
  });

  const handleDeleteHotel = async (hotel: Hotel) => {
    if (!confirm(`Delete hotel "${hotel.name}"?`)) return;
    try {
      const response = await fetch(`/api/admin/hotels/${hotel.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete");
      setHotels(hotels.filter((h) => h.id !== hotel.id));
      setSelectedHotel(null);
    } catch (error) {
      alert("Failed to delete hotel.");
      console.error(error);
    }
  };

  if (loading) {
    return <div className="text-center text-slate-400 py-8">Loading hotels...</div>;
  }

  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search hotels by name, city, supplier..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500"
        />
        <select
          value={filterStar}
          onChange={(e) => setFilterStar(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2"
        >
          <option value="all">All Star Ratings</option>
          <option value="5">5 Star</option>
          <option value="4">4 Star</option>
          <option value="3">3 Star</option>
          <option value="2">2 Star</option>
          <option value="1">1 Star</option>
        </select>
        <button
          onClick={() => setShowAddHotel(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors"
        >
          + Add Hotel
        </button>
      </div>

      <div className="bg-slate-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-700">
            <tr>
              <th className="text-left p-4 font-medium">Hotel Name</th>
              <th className="text-left p-4 font-medium">Star Rating</th>
              <th className="text-left p-4 font-medium">Location</th>
              <th className="text-left p-4 font-medium">Supplier</th>
              <th className="text-left p-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredHotels.map((hotel) => (
              <tr
                key={hotel.id}
                className="border-t border-slate-700 hover:bg-slate-700 cursor-pointer transition-colors"
                onClick={() => setSelectedHotel(hotel)}
              >
                <td className="p-4 font-medium">{hotel.name}</td>
                <td className="p-4 text-yellow-400">
                  {hotel.starRating ? `${hotel.starRating} Star` : "-"}
                </td>
                <td className="p-4 text-slate-300">
                  {hotel.destinationCity ? `${hotel.destinationCity}, ${hotel.destinationCountry || ""}` : "-"}
                </td>
                <td className="p-4 text-slate-300">{hotel.supplierName || "-"}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-sm ${hotel.isActive !== false ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"}`}>
                    {hotel.isActive !== false ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredHotels.length === 0 && (
          <div className="p-8 text-center text-slate-400">
            {searchTerm || filterStar !== "all"
              ? "No hotels match your search."
              : 'No hotels found. Click "+ Add Hotel" to create one.'}
          </div>
        )}
      </div>

      {(selectedHotel || showAddHotel) && (
        <HotelModal
          hotel={selectedHotel}
          isNew={showAddHotel}
          suppliers={suppliers}
          destinations={destinations}
          onClose={() => {
            setSelectedHotel(null);
            setShowAddHotel(false);
          }}
          onSave={() => {
            setSelectedHotel(null);
            setShowAddHotel(false);
            fetchHotels();
          }}
          onDelete={selectedHotel ? () => handleDeleteHotel(selectedHotel) : undefined}
        />
      )}
    </>
  );
}
