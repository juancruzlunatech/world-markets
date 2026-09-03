// This page shows the global market dashboard.
// It loads one quote per exchange, keeps track of loading/error states,
// and renders all cards in a responsive grid.

import { useCallback, useEffect, useMemo, useState } from 'react'
import { EXCHANGES, REGIONS } from '../data/exchanges'
import {
  MarketCard,
  MarketCardError,
  MarketCardSkeleton,
} from '../components/MarketCard'
import { loadQuote, type MarketQuote } from '../lib/markets'

type CardState =
  | { status: 'loading' }
  | { status: 'ready'; quote: MarketQuote }
  | { status: 'error' }

export function MarketsPage() {
  // region is the current filter value selected by the user.
  // It can be All, Americas, Europe, or Asia-Pacific.
  const [region, setRegion] = useState<(typeof REGIONS)[number]>('All')

  // states is an object that stores the status for each exchange.
  // Example: sp500 -> { status: 'ready', quote: ... }
  const [states, setStates] = useState<Record<string, CardState>>(() =>
    Object.fromEntries(EXCHANGES.map((item) => [item.id, { status: 'loading' }])),
  )

  // visible contains only the exchanges that match the selected region.
  const visible = useMemo(
    () => EXCHANGES.filter((item) => region === 'All' || item.region === region),
    [region],
  )

  // loadOne fetches the data for one specific exchange and updates its state.
  const loadOne = useCallback(async (id: string) => {
    const exchange = EXCHANGES.find((item) => item.id === id)
    if (!exchange) return

    setStates((current) => ({ ...current, [id]: { status: 'loading' } }))

    try {
      const quote = await loadQuote(exchange)
      setStates((current) => ({ ...current, [id]: { status: 'ready', quote } }))
    } catch {
      setStates((current) => ({ ...current, [id]: { status: 'error' } }))
    }
  }, [])

  // When the page loads, we request all quotes.
  // This happens once and then each card updates independently.
  useEffect(() => {
    for (const exchange of EXCHANGES) {
      void loadOne(exchange.id)
    }
  }, [loadOne])

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-4xl tracking-tight">Global markets</h1>
          <p className="mt-2 max-w-xl text-black/60 dark:text-white/55">
            Benchmark indices from the world’s major exchanges, with current price and
            change from the latest available close.
          </p>
        </div>

        {/* Region filter: user can switch from all markets to one geographic group. */}
        <label className="text-sm">
          Region
          <select
            value={region}
            onChange={(event) =>
              setRegion(event.target.value as (typeof REGIONS)[number])
            }
            className="ml-2 rounded-full border border-black/15 bg-white/80 px-3 py-1.5 dark:border-white/15 dark:bg-panel"
          >
            {REGIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* The cards are rendered in a simple responsive grid. */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {visible.map((exchange) => {
          const state = states[exchange.id] ?? { status: 'loading' as const }

          if (state.status === 'loading') {
            return <MarketCardSkeleton key={exchange.id} />
          }

          if (state.status === 'error') {
            return (
              <MarketCardError
                key={exchange.id}
                name={exchange.index}
                onRetry={() => void loadOne(exchange.id)}
              />
            )
          }

          return <MarketCard key={exchange.id} quote={state.quote} />
        })}
      </div>
    </section>
  )
}
