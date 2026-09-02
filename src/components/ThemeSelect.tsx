import { useEffect, useState } from 'react'
import { applyTheme, readTheme, THEME_OPTIONS, type ThemeId } from '../lib/theme'

export function ThemeSelect() {
  const [theme, setTheme] = useState<ThemeId>(() =>
    typeof window === 'undefined' ? 'system' : readTheme(),
  )

  useEffect(() => {
    applyTheme(theme)
    if (theme !== 'system') return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => applyTheme('system')
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [theme])

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="hidden sm:inline text-black/55 dark:text-white/50">Tema</span>
      <select
        value={theme}
        onChange={(event) => setTheme(event.target.value as ThemeId)}
        className="rounded-full border border-black/15 bg-white/80 px-3 py-1.5 text-sm dark:border-white/15 dark:bg-panel"
        aria-label="Seleccionar tema"
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
