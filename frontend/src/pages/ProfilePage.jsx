import { Building2, CalendarDays, Mail, Save, ShieldCheck, User } from 'lucide-react'
import { useState } from 'react'

import { useAuth } from '../context/AuthContext.jsx'
import { errorMessage, formatDate } from '../utils/format.js'

function ProfilePage() {
  const { updateProfile, user } = useAuth()
  const [form, setForm] = useState(() => ({ name: user?.name || '', company: user?.company || '' }))
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setMessage('')
    setError('')
    try {
      await updateProfile(form)
      setMessage('Profile updated.')
    } catch (caught) {
      setError(errorMessage(caught))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase text-cyan-700 dark:text-cyan-300">Account</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950 dark:text-white">Profile</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
          Manage identity details used across reports, exports, comments, and team workflows.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <section className="surface-card p-5">
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Personal details</h2>

          {message ? (
            <div className="mt-5 rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-700 dark:border-teal-900/70 dark:bg-teal-950/45 dark:text-teal-200">
              {message}
            </div>
          ) : null}

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
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  required
                />
              </span>
            </label>

            <label className="block md:col-span-2">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Company</span>
              <span className="field-shell mt-2">
                <Building2 className="h-4 w-4 text-slate-400" />
                <input
                  className="w-full border-0 bg-transparent text-sm outline-none dark:text-white"
                  value={form.company}
                  onChange={(event) => setForm((current) => ({ ...current, company: event.target.value }))}
                />
              </span>
            </label>

            <button type="submit" disabled={submitting} className="primary-action md:col-span-2 md:w-fit">
              <Save className="h-4 w-4" />
              {submitting ? 'Saving...' : 'Save profile'}
            </button>
          </form>
        </section>

        <aside className="space-y-4">
          <section className="surface-card p-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-cyan-100 text-2xl font-semibold text-cyan-800 dark:bg-cyan-400 dark:text-slate-950">
              {user?.name?.slice(0, 1)?.toUpperCase() || 'B'}
            </div>
            <h2 className="mt-5 text-xl font-semibold text-slate-950 dark:text-white">{user?.name}</h2>
            <div className="mt-5 space-y-4 text-sm">
              {[
                [Mail, user?.email],
                [Building2, user?.company || 'No company'],
                [CalendarDays, formatDate(user?.createdAt)],
              ].map(([Icon, value]) => (
                <div key={value} className="flex gap-3">
                  <Icon className="h-4 w-4 text-slate-400" />
                  <span className="break-words text-slate-600 dark:text-slate-300">{value}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="surface-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-950 dark:text-white">Security posture</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">2FA ready, sessions tracked</p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}

export default ProfilePage
