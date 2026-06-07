import { AnimatePresence, motion } from 'framer-motion'
import { Bot, Send, Sparkles, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'

const starterMessages = [
  {
    from: 'assistant',
    text: 'Ask me to explain an issue, suggest a fix, improve security, generate tests, or summarize the current report.',
  },
]

function answerFor(prompt, pathname) {
  const text = prompt.toLowerCase()
  if (text.includes('test')) {
    return 'Generate unit tests for the exact failing branch, add integration coverage for the data boundary, and include one negative case for unsafe input. For security issues, add a regression test that proves the payload is rejected or safely encoded.'
  }
  if (text.includes('security') || text.includes('xss') || text.includes('sql') || text.includes('secret')) {
    return 'Prioritize critical security findings first. Use parameterized queries, encode untrusted output, keep CSRF protection enabled, remove secrets from source and logs, and rotate any credential that may have been committed.'
  }
  if (text.includes('fix') || text.includes('improve')) {
    return 'Start with the highest severity issue, isolate the risky code path, replace it with a framework-safe API, and add a small regression test. Keep the patch narrow so the report score change is easy to verify.'
  }
  if (text.includes('file') || text.includes('complexity')) {
    return 'Use the File Insights panel to find high complexity, many imports, and low maintainability. Good first moves are extracting long functions, simplifying nested branches, and deleting unused dependencies.'
  }
  if (pathname.includes('/reports/')) {
    return 'This report is organized around Overview, Issues, Security, Metrics, AI Recommendations, Test Cases, and History. Use the Security and Metrics tabs to choose what gets fixed first.'
  }
  return 'BugSense can scan files or public GitHub repositories, score quality and security, explain issues in simple language, and turn findings into fixes, tests, and exportable reports.'
}

function AiAssistant() {
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState(starterMessages)

  const quickPrompts = useMemo(
    () => ['Explain this issue', 'Generate fix', 'Improve security'],
    [],
  )

  const submit = (event, quickPrompt) => {
    event?.preventDefault()
    const prompt = (quickPrompt || input).trim()
    if (!prompt) return
    setMessages((current) => [
      ...current,
      { from: 'user', text: prompt },
      { from: 'assistant', text: answerFor(prompt, location.pathname) },
    ].slice(-8))
    setInput('')
    setOpen(true)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="focus-ring fixed bottom-5 right-5 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-xl shadow-indigo-950/30 hover:from-indigo-400 hover:to-violet-500"
        aria-label="Open AI assistant"
      >
        {open ? <X className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
      </button>

      <AnimatePresence>
        {open ? (
          <motion.aside
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="fixed bottom-20 right-4 z-40 w-[min(420px,calc(100vw-2rem))] overflow-hidden rounded-lg border border-[#1F2937] bg-[#111827] shadow-2xl shadow-slate-950/40"
          >
            <div className="flex items-center justify-between border-b border-[#1F2937] px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-100 ring-1 ring-indigo-400/30">
                  <Sparkles className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">AI assistant</p>
                  <p className="text-xs text-slate-400">Contextual guidance</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="focus-ring rounded-lg p-2 text-slate-400 hover:bg-indigo-500/10 hover:text-white"
                aria-label="Close AI assistant"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-80 space-y-3 overflow-y-auto p-4">
              {messages.map((message, index) => (
                <div
                  key={`${message.from}-${index}`}
                  className={`rounded-lg px-3 py-2 text-sm leading-6 ${
                    message.from === 'user'
                      ? 'ml-8 bg-gradient-to-r from-indigo-600 to-violet-600 text-white'
                      : 'mr-8 bg-[#0F172A] text-slate-200'
                  }`}
                >
                  {message.text}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 border-t border-[#1F2937] px-4 py-3">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={(event) => submit(event, prompt)}
                  className="focus-ring rounded-md border border-[#1F2937] px-2 py-1 text-xs font-semibold text-slate-300 hover:bg-indigo-500/10 hover:text-white"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <form onSubmit={submit} className="flex gap-2 border-t border-[#1F2937] p-3">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                className="min-w-0 flex-1 rounded-lg border border-[#1F2937] bg-[#0F172A] px-3 py-2 text-sm text-white outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
                placeholder="Ask BugSense AI"
              />
              <button type="submit" className="focus-ring rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 p-2 text-white" aria-label="Send message">
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </>
  )
}

export default AiAssistant
