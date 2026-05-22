import {
  BarChart3,
  Bug,
  FileSearch,
  LogOut,
  Menu,
  ShieldCheck,
  UploadCloud,
  User,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'

import { useAuth } from '../context/AuthContext.jsx'

const navItems = [
  { to: '/app/dashboard', label: 'Dashboard', icon: BarChart3 },
  { to: '/app/upload', label: 'Analyze', icon: UploadCloud },
  { to: '/app/reports', label: 'Reports', icon: FileSearch },
  { to: '/app/profile', label: 'Profile', icon: User },
]

function AppShell() {
  const { logout, user } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const sidebar = (
    <aside className="flex h-full w-72 flex-col border-r border-slate-200 bg-white px-4 py-5">
      <div className="flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-white">
          <Bug className="h-5 w-5" />
        </div>
        <div>
          <p className="text-base font-semibold text-slate-950">BugSense AI</p>
          <p className="text-xs font-medium text-slate-500">QA intelligence</p>
        </div>
      </div>

      <nav className="mt-8 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                isActive
                  ? 'bg-slate-950 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
              }`
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-100 text-teal-800">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">{user?.name}</p>
            <p className="truncate text-xs text-slate-500">{user?.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={logout}
          className="focus-ring mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  )

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-950 lg:flex">
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:block">{sidebar}</div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden">
          <div className="h-full w-72 max-w-[86vw] bg-white shadow-xl">{sidebar}</div>
        </div>
      ) : null}

      <main className="min-h-screen flex-1 lg:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur md:px-8 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="focus-ring rounded-lg border border-slate-200 p-2 text-slate-700"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <p className="font-semibold text-slate-950">BugSense AI</p>
          <div className="h-9 w-9 rounded-lg bg-teal-100" />
        </header>

        <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 lg:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default AppShell
