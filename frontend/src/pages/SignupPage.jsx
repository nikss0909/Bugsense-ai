import { Bug, Building2, LockKeyhole, Mail, User } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { authErrorMessage } from '../utils/format.js'

function SignupPage() {
  const { signup } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', company: '' })
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
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-5xl overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm lg:grid lg:grid-cols-[0.9fr_1.1fr]">
        <section className="hidden bg-slate-950 p-8 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-400 text-slate-950">
              <Bug className="h-6 w-6" />
            </div>
            <p className="text-lg font-semibold">BugSense AI</p>
          </div>
          <div className="space-y-4">
            {[
              ['JWT Auth', 'Protected routes and encrypted credentials'],
              ['Gemini Review', 'Bug, severity, quality, fix, and test analysis'],
              ['Mongo Reports', 'Persistent history for every uploaded file'],
            ].map(([title, copy]) => (
              <div key={title} className="rounded-lg border border-white/10 bg-white/5 p-4">
                <p className="font-semibold">{title}</p>
                <p className="mt-1 text-sm text-slate-400">{copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="p-6 md:p-8">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-white">
              <Bug className="h-5 w-5" />
            </div>
            <p className="text-lg font-semibold text-slate-950">BugSense AI</p>
          </div>

          <div>
            <h1 className="text-2xl font-semibold tracking-normal text-slate-950">Create your account</h1>
            <p className="mt-2 text-sm text-slate-500">Start a secure QA workspace.</p>
          </div>

          {error ? (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          ) : null}

          <form onSubmit={submit} className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="block md:col-span-2">
              <span className="text-sm font-semibold text-slate-700">Name</span>
              <span className="mt-2 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-100">
                <User className="h-4 w-4 text-slate-400" />
                <input
                  className="w-full border-0 bg-transparent text-sm outline-none"
                  name="name"
                  value={form.name}
                  onChange={update}
                  required
                />
              </span>
            </label>

            <label className="block md:col-span-2">
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
                  minLength={8}
                  value={form.password}
                  onChange={update}
                  required
                />
              </span>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Company</span>
              <span className="mt-2 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-100">
                <Building2 className="h-4 w-4 text-slate-400" />
                <input
                  className="w-full border-0 bg-transparent text-sm outline-none"
                  name="company"
                  value={form.company}
                  onChange={update}
                />
              </span>
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="focus-ring inline-flex items-center justify-center rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 md:col-span-2"
            >
              {submitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link className="font-semibold text-teal-700 hover:text-teal-800" to="/login">
              Sign in
            </Link>
          </p>
        </section>
      </div>
    </main>
  )
}

export default SignupPage
