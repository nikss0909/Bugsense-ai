import {
  Bell,
  Building2,
  CheckCircle2,
  KeyRound,
  Link2,
  LockKeyhole,
  Mail,
  MonitorSmartphone,
  Save,
  ShieldCheck,
  SunMoon,
  User,
} from 'lucide-react'
import { useState } from 'react'

import { useAuth } from '../context/AuthContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { errorMessage } from '../utils/format.js'

const sections = [
  ['profile', User, 'Profile'],
  ['security', ShieldCheck, 'Security'],
  ['notifications', Bell, 'Notifications'],
  ['theme', SunMoon, 'Theme'],
  ['api', KeyRound, 'API Keys'],
  ['accounts', Link2, 'Connected Accounts'],
]

function Toggle({ checked, onChange, label, detail }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4 text-left transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/60 dark:hover:bg-slate-900"
    >
      <span>
        <span className="block text-sm font-semibold text-slate-950 dark:text-white">{label}</span>
        <span className="mt-1 block text-sm text-slate-500 dark:text-slate-400">{detail}</span>
      </span>
      <span className={`flex h-6 w-11 shrink-0 items-center rounded-full p-1 transition ${checked ? 'bg-cyan-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
        <span className={`h-4 w-4 rounded-full bg-white transition ${checked ? 'translate-x-5' : ''}`} />
      </span>
    </button>
  )
}

function SettingsPage() {
  const { updateProfile, user } = useAuth()
  const { setTheme, theme } = useTheme()
  const [active, setActive] = useState('profile')
  const [form, setForm] = useState(() => ({ name: user?.name || '', company: user?.company || '' }))
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [settings, setSettings] = useState({
    twoFactor: true,
    loginAlerts: true,
    scanComplete: true,
    criticalIssue: true,
    weeklyDigest: false,
    comments: true,
  })

  const updateToggle = (key) => (value) => setSettings((current) => ({ ...current, [key]: value }))

  const submitProfile = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setMessage('')
    setError('')
    try {
      await updateProfile(form)
      setMessage('Profile settings saved.')
    } catch (caught) {
      setError(errorMessage(caught))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase text-cyan-700 dark:text-cyan-300">Settings</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950 dark:text-white">Workspace settings</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
          Configure profile, security, notifications, theme, API access, and connected accounts.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
        <aside className="surface-card p-2">
          {sections.map(([value, Icon, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setActive(value)}
              className={`focus-ring flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition ${
                active === value
                  ? 'bg-slate-950 text-white dark:bg-cyan-400 dark:text-slate-950'
                  : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </aside>

        <section className="surface-card p-5">
          {active === 'profile' ? (
            <div>
              <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Profile</h2>
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
              <form onSubmit={submitProfile} className="mt-6 grid gap-4 md:grid-cols-2">
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
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Email</span>
                  <span className="field-shell mt-2 opacity-75">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <input className="w-full border-0 bg-transparent text-sm outline-none dark:text-white" value={user?.email || ''} disabled />
                  </span>
                </label>
                <label className="block">
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
                  {submitting ? 'Saving...' : 'Save changes'}
                </button>
              </form>
            </div>
          ) : null}

          {active === 'security' ? (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Security dashboard</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Active sessions, login history, and account controls.</p>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {[
                  ['Active sessions', 2],
                  ['Failed attempts', 0],
                  ['Security alerts', 1],
                ].map(([label, value]) => (
                  <div key={label} className="muted-card p-4">
                    <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
                    <p className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">{value}</p>
                  </div>
                ))}
              </div>
              <div className="grid gap-3">
                <Toggle checked={settings.twoFactor} onChange={updateToggle('twoFactor')} label="Two-factor authentication" detail="Authenticator app and OTP verification are enabled in this workspace model." />
                <Toggle checked={settings.loginAlerts} onChange={updateToggle('loginAlerts')} label="Login alerts" detail="Notify on new device, suspicious attempt, or account lock event." />
              </div>
              <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
                <table className="data-table min-w-[720px]">
                  <thead>
                    <tr>
                      <th>Device</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Last active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Chrome on Windows', 'India', 'Current', 'Now'],
                      ['Edge on Windows', 'India', 'Verified', '2 days ago'],
                      ['Mobile browser', 'India', 'Signed out', 'Last week'],
                    ].map(([device, location, status, activeAt]) => (
                      <tr key={device}>
                        <td>
                          <div className="flex items-center gap-2">
                            <MonitorSmartphone className="h-4 w-4 text-slate-400" />
                            {device}
                          </div>
                        </td>
                        <td>{location}</td>
                        <td>{status}</td>
                        <td>{activeAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {active === 'notifications' ? (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Notifications</h2>
              <div className="grid gap-3">
                <Toggle checked={settings.scanComplete} onChange={updateToggle('scanComplete')} label="Scan completed" detail="Notify when file or repository analysis finishes." />
                <Toggle checked={settings.criticalIssue} onChange={updateToggle('criticalIssue')} label="Critical issue found" detail="Notify immediately when a high-risk security issue is detected." />
                <Toggle checked={settings.comments} onChange={updateToggle('comments')} label="Mentions and comments" detail="Notify when teammates assign issues, comment, or mention you." />
                <Toggle checked={settings.weeklyDigest} onChange={updateToggle('weeklyDigest')} label="Weekly digest" detail="Summarize quality trends, scan history, and technical debt." />
              </div>
            </div>
          ) : null}

          {active === 'theme' ? (
            <div>
              <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Theme</h2>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {['light', 'dark'].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setTheme(option)}
                    className={`focus-ring rounded-lg border p-4 text-left ${
                      theme === option
                        ? 'border-cyan-400 bg-cyan-50 dark:bg-cyan-950/35'
                        : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/60 dark:hover:bg-slate-900'
                    }`}
                  >
                    <p className="font-semibold capitalize text-slate-950 dark:text-white">{option}</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{option === 'light' ? 'Bright workspace UI' : 'Low-glare security console'}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {active === 'api' ? (
            <div className="space-y-5">
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                <div>
                  <h2 className="text-lg font-semibold text-slate-950 dark:text-white">API keys</h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage automation credentials for CI scans and exports.</p>
                </div>
                <button type="button" className="primary-action">
                  <KeyRound className="h-4 w-4" />
                  New key
                </button>
              </div>
              <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
                <table className="data-table min-w-[720px]">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Scope</th>
                      <th>Last used</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['CI scanner', 'reports:write', 'Today', 'Active'],
                      ['Export worker', 'reports:read', 'Never', 'Draft'],
                    ].map(([name, scope, lastUsed, status]) => (
                      <tr key={name}>
                        <td className="font-semibold text-slate-950 dark:text-white">{name}</td>
                        <td>{scope}</td>
                        <td>{lastUsed}</td>
                        <td>{status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {active === 'accounts' ? (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Connected accounts</h2>
              {[
                ['GitHub', 'Repository scanning and organization imports', true],
                ['Google Authenticator', 'Time-based OTP for sign in', true],
                ['Slack', 'Security alerts and team mentions', false],
              ].map(([name, detail, connected]) => (
                <div key={name} className="flex flex-col justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950/60 md:flex-row md:items-center">
                  <div>
                    <p className="font-semibold text-slate-950 dark:text-white">{name}</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{detail}</p>
                  </div>
                  <span className={`inline-flex w-fit items-center gap-2 rounded-md px-2 py-1 text-xs font-semibold ${connected ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
                    {connected ? <CheckCircle2 className="h-3.5 w-3.5" /> : <LockKeyhole className="h-3.5 w-3.5" />}
                    {connected ? 'Connected' : 'Available'}
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  )
}

export default SettingsPage
