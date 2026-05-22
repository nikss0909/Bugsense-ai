import {
  ArrowLeft,
  CheckCircle2,
  Code2,
  FileCode2,
  FlaskConical,
  Lightbulb,
  Loader2,
  Wrench,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { api } from '../api/client.js'
import SeverityBadge from '../components/SeverityBadge.jsx'
import { formatBytes, formatDate, severityOrder } from '../utils/format.js'

function ReportDetailPage() {
  const { id } = useParams()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
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

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-teal-600" />
          <p className="mt-3 text-sm font-semibold text-slate-700">Loading AI report</p>
        </div>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="space-y-4">
        <Link className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700" to="/app/reports">
          <ArrowLeft className="h-4 w-4" />
          Back to reports
        </Link>
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error || 'Report was not found.'}
        </div>
      </div>
    )
  }

  const findings = report.analysis?.findings || []
  const tests = report.analysis?.testSuggestions || []
  const fixes = report.analysis?.fixRecommendations || []

  return (
    <div className="space-y-6">
      <Link className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700" to="/app/reports">
        <ArrowLeft className="h-4 w-4" />
        Back to reports
      </Link>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-normal text-slate-950">{report.fileName}</h1>
              <SeverityBadge severity={severity} />
            </div>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              {report.analysis?.summary || 'Analysis completed.'}
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-500">
              <span>{report.language}</span>
              <span>{formatBytes(report.fileSize)}</span>
              <span>{formatDate(report.createdAt)}</span>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 text-center">
            <p className="text-sm font-semibold text-slate-500">Quality score</p>
            <p className="mt-2 text-5xl font-semibold text-slate-950">{report.analysis?.qualityScore || 0}</p>
            <div className="mt-4 h-2 w-40 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-teal-600"
                style={{ width: `${Math.min(100, Math.max(0, report.analysis?.qualityScore || 0))}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-4">
        {severityOrder.map((item) => (
          <section key={item} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold capitalize text-slate-500">{item}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">
              {report.analysis?.severityCounts?.[item] || 0}
            </p>
          </section>
        ))}
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">AI-generated bug cards</h2>
            <p className="mt-1 text-sm text-slate-500">Findings include impact, affected lines, and repair guidance.</p>
          </div>
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          {findings.length ? (
            findings.map((finding, index) => {
              const explanation = finding.explanation || finding.description || 'No explanation provided.'
              const recommendation = finding.fixRecommendation || finding.recommendation || 'No recommendation provided.'
              const affectedLines =
                finding.affectedLines ||
                (finding.lineStart ? `${finding.lineStart}-${finding.lineEnd || finding.lineStart}` : 'unknown')

              return (
                <article
                  key={`${finding.title}-${index}`}
                  className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <SeverityBadge severity={finding.severity} />
                        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                          {finding.category || 'Code Quality'}
                        </span>
                      </div>
                      <h3 className="mt-3 break-words text-lg font-semibold text-slate-950">{finding.title}</h3>
                    </div>
                    <div className="shrink-0 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600">
                      Lines {affectedLines}
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase text-slate-400">Explanation</p>
                      <p className="mt-2 break-words text-sm leading-6 text-slate-600">{explanation}</p>
                    </div>
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-amber-800">
                        <Lightbulb className="h-4 w-4" />
                        Fix recommendation
                      </div>
                      <p className="mt-2 break-words text-sm leading-6 text-amber-900">{recommendation}</p>
                    </div>
                    {finding.improvedCodeSuggestion ? (
                      <div className="rounded-lg border border-slate-200 bg-slate-950">
                        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3 text-sm font-semibold text-slate-200">
                          <Code2 className="h-4 w-4" />
                          Improved code suggestion
                        </div>
                        <pre className="max-h-64 overflow-auto p-4 text-sm leading-6 text-slate-100">
                          <code>{finding.improvedCodeSuggestion}</code>
                        </pre>
                      </div>
                    ) : null}
                  </div>
              </article>
              )
            })
          ) : (
            <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm xl:col-span-2">
              <CheckCircle2 className="h-5 w-5 text-teal-600" />
              No bug findings were reported.
            </div>
          )}
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-4">
            <FlaskConical className="h-5 w-5 text-teal-700" />
            <h2 className="text-lg font-semibold text-slate-950">Test case suggestions</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {tests.map((test, index) => (
              <article key={`${test.name}-${index}`} className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold text-slate-950">{test.name}</h3>
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold uppercase text-slate-600">
                    {test.priority}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{test.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-4">
            <Wrench className="h-5 w-5 text-amber-600" />
            <h2 className="text-lg font-semibold text-slate-950">Recommendations</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {fixes.length ? (
              fixes.map((fix, index) => (
                <div key={`${fix}-${index}`} className="flex gap-3 p-5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-amber-100 text-xs font-bold text-amber-700">
                    {index + 1}
                  </span>
                  <p className="break-words text-sm leading-6 text-slate-700">{fix}</p>
                </div>
              ))
            ) : (
              <div className="px-5 py-8 text-sm text-slate-500">No recommendations were returned.</div>
            )}
          </div>
        </section>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-4">
          <FileCode2 className="h-5 w-5 text-slate-600" />
          <h2 className="text-lg font-semibold text-slate-950">Source preview</h2>
        </div>
        <pre className="max-h-[460px] overflow-auto p-5 text-sm leading-6 text-slate-700">
          <code>{report.sourcePreview}</code>
        </pre>
      </section>
    </div>
  )
}

export default ReportDetailPage
