// This file is the bridge between the UI and the market API.
// It receives an exchange definition, calls the Yahoo Finance chart endpoint,
// and transforms the raw response into a simpler object that the UI can display.

import { fetchThroughCors } from './fetchCors'
import type { Exchange } from '../data/exchanges'

// This is the normalized data structure used by the market cards.
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

// Build the Yahoo Finance URL for one market symbol.
function yahooUrl(symbol: string): string {
  const params = new URLSearchParams({
    interval: '1d',
    range: '1mo',
    includePrePost: 'false',
  })
  return `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?${params}`
}

// Fetch and normalize one market index quote.
export async function loadQuote(exchange: Exchange): Promise<MarketQuote> {
  const response = await fetchThroughCors(yahooUrl(exchange.symbol))
  const data = (await response.json()) as YahooChart
  const result = data.chart?.result?.[0]

  if (!result?.meta) {
    throw new Error(`No data for ${exchange.symbol}`)
  }

  // The quote endpoint includes a list of closing values.
  // We keep the last 20 values for the small sparkline graphic.
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

// Helper to fetch many markets at once and collect the result of each request.
export async function loadAllQuotes(
  exchanges: Exchange[],
): Promise<PromiseSettledResult<MarketQuote>[]> {
  return Promise.allSettled(exchanges.map((item) => loadQuote(item)))
}
