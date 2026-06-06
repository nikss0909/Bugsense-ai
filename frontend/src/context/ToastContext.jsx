import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'
import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const ToastContext = createContext(null)

const toneByType = {
  error: 'border-red-200 bg-red-50 text-red-800 dark:border-red-900/70 dark:bg-red-950 dark:text-red-200',
  success: 'border-teal-200 bg-teal-50 text-teal-800 dark:border-teal-900/70 dark:bg-teal-950 dark:text-teal-200',
  info: 'border-slate-200 bg-white text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100',
}

const iconByType = {
  error: AlertTriangle,
  success: CheckCircle2,
  info: Info,
}

function createToastId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random()}`
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(
    ({ title, message, type = 'error', duration = 4200 }) => {
      const id = createToastId()
      setToasts((current) => {
        const deduped = current.filter((toast) => toast.title !== title || toast.message !== message)
        return [...deduped, { id, title, message, type }].slice(-3)
      })
      window.setTimeout(() => dismissToast(id), duration)
    },
    [dismissToast],
  )

  const value = useMemo(() => ({ dismissToast, showToast }), [dismissToast, showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-50 grid w-[min(380px,calc(100vw-2rem))] gap-3" aria-live="polite">
        {toasts.map((toast) => {
          const Icon = iconByType[toast.type] || Info
          return (
            <div
              key={toast.id}
              className={`flex items-start gap-3 rounded-lg border p-4 shadow-lg ${toneByType[toast.type] || toneByType.info}`}
              role="status"
            >
              <Icon className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{toast.title}</p>
                <p className="mt-1 break-words text-sm leading-5 opacity-90">{toast.message}</p>
              </div>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="focus-ring rounded-md p-1 opacity-70 hover:bg-white/70 hover:opacity-100"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used inside ToastProvider')
  }
  return context
}
