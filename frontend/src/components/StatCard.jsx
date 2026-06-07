import { TrendingDown, TrendingUp } from 'lucide-react'

function StatCard({ icon: Icon, label, value, tone = 'indigo', detail, progress, trend, trendDirection = 'up' }) {
  const tones = {
    blue: 'bg-blue-500/12 text-blue-100 ring-blue-400/25',
    indigo: 'bg-indigo-500/12 text-indigo-100 ring-indigo-400/25',
    violet: 'bg-violet-500/12 text-violet-100 ring-violet-400/25',
    slate: 'bg-slate-700/55 text-slate-100 ring-slate-500/35',
  }
  const TrendIcon = trendDirection === 'down' ? TrendingDown : TrendingUp

  return (
    <section className="surface-card group p-5 transition duration-200 hover:-translate-y-1 hover:border-indigo-500/60 hover:shadow-[0_24px_80px_rgba(79,70,229,0.18)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-400">{label}</p>
          <p className="mt-3 truncate text-3xl font-semibold tracking-normal text-white">{value}</p>
        </div>
        <div className={`rounded-lg p-3 ring-1 transition group-hover:scale-105 ${tones[tone] || tones.indigo}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {typeof progress === 'number' ? (
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      ) : null}
      <div className="mt-4 flex items-center justify-between gap-3">
        {detail ? <p className="min-w-0 text-sm text-slate-400">{detail}</p> : <span />}
        {trend ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-indigo-400/30 bg-indigo-500/10 px-2 py-1 text-xs font-semibold text-indigo-100">
            <TrendIcon className="h-3.5 w-3.5" />
            {trend}
          </span>
        ) : null}
      </div>
    </section>
  )
}

export default StatCard
