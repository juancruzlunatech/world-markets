import { useEffect, useState } from 'react'
import { applyTheme, isDark, readTheme, type ThemeId } from '../lib/theme'

export function ThemeSelect() {
  const [theme, setTheme] = useState<ThemeId>(() =>
    typeof window === 'undefined' ? 'system' : readTheme(),
  )
  const [dark, setDark] = useState(() =>
    typeof window === 'undefined' ? false : isDark(readTheme()),
  )

  useEffect(() => {
    applyTheme(theme)
    setDark(isDark(theme))

    if (theme !== 'system') return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      applyTheme('system')
      setDark(media.matches)
    }
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [theme])

  const toggle = () => {
    const next: ThemeId = dark ? 'light' : 'dark'
    setTheme(next)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white/80 text-ink shadow-sm transition hover:bg-white dark:border-line-dark dark:bg-panel dark:text-slate-100 dark:hover:bg-slate-800"
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={dark ? 'Light' : 'Dark'}
    >
      {dark ? (
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path strokeLinecap="round" d="M12 2v2.2M12 19.8V22M4.2 12H2M22 12h-2.2M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 14.5A8.5 8.5 0 0 1 9.5 3 7 7 0 1 0 21 14.5Z"
          />
        </svg>
      )}
    </button>
  )
}
