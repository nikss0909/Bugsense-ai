export const severityOrder = ['critical', 'high', 'medium', 'low']

export const severityColors = {
  critical: '#7C3AED',
  high: '#4F46E5',
  medium: '#6366F1',
  low: '#60A5FA',
}

export const severityBadgeClasses = {
  critical: 'border-violet-400/45 bg-violet-500/15 text-violet-100 shadow-violet-950/20',
  high: 'border-indigo-400/45 bg-indigo-500/15 text-indigo-100 shadow-indigo-950/20',
  medium: 'border-blue-400/40 bg-blue-500/12 text-blue-100 shadow-blue-950/20',
  low: 'border-slate-500/45 bg-slate-700/45 text-slate-100 shadow-slate-950/20',
}

export function formatDate(value) {
  if (!value) {
    return 'Not available'
  }
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function formatBytes(bytes = 0) {
  if (!bytes) {
    return '0 B'
  }
  const units = ['B', 'KB', 'MB']
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / 1024 ** index
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`
}

export function errorMessage(error) {
  if (!error) {
    return 'Something went wrong.'
  }
  if (error.errors) {
    return Object.values(error.errors)[0]
  }
  return error.message || 'Something went wrong.'
}

export function authErrorMessage(error, mode) {
  if (error?.status === 409) {
    return 'An account with this email already exists.'
  }
  if (error?.status === 401) {
    return 'Invalid email or password.'
  }
  if (error?.status === 0 || error?.status === 503) {
    return 'Server unavailable. Check that the backend and database are running.'
  }
  if (mode === 'signup' && error?.message?.toLowerCase().includes('already exists')) {
    return 'An account with this email already exists.'
  }
  return errorMessage(error)
}
