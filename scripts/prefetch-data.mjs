/**
 * Fetches market quotes and news on the server (CI / local) and writes
 * same-origin JSON under public/data/ so GitHub Pages can serve them
 * without browser CORS limits.
 */
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

function parseExchanges() {
  const src = readFileSync(join(root, 'src/data/exchanges.ts'), 'utf8')
  const block = src.slice(src.indexOf('export const EXCHANGES'))
  const objects = [...block.matchAll(/\{[^{}]*id:\s*'([^']+)'[^{}]*symbol:\s*'([^']+)'[^{}]*currency:\s*'([^']+)'[^{}]*\}/gs)]
  return objects.map((m) => ({ id: m[1], symbol: m[2], currency: m[3] }))
}

function parseCountries() {
  const src = readFileSync(join(root, 'src/data/countries.ts'), 'utf8')
  const objects = [
    ...src.matchAll(/code:\s*'([^']+)'[\s\S]*?rss:\s*'([^']+)'/g),
  ]
  return objects.map((m) => ({ code: m[1], rss: m[2] }))
}

async function sleep(ms) {
  await new Promise((r) => setTimeout(r, ms))
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'application/json,text/xml,*/*' },
  })
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`)
  return response.json()
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'application/rss+xml,text/xml,*/*' },
  })
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`)
  return response.text()
}

function yahooUrl(symbol) {
  const params = new URLSearchParams({
    interval: '1d',
    range: '1mo',
    includePrePost: 'false',
  })
  return `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?${params}`
}

function quoteFromYahoo(data, fallbackCurrency) {
  const result = data?.chart?.result?.[0]
  if (!result?.meta) throw new Error('missing meta')
  const closes =
    result.indicators?.quote?.[0]?.close?.filter((v) => typeof v === 'number') ?? []
  const price = result.meta.regularMarketPrice ?? closes.at(-1)
  if (typeof price !== 'number') throw new Error('missing price')
  const previous =
    result.meta.chartPreviousClose ?? result.meta.previousClose ?? closes.at(-2) ?? price
  const change = price - previous
  const changePercent = previous ? (change / previous) * 100 : 0
  const asOf = result.meta.regularMarketTime
    ? new Date(result.meta.regularMarketTime * 1000).toISOString()
    : new Date().toISOString()
  return {
    price,
    change,
    changePercent,
    currency: result.meta.currency ?? fallbackCurrency,
    spark: closes.slice(-20),
    asOf,
  }
}

function parseRssXml(xml) {
  const items = []
  const itemRe = /<item>([\s\S]*?)<\/item>/gi
  let match
  while ((match = itemRe.exec(xml))) {
    const block = match[1]
    const title = (block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) ||
      block.match(/<title>(.*?)<\/title>/))?.[1]?.trim()
    const link = (block.match(/<link>(.*?)<\/link>/))?.[1]?.trim()
    const published = (block.match(/<pubDate>(.*?)<\/pubDate>/))?.[1]?.trim() ?? ''
    const source =
      (block.match(/<source[^>]*><!\[CDATA\[(.*?)\]\]><\/source>/) ||
        block.match(/<source[^>]*>(.*?)<\/source>/))?.[1]?.trim() || 'Google News'
    if (title && link) items.push({ title, link, published, source })
  }
  return items
}

async function loadNewsArticles(rss) {
  try {
    const url = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rss)}`
    const data = await fetchJson(url)
    if (data.status === 'ok' && Array.isArray(data.items) && data.items.length) {
      return data.items
        .map((item) => ({
          title: item.title ?? '',
          link: item.link ?? '',
          published: item.pubDate ?? '',
          source: item.author ?? 'Google News',
        }))
        .filter((a) => a.title && a.link)
    }
  } catch {
    // fall through to XML
  }
  const xml = await fetchText(rss)
  return parseRssXml(xml)
}

async function main() {
  const exchanges = parseExchanges()
  const countries = parseCountries()
  if (!exchanges.length) throw new Error('No exchanges parsed from exchanges.ts')
  if (!countries.length) throw new Error('No countries parsed from countries.ts')

  const marketsDir = join(root, 'public/data')
  const newsDir = join(marketsDir, 'news')
  mkdirSync(newsDir, { recursive: true })

  const quotes = {}
  let marketOk = 0
  for (const exchange of exchanges) {
    try {
      const data = await fetchJson(yahooUrl(exchange.symbol))
      quotes[exchange.id] = quoteFromYahoo(data, exchange.currency)
      marketOk += 1
      process.stdout.write(`.`)
    } catch (error) {
      process.stdout.write(`x`)
      console.error(`\nmarket ${exchange.id}:`, error.message ?? error)
    }
    await sleep(250)
  }
  console.log(`\nmarkets: ${marketOk}/${exchanges.length}`)

  writeFileSync(
    join(marketsDir, 'markets.json'),
    JSON.stringify(
      { fetchedAt: new Date().toISOString(), quotes },
      null,
      2,
    ),
  )

  const newsBundle = { fetchedAt: new Date().toISOString(), countries: {} }
  let newsOk = 0
  for (const country of countries) {
    try {
      const articles = await loadNewsArticles(country.rss)
      if (!articles.length) throw new Error('empty feed')
      newsBundle.countries[country.code] = {
        fetchedAt: new Date().toISOString(),
        articles: articles.slice(0, 40),
      }
      writeFileSync(
        join(newsDir, `${country.code}.json`),
        JSON.stringify(newsBundle.countries[country.code], null, 2),
      )
      newsOk += 1
      process.stdout.write(`.`)
    } catch (error) {
      process.stdout.write(`x`)
      console.error(`\nnews ${country.code}:`, error.message ?? error)
    }
    await sleep(200)
  }
  console.log(`\nnews: ${newsOk}/${countries.length}`)
  writeFileSync(join(newsDir, 'all.json'), JSON.stringify(newsBundle, null, 2))

  if (marketOk === 0) throw new Error('Prefetch failed: no market quotes')
  if (newsOk === 0) throw new Error('Prefetch failed: no news feeds')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
