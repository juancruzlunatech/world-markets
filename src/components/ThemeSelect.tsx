// This component lets the user change the display theme.
// It works with the theme utilities from src/lib/theme.ts to save the choice
// and apply light, dark, or system mode to the whole app.

import { useEffect, useState } from 'react'
import { applyTheme, readTheme, THEME_OPTIONS, type ThemeId } from '../lib/theme'

export function ThemeSelect() {
  // We initialize the state from the saved preference in localStorage.
  // If the browser has no saved value, we default to the system setting.
  const [theme, setTheme] = useState<ThemeId>(() =>
    typeof window === 'undefined' ? 'system' : readTheme(),
  )

  useEffect(() => {
    // Every time the theme changes, we apply it to the HTML element.
    applyTheme(theme)

    // If the user selected 'system', we also listen for OS-level changes.
    if (theme !== 'system') return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => applyTheme('system')
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [theme])

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="hidden sm:inline text-black/55 dark:text-white/50">Theme</span>
      <select
        value={theme}
        onChange={(event) => setTheme(event.target.value as ThemeId)}
        className="rounded-full border border-black/15 bg-white/80 px-3 py-1.5 text-sm dark:border-white/15 dark:bg-panel"
        aria-label="Select theme"
      >
        {THEME_OPTIONS.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
