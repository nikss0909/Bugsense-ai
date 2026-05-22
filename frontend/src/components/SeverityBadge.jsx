import { severityBadgeClasses } from '../utils/format.js'

function SeverityBadge({ severity = 'low' }) {
  const normalized = severity.toLowerCase()
  const classes = severityBadgeClasses[normalized] || severityBadgeClasses.low

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-1 text-xs font-semibold uppercase ${classes}`}
    >
      {normalized}
    </span>
  )
}

export default SeverityBadge
