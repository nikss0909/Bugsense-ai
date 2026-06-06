import { motion } from 'framer-motion'
import {
  ArrowUpDown,
  Bug,
  Download,
  FileSearch,
  Gauge,
  Loader2,
  Search,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { api } from '../api/client.js'
import SeverityBadge from '../components/SeverityBadge.jsx'
import StatCard from '../components/StatCard.jsx'
import { formatBytes, formatDate, severityOrder } from '../utils/format.js'

function topSeverity(report) {
  return severityOrder.find((severity) => report.analysis?.severityCounts?.[severity] > 0) || 'low'
}

function issueCount(report) {
  return report.analysis?.issues?.length || report.analysis?.findings?.length || 0
}

function ReportsPage() {
  const [reports, setReports] = useState([])
  const [query, setQuery] = useState('')
  const [severity, setSeverity] = useState('all')
  const [sortBy, setSortBy] = useState('date')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false
    api
      .get('/reports')
      .then(({ data }) => {
        if (!ignore) {
          setReports(data)
        }
      })
      .catch((caught) => {
        if (!ignore) {
          setError(caught.message || 'Unable to load reports.')
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

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    const result = reports.filter((report) => {
      const matchesQuery =
        !normalized ||
        report.fileName.toLowerCase().includes(normalized) ||
        report.language.toLowerCase().includes(normalized) ||
        report.analysis?.summary?.toLowerCase().includes(normalized)
      const matchesSeverity = severity === 'all' || topSeverity(report) === severity
      return matchesQuery && matchesSeverity
    })

    return [...result].sort((left, right) => {
      if (sortBy === 'score') {
        return (right.analysis?.qualityScore || 0) - (left.analysis?.qualityScore || 0)
      }
      if (sortBy === 'issues') {
        return issueCount(right) - issueCount(left)
      }
      return new Date(right.createdAt || 0) - new Date(left.createdAt || 0)
    })
  }, [query, reports, severity, sortBy])

  const reportMetrics = useMemo(() => {
    const totalFindings = reports.reduce((total, report) => total + issueCount(report), 0)
    const priorityReports = reports.filter((report) => ['critical', 'high'].includes(topSeverity(report))).length
    const scoreTotal = reports.reduce((total, report) => total + (report.analysis?.qualityScore || 0), 0)
    const securityTotal = reports.reduce((total, report) => total + (report.analysis?.securityScore || report.analysis?.qualityScore || 0), 0)
    const averageScore = reports.length ? Math.round((scoreTotal / reports.length) * 10) / 10 : 0
    const averageSecurity = reports.length ? Math.round((securityTotal / reports.length) * 10) / 10 : 0
    return { totalFindings, priorityReports, averageScore, averageSecurity }
  }, [reports])

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase text-cyan-700 dark:text-cyan-300">Reports</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950 dark:text-white">Analysis reports</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            Search scan history, compare health scores, and open detailed remediation reports.
          </p>
        </div>
        <Link to="/app/upload" className="primary-action">
          <FileSearch className="h-4 w-4" />
          New analysis
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={FileSearch} label="Analyzed assets" value={reports.length} detail="Files and repositories" tone="cyan" />
        <StatCard icon={Bug} label="Total issues" value={reportMetrics.totalFindings} detail="All report findings" tone="rose" />
        <StatCard icon={Gauge} label="Average quality" value={reportMetrics.averageScore} detail="Across reports" progress={reportMetrics.averageScore} tone="indigo" />
        <StatCard icon={ShieldCheck} label="Security score" value={reportMetrics.averageSecurity} detail="Across reports" progress={reportMetrics.averageSecurity} tone="teal" />
      </div>

      <section className="surface-card p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_220px_220px_170px]">
          <label className="field-shell">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              className="w-full border-0 bg-transparent text-sm outline-none dark:text-white"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search reports"
            />
          </label>
          <select
            className="focus-ring rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            value={severity}
            onChange={(event) => setSeverity(event.target.value)}
          >
            <option value="all">All severities</option>
            {severityOrder.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select
            className="focus-ring rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
          >
            <option value="date">Newest first</option>
            <option value="score">Best score</option>
            <option value="issues">Most issues</option>
          </select>
          <div className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-300">
            <ShieldAlert className="h-4 w-4 text-rose-600" />
            {reportMetrics.priorityReports} priority
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/70 dark:bg-red-950/50 dark:text-red-200">
          {error}
        </div>
      ) : null}

      <section className="surface-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Report inventory</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{filtered.length} matching reports</p>
          </div>
          <ArrowUpDown className="h-4 w-4 text-slate-400" />
        </div>

        {loading ? (
          <div className="flex h-56 items-center justify-center">
            <div className="text-center">
              <Loader2 className="mx-auto h-7 w-7 animate-spin text-cyan-600 dark:text-cyan-300" />
              <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Loading reports</p>
            </div>
          </div>
        ) : filtered.length ? (
          <div className="overflow-x-auto">
            <table className="data-table min-w-[920px]">
              <thead>
                <tr>
                  <th>Report</th>
                  <th>Severity</th>
                  <th>Quality</th>
                  <th>Security</th>
                  <th>Issues</th>
                  <th>Size</th>
                  <th>Created</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filtered.map((report) => (
                  <motion.tr key={report.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <td>
                      <Link to={`/app/reports/${report.id}`} className="block">
                        <p className="max-w-sm truncate font-semibold text-slate-950 dark:text-white">{report.fileName}</p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{report.language}</p>
                      </Link>
                    </td>
                    <td>
                      <SeverityBadge severity={topSeverity(report)} />
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="w-9 font-semibold text-slate-950 dark:text-white">{report.analysis?.qualityScore || 0}</span>
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div className="h-full rounded-full bg-cyan-500" style={{ width: `${Math.min(100, report.analysis?.qualityScore || 0)}%` }} />
                        </div>
                      </div>
                    </td>
                    <td>{report.analysis?.securityScore ?? report.analysis?.qualityScore ?? 0}</td>
                    <td>{issueCount(report)}</td>
                    <td>{formatBytes(report.fileSize)}</td>
                    <td>{formatDate(report.createdAt)}</td>
                    <td>
                      <Link
                        to={`/app/reports/${report.id}`}
                        className="focus-ring inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
                        aria-label="Open report"
                      >
                        <Download className="h-4 w-4" />
                      </Link>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-5 py-16 text-center">
            <FileSearch className="mx-auto h-10 w-10 text-slate-400" />
            <p className="mt-4 font-semibold text-slate-950 dark:text-white">No reports found</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Analyze a file or repository to create the first report.</p>
          </div>
        )}
      </section>
    </div>
  )
}

export default ReportsPage
