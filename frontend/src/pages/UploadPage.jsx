import { motion } from 'framer-motion'
import {
  AlertTriangle,
  FileCode2,
  FileSearch,
  FolderGit2,
  GitBranch,
  Loader2,
  ShieldCheck,
  UploadCloud,
  X,
  Zap,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { api } from '../api/client.js'
import { errorMessage, formatBytes } from '../utils/format.js'

const acceptedExtensions = '.js,.jsx,.ts,.tsx,.java,.py,.cs,.go,.rb,.php,.kt,.swift,.cpp,.c,.h,.hpp,.rs,.sql,.html,.css,.json,.yml,.yaml,.xml'

function UploadPage() {
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const [mode, setMode] = useState('file')
  const [file, setFile] = useState(null)
  const [repoUrl, setRepoUrl] = useState('')
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const selectFile = (selected) => {
    setError('')
    setFile(selected || null)
  }

  const submitFile = async () => {
    if (!file) {
      setError('Choose a source file first.')
      return
    }
    const payload = new FormData()
    payload.append('file', file)
    const { data } = await api.post('/reports/analyze', payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    navigate(`/app/reports/${data.id}`)
  }

  const submitRepository = async () => {
    if (!repoUrl.trim()) {
      setError('Enter a GitHub repository URL first.')
      return
    }
    const { data } = await api.post('/reports/analyze-repository', {
      repositoryUrl: repoUrl.trim(),
    })
    navigate(`/app/reports/${data.id}`)
  }

  const submit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      if (mode === 'file') {
        await submitFile()
      } else {
        await submitRepository()
      }
    } catch (caught) {
      setError(errorMessage(caught))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase text-cyan-700 dark:text-cyan-300">Analyze</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950 dark:text-white">Scan code and repositories</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            Run static quality, security, maintainability, file intelligence, and AI-ready recommendations.
          </p>
        </div>
        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
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
              }}
              className={`focus-ring inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition ${
                mode === value
                  ? 'bg-slate-950 text-white dark:bg-cyan-400 dark:text-slate-950'
                  : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <section className="surface-card p-5">
          {mode === 'file' ? (
            <button
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
              className={`focus-ring relative flex min-h-[420px] w-full flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 text-center transition disabled:cursor-not-allowed ${
                dragging
                  ? 'border-cyan-400 bg-cyan-50 dark:bg-cyan-950/30'
                  : 'border-slate-200 bg-slate-50 hover:border-cyan-300 hover:bg-white dark:border-slate-800 dark:bg-slate-950/60 dark:hover:border-cyan-700 dark:hover:bg-slate-950'
              }`}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-12 w-12 animate-spin text-cyan-600 dark:text-cyan-300" />
                  <span className="mt-5 text-lg font-semibold text-slate-950 dark:text-white">Running analysis</span>
                  <span className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                    Rules, file metrics, security signals, and report recommendations are being generated.
                  </span>
                </>
              ) : (
                <>
                  <UploadCloud className="h-12 w-12 text-cyan-600 dark:text-cyan-300" />
                  <span className="mt-5 text-lg font-semibold text-slate-950 dark:text-white">Drop source file</span>
                  <span className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                    Java, JavaScript, TypeScript, SQL, HTML, CSS, Python, Go, C#, C++, Rust, YAML, and JSON.
                  </span>
                </>
              )}
            </button>
          ) : (
            <div className="flex min-h-[420px] flex-col justify-center rounded-lg border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-950/60">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-slate-950 text-white dark:bg-cyan-400 dark:text-slate-950">
                <GitBranch className="h-7 w-7" />
              </div>
              <div className="mx-auto mt-5 max-w-2xl text-center">
                <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">Repository scanner</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Public GitHub repositories are cloned, language-detected, scanned file by file, and saved as a single report.
                </p>
              </div>
              <label className="mx-auto mt-8 block w-full max-w-2xl">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">GitHub repository URL</span>
                <span className="field-shell mt-2">
                  <FolderGit2 className="h-4 w-4 text-slate-400" />
                  <input
                    className="w-full border-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
                    value={repoUrl}
                    onChange={(event) => setRepoUrl(event.target.value)}
                    placeholder="https://github.com/user/project"
                  />
                </span>
              </label>
              {submitting ? (
                <div className="mx-auto mt-7 w-full max-w-2xl">
                  <div className="flex items-center justify-between text-sm font-semibold text-slate-600 dark:text-slate-300">
                    <span>Cloning and scanning</span>
                    <Loader2 className="h-4 w-4 animate-spin text-cyan-600 dark:text-cyan-300" />
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                    <motion.div
                      className="h-full rounded-full bg-cyan-500"
                      initial={{ width: '12%' }}
                      animate={{ width: ['18%', '72%', '46%', '88%'] }}
                      transition={{ repeat: Infinity, duration: 2.4 }}
                    />
                  </div>
                </div>
              ) : null}
            </div>
          )}
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
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">{mode === 'file' ? 'Selected file' : 'Repository target'}</h2>
            {mode === 'file' ? (
              file ? (
                <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-cyan-100 p-2 text-cyan-700 dark:bg-cyan-400/10 dark:text-cyan-300">
                      <FileCode2 className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-slate-950 dark:text-white">{file.name}</p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{formatBytes(file.size)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => selectFile(null)}
                      className="focus-ring rounded-lg p-1 text-slate-400 hover:bg-white hover:text-slate-700 dark:hover:bg-slate-900 dark:hover:text-white"
                      aria-label="Remove file"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-4 rounded-lg border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  No file selected
                </p>
              )
            ) : (
              <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300">
                {repoUrl.trim() || 'No repository URL entered'}
              </div>
            )}
          </section>

          <section className="surface-card p-5">
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Scan coverage</h2>
            <div className="mt-4 space-y-3">
              {[
                [ShieldCheck, 'Security vulnerabilities'],
                [FileSearch, 'File insights and metrics'],
                [Zap, 'AI-ready recommendations'],
              ].map(([Icon, label]) => (
                <div key={label} className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-300">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    <Icon className="h-4 w-4" />
                  </span>
                  {label}
                </div>
              ))}
            </div>
          </section>

          {error ? (
            <div className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 dark:border-red-900/70 dark:bg-red-950/50 dark:text-red-200">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}

          <button type="submit" disabled={submitting} className="primary-action w-full">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === 'file' ? <UploadCloud className="h-4 w-4" /> : <GitBranch className="h-4 w-4" />}
            {submitting ? 'Scanning...' : mode === 'file' ? 'Run file analysis' : 'Scan repository'}
          </button>
        </aside>
      </form>
    </div>
  )
}

export default UploadPage
