import { motion } from 'framer-motion'
import {
  ArrowRight,
  Bug,
  Code2,
  Download,
  FileSearch,
  FlaskConical,
  Gauge,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { Link } from 'react-router-dom'

const features = [
  ['Severity analysis', ShieldCheck, 'Prioritize critical, high, medium, and low findings with consistent scoring.'],
  ['Fix recommendations', Sparkles, 'Turn every finding into a clear remediation path your team can ship.'],
  ['Test generation', FlaskConical, 'Create targeted regression tests from the issues BugSense detects.'],
]

const stats = [
  ['2.4s', 'Average file scan'],
  ['4', 'Severity levels'],
  ['100', 'Quality score scale'],
  ['PDF', 'Export-ready reports'],
]

function PreviewRow({ severity, file, score, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-b border-[#1F2937] px-4 py-3 text-sm last:border-0"
    >
      <div className="min-w-0">
        <p className="truncate font-semibold text-white">{file}</p>
        <p className="mt-1 text-xs text-slate-400">Static + AI analysis</p>
      </div>
      <span className="rounded-md border border-indigo-400/35 bg-indigo-500/10 px-2 py-1 text-xs font-semibold uppercase text-indigo-100">
        {severity}
      </span>
      <span className="font-semibold text-violet-100">{score}</span>
    </motion.div>
  )
}

function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#0F172A] text-[#F8FAFC]">
      <header className="fixed inset-x-0 top-0 z-30 border-b border-white/8 bg-[#0F172A]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 md:px-6">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-950/30">
              <Bug className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-white">BugSense AI</span>
              <span className="block text-xs text-slate-400">Code quality intelligence</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-300 md:flex">
            <a className="transition hover:text-white" href="#features">Features</a>
            <a className="transition hover:text-white" href="#preview">Preview</a>
            <a className="transition hover:text-white" href="#stats">Stats</a>
          </nav>

          <div className="flex items-center gap-2">
            <Link className="secondary-action hidden px-3 py-2 sm:inline-flex" to="/login">
              Sign in
            </Link>
            <Link className="primary-action px-3 py-2" to="/signup">
              Start scanning
            </Link>
          </div>
        </div>
      </header>

      <section className="relative min-h-[88vh] px-4 pb-16 pt-28 md:px-6 md:pt-32">
        <div className="absolute inset-0">
          <div className="absolute left-1/2 top-24 h-[34rem] w-[70rem] -translate-x-1/2 rounded-full bg-indigo-600/10 blur-3xl" />
          <div className="absolute inset-x-4 bottom-6 top-20 mx-auto max-w-6xl rounded-[2rem] border border-indigo-400/10 bg-[linear-gradient(135deg,rgba(79,70,229,0.16),rgba(124,58,237,0.08)_42%,rgba(15,23,42,0.12))] opacity-80" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0F172A] to-transparent" />
        </div>

        <div className="relative mx-auto grid w-full max-w-7xl gap-12">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mx-auto max-w-4xl text-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase text-indigo-100">
              <LockKeyhole className="h-3.5 w-3.5" />
              Secure static analysis workspace
            </span>
            <h1 className="mt-6 text-4xl font-semibold tracking-normal text-white sm:text-5xl lg:text-6xl">
              AI-Powered Bug Detection & Code Quality Analysis
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
              Upload source code and receive bug findings, severity analysis, test cases, and fix recommendations within seconds.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link className="primary-action" to="/signup">
                Analyze code
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link className="secondary-action" to="/login">
                View workspace
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mx-auto w-full max-w-5xl overflow-hidden rounded-lg border border-[#1F2937] bg-[#111827]/90 shadow-[0_32px_100px_rgba(15,23,42,0.55)] backdrop-blur"
            aria-label="BugSense product preview"
          >
            <div className="flex items-center justify-between border-b border-[#1F2937] px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-indigo-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-violet-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-blue-400" />
              </div>
              <span className="text-xs font-semibold text-slate-400">bugsense.ai/report</span>
            </div>
            <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="border-b border-[#1F2937] p-5 lg:border-b-0 lg:border-r">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-400">Repository scan</p>
                    <p className="mt-1 text-2xl font-semibold text-white">checkout-service</p>
                  </div>
                  <span className="rounded-md border border-violet-400/35 bg-violet-500/10 px-2 py-1 text-xs font-semibold uppercase text-violet-100">
                    critical
                  </span>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {[
                    [FileSearch, 'Files', '128'],
                    [Gauge, 'Quality', '91'],
                    [Download, 'Exports', 'PDF'],
                  ].map(([Icon, label, value]) => (
                    <div key={label} className="rounded-lg border border-[#1F2937] bg-[#0F172A]/80 p-4">
                      <Icon className="h-4 w-4 text-indigo-200" />
                      <p className="mt-4 text-xs font-semibold uppercase text-slate-500">{label}</p>
                      <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-5 rounded-lg border border-[#1F2937] bg-[#0F172A]/70">
                  <PreviewRow delay={0.15} file="src/auth/session.js" score="42" severity="critical" />
                  <PreviewRow delay={0.22} file="src/payments/retry.ts" score="78" severity="high" />
                  <PreviewRow delay={0.29} file="src/api/report.java" score="88" severity="medium" />
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2">
                  <Code2 className="h-5 w-5 text-violet-200" />
                  <h2 className="text-lg font-semibold text-white">Suggested fix</h2>
                </div>
                <div className="mt-5 rounded-lg border border-[#1F2937] bg-[#0B1120] p-4 font-mono text-xs leading-6 text-slate-300">
                  <p><span className="text-blue-200">const</span> query = db.prepare(sql)</p>
                  <p><span className="text-blue-200">return</span> query.bind(params).first()</p>
                  <p className="mt-4 text-violet-200">// Add regression coverage for unsafe input</p>
                </div>
                <div className="mt-5 space-y-3">
                  {['Parameterized database access', 'Regression test generated', 'PDF report ready'].map((item) => (
                    <div key={item} className="flex items-center gap-3 rounded-lg border border-[#1F2937] bg-[#0F172A]/70 p-3">
                      <ShieldCheck className="h-4 w-4 text-indigo-200" />
                      <span className="text-sm font-medium text-slate-200">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="features" className="relative px-4 py-14 md:px-6">
        <div className="mx-auto grid w-full max-w-7xl gap-4 md:grid-cols-3">
          {features.map(([title, Icon, copy]) => (
            <article key={title} className="rounded-lg border border-[#1F2937] bg-[#111827]/82 p-5 shadow-lg shadow-slate-950/20 transition hover:-translate-y-1 hover:border-indigo-500/60">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-500/12 text-indigo-100 ring-1 ring-indigo-400/25">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-5 text-lg font-semibold text-white">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="preview" className="px-4 py-14 md:px-6">
        <div className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase text-indigo-200">Product preview</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">From upload to audit-ready report in one flow.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-400">
              BugSense organizes findings, severity, source context, test cases, and PDF export into a focused workspace for engineering teams.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {['Upload source', 'Detect language', 'Rank findings', 'Export PDF'].map((item, index) => (
              <div key={item} className="rounded-lg border border-[#1F2937] bg-[#111827] p-4">
                <span className="text-xs font-semibold text-violet-200">0{index + 1}</span>
                <p className="mt-3 font-semibold text-white">{item}</p>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" style={{ width: `${58 + index * 11}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="stats" className="px-4 py-14 md:px-6">
        <div className="mx-auto grid w-full max-w-7xl gap-4 rounded-lg border border-[#1F2937] bg-[#111827]/82 p-5 md:grid-cols-4">
          {stats.map(([value, label]) => (
            <div key={label} className="border-[#1F2937] py-3 md:border-r md:last:border-r-0">
              <p className="text-3xl font-semibold text-white">{value}</p>
              <p className="mt-2 text-sm text-slate-400">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-[#1F2937] px-4 py-8 md:px-6">
        <div className="mx-auto flex w-full max-w-7xl flex-col justify-between gap-4 text-sm text-slate-400 md:flex-row md:items-center">
          <p>BugSense AI</p>
          <div className="flex gap-5">
            <Link className="transition hover:text-white" to="/login">Login</Link>
            <Link className="transition hover:text-white" to="/signup">Signup</Link>
            <a className="transition hover:text-white" href="#features">Features</a>
          </div>
        </div>
      </footer>
    </main>
  )
}

export default LandingPage
