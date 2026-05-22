import { Activity, Bug, Gauge, Loader2, ShieldAlert, UploadCloud } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { api } from '../api/client.js'
import SeverityBadge from '../components/SeverityBadge.jsx'
import StatCard from '../components/StatCard.jsx'
import { formatDate, severityColors, severityOrder } from '../utils/format.js'

const emptyStats = {
  totalReports: 0,
  totalFindings: 0,
  averageQualityScore: 0,
  severityTotals: {},
  languageUsage: {},
  recentReports: [],
}

function DashboardPage() {
  const [stats, setStats] = useState(emptyStats)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false
    api
      .get('/dashboard/stats')
      .then(({ data }) => {
        if (!ignore) {
          setStats(data)
        }
      })
      .catch((caught) => {
        if (!ignore) {
          setError(caught.message || 'Unable to load dashboard.')
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false)
        }
      })
    return () => {
      ignore = true
    }
  }, [])

  const severityData = useMemo(
    () =>
      severityOrder.map((severity) => ({
        severity,
        count: stats.severityTotals?.[severity] || 0,
        fill: severityColors[severity],
      })),
    [stats.severityTotals],
  )

  const languageData = useMemo(
    () =>
      Object.entries(stats.languageUsage || {}).map(([name, value]) => ({
        name,
        value,
      })),
    [stats.languageUsage],
  )

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-teal-600" />
          <p className="mt-3 text-sm font-semibold text-slate-700">Loading dashboard</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase text-teal-700">Workspace</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">Dashboard</h1>
        </div>
        <Link
          to="/app/upload"
          className="focus-ring inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
        >
          <UploadCloud className="h-4 w-4" />
          Analyze file
        </Link>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Bug} label="Reports" value={stats.totalReports} detail="Uploaded source files" />
        <StatCard icon={ShieldAlert} label="Findings" value={stats.totalFindings} tone="rose" detail="Detected issues" />
        <StatCard
          icon={Gauge}
          label="Quality score"
          value={`${stats.averageQualityScore || 0}`}
          tone="amber"
          detail="Average across reports"
        />
        <StatCard
          icon={Activity}
          label="Critical"
          value={stats.severityTotals?.critical || 0}
          tone="indigo"
          detail="Highest priority"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Severity analytics</h2>
              <p className="mt-1 text-sm text-slate-500">Findings grouped by impact.</p>
            </div>
          </div>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severityData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="severity" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {severityData.map((entry) => (
                    <Cell key={entry.severity} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Language mix</h2>
            <p className="mt-1 text-sm text-slate-500">Reports grouped by source language.</p>
          </div>
          <div className="mt-6 h-72">
            {languageData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={languageData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92}>
                    {languageData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={['#0d9488', '#f59e0b', '#6366f1', '#e11d48', '#475569'][index % 5]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-slate-200 text-sm text-slate-500">
                No reports yet
              </div>
            )}
          </div>
        </section>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-950">Recent bug reports</h2>
          <Link className="text-sm font-semibold text-teal-700 hover:text-teal-800" to="/app/reports">
            View all
          </Link>
        </div>
        <div className="divide-y divide-slate-100">
          {stats.recentReports?.length ? (
            stats.recentReports.map((report) => {
              const severity = severityOrder.find((item) => report.analysis?.severityCounts?.[item] > 0) || 'low'
              const findingCount = report.analysis?.findings?.length || 0
              return (
                <Link
                  key={report.id}
                  to={`/app/reports/${report.id}`}
                  className="flex flex-col gap-3 px-5 py-4 transition hover:bg-slate-50 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-semibold text-slate-950">{report.fileName}</p>
                    <div className="mt-1 flex flex-wrap gap-2 text-sm text-slate-500">
                      <span>{report.language}</span>
                      <span>{formatDate(report.createdAt)}</span>
                      <span>{findingCount} findings</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-slate-600">
                      Score {report.analysis?.qualityScore || 0}
                    </span>
                    <SeverityBadge severity={severity} />
                  </div>
                </Link>
              )
            })
          ) : (
            <div className="px-5 py-10 text-center text-sm text-slate-500">No reports yet</div>
          )}
        </div>
      </section>
    </div>
  )
}

export default DashboardPage
