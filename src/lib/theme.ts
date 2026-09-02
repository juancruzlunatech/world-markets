export const THEME_OPTIONS = [
  { id: 'light', label: 'Claro' },
  { id: 'dark', label: 'Oscuro' },
  { id: 'system', label: 'Sistema' },
] as const

export type ThemeId = (typeof THEME_OPTIONS)[number]['id']

const KEY = 'wm-theme'

export function readTheme(): ThemeId {
  const stored = localStorage.getItem(KEY)
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored
  }
  return 'system'
}

export function isDark(theme: ThemeId): boolean {
  if (theme === 'dark') return true
  if (theme === 'light') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function applyTheme(theme: ThemeId): void {
  localStorage.setItem(KEY, theme)
  document.documentElement.classList.toggle('dark', isDark(theme))
}
