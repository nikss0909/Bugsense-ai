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
  const strengthLabel = strength >= 80 ? 'Strong' : strength >= 50 ? 'Fair' : 'Building'

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
    <main className="min-h-screen bg-[#0F172A] px-4 py-10 text-white">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between pb-6">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-950/30">
            <Bug className="h-5 w-5" />
          </div>
          <p className="text-lg font-semibold text-white">BugSense AI</p>
        </Link>
        <button
          type="button"
          onClick={toggleTheme}
          className="focus-ring rounded-lg border border-[#1F2937] bg-[#111827] p-2 text-slate-300 hover:bg-indigo-500/10"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>

      <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-lg border border-[#1F2937] bg-[#111827]/88 shadow-2xl shadow-slate-950/30 lg:grid-cols-[0.88fr_1.12fr]">
        <section className="relative hidden overflow-hidden bg-[#0B1120] p-8 lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(79,70,229,0.22),transparent_30rem),radial-gradient(circle_at_80%_80%,rgba(124,58,237,0.14),transparent_26rem)]" />
          <div className="relative">
            <p className="text-sm font-semibold uppercase text-indigo-200">Workspace setup</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">Create a secure code intelligence workspace</h1>
            <p className="mt-4 text-sm leading-6 text-slate-400">
              Scan files, clone public repositories, track security findings, and export production-ready reports.
            </p>
          </div>
          <div className="relative space-y-4">
            {[
              ['JWT authentication', 'Session storage and authenticated profile calls remain handled by the existing backend.'],
              ['PDF-ready reports', 'Generated reports can be exported from the report detail or history views.'],
              ['Quality history', 'Dashboards and filters organize prior scans into trend-ready history.'],
            ].map(([title, copy]) => (
              <motion.div key={title} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg border border-[#1F2937] bg-[#111827]/70 p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-indigo-200" />
                  <p className="font-semibold text-white">{title}</p>
                </div>
                <p className="mt-1 text-sm text-slate-400">{copy}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="p-6 md:p-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-normal text-white">Create your account</h1>
            <p className="mt-2 text-sm text-slate-400">Start a private analysis workspace.</p>
          </div>

          {error ? (
            <div className="mt-5 rounded-lg border border-violet-400/35 bg-violet-950/50 px-4 py-3 text-sm font-medium text-violet-100">
              {error}
            </div>
          ) : null}

          <form onSubmit={submit} className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="block md:col-span-2">
              <span className="text-sm font-semibold text-slate-200">Name</span>
              <span className="field-shell mt-2">
                <User className="h-4 w-4 text-slate-500" />
                <input
                  className="w-full border-0 bg-transparent text-sm text-white outline-none"
                  name="name"
                  value={form.name}
                  onChange={update}
                  required
                />
              </span>
            </label>

            <label className="block md:col-span-2">
              <span className="text-sm font-semibold text-slate-200">Email</span>
              <span className="field-shell mt-2">
                <Mail className="h-4 w-4 text-slate-500" />
                <input
                  className="w-full border-0 bg-transparent text-sm text-white outline-none"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={update}
                  required
                />
              </span>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-200">Password</span>
              <span className="field-shell mt-2">
                <LockKeyhole className="h-4 w-4 text-slate-500" />
                <input
                  className="w-full border-0 bg-transparent text-sm text-white outline-none"
                  name="password"
                  type="password"
                  minLength={8}
                  value={form.password}
                  onChange={update}
                  required
                />
              </span>
              <span className="mt-2 flex items-center gap-2">
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-slate-800">
                  <span
                    className="block h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                    style={{ width: `${strength}%` }}
                  />
                </span>
                <span className="text-xs font-semibold text-slate-400">{strengthLabel}</span>
              </span>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-200">Company</span>
              <span className="field-shell mt-2">
                <Building2 className="h-4 w-4 text-slate-500" />
                <input
                  className="w-full border-0 bg-transparent text-sm text-white outline-none"
                  name="company"
                  value={form.company}
                  onChange={update}
                />
              </span>
            </label>

            <div className="rounded-lg border border-indigo-400/25 bg-indigo-500/10 p-4 md:col-span-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-indigo-100">
                <ShieldCheck className="h-4 w-4" />
                Enterprise security profile
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Account security, session visibility, and notification controls are available from Settings after signup.
              </p>
            </div>

            <button type="submit" disabled={submitting} className="primary-action md:col-span-2">
              {submitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link className="font-semibold text-indigo-100 hover:text-white" to="/login">
              Sign in
            </Link>
          </p>
        </section>
      </div>
    </main>
  )
}

export default SignupPage
