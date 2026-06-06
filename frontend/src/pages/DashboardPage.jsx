import { motion } from 'framer-motion'
import {
  Activity,
  Bug,
  FileCheck2,
  Gauge,
  GitBranch,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Timer,
  UploadCloud,
  Users,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Area,
  AreaChart,
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
  totalScans: 0,
  totalFindings: 0,
  averageQualityScore: 0,
  severityTotals: {},
  languageUsage: {},
  mostCommonIssueTypes: {},
  recentReports: [],
}

function shortDate(value) {
  if (!value) return 'Scan'
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(value))
}

function averageFromReports(reports, key, fallback = 0) {
  const values = reports
    .map((report) => report.analysis?.[key])
    .filter((value) => typeof value === 'number')
  if (!values.length) return fallback
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="surface-card p-5">
            <div className="skeleton h-4 w-28" />
            <div className="skeleton mt-5 h-9 w-20" />
            <div className="skeleton mt-6 h-2 w-full" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="surface-card h-80 p-5" />
        <div className="surface-card h-80 p-5" />
      </div>
    </div>
  )
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
          setStats({ ...emptyStats, ...data })
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

  const recentReports = useMemo(() => stats.recentReports || [], [stats.recentReports])
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

  const trendData = useMemo(
    () =>
      [...recentReports].reverse().map((report, index) => ({
        name: shortDate(report.createdAt),
        quality: report.analysis?.qualityScore || stats.averageQualityScore || 0,
        security: report.analysis?.securityScore || report.analysis?.qualityScore || 0,
        issues: report.analysis?.analysisSummary?.totalIssues || report.analysis?.issues?.length || index,
      })),
    [recentReports, stats.averageQualityScore],
  )

  const commonIssues = useMemo(
    () =>
      Object.entries(stats.mostCommonIssueTypes || {}).map(([title, count]) => ({
        title,
        count,
      })),
    [stats.mostCommonIssueTypes],
  )

  const averageSecurity = averageFromReports(recentReports, 'securityScore', stats.averageQualityScore || 0)
  const averageMaintainability = averageFromReports(recentReports, 'maintainabilityScore', stats.averageQualityScore || 0)
  const healthScore = Math.round(((stats.averageQualityScore || 0) + averageSecurity + averageMaintainability) / 3)
  const criticalIssues = stats.severityTotals?.critical || 0

  if (loading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase text-cyan-700 dark:text-cyan-300">Enterprise dashboard</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950 dark:text-white">Project health command center</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            Quality, security, maintainability, repository activity, and team signals in one operational view.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link to="/app/reports" className="secondary-action">
            <FileCheck2 className="h-4 w-4" />
            View reports
          </Link>
          <Link to="/app/upload" className="primary-action">
            <UploadCloud className="h-4 w-4" />
            New scan
          </Link>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/70 dark:bg-red-950/50 dark:text-red-200">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={GitBranch} label="Total projects" value={stats.totalReports || 0} detail="Tracked scans and repositories" trend="+12%" tone="cyan" />
        <StatCard icon={Bug} label="Total issues" value={stats.totalFindings || 0} detail="Open findings" tone="rose" progress={Math.min(100, stats.totalFindings || 0)} />
        <StatCard icon={ShieldCheck} label="Security score" value={averageSecurity || 0} detail="Recent scan average" tone="teal" progress={averageSecurity || 0} />
        <StatCard icon={Gauge} label="Health score" value={healthScore || 0} detail="Quality plus security" tone="indigo" progress={healthScore || 0} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <section className="surface-card p-5">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Quality and security trends</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Recent scan score movement.</p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
              <Activity className="h-3.5 w-3.5" />
              Live history
            </span>
          </div>
          <div className="mt-6 h-72">
            {trendData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="quality" stroke="#0891b2" fill="#06b6d4" fillOpacity={0.14} />
                  <Area type="monotone" dataKey="security" stroke="#10b981" fill="#10b981" fillOpacity={0.12} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-slate-200 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
                No trend data yet
              </div>
            )}
          </div>
        </section>

        <section className="surface-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Project health</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Weighted operational posture.</p>
            </div>
            <Sparkles className="h-5 w-5 text-cyan-600 dark:text-cyan-300" />
          </div>
          <div className="mt-6 grid gap-4">
            {[
              ['Quality', stats.averageQualityScore || 0, 'bg-cyan-500'],
              ['Security', averageSecurity || 0, 'bg-emerald-500'],
              ['Maintainability', averageMaintainability || 0, 'bg-indigo-500'],
              ['Critical risk', criticalIssues ? Math.max(0, 100 - criticalIssues * 15) : 100, 'bg-rose-500'],
            ].map(([label, value, color]) => (
              <div key={label}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{label}</span>
                  <span className="font-semibold text-slate-950 dark:text-white">{value}</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.9fr_0.65fr_0.75fr]">
        <section className="surface-card p-5">
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Severity distribution</h2>
          <div className="mt-5 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severityData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="severity" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'rgba(148, 163, 184, 0.12)' }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {severityData.map((entry) => (
                    <Cell key={entry.severity} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="surface-card p-5">
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Language distribution</h2>
          <div className="mt-5 h-64">
            {languageData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={languageData} dataKey="value" nameKey="name" innerRadius={54} outerRadius={84}>
                    {languageData.map((entry, index) => (
                      <Cell key={entry.name} fill={['#0891b2', '#10b981', '#6366f1', '#f97316', '#e11d48'][index % 5]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-slate-200 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
                No scans yet
              </div>
            )}
          </div>
        </section>

        <section className="surface-card p-5">
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Team activity</h2>
          <div className="mt-5 space-y-4">
            {[
              [Users, '3 active reviewers', 'Issue triage'],
              [ShieldAlert, `${criticalIssues} critical issues`, 'Security queue'],
              [Timer, '24m avg scan time', 'Repository jobs'],
            ].map(([Icon, titleText, detail]) => (
              <div key={titleText} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/60">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-700 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-800">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">{titleText}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_0.8fr]">
        <section className="surface-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Recent scans</h2>
            <Link className="text-sm font-semibold text-cyan-700 hover:text-cyan-800 dark:text-cyan-300" to="/app/reports">
              View all
            </Link>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentReports.length ? (
              recentReports.map((report) => {
                const severity = severityOrder.find((item) => report.analysis?.severityCounts?.[item] > 0) || 'low'
                const findingCount = report.analysis?.issues?.length || report.analysis?.findings?.length || 0
                return (
                  <motion.div key={report.id} whileHover={{ x: 3 }}>
                    <Link
                      to={`/app/reports/${report.id}`}
                      className="flex flex-col gap-3 px-5 py-4 transition hover:bg-slate-50 dark:hover:bg-slate-900 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <p className="font-semibold text-slate-950 dark:text-white">{report.fileName}</p>
                        <div className="mt-1 flex flex-wrap gap-2 text-sm text-slate-500 dark:text-slate-400">
                          <span>{report.language}</span>
                          <span>{formatDate(report.createdAt)}</span>
                          <span>{findingCount} findings</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                          Score {report.analysis?.qualityScore || 0}
                        </span>
                        <SeverityBadge severity={severity} />
                      </div>
                    </Link>
                  </motion.div>
                )
              })
            ) : (
              <div className="px-5 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                No reports yet
              </div>
            )}
          </div>
        </section>

        <section className="surface-card p-5">
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Common issue types</h2>
          <div className="mt-5 space-y-3">
            {commonIssues.length ? (
              commonIssues.map((issue) => (
                <div key={issue.title} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-950/60">
                  <span className="min-w-0 truncate font-medium text-slate-700 dark:text-slate-200">{issue.title}</span>
                  <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800">
                    {issue.count}
                  </span>
                </div>
              ))
            ) : (
              <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-slate-200 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
                No issue trends yet
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

export default DashboardPage
