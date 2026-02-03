"use client";

interface PortersTableProps {
  rates: any[];
  onSelect: (rate: any) => void;
}

export default function PortersTable({ rates, onSelect }: PortersTableProps) {
  return (
    <div className="bg-slate-800 rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-700">
          <tr>
            <th className="text-left p-4 font-medium">Region</th>
            <th className="text-left p-4 font-medium">Max Weight</th>
            <th className="text-left p-4 font-medium">Cost/Day</th>
            <th className="text-left p-4 font-medium">Sell/Day</th>
            <th className="text-left p-4 font-medium">Margin</th>
            <th className="text-left p-4 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {rates.map((rate, i) => {
            const cost = parseFloat(rate.costPerDay || "0");
            const sell = parseFloat(rate.sellPerDay || "0");
            const margin = cost > 0 && sell > 0 ? (((sell - cost) / cost) * 100).toFixed(0) : "-";

            return (
              <tr
                key={`${rate.id}-${i}`}
                className="border-t border-slate-700 hover:bg-slate-700 cursor-pointer transition-colors"
                onClick={() => onSelect(rate)}
              >
                <td className="p-4 font-medium">{rate.region || "-"}</td>
                <td className="p-4 text-slate-300">
                  {rate.maxWeightKg ? `${rate.maxWeightKg} kg` : "-"}
                </td>
                <td className="p-4 text-slate-400">
                  {rate.costPerDay ? `$${rate.costPerDay}` : "-"}
                </td>
                <td className="p-4 text-emerald-400 font-medium">
                  {rate.sellPerDay ? `$${rate.sellPerDay}` : "-"}
                </td>
                <td className="p-4 text-yellow-400 font-medium">
                  {margin !== "-" ? `${margin}%` : "-"}
                </td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      rate.isActive !== false
                        ? "bg-green-900 text-green-300"
                        : "bg-red-900 text-red-300"
                    }`}
                  >
                    {rate.isActive !== false ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {rates.length === 0 && (
        <div className="p-8 text-center text-slate-400">No porter rates found.</div>
      )}
    </div>
  );
}
