import { NavLink, Outlet } from 'react-router-dom'
import { ThemeSelect } from './ThemeSelect'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `chip ${isActive ? 'chip-active' : 'chip-idle'}`

export function Layout() {
  return (
    <div className="min-h-svh">
      <header className="sticky top-0 z-20 border-b border-line/80 bg-paper/75 backdrop-blur-xl dark:border-line-dark dark:bg-night/75">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div
              aria-hidden
              className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-sm font-bold text-white shadow-lg shadow-orange-500/25"
            >
              WM
            </div>
            <div className="min-w-0">
              <p className="font-display text-lg font-semibold tracking-tight sm:text-xl">
                World Markets
              </p>
              <p className="truncate text-xs text-muted">
                Índices globales · noticias por país
              </p>
            </div>
          </div>

          <nav className="order-3 flex w-full items-center justify-center gap-1 sm:order-none sm:w-auto">
            <NavLink to="/" end className={linkClass}>
              Markets
            </NavLink>
            <NavLink to="/noticias" className={linkClass}>
              News
            </NavLink>
          </nav>

          <ThemeSelect />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
        <Outlet />
      </main>

      <footer className="mx-auto max-w-6xl border-t border-line/70 px-4 py-8 text-xs text-muted dark:border-line-dark">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <p>Market data via Yahoo Finance · News via Google News RSS</p>
          <p>Not financial advice</p>
        </div>
      </footer>
    </div>
  )
}
