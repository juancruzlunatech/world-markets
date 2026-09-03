// This file creates the shared layout of the app.
// Every page uses the same header, navigation, and footer structure,
// while the main content changes depending on the route.

import { NavLink, Outlet } from 'react-router-dom'
import { ThemeSelect } from './ThemeSelect'

// This helper returns the CSS class for a navigation link.
// isActive is provided by React Router, and we use it to highlight the current page.
const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-4 py-2 text-sm font-medium transition ${
    isActive
      ? 'bg-ink text-paper dark:bg-gold dark:text-night'
      : 'text-black/70 hover:bg-black/5 dark:text-white/70 dark:hover:bg-white/10'
  }`

export function Layout() {
  return (
    <div className="min-h-svh">
      {/* Header stays on top while the page scrolls. */}
      <header className="sticky top-0 z-20 border-b border-black/10 bg-paper/80 backdrop-blur dark:border-white/10 dark:bg-night/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div>
            {/* Brand name and short description shown in the top bar. */}
            <p className="font-display text-xl tracking-tight">World Markets</p>
            <p className="text-xs text-black/50 dark:text-white/45">
              Global markets · news by country
            </p>
          </div>

          {/* Navigation links between the markets and news screens. */}
          <nav className="flex items-center gap-1">
            <NavLink to="/" end className={linkClass}>
              Markets
            </NavLink>
            <NavLink to="/noticias" className={linkClass}>
              News
            </NavLink>
          </nav>

          {/* Theme selector is placed in the header so the user can switch mode anytime. */}
          <ThemeSelect />
        </div>
      </header>

      {/* Outlet is replaced by the page component for the current route. */}
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>

      {/* Footer is a universal note explaining the data source and risk disclaimer. */}
      <footer className="mx-auto max-w-6xl px-4 pb-10 text-xs text-black/45 dark:text-white/35">
        Market index data via Yahoo Finance. News via Google News RSS. Not financial
        advice.
      </footer>
    </div>
  )
}
