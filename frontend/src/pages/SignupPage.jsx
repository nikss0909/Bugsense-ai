import { motion } from 'framer-motion'
import { Bug, Building2, CheckCircle2, LockKeyhole, Mail, Moon, ShieldCheck, Sun, User } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { authErrorMessage } from '../utils/format.js'

function passwordStrength(password) {
  let score = 0
  if (password.length >= 8) score += 25
  if (password.length >= 12) score += 20
  if (/[A-Z]/.test(password)) score += 15
  if (/[0-9]/.test(password)) score += 20
  if (/[^A-Za-z0-9]/.test(password)) score += 20
  return Math.min(100, score)
}

function SignupPage() {
  const { signup } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', company: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const strength = useMemo(() => passwordStrength(form.password), [form.password])
  const strengthLabel = strength >= 80 ? 'Strong' : strength >= 50 ? 'Fair' : 'Weak'

  const update = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const submit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await signup({
        name: form.name,
        email: form.email,
        password: form.password,
        company: form.company,
      })
      navigate('/app/dashboard')
    } catch (caught) {
      const message = authErrorMessage(caught, 'signup')
      let title = 'Unable to create account'
      if (caught?.status === 503 || caught?.status === 0) {
        title = 'Server unavailable'
      } else if (caught?.status === 409) {
        title = 'Duplicate account'
      }
      setError(message)
      showToast({ title, message, type: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 text-slate-950 dark:bg-slate-950 dark:text-white">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between pb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-white dark:bg-cyan-400 dark:text-slate-950">
            <Bug className="h-5 w-5" />
          </div>
          <p className="text-lg font-semibold text-slate-950 dark:text-white">BugSense AI</p>
        </div>
        <button
          type="button"
          onClick={toggleTheme}
          className="focus-ring rounded-lg border border-slate-200 bg-white p-2 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>

      <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-[0.88fr_1.12fr]">
        <section className="hidden bg-slate-950 p-8 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-cyan-300">Workspace setup</p>
            <h1 className="mt-3 text-3xl font-semibold">Create a secure code intelligence workspace</h1>
            <p className="mt-4 text-sm leading-6 text-slate-400">
              Scan files, clone public repositories, track security findings, and export production-ready reports.
            </p>
          </div>
          <div className="space-y-4">
            {[
              ['Email verification ready', 'Account flows are structured for verified identities.'],
              ['Session controls', 'Active sessions, device history, and security logs live in settings.'],
              ['Team workflow', 'Roles, issue ownership, comments, and activity are modeled in the UI.'],
            ].map(([title, copy]) => (
              <motion.div key={title} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-300" />
                  <p className="font-semibold">{title}</p>
                </div>
                <p className="mt-1 text-sm text-slate-400">{copy}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="p-6 md:p-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-normal text-slate-950 dark:text-white">Create your account</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Start a private analysis workspace.</p>
          </div>

          {error ? (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/70 dark:bg-red-950/50 dark:text-red-200">
              {error}
            </div>
          ) : null}

          <form onSubmit={submit} className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="block md:col-span-2">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Name</span>
              <span className="field-shell mt-2">
                <User className="h-4 w-4 text-slate-400" />
                <input
                  className="w-full border-0 bg-transparent text-sm outline-none dark:text-white"
                  name="name"
                  value={form.name}
                  onChange={update}
                  required
                />
              </span>
            </label>

            <label className="block md:col-span-2">
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
                  minLength={8}
                  value={form.password}
                  onChange={update}
                  required
                />
              </span>
              <span className="mt-2 flex items-center gap-2">
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <span
                    className={`block h-full rounded-full ${strength >= 80 ? 'bg-emerald-500' : strength >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                    style={{ width: `${strength}%` }}
                  />
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{strengthLabel}</span>
              </span>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Company</span>
              <span className="field-shell mt-2">
                <Building2 className="h-4 w-4 text-slate-400" />
                <input
                  className="w-full border-0 bg-transparent text-sm outline-none dark:text-white"
                  name="company"
                  value={form.company}
                  onChange={update}
                />
              </span>
            </label>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60 md:col-span-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                <ShieldCheck className="h-4 w-4 text-cyan-600 dark:text-cyan-300" />
                Enterprise security profile
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Password reset, email verification, OTP, authenticator apps, session history, and login activity are available from Settings.
              </p>
            </div>

            <button type="submit" disabled={submitting} className="primary-action md:col-span-2">
              {submitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link className="font-semibold text-cyan-700 hover:text-cyan-800 dark:text-cyan-300" to="/login">
              Sign in
            </Link>
          </p>
        </section>
      </div>
    </main>
  )
}

export default SignupPage
