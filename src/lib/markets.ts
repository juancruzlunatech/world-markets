// Bridge between the UI and market data.
import { fetchThroughCors } from './fetchCors'
import type { Exchange } from '../data/exchanges'

export type MarketQuote = {
  exchange: Exchange
  price: number
  change: number
  changePercent: number
  currency: string
  spark: number[]
  asOf: string
}

type YahooChart = {
  chart?: {
    result?: Array<{
      meta?: {
        regularMarketPrice?: number
        chartPreviousClose?: number
        previousClose?: number
        currency?: string
        regularMarketTime?: number
      }
      indicators?: {
        quote?: Array<{ close?: Array<number | null> }>
      }
    }>
  }
}

type SnapshotFile = {
  fetchedAt?: string
  quotes?: Record<
    string,
    {
      price: number
      change: number
      changePercent: number
      currency: string
      spark: number[]
      asOf: string
    }
  >
}

let snapshotPromise: Promise<SnapshotFile | null> | null = null

function dataUrl(path: string): string {
  const base = import.meta.env.BASE_URL || '/'
  const normalized = base.endsWith('/') ? base : `${base}/`
  return `${normalized}${path.replace(/^\//, '')}`
}

async function loadSnapshotFile(): Promise<SnapshotFile | null> {
  if (!snapshotPromise) {
    snapshotPromise = (async () => {
      try {
        const response = await fetch(dataUrl('data/markets.json'), { cache: 'no-cache' })
        if (!response.ok) return null
        return (await response.json()) as SnapshotFile
      } catch {
        return null
      }
    })()
  }
  return snapshotPromise
}

function yahooUrl(symbol: string): string {
  const params = new URLSearchParams({
    interval: '1d',
    range: '1mo',
    includePrePost: 'false',
  })
  return `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?${params}`
}

function quoteFromYahoo(exchange: Exchange, data: YahooChart): MarketQuote {
  const result = data.chart?.result?.[0]
  if (!result?.meta) {
    throw new Error(`No data for ${exchange.symbol}`)
  }

  const closes =
    result.indicators?.quote?.[0]?.close?.filter(
      (value): value is number => typeof value === 'number',
    ) ?? []

  const price = result.meta.regularMarketPrice ?? closes.at(-1) ?? NaN
  if (!Number.isFinite(price)) {
    throw new Error(`No price for ${exchange.symbol}`)
  }

  const previous =
    result.meta.chartPreviousClose ?? result.meta.previousClose ?? closes.at(-2) ?? price
  const change = price - previous
  const changePercent = previous ? (change / previous) * 100 : 0
  const asOf = result.meta.regularMarketTime
    ? new Date(result.meta.regularMarketTime * 1000).toISOString()
    : new Date().toISOString()

  return {
    exchange,
    price,
    change,
    changePercent,
    currency: result.meta.currency ?? exchange.currency,
    spark: closes.slice(-20),
    asOf,
  }
}

async function loadLiveQuote(exchange: Exchange): Promise<MarketQuote> {
  const response = await fetchThroughCors(yahooUrl(exchange.symbol))
  const data = (await response.json()) as YahooChart
  return quoteFromYahoo(exchange, data)
}

async function loadSnapshotQuote(exchange: Exchange): Promise<MarketQuote | null> {
  const snapshot = await loadSnapshotFile()
  const row = snapshot?.quotes?.[exchange.id]
  if (!row || !Number.isFinite(row.price)) return null
  return { exchange, ...row }
}

export async function loadQuote(exchange: Exchange): Promise<MarketQuote> {
  try {
    return await loadLiveQuote(exchange)
  } catch {
    const snapshot = await loadSnapshotQuote(exchange)
    if (snapshot) return snapshot
    throw new Error(`Could not load quote for ${exchange.symbol}`)
  }
}

export async function loadAllQuotes(
  exchanges: Exchange[],
): Promise<PromiseSettledResult<MarketQuote>[]> {
  return Promise.allSettled(exchanges.map((item) => loadQuote(item)))
}
