import { Bug, FileSearch, Gauge, Loader2, Search, ShieldAlert } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { api } from '../api/client.js'
import SeverityBadge from '../components/SeverityBadge.jsx'
import { formatBytes, formatDate, severityOrder } from '../utils/format.js'

function topSeverity(report) {
  return severityOrder.find((severity) => report.analysis?.severityCounts?.[severity] > 0) || 'low'
}

function ReportsPage() {
  const [reports, setReports] = useState([])
  const [query, setQuery] = useState('')
  const [severity, setSeverity] = useState('all')
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
    return reports.filter((report) => {
      const matchesQuery =
        !normalized ||
        report.fileName.toLowerCase().includes(normalized) ||
        report.language.toLowerCase().includes(normalized) ||
        report.analysis?.summary?.toLowerCase().includes(normalized)
      const matchesSeverity = severity === 'all' || topSeverity(report) === severity
      return matchesQuery && matchesSeverity
    })
  }, [query, reports, severity])

  const reportMetrics = useMemo(() => {
    const totalFindings = reports.reduce((total, report) => total + (report.analysis?.findings?.length || 0), 0)
    const priorityReports = reports.filter((report) => ['critical', 'high'].includes(topSeverity(report))).length
    const scoreTotal = reports.reduce((total, report) => total + (report.analysis?.qualityScore || 0), 0)
    const averageScore = reports.length ? Math.round((scoreTotal / reports.length) * 10) / 10 : 0
    return { totalFindings, priorityReports, averageScore }
  }, [reports])

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase text-teal-700">Reports</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">Reports dashboard</h1>
        </div>
        <Link
          to="/app/upload"
          className="focus-ring inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
        >
          <FileSearch className="h-4 w-4" />
          New analysis
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-500">Analyzed files</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">{reports.length}</p>
            </div>
            <div className="rounded-lg bg-teal-50 p-3 text-teal-700 ring-1 ring-teal-100">
              <FileSearch className="h-5 w-5" />
            </div>
          </div>
        </section>
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-500">AI findings</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">{reportMetrics.totalFindings}</p>
            </div>
            <div className="rounded-lg bg-rose-50 p-3 text-rose-700 ring-1 ring-rose-100">
              <Bug className="h-5 w-5" />
            </div>
          </div>
        </section>
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-500">Average quality</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">{reportMetrics.averageScore}</p>
            </div>
            <div className="rounded-lg bg-amber-50 p-3 text-amber-700 ring-1 ring-amber-100">
              <Gauge className="h-5 w-5" />
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1fr_220px_180px]">
          <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-100">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              className="w-full border-0 bg-transparent text-sm outline-none"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search reports"
            />
          </label>
          <select
            className="focus-ring rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700"
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
          <div className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-600">
            <ShieldAlert className="h-4 w-4 text-rose-600" />
            {reportMetrics.priorityReports} priority
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4">
        {loading ? (
          <div className="flex h-48 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="text-center">
              <Loader2 className="mx-auto h-7 w-7 animate-spin text-teal-600" />
              <p className="mt-3 text-sm font-semibold text-slate-700">Loading reports</p>
            </div>
          </div>
        ) : filtered.length ? (
          filtered.map((report) => (
            <Link
              key={report.id}
              to={`/app/reports/${report.id}`}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-lg font-semibold text-slate-950">{report.fileName}</h2>
                    <SeverityBadge severity={topSeverity(report)} />
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                    {report.analysis?.summary || 'Analysis completed.'}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {severityOrder.map((item) => (
                      <span
                        key={`${report.id}-${item}`}
                        className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold capitalize text-slate-600"
                      >
                        {item}: {report.analysis?.severityCounts?.[item] || 0}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm md:min-w-80">
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="font-semibold text-slate-950">{report.language}</p>
                    <p className="mt-1 text-xs text-slate-500">Language</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="font-semibold text-slate-950">{report.analysis?.qualityScore || 0}</p>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-teal-600"
                        style={{ width: `${Math.min(100, Math.max(0, report.analysis?.qualityScore || 0))}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">Score</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="font-semibold text-slate-950">{formatBytes(report.fileSize)}</p>
                    <p className="mt-1 text-xs text-slate-500">Size</p>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-xs font-medium text-slate-400">{formatDate(report.createdAt)}</p>
            </Link>
          ))
        ) : (
          <section className="rounded-lg border border-dashed border-slate-300 bg-white px-5 py-14 text-center">
            <FileSearch className="mx-auto h-10 w-10 text-slate-400" />
            <p className="mt-4 font-semibold text-slate-950">No reports found</p>
            <p className="mt-2 text-sm text-slate-500">Analyze a source file to create the first report.</p>
          </section>
        )}
      </div>
    </div>
  )
}

export default ReportsPage
