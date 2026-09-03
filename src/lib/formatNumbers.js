// This file centralizes the formatting logic used across the app.
// Instead of writing number formatting manually in each component,
// we use helper functions to keep the UI consistent.

/**
 * Formats a numeric value as a price.
 * For example: 1234.5 -> 1,234.50
 * @param {number} value
 */
export function formatPrice(value) {
  if (!Number.isFinite(value)) return '—'
  const abs = Math.abs(value)
  const digits = abs >= 1000 ? 2 : abs >= 10 ? 2 : 4
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: digits,
  }).format(value)
}

/**
 * Formats a numeric value as a percentage.
 * If signed is true, the value can show a leading + or - sign.
 * @param {number} value
 * @param {{ signed?: boolean }} [opts]
 */
export function formatPercent(value, opts = {}) {
  if (!Number.isFinite(value)) return '—'
  const signed = opts.signed ? { signDisplay: 'exceptZero' } : {}
  return `${new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...signed,
  }).format(value)}%`
}

/**
 * Converts a date string into a readable local format.
 * This is used for news publication timestamps.
 * @param {string | number | Date} value
 */
export function formatNewsDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}
