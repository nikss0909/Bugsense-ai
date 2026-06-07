import { motion } from 'framer-motion'
import {
  ArrowUpDown,
  Bug,
  Download,
  Eye,
  FileSearch,
  Filter,
  Gauge,
  Loader2,
  Search,
  ShieldAlert,
  Sparkles,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { api } from '../api/client.js'
import SeverityBadge from '../components/SeverityBadge.jsx'
import StatCard from '../components/StatCard.jsx'
import { errorMessage, formatBytes, formatDate, severityOrder } from '../utils/format.js'

function topSeverity(report) {
  return severityOrder.find((severity) => report.analysis?.severityCounts?.[severity] > 0) || 'low'
}

function issueCount(report) {
  return report.analysis?.analysisSummary?.totalIssues || report.analysis?.issues?.length || report.analysis?.findings?.length || 0
}

function ReportsSkeleton() {
  return (
    <div className="surface-card overflow-hidden">
      {[1, 2, 3, 4, 5].map((item) => (
        <div key={item} className="grid gap-4 border-b border-[#1F2937] p-5 md:grid-cols-[1.4fr_0.5fr_0.5fr_0.5fr]">
          <div>
            <div className="skeleton h-4 w-64" />
            <div className="skeleton mt-3 h-3 w-40" />
          </div>
          <div className="skeleton h-8 w-24" />
          <div className="skeleton h-8 w-16" />
          <div className="skeleton h-8 w-20" />
        </div>
      ))}
    </div>
  )
}

function ReportsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [reports, setReports] = useState([])
  const [query, setQuery] = useState(() => searchParams.get('q') || '')
  const [severity, setSeverity] = useState('all')
  const [sortBy, setSortBy] = useState('date')
  const [loading, setLoading] = useState(true)
  const [pdfLoadingId, setPdfLoadingId] = useState('')
  const [error, setError] = useState('')
  const [pdfError, setPdfError] = useState('')

  useEffect(() => {
    setQuery(searchParams.get('q') || '')
  }, [searchParams])

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

  const updateQuery = (value) => {
    setQuery(value)
    const trimmed = value.trim()
    if (trimmed) {
      setSearchParams({ q: trimmed })
    } else {
      setSearchParams({})
    }
  }

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    const result = reports.filter((report) => {
      const matchesQuery =
        !normalized ||
        report.fileName?.toLowerCase().includes(normalized) ||
        report.language?.toLowerCase().includes(normalized) ||
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
    const fixes = reports.reduce((total, report) => total + (report.analysis?.fixRecommendations?.length || 0), 0)
    const averageScore = reports.length ? Math.round((scoreTotal / reports.length) * 10) / 10 : 0
    return { totalFindings, priorityReports, averageScore, fixes }
  }, [reports])

  const downloadPdf = async (report, event) => {
    event.preventDefault()
    event.stopPropagation()
    setPdfLoadingId(report.id)
    setPdfError('')
    try {
      const response = await api.get(`/reports/${report.id}/pdf`, { responseType: 'blob' })
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${report.fileName.replace(/\.[^.]+$/, '') || 'bugsense-report'}-static-analysis.pdf`
      link.click()
      URL.revokeObjectURL(url)
    } catch (caught) {
      setPdfError(errorMessage(caught))
    } finally {
      setPdfLoadingId('')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase text-indigo-200">Analysis history</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal text-white">Reports and exports</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Search previous reports, filter by severity, compare score movement, and export PDFs for review.
          </p>
        </div>
        <Link to="/app/upload" className="primary-action">
          <FileSearch className="h-4 w-4" />
          New analysis
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={FileSearch} label="Previous Reports" value={reports.length} detail="Saved analysis history" tone="blue" />
        <StatCard icon={Bug} label="Bugs Found" value={reportMetrics.totalFindings} detail="All report findings" tone="violet" />
        <StatCard icon={Gauge} label="Average Quality" value={reportMetrics.averageScore} detail="Across reports" progress={reportMetrics.averageScore} tone="indigo" />
        <StatCard icon={Sparkles} label="Fixes Suggested" value={reportMetrics.fixes} detail="AI-ready recommendations" tone="slate" />
      </div>

      <section className="surface-card p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_210px_210px_170px]">
          <label className="field-shell">
            <Search className="h-4 w-4 text-slate-500" />
            <input
              className="w-full border-0 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
              value={query}
              onChange={(event) => updateQuery(event.target.value)}
              placeholder="Search reports instantly"
            />
          </label>
          <label className="relative">
            <Filter className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
            <select
              className="focus-ring w-full rounded-lg border border-[#1F2937] bg-[#0F172A] py-2.5 pl-9 pr-3 text-sm font-semibold text-slate-200"
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
          </label>
          <label className="relative">
            <ArrowUpDown className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
            <select
              className="focus-ring w-full rounded-lg border border-[#1F2937] bg-[#0F172A] py-2.5 pl-9 pr-3 text-sm font-semibold text-slate-200"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
            >
              <option value="date">Newest first</option>
              <option value="score">Best score</option>
              <option value="issues">Most issues</option>
            </select>
          </label>
          <div className="flex items-center justify-center gap-2 rounded-lg border border-indigo-400/25 bg-indigo-500/10 px-3 py-2.5 text-sm font-semibold text-indigo-100">
            <ShieldAlert className="h-4 w-4" />
            {reportMetrics.priorityReports} priority
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-lg border border-violet-400/35 bg-violet-950/50 px-4 py-3 text-sm font-medium text-violet-100">
          {error}
        </div>
      ) : null}

      {pdfError ? (
        <div className="rounded-lg border border-violet-400/35 bg-violet-950/50 px-4 py-3 text-sm font-medium text-violet-100">
          {pdfError}
        </div>
      ) : null}

      {loading ? (
        <ReportsSkeleton />
      ) : (
        <section className="surface-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#1F2937] px-5 py-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Report inventory</h2>
              <p className="mt-1 text-sm text-slate-400">{filtered.length} matching reports</p>
            </div>
            <ArrowUpDown className="h-4 w-4 text-slate-500" />
          </div>

          {filtered.length ? (
            <div className="overflow-x-auto">
              <table className="data-table min-w-[980px]">
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
                          <p className="max-w-sm truncate font-semibold text-white">{report.fileName}</p>
                          <p className="mt-1 text-xs text-slate-400">{report.language}</p>
                        </Link>
                      </td>
                      <td>
                        <SeverityBadge severity={topSeverity(report)} />
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className="w-9 font-semibold text-white">{report.analysis?.qualityScore || 0}</span>
                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-800">
                            <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" style={{ width: `${Math.min(100, report.analysis?.qualityScore || 0)}%` }} />
                          </div>
                        </div>
                      </td>
                      <td>{report.analysis?.securityScore ?? report.analysis?.qualityScore ?? 0}</td>
                      <td>{issueCount(report)}</td>
                      <td>{formatBytes(report.fileSize)}</td>
                      <td>{formatDate(report.createdAt)}</td>
                      <td>
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/app/reports/${report.id}`}
                            className="focus-ring inline-flex items-center justify-center rounded-lg border border-[#1F2937] p-2 text-slate-300 hover:bg-indigo-500/10 hover:text-white"
                            aria-label="Open report"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={(event) => downloadPdf(report, event)}
                            className="focus-ring inline-flex items-center justify-center rounded-lg border border-[#1F2937] p-2 text-slate-300 hover:bg-indigo-500/10 hover:text-white disabled:opacity-60"
                            aria-label="Download PDF"
                            disabled={pdfLoadingId === report.id}
                          >
                            {pdfLoadingId === report.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-5 py-16 text-center">
              <FileSearch className="mx-auto h-10 w-10 text-indigo-200" />
              <p className="mt-4 font-semibold text-white">No reports found</p>
              <p className="mt-2 text-sm text-slate-400">
                {reports.length ? 'Adjust search or filters to find a matching report.' : 'Analyze a file or repository to create the first report.'}
              </p>
              {!reports.length ? (
                <Link to="/app/upload" className="primary-action mt-5">
                  Start first analysis
                </Link>
              ) : null}
            </div>
          )}
        </section>
      )}
    </div>
  )
}

export default ReportsPage
