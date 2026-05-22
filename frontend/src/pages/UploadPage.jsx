import { AlertTriangle, FileCode2, Loader2, UploadCloud, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { api } from '../api/client.js'
import { errorMessage, formatBytes } from '../utils/format.js'

function UploadPage() {
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const selectFile = (selected) => {
    setError('')
    setFile(selected || null)
  }

  const submit = async (event) => {
    event.preventDefault()
    if (!file) {
      setError('Choose a source file first.')
      return
    }

    const payload = new FormData()
    payload.append('file', file)
    setSubmitting(true)
    setError('')

    try {
      const { data } = await api.post('/reports/analyze', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      navigate(`/app/reports/${data.id}`)
    } catch (caught) {
      setError(errorMessage(caught))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase text-teal-700">Analyze</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">Upload source code</h1>
      </div>

      <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
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
            className={`focus-ring relative flex min-h-[360px] w-full flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 text-center transition disabled:cursor-not-allowed ${
              dragging
                ? 'border-teal-400 bg-teal-50'
                : 'border-slate-200 bg-slate-50 hover:border-teal-300 hover:bg-white'
            }`}
          >
            {submitting ? (
              <>
                <Loader2 className="h-12 w-12 animate-spin text-teal-600" />
                <span className="mt-5 text-lg font-semibold text-slate-950">Analyzing with Gemini</span>
                <span className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                  This can take a moment for larger source files.
                </span>
              </>
            ) : (
              <>
                <UploadCloud className="h-12 w-12 text-teal-600" />
                <span className="mt-5 text-lg font-semibold text-slate-950">Select file</span>
                <span className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Supported: JavaScript, TypeScript, Java, Python, Go, SQL, HTML, CSS, JSON, YAML, XML, and more.
                </span>
              </>
            )}
          </button>
          <input
            ref={inputRef}
            className="hidden"
            type="file"
            accept=".js,.jsx,.ts,.tsx,.java,.py,.cs,.go,.rb,.php,.kt,.swift,.cpp,.c,.h,.hpp,.rs,.sql,.html,.css,.json,.yml,.yaml,.xml"
            onChange={(event) => selectFile(event.target.files?.[0])}
          />
        </section>

        <aside className="space-y-4">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Selected file</h2>
            {file ? (
              <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-teal-100 p-2 text-teal-700">
                    <FileCode2 className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-950">{file.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{formatBytes(file.size)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => selectFile(null)}
                    className="focus-ring rounded-lg p-1 text-slate-400 hover:bg-white hover:text-slate-700"
                    aria-label="Remove file"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-4 rounded-lg border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                No file selected
              </p>
            )}
          </section>

          {error ? (
            <div className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
            {submitting ? 'Analyzing...' : 'Run analysis'}
          </button>
        </aside>
      </form>
    </div>
  )
}

export default UploadPage
