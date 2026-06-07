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
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'

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
    label: 'Administration',
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
  if (pathname.includes('/reports/')) return 'Security report'
  if (pathname.includes('/reports')) return 'Analysis history'
  if (pathname.includes('/settings')) return 'Settings'
  if (pathname.includes('/admin')) return 'Admin'
  if (pathname.includes('/profile')) return 'Profile'
  return 'Dashboard'
}

function AppShell() {
  const { logout, user } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [quickSearch, setQuickSearch] = useState('')

  const title = useMemo(() => pageTitle(location.pathname), [location.pathname])

  const submitQuickSearch = (event) => {
    event.preventDefault()
    const query = quickSearch.trim()
    navigate(query ? `/app/reports?q=${encodeURIComponent(query)}` : '/app/reports')
  }

  const sidebar = (
    <aside className="flex h-full w-72 flex-col border-r border-[#1F2937] bg-[#0B1120]/96 px-4 py-5 shadow-2xl shadow-slate-950/30">
      <div className="flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-950/30">
          <Bug className="h-5 w-5" />
        </div>
        <div>
          <p className="text-base font-semibold text-white">BugSense AI</p>
          <p className="text-xs font-medium text-slate-400">Security analysis SaaS</p>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-indigo-400/20 bg-indigo-500/8 p-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/14 text-indigo-100 ring-1 ring-indigo-400/25">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white">Enterprise guard</p>
            <p className="text-xs text-slate-400">7 scanners active</p>
          </div>
          <span className="ml-auto h-2.5 w-2.5 rounded-full bg-violet-400 shadow-[0_0_16px_rgba(124,58,237,0.75)]" />
        </div>
      </div>

      <nav className="mt-7 space-y-7">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-3 text-xs font-semibold uppercase text-slate-500">{group.label}</p>
            <div className="mt-2 space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-950/25'
                        : 'text-slate-400 hover:bg-indigo-500/10 hover:text-white'
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

      <div className="mt-auto rounded-lg border border-[#1F2937] bg-[#111827]/90 p-4 shadow-lg shadow-slate-950/20">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/15 text-sm font-bold text-indigo-100 ring-1 ring-indigo-400/30">
            {initials(user?.name)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{user?.name}</p>
            <p className="truncate text-xs text-slate-400">{user?.email}</p>
          </div>
        </div>
        <button type="button" onClick={logout} className="secondary-action mt-4 w-full py-2">
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  )

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 lg:flex">
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:block">{sidebar}</div>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden"
          >
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="h-full w-72 max-w-[86vw]"
            >
              {sidebar}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <main className="min-h-screen flex-1 lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-[#1F2937] bg-[#0F172A]/86 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between gap-3 px-4 md:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen((open) => !open)}
                className="focus-ring rounded-lg border border-[#1F2937] p-2 text-slate-300 hover:bg-indigo-500/10 lg:hidden"
                aria-label="Toggle navigation"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              <div>
                <p className="text-sm text-slate-400">BugSense AI</p>
                <h1 className="text-lg font-semibold text-white">{title}</h1>
              </div>
            </div>

            <form
              onSubmit={submitQuickSearch}
              className="hidden w-full max-w-md items-center gap-2 rounded-lg border border-[#1F2937] bg-[#111827]/80 px-3 py-2 transition focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-500/20 md:flex"
            >
              <Search className="h-4 w-4 text-slate-500" />
              <input
                className="w-full border-0 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
                placeholder="Search reports instantly"
                value={quickSearch}
                onChange={(event) => setQuickSearch(event.target.value)}
              />
            </form>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleTheme}
                className="focus-ring rounded-lg border border-[#1F2937] p-2 text-slate-300 transition hover:bg-indigo-500/10"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <button
                type="button"
                className="focus-ring relative rounded-lg border border-[#1F2937] p-2 text-slate-300 transition hover:bg-indigo-500/10"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-violet-400" />
              </button>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileOpen((open) => !open)}
                  className="focus-ring flex items-center gap-2 rounded-lg border border-[#1F2937] bg-[#111827]/90 px-2 py-1.5 text-sm font-semibold text-slate-200 transition hover:bg-indigo-500/10"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-500/15 text-xs font-bold text-indigo-100 ring-1 ring-indigo-400/30">
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
                      className="absolute right-0 mt-2 w-56 overflow-hidden rounded-lg border border-[#1F2937] bg-[#111827] shadow-2xl shadow-slate-950/40"
                    >
                      <NavLink
                        to="/app/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-indigo-500/10"
                      >
                        <User className="h-4 w-4" />
                        Profile
                      </NavLink>
                      <NavLink
                        to="/app/settings"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-indigo-500/10"
                      >
                        <ShieldCheck className="h-4 w-4" />
                        Security
                      </NavLink>
                      <button
                        type="button"
                        onClick={logout}
                        className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-semibold text-violet-100 hover:bg-violet-500/10"
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
      <div className="pointer-events-none fixed bottom-0 left-72 right-0 hidden h-px bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent lg:block" />
    </div>
  )
}

export default AppShell
