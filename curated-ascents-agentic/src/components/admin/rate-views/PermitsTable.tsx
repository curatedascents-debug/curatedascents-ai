"use client";

interface PermitsTableProps {
  rates: any[];
  onSelect: (rate: any) => void;
}

export default function PermitsTable({ rates, onSelect }: PermitsTableProps) {
  return (
    <div className="bg-slate-800 rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-700">
          <tr>
            <th className="text-left p-4 font-medium">Name</th>
            <th className="text-left p-4 font-medium">Type</th>
            <th className="text-left p-4 font-medium">Country</th>
            <th className="text-left p-4 font-medium">Region</th>
            <th className="text-left p-4 font-medium">Processing</th>
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
              <td className="p-4 font-medium">{rate.name || "-"}</td>
              <td className="p-4 text-slate-300 capitalize">{rate.type || "-"}</td>
              <td className="p-4 text-slate-300">{rate.country || "-"}</td>
              <td className="p-4 text-slate-300">{rate.region || "-"}</td>
              <td className="p-4 text-slate-300">{rate.processingTime || "-"}</td>
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
      {rates.length === 0 && <div className="p-8 text-center text-slate-400">No permit rates found.</div>}
    </div>
  );
}
