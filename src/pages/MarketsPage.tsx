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
  const [region, setRegion] = useState<(typeof REGIONS)[number]>('Todas')
  const [states, setStates] = useState<Record<string, CardState>>(() =>
    Object.fromEntries(EXCHANGES.map((item) => [item.id, { status: 'loading' }])),
  )

  const visible = useMemo(
    () =>
      EXCHANGES.filter((item) => region === 'Todas' || item.region === region),
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-4xl tracking-tight">Bolsas del mundo</h1>
          <p className="mt-2 max-w-xl text-black/60 dark:text-white/55">
            Índices de referencia de las principales plazas, con precio y variación
            del último cierre disponible.
          </p>
        </div>
        <label className="text-sm">
          Región
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
