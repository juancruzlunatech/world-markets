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
      timestamp?: number[]
      indicators?: {
        quote?: Array<{ close?: Array<number | null> }>
      }
    }>
    error?: unknown
  }
}

function yahooUrl(symbol: string): string {
  const params = new URLSearchParams({
    interval: '1d',
    range: '1mo',
    includePrePost: 'false',
  })
  return `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?${params}`
}

export async function loadQuote(exchange: Exchange): Promise<MarketQuote> {
  const response = await fetchThroughCors(yahooUrl(exchange.symbol))
  const data = (await response.json()) as YahooChart
  const result = data.chart?.result?.[0]
  if (!result?.meta) {
    throw new Error(`Sin datos para ${exchange.symbol}`)
  }

  const closes =
    result.indicators?.quote?.[0]?.close?.filter(
      (value): value is number => typeof value === 'number',
    ) ?? []
  const price = result.meta.regularMarketPrice ?? closes.at(-1) ?? NaN
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

export async function loadAllQuotes(
  exchanges: Exchange[],
): Promise<PromiseSettledResult<MarketQuote>[]> {
  return Promise.allSettled(exchanges.map((item) => loadQuote(item)))
}
