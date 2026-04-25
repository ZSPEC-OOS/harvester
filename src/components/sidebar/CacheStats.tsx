import { Pie, PieChart, ResponsiveContainer, Cell } from 'recharts';
import { GlassCard } from '../ui/GlassCard';

const data = [
  { name: 'Cached', value: 1847, color: '#4ADE80' },
  { name: 'New', value: 2103, color: '#3B82F6' },
];

export function CacheStats() {
  return (
    <GlassCard className="p-4 sm:p-6">
      <h2 className="mb-3 text-2xl font-semibold text-white">CACHE STATISTICS</h2>
      <div className="mx-auto h-56 w-full max-w-[280px]">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius={70} outerRadius={100} startAngle={90} endAngle={-270}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-2 text-slate-200">
        <p>1,847 PDFs already downloaded</p>
        <p>2,103 new to fetch</p>
      </div>
      <button className="mt-4 w-full rounded-xl border border-sky-500 px-4 py-3 text-white">Clean cache older than 90 days</button>
    </GlassCard>
  );
}
