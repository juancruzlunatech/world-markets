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
  const [region, setRegion] = useState<(typeof REGIONS)[number]>('All')
  const [states, setStates] = useState<Record<string, CardState>>(() =>
    Object.fromEntries(EXCHANGES.map((item) => [item.id, { status: 'loading' }])),
  )

  const visible = useMemo(
    () => EXCHANGES.filter((item) => region === 'All' || item.region === region),
    [region],
  )

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

  useEffect(() => {
    for (const exchange of EXCHANGES) {
      void loadOne(exchange.id)
    }
  }, [loadOne])

  return (
    <section>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.16em] text-accent uppercase">
            Dashboard
          </p>
          <h1 className="font-display mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
            Global markets
          </h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted">
            Benchmark indices from the world’s major exchanges, with current price and
            change from the latest available close.
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by region">
          {REGIONS.map((item) => {
            const active = region === item
            return (
              <button
                key={item}
                type="button"
                onClick={() => setRegion(item)}
                className={`chip ${active ? 'chip-active' : 'chip-idle'}`}
              >
                {item}
              </button>
            )
          })}
        </div>
      </div>

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
