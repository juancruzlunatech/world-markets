// This component represents a single market card.
// It receives a quote object from the markets loading logic and displays the index,
// the current price, the currency, and the percentage movement.

import { formatPercent, formatPrice } from '../lib/formatNumbers.js'
import type { MarketQuote } from '../lib/markets'
import { Sparkline } from './Sparkline'

type MarketCardProps = {
  quote: MarketQuote
}

export function MarketCard({ quote }: MarketCardProps) {
  // If the percentage is positive, the card is green; otherwise red.
  const up = quote.changePercent >= 0

  return (
    <article className="rounded-2xl border border-black/10 bg-white/70 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-panel">
      <div className="flex items-start justify-between gap-3">
        <div>
          {/* City where this market operates. */}
          <p className="text-xs font-medium tracking-wide text-gold uppercase">
            {quote.exchange.city}
          </p>

          {/* Name of the financial index, such as S&P 500 or FTSE 100. */}
          <h3 className="font-display mt-1 text-xl">{quote.exchange.index}</h3>

          {/* Additional metadata: exchange and country. */}
          <p className="text-sm text-black/60 dark:text-white/55">
            {quote.exchange.name} · {quote.exchange.country}
          </p>
        </div>

        {/* Sparkline is a small chart showing recent movement. */}
        <Sparkline values={quote.spark} up={up} />
      </div>

      <div className="mt-5 flex items-end justify-between">
        <p className="text-2xl font-semibold tracking-tight">
          {formatPrice(quote.price)}
          <span className="ml-1 text-sm font-normal text-black/50 dark:text-white/45">
            {quote.currency}
          </span>
        </p>

        {/* The percent badge uses a green or red style depending on the sign. */}
        <p
          className={`rounded-full px-2.5 py-1 text-sm font-medium ${
            up
              ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-500/15 text-rose-800 dark:text-rose-300'
          }`}
        >
          {formatPercent(quote.changePercent, { signed: true })}
        </p>
      </div>
    </article>
  )
}

// This is a loading placeholder. It appears while the app is waiting for data.
export function MarketCardSkeleton() {
  return (
    <div className="h-44 animate-pulse rounded-2xl border border-black/10 bg-white/50 dark:border-white/10 dark:bg-panel/70" />
  )
}

// This state is shown when a market request fails.
// It allows the user to retry without reloading the whole page.
export function MarketCardError({ name, onRetry }: { name: string; onRetry: () => void }) {
  return (
    <article className="rounded-2xl border border-dashed border-black/20 p-5 dark:border-white/20">
      <h3 className="font-display text-lg">{name}</h3>
      <p className="mt-2 text-sm text-black/55 dark:text-white/50">
        Could not load the quote.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-3 text-sm font-medium text-gold underline-offset-2 hover:underline"
      >
        Retry
      </button>
    </article>
  )
}
