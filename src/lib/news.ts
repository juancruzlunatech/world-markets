// Converts a country RSS URL into article objects for NewsPage.
// Tries live feeds first, then falls back to same-origin snapshots from prefetch
// so GitHub Pages still works when rss2json / Google News are blocked by CORS.

import { NEWS_COUNTRIES, type NewsCountry } from '../data/countries'
import { fetchThroughCors } from './fetchCors'

export type NewsArticle = {
  title: string
  link: string
  published: string
  source: string
}

type Rss2Json = {
  status?: string
  items?: Array<{
    title?: string
    link?: string
    pubDate?: string
    author?: string
  }>
}

type NewsSnapshot = {
  fetchedAt?: string
  articles?: NewsArticle[]
}

function dataUrl(path: string): string {
  const base = import.meta.env.BASE_URL || '/'
  const normalized = base.endsWith('/') ? base : `${base}/`
  return `${normalized}${path.replace(/^\//, '')}`
}

function textOf(node: Element | null): string {
  return node?.textContent?.trim() ?? ''
}

function parseRssXml(xml: string): NewsArticle[] {
  const doc = new DOMParser().parseFromString(xml, 'text/xml')
  return [...doc.querySelectorAll('item')].map((item) => ({
    title: textOf(item.querySelector('title')),
    link: textOf(item.querySelector('link')),
    published: textOf(item.querySelector('pubDate')),
    source: textOf(item.querySelector('source')) || 'Google News',
  }))
}

async function fromRss2Json(rss: string): Promise<NewsArticle[]> {
  const url = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rss)}`
  const response = await fetch(url)
  if (!response.ok) throw new Error('rss2json is unavailable')

  const data = (await response.json()) as Rss2Json
  if (data.status !== 'ok' || !data.items) throw new Error('Invalid RSS feed')

  return data.items.map((item) => ({
    title: item.title ?? '',
    link: item.link ?? '',
    published: item.pubDate ?? '',
    source: item.author ?? 'Google News',
  }))
}

async function loadLiveNews(country: NewsCountry): Promise<NewsArticle[]> {
  try {
    const articles = await fromRss2Json(country.rss)
    if (articles.length) return articles.filter((article) => article.title && article.link)
  } catch {
    // fallback to XML parsing below
  }

  const response = await fetchThroughCors(country.rss)
  const xml = await response.text()
  return parseRssXml(xml).filter((article) => article.title && article.link)
}

async function loadSnapshotNews(country: NewsCountry): Promise<NewsArticle[]> {
  try {
    const response = await fetch(dataUrl(`data/news/${country.code}.json`), {
      cache: 'no-cache',
    })
    if (!response.ok) throw new Error('snapshot missing')
    const data = (await response.json()) as NewsSnapshot
    const articles = (data.articles ?? []).filter((article) => article.title && article.link)
    if (!articles.length) throw new Error('snapshot empty')
    return articles
  } catch {
    return []
  }
}

export async function loadNews(country: NewsCountry): Promise<NewsArticle[]> {
  try {
    const live = await loadLiveNews(country)
    if (live.length) return live
  } catch {
    // use snapshot
  }

  const snapshot = await loadSnapshotNews(country)
  if (snapshot.length) return snapshot
  throw new Error(`News could not be loaded for ${country.code}`)
}

export function countryByCode(code: string): NewsCountry {
  return NEWS_COUNTRIES.find((item) => item.code === code) ?? NEWS_COUNTRIES[0]
}
