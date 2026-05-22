import { Building2, CalendarDays, Mail, Save, User } from 'lucide-react'
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
        <p className="text-sm font-semibold uppercase text-teal-700">Account</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">Profile</h1>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">Personal details</h2>

          {message ? (
            <div className="mt-5 rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-700">
              {message}
            </div>
          ) : null}

          {error ? (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          ) : null}

          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Name</span>
              <span className="mt-2 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-100">
                <User className="h-4 w-4 text-slate-400" />
                <input
                  className="w-full border-0 bg-transparent text-sm outline-none"
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
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
                  value={form.company}
                  onChange={(event) => setForm((current) => ({ ...current, company: event.target.value }))}
                />
              </span>
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="focus-ring inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {submitting ? 'Saving...' : 'Save profile'}
            </button>
          </form>
        </section>

        <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-teal-100 text-2xl font-semibold text-teal-800">
            {user?.name?.slice(0, 1)?.toUpperCase() || 'B'}
          </div>
          <h2 className="mt-5 text-xl font-semibold text-slate-950">{user?.name}</h2>
          <div className="mt-5 space-y-4 text-sm">
            <div className="flex gap-3">
              <Mail className="h-4 w-4 text-slate-400" />
              <span className="text-slate-600">{user?.email}</span>
            </div>
            <div className="flex gap-3">
              <Building2 className="h-4 w-4 text-slate-400" />
              <span className="text-slate-600">{user?.company || 'No company'}</span>
            </div>
            <div className="flex gap-3">
              <CalendarDays className="h-4 w-4 text-slate-400" />
              <span className="text-slate-600">{formatDate(user?.createdAt)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default ProfilePage
