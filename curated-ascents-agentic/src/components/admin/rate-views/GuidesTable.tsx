"use client";

interface GuidesTableProps {
  rates: any[];
  onSelect: (rate: any) => void;
}

export default function GuidesTable({ rates, onSelect }: GuidesTableProps) {
  return (
    <div className="bg-slate-800 rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-700">
          <tr>
            <th className="text-left p-4 font-medium">Type</th>
            <th className="text-left p-4 font-medium">Destination</th>
            <th className="text-left p-4 font-medium">Languages</th>
            <th className="text-left p-4 font-medium">Experience</th>
            <th className="text-left p-4 font-medium">Cost/Day</th>
            <th className="text-left p-4 font-medium">Sell/Day</th>
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
              <td className="p-4 font-medium capitalize">{rate.guideType || "-"}</td>
              <td className="p-4 text-slate-300">{rate.destination || "-"}</td>
              <td className="p-4 text-slate-300">
                {Array.isArray(rate.languages) ? rate.languages.join(", ") : "-"}
              </td>
              <td className="p-4 text-slate-300">
                {rate.experienceYears ? `${rate.experienceYears} yrs` : "-"}
              </td>
              <td className="p-4 text-slate-400">{rate.costPerDay ? `$${rate.costPerDay}` : "-"}</td>
              <td className="p-4 text-emerald-400 font-medium">{rate.sellPerDay ? `$${rate.sellPerDay}` : "-"}</td>
              <td className="p-4">
                <span className={`px-2 py-1 rounded text-sm ${rate.isActive !== false ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"}`}>
                  {rate.isActive !== false ? "Active" : "Inactive"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {rates.length === 0 && <div className="p-8 text-center text-slate-400">No guide rates found.</div>}
    </div>
  );
}
