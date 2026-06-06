function StatCard({ icon: Icon, label, value, tone = 'teal', detail, progress, trend }) {
  const tones = {
    teal: 'bg-teal-50 text-teal-700 ring-teal-100 dark:bg-teal-400/10 dark:text-teal-300 dark:ring-teal-400/20',
    amber: 'bg-amber-50 text-amber-700 ring-amber-100 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/20',
    rose: 'bg-rose-50 text-rose-700 ring-rose-100 dark:bg-rose-400/10 dark:text-rose-300 dark:ring-rose-400/20',
    indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-100 dark:bg-indigo-400/10 dark:text-indigo-300 dark:ring-indigo-400/20',
    cyan: 'bg-cyan-50 text-cyan-700 ring-cyan-100 dark:bg-cyan-400/10 dark:text-cyan-300 dark:ring-cyan-400/20',
  }

  return (
    <section className="surface-card p-5 transition hover:-translate-y-0.5 hover:shadow-md dark:hover:border-slate-700">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-3 truncate text-3xl font-semibold tracking-normal text-slate-950 dark:text-white">{value}</p>
        </div>
        <div className={`rounded-lg p-3 ring-1 ${tones[tone] || tones.teal}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {typeof progress === 'number' ? (
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-cyan-500"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      ) : null}
      <div className="mt-4 flex items-center justify-between gap-3">
        {detail ? <p className="min-w-0 text-sm text-slate-500 dark:text-slate-400">{detail}</p> : <span />}
        {trend ? (
          <span className="shrink-0 rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
            {trend}
          </span>
        ) : null}
      </div>
    </section>
  )
}

export default StatCard
