import { NavLink, Outlet } from 'react-router-dom'
import { ThemeSelect } from './ThemeSelect'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-4 py-2 text-sm font-medium transition ${
    isActive
      ? 'bg-ink text-paper dark:bg-gold dark:text-night'
      : 'text-black/70 hover:bg-black/5 dark:text-white/70 dark:hover:bg-white/10'
  }`

export function Layout() {
  return (
    <div className="min-h-svh">
      <header className="sticky top-0 z-20 border-b border-black/10 bg-paper/80 backdrop-blur dark:border-white/10 dark:bg-night/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div>
            <p className="font-display text-xl tracking-tight">World Markets</p>
            <p className="text-xs text-black/50 dark:text-white/45">
              Bolsas del mundo · noticias por país
            </p>
          </div>
          <nav className="flex items-center gap-1">
            <NavLink to="/" end className={linkClass}>
              Bolsas
            </NavLink>
            <NavLink to="/noticias" className={linkClass}>
              Noticias
            </NavLink>
          </nav>
          <ThemeSelect />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
      <footer className="mx-auto max-w-6xl px-4 pb-10 text-xs text-black/45 dark:text-white/35">
        Datos de índices vía Yahoo Finance. Noticias vía Google News RSS. No es
        asesoramiento financiero.
      </footer>
    </div>
  )
}
