function StatCard({ icon: Icon, label, value, tone = 'teal', detail }) {
  const tones = {
    teal: 'bg-teal-50 text-teal-700 ring-teal-100',
    amber: 'bg-amber-50 text-amber-700 ring-amber-100',
    rose: 'bg-rose-50 text-rose-700 ring-rose-100',
    indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-100',
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-normal text-slate-950">{value}</p>
        </div>
        <div className={`rounded-lg p-3 ring-1 ${tones[tone] || tones.teal}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {detail ? <p className="mt-4 text-sm text-slate-500">{detail}</p> : null}
    </section>
  )
}

export default StatCard
