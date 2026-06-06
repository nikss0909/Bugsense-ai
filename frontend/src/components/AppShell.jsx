import { AnimatePresence, motion } from 'framer-motion'
import {
  BarChart3,
  Bell,
  Bug,
  ChevronDown,
  FileSearch,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  ShieldCheck,
  Sun,
  UploadCloud,
  User,
  Users,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'

import { useAuth } from '../context/AuthContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import AiAssistant from './AiAssistant.jsx'

const navGroups = [
  {
    label: 'Workspace',
    items: [
      { to: '/app/dashboard', label: 'Dashboard', icon: BarChart3 },
      { to: '/app/upload', label: 'Analyze', icon: UploadCloud },
      { to: '/app/reports', label: 'Reports', icon: FileSearch },
    ],
  },
  {
    label: 'Enterprise',
    items: [
      { to: '/app/settings', label: 'Settings', icon: Settings },
      { to: '/app/admin', label: 'Admin', icon: Users },
    ],
  },
]

function initials(name) {
  return (name || 'BugSense')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function pageTitle(pathname) {
  if (pathname.includes('/upload')) return 'Analyze'
  if (pathname.includes('/reports/')) return 'Report details'
  if (pathname.includes('/reports')) return 'Reports'
  if (pathname.includes('/settings')) return 'Settings'
  if (pathname.includes('/admin')) return 'Admin'
  if (pathname.includes('/profile')) return 'Profile'
  return 'Dashboard'
}

function AppShell() {
  const { logout, user } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const title = useMemo(() => pageTitle(location.pathname), [location.pathname])

  const sidebar = (
    <aside className="flex h-full w-72 flex-col border-r border-slate-200 bg-white px-4 py-5 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-white dark:bg-cyan-400 dark:text-slate-950">
          <Bug className="h-5 w-5" />
        </div>
        <div>
          <p className="text-base font-semibold text-slate-950 dark:text-white">BugSense AI</p>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Code security SaaS</p>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/70">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-950 dark:text-white">Enterprise guard</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">7 scanners active</p>
            </div>
          </div>
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
        </div>
      </div>

      <nav className="mt-7 space-y-7">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-3 text-xs font-semibold uppercase text-slate-400 dark:text-slate-500">{group.label}</p>
            <div className="mt-2 space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                      isActive
                        ? 'bg-slate-950 text-white shadow-sm dark:bg-cyan-400 dark:text-slate-950'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white'
                    }`
                  }
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-auto rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-100 text-sm font-bold text-cyan-700 dark:bg-cyan-400 dark:text-slate-950">
            {initials(user?.name)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{user?.name}</p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={logout}
          className="secondary-action mt-4 w-full py-2"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  )

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950 dark:bg-slate-950 dark:text-slate-100 lg:flex">
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:block">{sidebar}</div>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden"
          >
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="h-full w-72 max-w-[86vw] bg-white shadow-xl dark:bg-slate-950"
            >
              {sidebar}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <main className="min-h-screen flex-1 lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/88 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/82">
          <div className="flex h-16 items-center justify-between gap-3 px-4 md:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen((open) => !open)}
                className="focus-ring rounded-lg border border-slate-200 p-2 text-slate-700 dark:border-slate-800 dark:text-slate-300 lg:hidden"
                aria-label="Toggle navigation"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">BugSense AI</p>
                <h1 className="text-lg font-semibold text-slate-950 dark:text-white">{title}</h1>
              </div>
            </div>

            <label className="hidden w-full max-w-md items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-100 dark:border-slate-800 dark:bg-slate-900 dark:focus-within:ring-cyan-950 md:flex">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                className="w-full border-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-200"
                placeholder="Search scans, files, issues"
              />
            </label>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleTheme}
                className="focus-ring rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <button
                type="button"
                className="focus-ring relative rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500" />
              </button>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileOpen((open) => !open)}
                  className="focus-ring flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-cyan-100 text-xs font-bold text-cyan-700 dark:bg-cyan-400 dark:text-slate-950">
                    {initials(user?.name)}
                  </span>
                  <ChevronDown className="hidden h-4 w-4 md:block" />
                </button>

                <AnimatePresence>
                  {profileOpen ? (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute right-0 mt-2 w-56 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900"
                    >
                      <NavLink
                        to="/app/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        <User className="h-4 w-4" />
                        Profile
                      </NavLink>
                      <NavLink
                        to="/app/settings"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        <ShieldCheck className="h-4 w-4" />
                        Security
                      </NavLink>
                      <button
                        type="button"
                        onClick={logout}
                        className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto w-full max-w-[1500px] px-4 py-6 md:px-8 lg:py-8">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
          >
            <Outlet />
          </motion.div>
        </div>
      </main>

      <AiAssistant />
      <div className="pointer-events-none fixed bottom-0 left-72 right-0 hidden h-px bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent dark:via-cyan-400/30 lg:block" />
    </div>
  )
}

export default AppShell
