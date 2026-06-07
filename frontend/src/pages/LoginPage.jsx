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
    <main className="min-h-screen bg-[#0F172A] text-white lg:grid lg:grid-cols-[0.94fr_1.06fr]">
      <section className="relative hidden overflow-hidden border-r border-[#1F2937] bg-[#0B1120] p-10 lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(79,70,229,0.22),transparent_34rem),radial-gradient(circle_at_80%_70%,rgba(124,58,237,0.16),transparent_28rem)]" />
        <Link to="/" className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-950/30">
            <Bug className="h-6 w-6" />
          </div>
          <div>
            <p className="text-lg font-semibold">BugSense AI</p>
            <p className="text-sm text-slate-400">Secure code intelligence</p>
          </div>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel relative rounded-lg p-6"
        >
          <div className="flex items-center justify-between border-b border-[#1F2937] pb-4">
            <div>
              <p className="text-sm font-semibold text-slate-400">Repository scan</p>
              <p className="mt-1 text-2xl font-semibold text-white">payments/api</p>
            </div>
            <span className="rounded-md border border-violet-400/35 bg-violet-500/10 px-2 py-1 text-xs font-bold uppercase text-violet-100">
              critical
            </span>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3">
            {[
              ['Issues', '18'],
              ['Security', '74'],
              ['Quality', '82'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-[#1F2937] bg-[#0F172A]/75 p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
                <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 space-y-3">
            {['Possible SQL injection', 'Sensitive data in logs', 'Weak password policy'].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-lg border border-[#1F2937] bg-[#0F172A]/70 p-3">
                <ShieldCheck className="h-4 w-4 text-indigo-200" />
                <p className="text-sm font-medium text-slate-200">{item}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="relative grid gap-3 text-sm text-slate-300">
          {['JWT sessions', 'Repository scanning', 'AI-ready remediation'].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-indigo-200" />
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
                <Bug className="h-5 w-5" />
              </div>
              <p className="text-lg font-semibold text-white">BugSense AI</p>
            </Link>
            <button
              type="button"
              onClick={toggleTheme}
              className="focus-ring ml-auto rounded-lg border border-[#1F2937] bg-[#111827] p-2 text-slate-300 hover:bg-indigo-500/10"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>

          <div className="surface-card p-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-normal text-white">Welcome back</h1>
              <p className="mt-2 text-sm text-slate-400">Sign in to continue scanning code.</p>
            </div>

            {error ? (
              <div className="mt-5 rounded-lg border border-violet-400/35 bg-violet-950/50 px-4 py-3 text-sm font-medium text-violet-100">
                {error}
              </div>
            ) : null}

            <form onSubmit={submit} className="mt-6 space-y-4">
              <label className="block">
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
                    value={form.password}
                    onChange={update}
                    required
                  />
                </span>
              </label>

              <div className="flex items-center justify-between gap-3 text-sm">
                <label className="inline-flex items-center gap-2 font-medium text-slate-300">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(event) => setRemember(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-700 bg-[#0F172A] text-indigo-600"
                  />
                  Remember me
                </label>
                <button type="button" className="font-semibold text-indigo-100 hover:text-white">
                  Reset password
                </button>
              </div>

              <button type="submit" disabled={submitting} className="primary-action w-full">
                {submitting ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-slate-400">
              New to BugSense?{' '}
              <Link className="font-semibold text-indigo-100 hover:text-white" to="/signup">
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
