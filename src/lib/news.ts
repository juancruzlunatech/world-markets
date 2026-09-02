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
  if (!response.ok) throw new Error('rss2json no disponible')
  const data = (await response.json()) as Rss2Json
  if (data.status !== 'ok' || !data.items) throw new Error('RSS inválido')
  return data.items.map((item) => ({
    title: item.title ?? '',
    link: item.link ?? '',
    published: item.pubDate ?? '',
    source: item.author ?? 'Google News',
  }))
}

export async function loadNews(country: NewsCountry): Promise<NewsArticle[]> {
  try {
    const articles = await fromRss2Json(country.rss)
    if (articles.length) return articles
  } catch {
    // fallback CORS + XML
  }

  const response = await fetchThroughCors(country.rss)
  const xml = await response.text()
  return parseRssXml(xml).filter((article) => article.title && article.link)
}

export function countryByCode(code: string): NewsCountry {
  return NEWS_COUNTRIES.find((item) => item.code === code) ?? NEWS_COUNTRIES[0]
}
