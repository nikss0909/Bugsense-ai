import { motion } from 'framer-motion'
import {
  Activity,
  Bug,
  FileCheck2,
  FileCode2,
  Gauge,
  Layers3,
  Lightbulb,
  Search,
  ShieldAlert,
  Sparkles,
  TestTube2,
  UploadCloud,
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

function issueCount(report) {
  return report.analysis?.analysisSummary?.totalIssues || report.analysis?.issues?.length || report.analysis?.findings?.length || 0
}

function topEntry(source = {}, fallback = 'Not enough data') {
  const [name, value] = Object.entries(source).sort((left, right) => right[1] - left[1])[0] || []
  return { name: name || fallback, value: value || 0 }
}

function trendCopy(data) {
  if (data.length < 2) return { label: 'Baseline', direction: 'up' }
  const previous = data[data.length - 2].quality || 0
  const current = data[data.length - 1].quality || 0
  const delta = Math.round(current - previous)
  if (delta === 0) return { label: 'Stable', direction: 'up' }
  return { label: `${delta > 0 ? '+' : ''}${delta} pts`, direction: delta >= 0 ? 'up' : 'down' }
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
  const trendData = useMemo(
    () =>
      [...recentReports].reverse().map((report) => ({
        name: shortDate(report.createdAt),
        quality: report.analysis?.qualityScore || stats.averageQualityScore || 0,
        security: report.analysis?.securityScore || report.analysis?.qualityScore || 0,
        issues: issueCount(report),
      })),
    [recentReports, stats.averageQualityScore],
  )

  const severityData = useMemo(
    () =>
      severityOrder.map((severity) => ({
        severity,
        count: stats.severityTotals?.[severity] || 0,
        fill: severityColors[severity],
      })),
    [stats.severityTotals],
  )

  const filesAnalyzed = useMemo(
    () =>
      recentReports.reduce((total, report) => {
        const repoFiles = report.analysis?.repositoryStats?.analyzedFiles
        return total + (repoFiles || 1)
      }, 0) || stats.totalScans || stats.totalReports || 0,
    [recentReports, stats.totalReports, stats.totalScans],
  )

  const testCasesGenerated = useMemo(
    () => recentReports.reduce((total, report) => total + (report.analysis?.testSuggestions?.length || 0), 0),
    [recentReports],
  )

  const totalFixesSuggested = useMemo(
    () => recentReports.reduce((total, report) => total + (report.analysis?.fixRecommendations?.length || 0), 0),
    [recentReports],
  )

  const commonBug = useMemo(() => topEntry(stats.mostCommonIssueTypes, 'No issue category yet'), [stats.mostCommonIssueTypes])
  const commonLanguage = useMemo(() => topEntry(stats.languageUsage, 'No language yet'), [stats.languageUsage])
  const scoreTrend = trendCopy(trendData)
  const criticalBugs = stats.severityTotals?.critical || 0

  if (loading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase text-indigo-200">Dashboard</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal text-white">Code quality command center</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Monitor analysis history, severity movement, quality score trends, and remediation coverage from one workspace.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link to="/app/reports" className="secondary-action">
            <FileCheck2 className="h-4 w-4" />
            View history
          </Link>
          <Link to="/app/upload" className="primary-action">
            <UploadCloud className="h-4 w-4" />
            New analysis
          </Link>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-violet-400/35 bg-violet-950/50 px-4 py-3 text-sm font-medium text-violet-100">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={FileCode2} label="Files Analyzed" value={filesAnalyzed} detail="Files and repository assets" tone="blue" trend="+12%" />
        <StatCard icon={Bug} label="Critical Bugs Found" value={criticalBugs} detail="Highest-priority queue" tone="violet" trend={criticalBugs ? 'Needs review' : 'Clear'} trendDirection={criticalBugs ? 'up' : 'down'} />
        <StatCard icon={Gauge} label="Average Quality Score" value={Math.round(stats.averageQualityScore || 0)} detail="Across saved reports" tone="indigo" progress={stats.averageQualityScore || 0} trend={scoreTrend.label} trendDirection={scoreTrend.direction} />
        <StatCard icon={TestTube2} label="Test Cases Generated" value={testCasesGenerated} detail="From recent reports" tone="slate" trend={`${totalFixesSuggested} fixes`} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <section className="surface-card p-5">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-semibold text-white">Quality trend chart</h2>
              <p className="mt-1 text-sm text-slate-400">Score history from recent analyses.</p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-md border border-indigo-400/30 bg-indigo-500/10 px-2 py-1 text-xs font-semibold text-indigo-100">
              <Activity className="h-3.5 w-3.5" />
              Live history
            </span>
          </div>
          <div className="mt-6 h-72">
            {trendData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="qualityGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#7C3AED" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#4F46E5" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1F2937" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} stroke="#94A3B8" />
                  <YAxis domain={[0, 100]} tickLine={false} axisLine={false} stroke="#94A3B8" />
                  <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1F2937', color: '#F8FAFC' }} />
                  <Area type="monotone" dataKey="quality" stroke="#7C3AED" fill="url(#qualityGradient)" strokeWidth={2} />
                  <Area type="monotone" dataKey="security" stroke="#60A5FA" fill="transparent" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-indigo-400/25 bg-[#0F172A]/60 text-sm text-slate-400">
                No trend data yet
              </div>
            )}
          </div>
        </section>

        <section className="surface-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Dashboard insights</h2>
              <p className="mt-1 text-sm text-slate-400">Signals derived from saved scans.</p>
            </div>
            <Sparkles className="h-5 w-5 text-violet-200" />
          </div>
          <div className="mt-6 space-y-3">
            {[
              [Lightbulb, 'Most common bug category', commonBug.name, `${commonBug.value} matches`],
              [Layers3, 'Most analyzed language', commonLanguage.name, `${commonLanguage.value} scans`],
              [ShieldAlert, 'Total fixes suggested', totalFixesSuggested, 'Recent report recommendations'],
            ].map(([Icon, label, value, detail]) => (
              <div key={label} className="rounded-lg border border-[#1F2937] bg-[#0F172A]/65 p-4 transition hover:border-indigo-500/50">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/12 text-indigo-100 ring-1 ring-indigo-400/25">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
                    <p className="mt-1 truncate text-lg font-semibold text-white">{value}</p>
                    <p className="mt-1 text-sm text-slate-400">{detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="surface-card p-5">
          <h2 className="text-lg font-semibold text-white">Severity distribution</h2>
          <p className="mt-1 text-sm text-slate-400">Findings grouped by report severity.</p>
          <div className="mt-5 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severityData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1F2937" />
                <XAxis dataKey="severity" tickLine={false} axisLine={false} stroke="#94A3B8" />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} stroke="#94A3B8" />
                <Tooltip cursor={{ fill: 'rgba(79, 70, 229, 0.1)' }} contentStyle={{ background: '#111827', border: '1px solid #1F2937', color: '#F8FAFC' }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {severityData.map((entry) => (
                    <Cell key={entry.severity} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="surface-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#1F2937] px-5 py-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Recent analysis history</h2>
              <p className="mt-1 text-sm text-slate-400">Latest saved reports.</p>
            </div>
            <Link className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-100 hover:text-white" to="/app/reports">
              <Search className="h-4 w-4" />
              Search
            </Link>
          </div>
          <div className="divide-y divide-[#1F2937]">
            {recentReports.length ? (
              recentReports.map((report) => {
                const severity = severityOrder.find((item) => report.analysis?.severityCounts?.[item] > 0) || 'low'
                return (
                  <motion.div key={report.id} whileHover={{ x: 3 }}>
                    <Link
                      to={`/app/reports/${report.id}`}
                      className="flex flex-col gap-3 px-5 py-4 transition hover:bg-indigo-500/8 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-white">{report.fileName}</p>
                        <div className="mt-1 flex flex-wrap gap-2 text-sm text-slate-400">
                          <span>{report.language}</span>
                          <span>{formatDate(report.createdAt)}</span>
                          <span>{issueCount(report)} findings</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-slate-300">
                          Score {report.analysis?.qualityScore || 0}
                        </span>
                        <SeverityBadge severity={severity} />
                      </div>
                    </Link>
                  </motion.div>
                )
              })
            ) : (
              <div className="px-5 py-12 text-center">
                <FileCode2 className="mx-auto h-10 w-10 text-indigo-200" />
                <p className="mt-4 font-semibold text-white">No reports yet</p>
                <p className="mt-2 text-sm text-slate-400">Run your first analysis to populate trends and insights.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

export default DashboardPage
