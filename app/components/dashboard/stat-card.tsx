export type StatCardProps = {
  label: string;
  value: number;
  subtext?: string;
  color: string;
  icon: string;
};

export function StatCard({
  label,
  value,
  subtext,
  color,
  icon,
}: StatCardProps) {
  return (
    <div
      className={`bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between ${color}`}
    >
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
        <p className="text-3xl font-bold text-slate-800">{value}</p>
        {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
      </div>
      <div className="text-3xl opacity-80">{icon}</div>
    </div>
  );
}
