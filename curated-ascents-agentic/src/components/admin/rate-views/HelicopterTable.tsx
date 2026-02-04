"use client";

interface HelicopterTableProps {
  rates: any[];
  onSelect: (rate: any) => void;
}

export default function HelicopterTable({ rates, onSelect }: HelicopterTableProps) {
  return (
    <div className="bg-slate-800 rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-700">
          <tr>
            <th className="text-left p-4 font-medium">Route</th>
            <th className="text-left p-4 font-medium">Type</th>
            <th className="text-left p-4 font-medium">Duration</th>
            <th className="text-left p-4 font-medium">Capacity</th>
            <th className="text-left p-4 font-medium">Cost</th>
            <th className="text-left p-4 font-medium">Sell</th>
            <th className="text-left p-4 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {rates.map((rate, i) => (
            <tr
              key={`${rate.serviceType}-${rate.id}-${i}`}
              className="border-t border-slate-700 hover:bg-slate-700 cursor-pointer transition-colors"
              onClick={() => onSelect(rate)}
            >
              <td className="p-4 font-medium">{rate.routeName || "-"}</td>
              <td className="p-4 text-slate-300">
                <span className="px-2 py-1 bg-slate-600 rounded text-sm capitalize">
                  {rate.serviceType === "helicopter_charter" ? "Charter" : "Sharing"}
                </span>
              </td>
              <td className="p-4 text-slate-300">{rate.flightDuration || "-"}</td>
              <td className="p-4 text-slate-300">
                {rate.maxPassengers ? `${rate.maxPassengers} pax` : rate.seatsAvailable ? `${rate.seatsAvailable} seats` : "-"}
              </td>
              <td className="p-4 text-slate-400">
                {rate.costPerCharter ? `$${rate.costPerCharter}` : rate.costPerSeat ? `$${rate.costPerSeat}/seat` : "-"}
              </td>
              <td className="p-4 text-emerald-400 font-medium">
                {rate.sellPerCharter ? `$${rate.sellPerCharter}` : rate.sellPerSeat ? `$${rate.sellPerSeat}/seat` : "-"}
              </td>
              <td className="p-4">
                <span className={`px-2 py-1 rounded text-sm ${rate.isActive !== false ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"}`}>
                  {rate.isActive !== false ? "Active" : "Inactive"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {rates.length === 0 && <div className="p-8 text-center text-slate-400">No helicopter rates found.</div>}
    </div>
  );
}
