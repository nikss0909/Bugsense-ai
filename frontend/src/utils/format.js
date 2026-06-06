export const severityOrder = ['critical', 'high', 'medium', 'low']

export const severityColors = {
  critical: '#dc2626',
  high: '#f97316',
  medium: '#d97706',
  low: '#0d9488',
}

export const severityBadgeClasses = {
  critical: 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/70 dark:bg-red-950/50 dark:text-red-300',
  high: 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900/70 dark:bg-orange-950/45 dark:text-orange-300',
  medium: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/70 dark:bg-amber-950/45 dark:text-amber-300',
  low: 'border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-900/70 dark:bg-teal-950/45 dark:text-teal-300',
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
