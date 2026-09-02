/** @param {number} value */
export function formatPrice(value) {
  if (!Number.isFinite(value)) return '—'
  const abs = Math.abs(value)
  const digits = abs >= 1000 ? 2 : abs >= 10 ? 2 : 4
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: digits,
  }).format(value)
}

/**
 * @param {number} value
 * @param {{ signed?: boolean }} [opts]
 */
export function formatPercent(value, opts = {}) {
  if (!Number.isFinite(value)) return '—'
  const signed = opts.signed ? { signDisplay: 'exceptZero' } : {}
  return `${new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...signed,
  }).format(value)}%`
}

/** @param {string | number | Date} value */
export function formatNewsDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}
