export default function StatCard({ title, value, hint, icon, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-50 text-slate-700 border-slate-200",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{title}</div>
          <div className="mt-2 text-3xl font-semibold text-slate-900">{value ?? 0}</div>
          {hint ? <div className="mt-1 text-sm text-slate-500">{hint}</div> : null}
        </div>
        <div className={`rounded-xl border p-3 ${tones[tone] ?? tones.slate}`}>{icon}</div>
      </div>
    </div>
  );
}