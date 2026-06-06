import { motion } from 'framer-motion'
import { Bug, CheckCircle2, LockKeyhole, Mail, Moon, ShieldCheck, Sun } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { authErrorMessage } from '../utils/format.js'

function LoginPage() {
  const { login } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [remember, setRemember] = useState(true)
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
      await login({ email: form.email, password: form.password })
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
      showToast({ title, message, type: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950 dark:bg-slate-950 dark:text-white lg:grid lg:grid-cols-[0.95fr_1.05fr]">
      <section className="relative hidden overflow-hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(8,145,178,0.28),transparent_36%),linear-gradient(35deg,rgba(16,185,129,0.16),transparent_42%)]" />
        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-cyan-400 text-slate-950">
            <Bug className="h-6 w-6" />
          </div>
          <div>
            <p className="text-lg font-semibold">BugSense AI</p>
            <p className="text-sm text-slate-400">Secure code intelligence</p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel relative rounded-lg p-6 text-slate-950 dark:text-white"
        >
          <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-white/10">
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Repository scan</p>
              <p className="mt-1 text-2xl font-semibold">payments/api</p>
            </div>
            <span className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs font-bold uppercase text-red-700 dark:border-red-900/70 dark:bg-red-950/60 dark:text-red-200">
              critical
            </span>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3">
            {[
              ['Issues', '18'],
              ['Security', '74'],
              ['Health', '82'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">{label}</p>
                <p className="mt-2 text-2xl font-semibold">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 space-y-3">
            {['Possible SQL injection', 'Sensitive data in logs', 'Weak password policy'].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-lg bg-white p-3 shadow-sm dark:bg-slate-900">
                <ShieldCheck className="h-4 w-4 text-cyan-600 dark:text-cyan-300" />
                <p className="text-sm font-medium">{item}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="relative grid gap-3 text-sm text-slate-300">
          {['JWT sessions', 'Repository scanning', 'AI-ready remediation'].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-cyan-300" />
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-white dark:bg-cyan-400 dark:text-slate-950">
                <Bug className="h-5 w-5" />
              </div>
              <p className="text-lg font-semibold text-slate-950 dark:text-white">BugSense AI</p>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="focus-ring ml-auto rounded-lg border border-slate-200 bg-white p-2 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>

          <div className="surface-card p-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-normal text-slate-950 dark:text-white">Welcome back</h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Sign in to continue scanning code.</p>
            </div>

            {error ? (
              <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/70 dark:bg-red-950/50 dark:text-red-200">
                {error}
              </div>
            ) : null}

            <form onSubmit={submit} className="mt-6 space-y-4">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Email</span>
                <span className="field-shell mt-2">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <input
                    className="w-full border-0 bg-transparent text-sm outline-none dark:text-white"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={update}
                    required
                  />
                </span>
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Password</span>
                <span className="field-shell mt-2">
                  <LockKeyhole className="h-4 w-4 text-slate-400" />
                  <input
                    className="w-full border-0 bg-transparent text-sm outline-none dark:text-white"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={update}
                    required
                  />
                </span>
              </label>

              <div className="flex items-center justify-between gap-3 text-sm">
                <label className="inline-flex items-center gap-2 font-medium text-slate-600 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(event) => setRemember(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-cyan-600"
                  />
                  Remember me
                </label>
                <button type="button" className="font-semibold text-cyan-700 hover:text-cyan-800 dark:text-cyan-300">
                  Reset password
                </button>
              </div>

              <button type="submit" disabled={submitting} className="primary-action w-full">
                {submitting ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
              New to BugSense?{' '}
              <Link className="font-semibold text-cyan-700 hover:text-cyan-800 dark:text-cyan-300" to="/signup">
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
