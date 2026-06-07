import { Ban, BarChart3, Building2, FileSearch, Loader2, RotateCcw, ShieldCheck, Users } from 'lucide-react'
import { useEffect, useState } from 'react'

import { api } from '../api/client.js'
import StatCard from '../components/StatCard.jsx'

const users = [
  ['Nikhil Patil', 'Admin', 'Active', '12 scans'],
  ['Aarav Shah', 'Developer', 'Active', '7 scans'],
  ['Priya Rao', 'Tester', 'Invited', '0 scans'],
  ['Maya Iyer', 'Manager', 'Active', '19 scans'],
]

const projects = [
  ['payments/api', 'Repository', '82 health', '3 critical'],
  ['checkout-service.ts', 'File', '91 health', '0 critical'],
  ['identity-service', 'Repository', '74 health', '2 critical'],
]

function AdminPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let ignore = false
    api
      .get('/dashboard/stats')
      .then(({ data }) => {
        if (!ignore) {
          setStats(data)
        }
      })
      .catch(() => {
        if (!ignore) {
          setStats(null)
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false)
        }
      })
    return () => {
      ignore = true
    }
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase text-indigo-200">Admin</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950 dark:text-white">Admin control center</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
          Manage users, projects, organizations, reports, account actions, and system-level statistics.
        </p>
      </div>

      {loading ? (
        <div className="surface-card flex h-40 items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-indigo-200" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={Users} label="Users" value={users.length} detail="Workspace members" tone="blue" />
          <StatCard icon={Building2} label="Organizations" value="1" detail="Managed tenant" tone="indigo" />
          <StatCard icon={FileSearch} label="Reports" value={stats?.totalReports || 0} detail="Saved reports" tone="indigo" />
          <StatCard icon={BarChart3} label="Issues" value={stats?.totalFindings || 0} detail="Across reports" tone="violet" />
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <section className="surface-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">User management</h2>
            <button type="button" className="primary-action py-2">
              <Users className="h-4 w-4" />
              Invite user
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table min-w-[720px]">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Activity</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {users.map(([name, role, status, activity]) => (
                  <tr key={name}>
                    <td className="font-semibold text-slate-950 dark:text-white">{name}</td>
                    <td>{role}</td>
                    <td>{status}</td>
                    <td>{activity}</td>
                    <td>
                      <div className="flex justify-end gap-2">
                        <button type="button" className="focus-ring rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900" aria-label="Reset account">
                          <RotateCcw className="h-4 w-4" />
                        </button>
                        <button type="button" className="focus-ring rounded-lg border border-violet-400/35 p-2 text-violet-100 hover:bg-violet-500/10" aria-label="Ban user">
                          <Ban className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="surface-card p-5">
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Organization controls</h2>
          <div className="mt-5 space-y-3">
            {[
              ['Default role', 'Developer'],
              ['Issue workflow', 'Open - In Progress - Testing - Resolved - Closed'],
              ['Export formats', 'PDF, Excel, CSV, JSON'],
              ['Security policy', 'Critical findings require owner assignment'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                <p className="text-sm font-semibold text-slate-950 dark:text-white">{label}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{value}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="surface-card overflow-hidden">
        <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <ShieldCheck className="h-5 w-5 text-indigo-200" />
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Project administration</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table min-w-[820px]">
            <thead>
              <tr>
                <th>Project</th>
                <th>Type</th>
                <th>Health</th>
                <th>Risk</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(([project, type, health, risk]) => (
                <tr key={project}>
                  <td className="font-semibold text-slate-950 dark:text-white">{project}</td>
                  <td>{type}</td>
                  <td>{health}</td>
                  <td>{risk}</td>
                  <td>Monitored</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default AdminPage
