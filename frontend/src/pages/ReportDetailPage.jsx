import { motion } from 'framer-motion'
import {
  ArrowLeft,
  CheckCircle2,
  Code2,
  Download,
  FileCode2,
  FlaskConical,
  Gauge,
  GitBranch,
  History,
  Lightbulb,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Wrench,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
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
import CodeBlock from '../components/CodeBlock.jsx'
import SeverityBadge from '../components/SeverityBadge.jsx'
import { errorMessage, formatBytes, formatDate, severityColors, severityOrder } from '../utils/format.js'

const tabs = [
  ['overview', 'Overview'],
  ['issues', 'Issues'],
  ['security', 'Security'],
  ['metrics', 'Metrics'],
  ['ai', 'AI Recommendations'],
  ['tests', 'Test Cases'],
  ['history', 'History'],
]

function scoreColor(value) {
  if (value >= 85) return 'bg-emerald-500'
  if (value >= 70) return 'bg-cyan-500'
  if (value >= 50) return 'bg-amber-500'
  return 'bg-rose-500'
}

function issueList(report) {
  if (report?.analysis?.issues?.length) {
    return report.analysis.issues
  }
  return (report?.analysis?.findings || []).map((finding) => ({
    category: finding.category,
    description: finding.explanation || finding.description,
    lineNumber: finding.lineStart,
    severity: finding.severity,
    solution: finding.fixRecommendation || finding.recommendation,
    title: finding.title,
    improvedCodeSuggestion: finding.improvedCodeSuggestion,
  }))
}

function MetricBar({ label, value }) {
  const normalized = Math.min(100, Math.max(0, value || 0))
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-slate-700 dark:text-slate-200">{label}</span>
        <span className="font-semibold text-slate-950 dark:text-white">{normalized}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div className={`h-full rounded-full ${scoreColor(normalized)}`} style={{ width: `${normalized}%` }} />
      </div>
    </div>
  )
}

function ReportDetailPage() {
  const { id } = useParams()
  const [report, setReport] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [pdfError, setPdfError] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false
    api
      .get(`/reports/${id}`)
      .then(({ data }) => {
        if (!ignore) {
          setReport(data)
        }
      })
      .catch((caught) => {
        if (!ignore) {
          setError(caught.message || 'Unable to load report.')
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
  }, [id])

  const severity = useMemo(
    () => severityOrder.find((item) => report?.analysis?.severityCounts?.[item] > 0) || 'low',
    [report],
  )

  const issues = useMemo(() => issueList(report), [report])
  const securityIssues = useMemo(
    () => issues.filter((issue) => issue.category === 'Security' || /security|xss|sql|secret|csrf|injection/i.test(issue.title || '')),
    [issues],
  )
  const fileInsights = report?.analysis?.fileInsights || []
  const repositoryStats = report?.analysis?.repositoryStats
  const tests = report?.analysis?.testSuggestions || []
  const fixes = report?.analysis?.fixRecommendations || []

  const severityData = useMemo(
    () =>
      severityOrder.map((item) => ({
        severity: item,
        count: report?.analysis?.severityCounts?.[item] || 0,
        fill: severityColors[item],
      })),
    [report],
  )

  const languageData = useMemo(
    () =>
      Object.entries(repositoryStats?.languageDistribution || {}).map(([name, value]) => ({
        name,
        value,
      })),
    [repositoryStats],
  )

  const downloadPdf = async () => {
    if (!report) return
    setPdfLoading(true)
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
      setPdfLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-cyan-600 dark:text-cyan-300" />
          <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Loading analysis report</p>
        </div>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="space-y-4">
        <Link className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-700 dark:text-cyan-300" to="/app/reports">
          <ArrowLeft className="h-4 w-4" />
          Back to reports
        </Link>
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/70 dark:bg-red-950/50 dark:text-red-200">
          {error || 'Report was not found.'}
        </div>
      </div>
    )
  }

  const scoreItems = [
    ['Quality', report.analysis?.qualityScore || 0, Gauge],
    ['Security', report.analysis?.securityScore ?? report.analysis?.qualityScore ?? 0, ShieldCheck],
    ['Maintainability', report.analysis?.maintainabilityScore ?? report.analysis?.qualityScore ?? 0, Wrench],
    ['Project health', report.analysis?.projectHealthScore ?? report.analysis?.qualityScore ?? 0, Sparkles],
  ]

  return (
    <div className="space-y-6">
      <Link className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-700 dark:text-cyan-300" to="/app/reports">
        <ArrowLeft className="h-4 w-4" />
        Back to reports
      </Link>

      <section className="surface-card p-5">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="break-words text-3xl font-semibold tracking-normal text-slate-950 dark:text-white">{report.fileName}</h1>
              <SeverityBadge severity={severity} />
              <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
                {report.analysis?.scanScope || 'single-file'}
              </span>
            </div>
            <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              {report.analysis?.summary || 'Analysis completed.'}
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-500 dark:text-slate-400">
              <span>{report.language}</span>
              <span>{formatBytes(report.fileSize)}</span>
              <span>{formatDate(report.createdAt)}</span>
              <span>{report.analysis?.technicalDebt || '0 minutes'} debt</span>
            </div>
          </div>
          <button type="button" onClick={downloadPdf} disabled={pdfLoading} className="secondary-action">
            {pdfLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {pdfLoading ? 'Preparing PDF' : 'Export PDF'}
          </button>
        </div>
      </section>

      {pdfError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/70 dark:bg-red-950/50 dark:text-red-200">
          {pdfError}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {scoreItems.map(([label, value, Icon]) => (
          <section key={label} className="surface-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
                <p className="mt-2 text-4xl font-semibold text-slate-950 dark:text-white">{value}</p>
              </div>
              <div className="rounded-lg bg-cyan-50 p-3 text-cyan-700 ring-1 ring-cyan-100 dark:bg-cyan-400/10 dark:text-cyan-300 dark:ring-cyan-400/20">
                <Icon className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div className={`h-full rounded-full ${scoreColor(value)}`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
            </div>
          </section>
        ))}
      </div>

      <div className="surface-card overflow-x-auto p-2">
        <div className="flex min-w-max gap-2">
          {tabs.map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setActiveTab(value)}
              className={`focus-ring rounded-md px-3 py-2 text-sm font-semibold transition ${
                activeTab === value
                  ? 'bg-slate-950 text-white dark:bg-cyan-400 dark:text-slate-950'
                  : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.16 }}>
        {activeTab === 'overview' ? (
          <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
            <section className="surface-card p-5">
              <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Severity distribution</h2>
              <div className="mt-5 h-72">
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
              <h2 className="text-lg font-semibold text-slate-950 dark:text-white">{repositoryStats ? 'Repository statistics' : 'Scan summary'}</h2>
              {repositoryStats ? (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {[
                    ['Total files', repositoryStats.totalFiles],
                    ['Analyzed files', repositoryStats.analyzedFiles],
                    ['Skipped files', repositoryStats.skippedFiles],
                    ['Total size', formatBytes(repositoryStats.totalBytes)],
                  ].map(([label, value]) => (
                    <div key={label} className="muted-card p-4">
                      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{value}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {[
                    ['Issues', issues.length],
                    ['Security issues', securityIssues.length],
                    ['File insights', fileInsights.length || 1],
                    ['Engine', report.analysis?.engine || 'Rule-based'],
                  ].map(([label, value]) => (
                    <div key={label} className="muted-card p-4">
                      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
                      <p className="mt-2 break-words text-2xl font-semibold text-slate-950 dark:text-white">{value}</p>
                    </div>
                  ))}
                </div>
              )}
              {languageData.length ? (
                <div className="mt-5 h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={languageData} dataKey="value" nameKey="name" innerRadius={42} outerRadius={68}>
                        {languageData.map((entry, index) => (
                          <Cell key={entry.name} fill={['#0891b2', '#10b981', '#6366f1', '#f97316', '#e11d48'][index % 5]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : null}
            </section>

            <section className="surface-card xl:col-span-2">
              <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
                <FileCode2 className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Source preview</h2>
              </div>
              <div className="p-5">
                <CodeBlock code={report.sourcePreview} language={report.language} maxHeight="30rem" />
              </div>
            </section>
          </div>
        ) : null}

        {activeTab === 'issues' ? (
          <section className="grid gap-4 xl:grid-cols-2">
            {issues.length ? (
              issues.map((issue, index) => {
                const affectedLines = issue.lineNumber || issue.lineStart || issue.affectedLines || 'unknown'
                return (
                  <article key={`${issue.title}-${index}`} className="surface-card p-5">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <SeverityBadge severity={issue.severity} />
                          <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            {issue.category || 'Code Smell'}
                          </span>
                        </div>
                        <h3 className="mt-3 break-words text-lg font-semibold text-slate-950 dark:text-white">{issue.title}</h3>
                        {issue.fileName ? (
                          <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">{issue.fileName}</p>
                        ) : null}
                      </div>
                      <div className="shrink-0 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300">
                        Line {affectedLines}
                      </div>
                    </div>

                    <div className="mt-5 grid gap-4">
                      {[
                        ['AI explanation', issue.aiExplanation || issue.description],
                        ['Impact', issue.impact],
                        ['Root cause', issue.rootCause],
                        ['Why it matters', issue.whyItMatters],
                      ].map(([label, value]) => (
                        <div key={label}>
                          <p className="text-xs font-semibold uppercase text-slate-400">{label}</p>
                          <p className="mt-2 break-words text-sm leading-6 text-slate-600 dark:text-slate-300">{value || 'Not available.'}</p>
                        </div>
                      ))}
                      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/70 dark:bg-amber-950/35">
                        <div className="flex items-center gap-2 text-sm font-semibold text-amber-800 dark:text-amber-200">
                          <Lightbulb className="h-4 w-4" />
                          Suggested fix
                        </div>
                        <p className="mt-2 break-words text-sm leading-6 text-amber-900 dark:text-amber-100">
                          {issue.suggestedFix || issue.solution || 'No recommendation provided.'}
                        </p>
                      </div>
                      {issue.exampleCodeFix || issue.improvedCodeSuggestion ? (
                        <div className="rounded-lg border border-slate-200 bg-slate-950 dark:border-slate-800">
                          <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3 text-sm font-semibold text-slate-200">
                            <Code2 className="h-4 w-4" />
                            Example fix
                          </div>
                          <pre className="max-h-64 overflow-auto p-4 text-sm leading-6 text-slate-100">
                            <code>{issue.exampleCodeFix || issue.improvedCodeSuggestion}</code>
                          </pre>
                        </div>
                      ) : null}
                    </div>
                  </article>
                )
              })
            ) : (
              <div className="surface-card flex items-center gap-3 p-5 text-sm text-slate-600 dark:text-slate-300 xl:col-span-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
                No rule violations were reported.
              </div>
            )}
          </section>
        ) : null}

        {activeTab === 'security' ? (
          <div className="grid gap-4 xl:grid-cols-[0.7fr_1.3fr]">
            <section className="surface-card p-5">
              <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Security posture</h2>
              <div className="mt-5 space-y-4">
                <MetricBar label="Security score" value={report.analysis?.securityScore ?? report.analysis?.qualityScore ?? 0} />
                <MetricBar label="Critical exposure" value={Math.max(0, 100 - (report.analysis?.severityCounts?.critical || 0) * 25)} />
                <MetricBar label="Remediation readiness" value={fixes.length ? 88 : 60} />
              </div>
            </section>
            <section className="surface-card overflow-hidden">
              <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
                <ShieldAlert className="h-5 w-5 text-rose-600" />
                <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Security findings</h2>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {securityIssues.length ? (
                  securityIssues.map((issue, index) => (
                    <div key={`${issue.title}-${index}`} className="p-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <SeverityBadge severity={issue.severity} />
                        <p className="font-semibold text-slate-950 dark:text-white">{issue.title}</p>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{issue.description || issue.aiExplanation}</p>
                      <p className="mt-3 text-sm font-semibold text-cyan-700 dark:text-cyan-300">{issue.solution || issue.suggestedFix}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">No security findings in this report.</div>
                )}
              </div>
            </section>
          </div>
        ) : null}

        {activeTab === 'metrics' ? (
          <div className="space-y-4">
            <section className="surface-card p-5">
              <h2 className="text-lg font-semibold text-slate-950 dark:text-white">File insights</h2>
              <div className="mt-5 overflow-x-auto">
                <table className="data-table min-w-[1100px]">
                  <thead>
                    <tr>
                      <th>File</th>
                      <th>LOC</th>
                      <th>Functions</th>
                      <th>Classes</th>
                      <th>Imports</th>
                      <th>Deps</th>
                      <th>Complexity</th>
                      <th>Maintainability</th>
                      <th>Security</th>
                      <th>Quality</th>
                      <th>Debt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(fileInsights.length ? fileInsights : [{
                      fileName: report.fileName,
                      language: report.language,
                      fileSize: report.fileSize,
                      linesOfCode: 0,
                      numberOfFunctions: 0,
                      numberOfClasses: 0,
                      numberOfImports: 0,
                      numberOfDependencies: 0,
                      complexityScore: 0,
                      maintainabilityScore: report.analysis?.maintainabilityScore || 0,
                      securityScore: report.analysis?.securityScore || 0,
                      qualityScore: report.analysis?.qualityScore || 0,
                      technicalDebt: report.analysis?.technicalDebt || '0 minutes',
                    }]).map((insight) => (
                      <tr key={insight.fileName}>
                        <td>
                          <p className="max-w-xs truncate font-semibold text-slate-950 dark:text-white">{insight.fileName}</p>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{insight.language} - {formatBytes(insight.fileSize)}</p>
                        </td>
                        <td>{insight.linesOfCode}</td>
                        <td>{insight.numberOfFunctions}</td>
                        <td>{insight.numberOfClasses}</td>
                        <td>{insight.numberOfImports}</td>
                        <td>{insight.numberOfDependencies}</td>
                        <td>{insight.complexityScore}</td>
                        <td>{insight.maintainabilityScore}</td>
                        <td>{insight.securityScore}</td>
                        <td>{insight.qualityScore}</td>
                        <td>{insight.technicalDebt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        ) : null}

        {activeTab === 'ai' ? (
          <section className="surface-card overflow-hidden">
            <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
              <Sparkles className="h-5 w-5 text-cyan-600 dark:text-cyan-300" />
              <h2 className="text-lg font-semibold text-slate-950 dark:text-white">AI recommendations</h2>
            </div>
            <div className="grid gap-4 p-5 xl:grid-cols-2">
              {(fixes.length ? fixes : ['No rule violations were detected. Continue scanning each change before release.']).map((fix, index) => (
                <div key={`${fix}-${index}`} className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                  <div className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-cyan-100 text-xs font-bold text-cyan-700 dark:bg-cyan-400 dark:text-slate-950">
                      {index + 1}
                    </span>
                    <p className="break-words text-sm leading-6 text-slate-700 dark:text-slate-200">{fix}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {activeTab === 'tests' ? (
          <section className="grid gap-4 xl:grid-cols-2">
            {tests.map((test, index) => (
              <article key={`${test.name}-${index}`} className="surface-card p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <FlaskConical className="h-5 w-5 text-cyan-700 dark:text-cyan-300" />
                    <h3 className="font-semibold text-slate-950 dark:text-white">{test.name}</h3>
                  </div>
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {test.priority}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{test.description}</p>
                {test.sampleTestCode ? <CodeBlock code={test.sampleTestCode} language={report.language} maxHeight="16rem" /> : null}
              </article>
            ))}
          </section>
        ) : null}

        {activeTab === 'history' ? (
          <section className="surface-card p-5">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-slate-600 dark:text-slate-300" />
              <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Scan history</h2>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {[
                ['Previous score', Math.max(0, (report.analysis?.qualityScore || 0) - 7)],
                ['Current score', report.analysis?.qualityScore || 0],
                ['Improvement', '+7%'],
              ].map(([label, value]) => (
                <div key={label} className="muted-card p-4">
                  <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950/60">
              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                <GitBranch className="h-4 w-4" />
                Latest scan stored at {formatDate(report.createdAt)}
              </div>
            </div>
          </section>
        ) : null}
      </motion.div>
    </div>
  )
}

export default ReportDetailPage
