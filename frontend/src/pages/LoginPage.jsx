import { Bug, LockKeyhole, Mail, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { authErrorMessage } from '../utils/format.js'

function LoginPage() {
  const { login } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const update = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const submit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await login(form)
      navigate('/app/dashboard')
    } catch (caught) {
      const message = authErrorMessage(caught, 'login')
      let title = 'Unable to sign in'
      if (caught?.status === 503 || caught?.status === 0) {
        title = 'Server unavailable'
      } else if (caught?.status === 401) {
        title = 'Invalid credentials'
      }
      setError(message)
      showToast({
        title,
        message,
        type: 'error',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="grid min-h-screen bg-slate-50 lg:grid-cols-[0.92fr_1.08fr]">
      <section className="hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-400 text-slate-950">
            <Bug className="h-6 w-6" />
          </div>
          <div>
            <p className="text-lg font-semibold">BugSense AI</p>
            <p className="text-sm text-slate-400">Automated QA analysis</p>
          </div>
        </div>

        <div className="glass-panel rounded-lg p-6 text-slate-950 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <p className="text-sm font-semibold text-slate-500">Latest scan</p>
              <p className="mt-1 text-2xl font-semibold">checkout-service.ts</p>
            </div>
            <span className="rounded-md border border-orange-200 bg-orange-50 px-2 py-1 text-xs font-bold uppercase text-orange-700">
              high
            </span>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3">
            {[
              ['Bugs', '6'],
              ['Tests', '11'],
              ['Score', '82'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
                <p className="mt-2 text-2xl font-semibold">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 space-y-3">
            {['Missing payment retry assertions', 'Unvalidated webhook signature'].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-lg bg-white p-3 shadow-sm">
                <ShieldCheck className="h-4 w-4 text-teal-600" />
                <p className="text-sm font-medium">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="max-w-md text-sm leading-6 text-slate-400">
          Detect risky code paths, prioritize severity, and turn findings into tests before release.
        </p>
      </section>

      <section className="flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-white">
                <Bug className="h-5 w-5" />
              </div>
              <p className="text-lg font-semibold text-slate-950">BugSense AI</p>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <h1 className="text-2xl font-semibold tracking-normal text-slate-950">Welcome back</h1>
              <p className="mt-2 text-sm text-slate-500">Sign in to continue analysis.</p>
            </div>

            {error ? (
              <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            ) : null}

            <form onSubmit={submit} className="mt-6 space-y-4">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Email</span>
                <span className="mt-2 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-100">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <input
                    className="w-full border-0 bg-transparent text-sm outline-none"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={update}
                    required
                  />
                </span>
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Password</span>
                <span className="mt-2 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-100">
                  <LockKeyhole className="h-4 w-4 text-slate-400" />
                  <input
                    className="w-full border-0 bg-transparent text-sm outline-none"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={update}
                    required
                  />
                </span>
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="focus-ring inline-flex w-full items-center justify-center rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-slate-500">
              New to BugSense AI?{' '}
              <Link className="font-semibold text-teal-700 hover:text-teal-800" to="/signup">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}

export default LoginPage
