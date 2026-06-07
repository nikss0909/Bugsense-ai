import { Building2, CalendarDays, KeyRound, Mail, MonitorSmartphone, Save, ShieldCheck, User } from 'lucide-react'
import { useState } from 'react'

import { useAuth } from '../context/AuthContext.jsx'
import { errorMessage, formatDate } from '../utils/format.js'

function initials(name) {
  return (name || 'BugSense')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

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
        <p className="text-sm font-semibold uppercase text-indigo-200">Account</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal text-white">Profile</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          Manage identity details used across reports, exports, comments, and team workflows.
        </p>
      </div>

      <section className="surface-card overflow-hidden">
        <div className="h-28 border-b border-[#1F2937] bg-gradient-to-r from-indigo-600/22 to-violet-600/16" />
        <div className="flex flex-col gap-5 px-5 pb-5 md:flex-row md:items-end md:justify-between">
          <div className="-mt-10 flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex h-24 w-24 items-center justify-center rounded-lg border border-indigo-400/35 bg-[#111827] text-3xl font-semibold text-indigo-100 shadow-2xl shadow-slate-950/35">
              {initials(user?.name)}
            </div>
            <div className="pb-1">
              <h2 className="text-2xl font-semibold text-white">{user?.name}</h2>
              <p className="mt-1 text-sm text-slate-400">{user?.email}</p>
            </div>
          </div>
          <div className="grid gap-2 text-sm text-slate-400 sm:grid-cols-3">
            <span className="rounded-lg border border-[#1F2937] bg-[#0F172A]/70 px-3 py-2">Role: Member</span>
            <span className="rounded-lg border border-[#1F2937] bg-[#0F172A]/70 px-3 py-2">Auth: JWT</span>
            <span className="rounded-lg border border-[#1F2937] bg-[#0F172A]/70 px-3 py-2">Exports: PDF</span>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <section className="surface-card p-5">
          <h2 className="text-lg font-semibold text-white">Profile details</h2>

          {message ? (
            <div className="mt-5 rounded-lg border border-indigo-400/35 bg-indigo-950/50 px-4 py-3 text-sm font-medium text-indigo-100">
              {message}
            </div>
          ) : null}

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
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  required
                />
              </span>
            </label>

            <label className="block md:col-span-2">
              <span className="text-sm font-semibold text-slate-200">Company</span>
              <span className="field-shell mt-2">
                <Building2 className="h-4 w-4 text-slate-500" />
                <input
                  className="w-full border-0 bg-transparent text-sm text-white outline-none"
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
            <h2 className="text-lg font-semibold text-white">Account settings</h2>
            <div className="mt-5 space-y-4 text-sm">
              {[
                [Mail, user?.email || 'No email'],
                [Building2, user?.company || 'No company'],
                [CalendarDays, formatDate(user?.createdAt)],
              ].map(([Icon, value]) => (
                <div key={value} className="flex gap-3 rounded-lg border border-[#1F2937] bg-[#0F172A]/70 p-3">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-indigo-200" />
                  <span className="break-words text-slate-300">{value}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="surface-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/12 text-indigo-100 ring-1 ring-indigo-400/25">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold text-white">Security section</h2>
                <p className="text-sm text-slate-400">Session and account posture</p>
              </div>
            </div>
            <div className="mt-5 grid gap-3">
              {[
                [KeyRound, 'Password protected', 'Credential auth enabled'],
                [MonitorSmartphone, 'Session tracked', 'Current device active'],
                [ShieldCheck, 'Report access scoped', 'Authenticated requests use JWT'],
              ].map(([Icon, label, detail]) => (
                <div key={label} className="flex items-center gap-3 rounded-lg border border-[#1F2937] bg-[#0F172A]/70 p-3">
                  <Icon className="h-4 w-4 text-indigo-200" />
                  <div>
                    <p className="text-sm font-semibold text-white">{label}</p>
                    <p className="text-xs text-slate-400">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}

export default ProfilePage
