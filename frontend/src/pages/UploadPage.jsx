import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  CheckCircle2,
  Code2,
  FileCode2,
  FileSearch,
  FolderGit2,
  GitBranch,
  Layers3,
  Loader2,
  ShieldCheck,
  UploadCloud,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { api } from '../api/client.js'
import { errorMessage, formatBytes } from '../utils/format.js'

const acceptedExtensions = '.js,.jsx,.ts,.tsx,.java,.py,.cs,.go,.rb,.php,.kt,.swift,.cpp,.c,.h,.hpp,.rs,.sql,.html,.css,.json,.yml,.yaml,.xml'

const progressSteps = [
  'Uploading',
  'Processing',
  'AI Analysis',
  'Generating Report',
  'Complete',
]

const languageByExtension = {
  c: 'C',
  cpp: 'C++',
  cs: 'C#',
  css: 'CSS',
  go: 'Go',
  h: 'C/C++ Header',
  hpp: 'C++ Header',
  html: 'HTML',
  java: 'Java',
  js: 'JavaScript',
  json: 'JSON',
  jsx: 'React JSX',
  kt: 'Kotlin',
  php: 'PHP',
  py: 'Python',
  rb: 'Ruby',
  rs: 'Rust',
  sql: 'SQL',
  swift: 'Swift',
  ts: 'TypeScript',
  tsx: 'React TSX',
  xml: 'XML',
  yaml: 'YAML',
  yml: 'YAML',
}

function detectLanguage(fileName = '') {
  const extension = fileName.split('.').pop()?.toLowerCase()
  return languageByExtension[extension] || 'Unknown'
}

function StepTimeline({ activeStep, submitting }) {
  return (
    <div className="space-y-3">
      {progressSteps.map((step, index) => {
        const complete = activeStep > index
        const active = activeStep === index
        return (
          <div key={step} className="flex items-center gap-3">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-bold transition ${
                complete
                  ? 'border-indigo-400/50 bg-indigo-500/20 text-indigo-100'
                  : active
                    ? 'border-violet-400/60 bg-violet-500/20 text-violet-100'
                    : 'border-[#1F2937] bg-[#0F172A] text-slate-500'
              }`}
            >
              {complete ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-semibold ${active || complete ? 'text-white' : 'text-slate-500'}`}>{step}</p>
              <p className="text-xs text-slate-500">
                {complete ? 'Finished' : active && submitting ? 'In progress' : 'Waiting'}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function UploadPage() {
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const [mode, setMode] = useState('file')
  const [file, setFile] = useState(null)
  const [repoUrl, setRepoUrl] = useState('')
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!submitting) return undefined
    setProgress(8)
    const timer = window.setInterval(() => {
      setProgress((current) => Math.min(92, current + (current < 45 ? 9 : current < 72 ? 5 : 2)))
    }, 420)
    return () => window.clearInterval(timer)
  }, [submitting])

  const activeStep = useMemo(() => {
    if (!submitting && progress === 0) return -1
    if (progress >= 100) return 4
    if (progress >= 76) return 3
    if (progress >= 48) return 2
    if (progress >= 24) return 1
    return 0
  }, [progress, submitting])

  const selectedLanguage = file ? detectLanguage(file.name) : 'Waiting for file'

  const selectFile = (selected) => {
    setError('')
    setProgress(0)
    setFile(selected || null)
  }

  const submitFile = async () => {
    if (!file) {
      setError('Choose a source file first.')
      return null
    }
    const payload = new FormData()
    payload.append('file', file)
    const { data } = await api.post('/reports/analyze', payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (event) => {
        if (!event.total) return
        const uploadPercent = Math.round((event.loaded * 24) / event.total)
        setProgress(Math.max(8, Math.min(32, uploadPercent)))
      },
    })
    return data
  }

  const submitRepository = async () => {
    if (!repoUrl.trim()) {
      setError('Enter a GitHub repository URL first.')
      return null
    }
    const { data } = await api.post('/reports/analyze-repository', {
      repositoryUrl: repoUrl.trim(),
    })
    return data
  }

  const submit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const data = mode === 'file' ? await submitFile() : await submitRepository()
      if (!data) return
      setProgress(100)
      window.setTimeout(() => navigate(`/app/reports/${data.id}`), 260)
    } catch (caught) {
      setError(errorMessage(caught))
      setProgress(0)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase text-indigo-200">Analyze</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal text-white">Upload code for AI analysis</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Scan a source file or public repository for bugs, severity, test cases, and fix recommendations.
          </p>
        </div>
        <div className="inline-flex rounded-lg border border-[#1F2937] bg-[#111827] p-1">
          {[
            ['file', UploadCloud, 'File'],
            ['repository', GitBranch, 'Repository'],
          ].map(([value, Icon, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setMode(value)
                setError('')
                setProgress(0)
              }}
              className={`focus-ring inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition ${
                mode === value
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white'
                  : 'text-slate-400 hover:bg-indigo-500/10 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[1fr_390px]">
        <section className="surface-card p-5">
          <AnimatePresence mode="wait">
            {mode === 'file' ? (
              <motion.button
                key="file-upload"
                type="button"
                disabled={submitting}
                onClick={() => inputRef.current?.click()}
                onDragEnter={(event) => {
                  event.preventDefault()
                  if (submitting) return
                  setDragging(true)
                }}
                onDragOver={(event) => event.preventDefault()}
                onDragLeave={() => setDragging(false)}
                onDrop={(event) => {
                  event.preventDefault()
                  if (submitting) return
                  setDragging(false)
                  selectFile(event.dataTransfer.files?.[0])
                }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className={`focus-ring relative flex min-h-[460px] w-full flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed px-6 text-center transition disabled:cursor-not-allowed ${
                  dragging
                    ? 'border-violet-400 bg-violet-500/10'
                    : 'border-indigo-400/25 bg-[#0F172A]/70 hover:border-indigo-400/60 hover:bg-indigo-500/8'
                }`}
              >
                <div className="absolute inset-x-10 top-10 h-40 rounded-full bg-indigo-600/10 blur-3xl" />
                {submitting ? (
                  <>
                    <Loader2 className="relative h-12 w-12 animate-spin text-indigo-200" />
                    <span className="relative mt-5 text-lg font-semibold text-white">Running analysis</span>
                    <span className="relative mt-2 max-w-md text-sm leading-6 text-slate-400">
                      Upload, static rules, AI review, and report generation are moving through the pipeline.
                    </span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="relative h-12 w-12 text-indigo-200" />
                    <span className="relative mt-5 text-lg font-semibold text-white">Drop source file here</span>
                    <span className="relative mt-2 max-w-md text-sm leading-6 text-slate-400">
                      Click to browse or drag a supported source file into this analysis zone.
                    </span>
                    <span className="relative mt-5 rounded-full border border-indigo-400/25 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-100">
                      JS, TS, Java, Python, Go, SQL, HTML, CSS, JSON, YAML, XML
                    </span>
                  </>
                )}
              </motion.button>
            ) : (
              <motion.div
                key="repository-upload"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex min-h-[460px] flex-col justify-center rounded-lg border border-[#1F2937] bg-[#0F172A]/70 p-6"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-100 ring-1 ring-indigo-400/30">
                  <GitBranch className="h-7 w-7" />
                </div>
                <div className="mx-auto mt-5 max-w-2xl text-center">
                  <h2 className="text-2xl font-semibold text-white">Repository scanner</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Public GitHub repositories are cloned, language-detected, scanned file by file, and saved as a single report.
                  </p>
                </div>
                <label className="mx-auto mt-8 block w-full max-w-2xl">
                  <span className="text-sm font-semibold text-slate-200">GitHub repository URL</span>
                  <span className="field-shell mt-2">
                    <FolderGit2 className="h-4 w-4 text-slate-500" />
                    <input
                      className="w-full border-0 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                      value={repoUrl}
                      onChange={(event) => setRepoUrl(event.target.value)}
                      placeholder="https://github.com/user/project"
                    />
                  </span>
                </label>
              </motion.div>
            )}
          </AnimatePresence>
          <input
            ref={inputRef}
            className="hidden"
            type="file"
            accept={acceptedExtensions}
            onChange={(event) => selectFile(event.target.files?.[0])}
          />
        </section>

        <aside className="space-y-4">
          <section className="surface-card p-5">
            <h2 className="text-lg font-semibold text-white">{mode === 'file' ? 'Selected file' : 'Repository target'}</h2>
            {mode === 'file' ? (
              file ? (
                <div className="mt-4 rounded-lg border border-[#1F2937] bg-[#0F172A]/70 p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-indigo-500/12 p-2 text-indigo-100 ring-1 ring-indigo-400/25">
                      <FileCode2 className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-white">{file.name}</p>
                      <div className="mt-2 grid gap-2 text-sm text-slate-400">
                        <span>File size: {formatBytes(file.size)}</span>
                        <span>Language detected: {selectedLanguage}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => selectFile(null)}
                      className="focus-ring rounded-lg p-1 text-slate-500 hover:bg-indigo-500/10 hover:text-white"
                      aria-label="Remove file"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-lg border border-dashed border-indigo-400/25 px-4 py-8 text-center">
                  <FileCode2 className="mx-auto h-8 w-8 text-indigo-200" />
                  <p className="mt-3 text-sm font-semibold text-white">No file selected</p>
                  <p className="mt-1 text-sm text-slate-400">Supported file types are shown in the drop zone.</p>
                </div>
              )
            ) : (
              <div className="mt-4 rounded-lg border border-[#1F2937] bg-[#0F172A]/70 p-4 text-sm text-slate-300">
                {repoUrl.trim() || 'No repository URL entered'}
              </div>
            )}
          </section>

          <section className="surface-card p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-white">Analysis progress</h2>
              <span className="text-sm font-semibold text-indigo-100">{progress}%</span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.22 }}
              />
            </div>
            <div className="mt-5">
              <StepTimeline activeStep={activeStep} submitting={submitting} />
            </div>
          </section>

          <section className="surface-card p-5">
            <h2 className="text-lg font-semibold text-white">Scan coverage</h2>
            <div className="mt-4 space-y-3">
              {[
                [ShieldCheck, 'Security vulnerabilities'],
                [FileSearch, 'Source metrics and findings'],
                [Layers3, 'Language and file intelligence'],
                [Code2, 'Fix recommendations and tests'],
              ].map(([Icon, label]) => (
                <div key={label} className="flex items-center gap-3 text-sm font-medium text-slate-300">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-100 ring-1 ring-indigo-400/20">
                    <Icon className="h-4 w-4" />
                  </span>
                  {label}
                </div>
              ))}
            </div>
          </section>

          {error ? (
            <div className="flex gap-3 rounded-lg border border-violet-400/35 bg-violet-950/50 p-4 text-sm font-medium text-violet-100">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}

          <button type="submit" disabled={submitting} className="primary-action w-full">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === 'file' ? <UploadCloud className="h-4 w-4" /> : <GitBranch className="h-4 w-4" />}
            {submitting ? 'Analyzing...' : mode === 'file' ? 'Run file analysis' : 'Scan repository'}
          </button>
        </aside>
      </form>
    </div>
  )
}

export default UploadPage
