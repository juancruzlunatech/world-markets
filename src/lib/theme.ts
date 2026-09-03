// This file centralizes all theme-related logic.
// It stores the user preference, reads it back, and applies the chosen mode
// to the document so the whole app updates in light or dark styling.

export const THEME_OPTIONS = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'system', label: 'System' },
] as const

export type ThemeId = (typeof THEME_OPTIONS)[number]['id']

const KEY = 'wm-theme'

// Read the saved theme from localStorage.
// If nothing was saved, we use the system preference.
export function readTheme(): ThemeId {
  const stored = localStorage.getItem(KEY)
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored
  }
  return 'system'
}

// Decide whether the current theme should be treated as dark mode.
export function isDark(theme: ThemeId): boolean {
  if (theme === 'dark') return true
  if (theme === 'light') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

// Save the theme and toggle the dark class on the root HTML element.
export function applyTheme(theme: ThemeId): void {
  localStorage.setItem(KEY, theme)
  document.documentElement.classList.toggle('dark', isDark(theme))
}
