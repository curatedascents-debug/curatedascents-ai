"use client";

interface StatCard {
  label: string;
  value: number;
  color: string;
}

interface AdminStatsProps {
  stats: StatCard[];
}

export default function AdminStats({ stats }: AdminStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-slate-800 p-4 rounded-lg">
          <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
          <div className="text-slate-400 text-sm">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
