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
    <div
      className="flex flex-wrap items-center gap-1"
      role="group"
      aria-label="Theme"
    >
      {THEME_OPTIONS.map((option) => {
        const active = theme === option.id
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => setTheme(option.id)}
            className={`chip ${active ? 'chip-active' : 'chip-idle'}`}
            aria-pressed={active}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
