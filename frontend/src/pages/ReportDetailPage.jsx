import { motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Code2,
  Download,
  FileCode2,
  FlaskConical,
  Gauge,
  GitBranch,
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
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { api } from '../api/client.js'
import CodeBlock from '../components/CodeBlock.jsx'
import SeverityBadge from '../components/SeverityBadge.jsx'
import { errorMessage, formatBytes, formatDate, severityColors, severityOrder } from '../utils/format.js'

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

function scoreValue(value) {
  return Math.min(100, Math.max(0, value || 0))
}

function ReportMetric({ icon: Icon, label, value, detail }) {
  const normalized = typeof value === 'number' ? scoreValue(value) : null
  return (
    <section className="surface-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-400">{label}</p>
          <p className="mt-2 truncate text-3xl font-semibold text-white">{value}</p>
          {detail ? <p className="mt-2 text-sm text-slate-400">{detail}</p> : null}
        </div>
        <div className="rounded-lg bg-indigo-500/12 p-3 text-indigo-100 ring-1 ring-indigo-400/25">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {normalized !== null ? (
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
          <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" style={{ width: `${normalized}%` }} />
        </div>
      ) : null}
    </section>
  )
}

function EmptyState({ icon: Icon = CheckCircle2, title, copy }) {
  return (
    <div className="rounded-lg border border-dashed border-indigo-400/25 bg-[#0F172A]/60 px-5 py-10 text-center">
      <Icon className="mx-auto h-9 w-9 text-indigo-200" />
      <p className="mt-4 font-semibold text-white">{title}</p>
      <p className="mt-2 text-sm text-slate-400">{copy}</p>
    </div>
  )
}

function ReportDetailPage() {
  const { id } = useParams()
  const [report, setReport] = useState(null)
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
      <div className="space-y-6">
        <div className="skeleton h-6 w-32" />
        <div className="surface-card p-5">
          <div className="skeleton h-8 w-80" />
          <div className="skeleton mt-4 h-4 w-full max-w-3xl" />
          <div className="skeleton mt-3 h-4 w-2/3" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="surface-card p-5">
              <div className="skeleton h-4 w-24" />
              <div className="skeleton mt-4 h-8 w-16" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="space-y-4">
        <Link className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-100 hover:text-white" to="/app/reports">
          <ArrowLeft className="h-4 w-4" />
          Back to reports
        </Link>
        <div className="rounded-lg border border-violet-400/35 bg-violet-950/50 px-4 py-3 text-sm font-medium text-violet-100">
          {error || 'Report was not found.'}
        </div>
      </div>
    )
  }

  const scoreItems = [
    ['Quality', report.analysis?.qualityScore || 0, Gauge, 'Overall code quality'],
    ['Security', report.analysis?.securityScore ?? report.analysis?.qualityScore ?? 0, ShieldCheck, `${securityIssues.length} security findings`],
    ['Maintainability', report.analysis?.maintainabilityScore ?? report.analysis?.qualityScore ?? 0, Wrench, report.analysis?.technicalDebt || '0 minutes debt'],
    ['Findings', issues.length, ShieldAlert, `${fixes.length} suggested fixes`],
  ]

  return (
    <div className="space-y-6">
      <Link className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-100 hover:text-white" to="/app/reports">
        <ArrowLeft className="h-4 w-4" />
        Back to reports
      </Link>

      <section className="surface-card overflow-hidden">
        <div className="border-b border-[#1F2937] bg-gradient-to-r from-indigo-600/16 to-violet-600/10 p-5">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="break-words text-3xl font-semibold tracking-normal text-white">{report.fileName}</h1>
                <SeverityBadge severity={severity} />
                <span className="rounded-md border border-[#1F2937] bg-[#0F172A]/70 px-2 py-1 text-xs font-semibold uppercase text-slate-300">
                  {report.analysis?.scanScope || 'single-file'}
                </span>
              </div>
              <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-300">
                {report.analysis?.summary || 'Analysis completed.'}
              </p>
              <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-400">
                <span>{report.language}</span>
                <span>{formatBytes(report.fileSize)}</span>
                <span>{formatDate(report.createdAt)}</span>
                <span>{report.analysis?.engine || 'Rule-based static analysis'}</span>
              </div>
            </div>
            <button type="button" onClick={downloadPdf} disabled={pdfLoading} className="primary-action">
              {pdfLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              {pdfLoading ? 'Preparing PDF' : 'Export PDF'}
            </button>
          </div>
        </div>

        {repositoryStats ? (
          <div className="grid gap-0 border-b border-[#1F2937] md:grid-cols-4">
            {[
              ['Total files', repositoryStats.totalFiles],
              ['Analyzed files', repositoryStats.analyzedFiles],
              ['Skipped files', repositoryStats.skippedFiles],
              ['Repository size', formatBytes(repositoryStats.totalBytes)],
            ].map(([label, value]) => (
              <div key={label} className="border-[#1F2937] p-5 md:border-r md:last:border-r-0">
                <p className="text-sm text-slate-400">{label}</p>
                <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      {pdfError ? (
        <div className="rounded-lg border border-violet-400/35 bg-violet-950/50 px-4 py-3 text-sm font-medium text-violet-100">
          {pdfError}
        </div>
      ) : null}

      <section id="summary" className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {scoreItems.map(([label, value, Icon, detail]) => (
          <ReportMetric key={label} icon={Icon} label={label} value={value} detail={detail} />
        ))}
      </section>

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <section id="severity" className="surface-card p-5">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-indigo-200" />
            <h2 className="text-lg font-semibold text-white">Severity</h2>
          </div>
          <p className="mt-1 text-sm text-slate-400">Professional security report distribution.</p>
          <div className="mt-5 h-72">
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

        <section className="surface-card p-5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet-200" />
            <h2 className="text-lg font-semibold text-white">Suggested fixes</h2>
          </div>
          <div className="mt-5 grid gap-3">
            {(fixes.length ? fixes : ['No remediation steps were required for this report. Keep scanning each change before release.']).map((fix, index) => (
              <div key={`${fix}-${index}`} className="rounded-lg border border-[#1F2937] bg-[#0F172A]/65 p-4">
                <div className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-indigo-500/15 text-xs font-bold text-indigo-100 ring-1 ring-indigo-400/30">
                    {index + 1}
                  </span>
                  <p className="break-words text-sm leading-6 text-slate-300">{fix}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section id="findings" className="space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-indigo-200" />
          <h2 className="text-lg font-semibold text-white">Findings</h2>
        </div>
        {issues.length ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {issues.map((issue, index) => {
              const affectedLines = issue.lineNumber || issue.lineStart || issue.affectedLines || 'unknown'
              return (
                <motion.article
                  key={`${issue.title}-${index}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="surface-card p-5"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <SeverityBadge severity={issue.severity} />
                        <span className="rounded-md border border-[#1F2937] bg-[#0F172A]/70 px-2 py-1 text-xs font-semibold text-slate-300">
                          {issue.category || 'Code Smell'}
                        </span>
                      </div>
                      <h3 className="mt-3 break-words text-lg font-semibold text-white">{issue.title}</h3>
                      {issue.fileName ? (
                        <p className="mt-1 text-xs font-medium text-slate-400">{issue.fileName}</p>
                      ) : null}
                    </div>
                    <div className="shrink-0 rounded-lg border border-[#1F2937] bg-[#0F172A]/70 px-3 py-2 text-sm font-semibold text-slate-300">
                      Line {affectedLines}
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4">
                    {[
                      ['Explanation', issue.aiExplanation || issue.description],
                      ['Impact', issue.impact],
                      ['Root cause', issue.rootCause],
                      ['Why it matters', issue.whyItMatters],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
                        <p className="mt-2 break-words text-sm leading-6 text-slate-300">{value || 'Not available.'}</p>
                      </div>
                    ))}
                    <div className="rounded-lg border border-indigo-400/25 bg-indigo-500/10 p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-indigo-100">
                        <Lightbulb className="h-4 w-4" />
                        Suggested fix
                      </div>
                      <p className="mt-2 break-words text-sm leading-6 text-slate-200">
                        {issue.suggestedFix || issue.solution || 'No recommendation provided.'}
                      </p>
                    </div>
                    {issue.exampleCodeFix || issue.improvedCodeSuggestion ? (
                      <div className="rounded-lg border border-[#1F2937] bg-[#0B1120]">
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
                </motion.article>
              )
            })}
          </div>
        ) : (
          <EmptyState title="No findings detected" copy="This report did not include rule violations." />
        )}
      </section>

      <section id="tests" className="space-y-4">
        <div className="flex items-center gap-2">
          <FlaskConical className="h-5 w-5 text-indigo-200" />
          <h2 className="text-lg font-semibold text-white">Test cases</h2>
        </div>
        {tests.length ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {tests.map((test, index) => (
              <article key={`${test.name}-${index}`} className="surface-card p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <FlaskConical className="h-5 w-5 text-indigo-200" />
                    <h3 className="font-semibold text-white">{test.name}</h3>
                  </div>
                  <span className="rounded-md border border-[#1F2937] bg-[#0F172A]/70 px-2 py-1 text-xs font-semibold uppercase text-slate-300">
                    {test.priority}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-300">{test.description}</p>
                {test.sampleTestCode ? <CodeBlock code={test.sampleTestCode} language={report.language} maxHeight="16rem" /> : null}
              </article>
            ))}
          </div>
        ) : (
          <EmptyState icon={FlaskConical} title="No generated test cases" copy="BugSense did not receive test suggestions for this report." />
        )}
      </section>

      <section id="source-preview" className="surface-card overflow-hidden">
        <div className="flex flex-col justify-between gap-3 border-b border-[#1F2937] px-5 py-4 md:flex-row md:items-center">
          <div className="flex items-center gap-2">
            <FileCode2 className="h-5 w-5 text-indigo-200" />
            <h2 className="text-lg font-semibold text-white">Source preview</h2>
          </div>
          <span className="text-sm text-slate-400">{fileInsights.length || 1} analyzed file view</span>
        </div>
        <div className="p-5">
          <CodeBlock code={report.sourcePreview} language={report.language} maxHeight="32rem" />
        </div>
      </section>

      {fileInsights.length ? (
        <section className="surface-card overflow-hidden">
          <div className="flex items-center gap-2 border-b border-[#1F2937] px-5 py-4">
            <GitBranch className="h-5 w-5 text-indigo-200" />
            <h2 className="text-lg font-semibold text-white">File metrics</h2>
          </div>
          <div className="overflow-x-auto">
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
                {fileInsights.map((insight) => (
                  <tr key={insight.fileName}>
                    <td>
                      <p className="max-w-xs truncate font-semibold text-white">{insight.fileName}</p>
                      <p className="mt-1 text-xs text-slate-400">{insight.language} - {formatBytes(insight.fileSize)}</p>
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
      ) : null}
    </div>
  )
}

export default ReportDetailPage
