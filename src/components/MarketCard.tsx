import { formatPercent, formatPrice } from '../lib/formatNumbers.js'
import type { MarketQuote } from '../lib/markets'
import { Sparkline } from './Sparkline'

type MarketCardProps = {
  quote: MarketQuote
}

export function MarketCard({ quote }: MarketCardProps) {
  const up = quote.changePercent >= 0

  return (
    <article className="surface group relative overflow-hidden rounded-2xl p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:hover:shadow-black/40">
      <div
        aria-hidden
        className={`absolute inset-y-0 left-0 w-1 ${up ? 'bg-up' : 'bg-down'}`}
      />
      <div className="flex items-start justify-between gap-3 pl-1">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-accent uppercase">
            {quote.exchange.city}
          </p>
          <h3 className="font-display mt-1 truncate text-xl font-semibold tracking-tight">
            {quote.exchange.index}
          </h3>
          <p className="mt-0.5 truncate text-sm text-muted">
            {quote.exchange.name} · {quote.exchange.country}
          </p>
        </div>
        <Sparkline values={quote.spark} up={up} />
      </div>

      <div className="mt-6 flex items-end justify-between gap-3 pl-1">
        <p className="text-2xl font-semibold tracking-tight tabular-nums">
          {formatPrice(quote.price)}
          <span className="ml-1.5 text-sm font-medium text-muted">
            {quote.currency}
          </span>
        </p>
        <p
          className={`rounded-full px-2.5 py-1 text-sm font-semibold tabular-nums ${
            up
              ? 'bg-emerald-500/12 text-up dark:bg-emerald-400/15 dark:text-emerald-300'
              : 'bg-rose-500/12 text-down dark:bg-rose-400/15 dark:text-rose-300'
          }`}
        >
          {formatPercent(quote.changePercent, { signed: true })}
        </p>
      </div>
    </article>
  )
}

export function MarketCardSkeleton() {
  return (
    <div className="surface h-[168px] animate-pulse rounded-2xl p-5">
      <div className="flex justify-between">
        <div className="space-y-2">
          <div className="h-3 w-16 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-5 w-28 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-3 w-36 rounded bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="h-11 w-28 rounded bg-slate-200 dark:bg-slate-700" />
      </div>
      <div className="mt-8 flex justify-between">
        <div className="h-7 w-24 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-7 w-16 rounded-full bg-slate-200 dark:bg-slate-700" />
      </div>
    </div>
  )
}

export function MarketCardError({
  name,
  onRetry,
}: {
  name: string
  onRetry: () => void
}) {
  return (
    <article className="surface rounded-2xl border-dashed p-5">
      <h3 className="font-display text-lg font-semibold">{name}</h3>
      <p className="mt-2 text-sm text-muted">Could not load the quote.</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 rounded-full bg-ink px-3.5 py-1.5 text-sm font-semibold text-white transition hover:opacity-90 dark:bg-white dark:text-night"
      >
        Retry
      </button>
    </article>
  )
}
