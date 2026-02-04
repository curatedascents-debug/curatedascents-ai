"use client";

interface TransportationTableProps {
  rates: any[];
  onSelect: (rate: any) => void;
}

export default function TransportationTable({ rates, onSelect }: TransportationTableProps) {
  return (
    <div className="bg-slate-800 rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-700">
          <tr>
            <th className="text-left p-4 font-medium">Vehicle</th>
            <th className="text-left p-4 font-medium">Route</th>
            <th className="text-left p-4 font-medium">Distance</th>
            <th className="text-left p-4 font-medium">Duration</th>
            <th className="text-left p-4 font-medium">Cost</th>
            <th className="text-left p-4 font-medium">Sell</th>
            <th className="text-left p-4 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {rates.map((rate, i) => (
            <tr
              key={`${rate.id}-${i}`}
              className="border-t border-slate-700 hover:bg-slate-700 cursor-pointer transition-colors"
              onClick={() => onSelect(rate)}
            >
              <td className="p-4 font-medium">{rate.vehicleName || rate.vehicleType || "-"}</td>
              <td className="p-4 text-slate-300">{rate.routeFrom && rate.routeTo ? `${rate.routeFrom} → ${rate.routeTo}` : "-"}</td>
              <td className="p-4 text-slate-300">{rate.distanceKm ? `${rate.distanceKm} km` : "-"}</td>
              <td className="p-4 text-slate-300">{rate.durationHours ? `${rate.durationHours} hrs` : "-"}</td>
              <td className="p-4 text-slate-400">{rate.costPrice ? `$${rate.costPrice}` : "-"}</td>
              <td className="p-4 text-emerald-400 font-medium">{rate.sellPrice ? `$${rate.sellPrice}` : "-"}</td>
              <td className="p-4">
                <span className={`px-2 py-1 rounded text-sm ${rate.isActive !== false ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"}`}>
                  {rate.isActive !== false ? "Active" : "Inactive"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {rates.length === 0 && <div className="p-8 text-center text-slate-400">No transportation rates found.</div>}
    </div>
  );
}
