// This file handles the news feed logic.
// It converts a country RSS URL into a clean list of article objects,
// which the NewsPage component can render as clickable cards.

import { NEWS_COUNTRIES, type NewsCountry } from '../data/countries'
import { fetchThroughCors } from './fetchCors'

// Each article contains the title, URL, publication date, and source name.
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

// Utility to read text from a DOM node safely.
function textOf(node: Element | null): string {
  return node?.textContent?.trim() ?? ''
}

// This function parses the XML returned by Google News RSS.
// It loops through each <item> and extracts the fields we need.
function parseRssXml(xml: string): NewsArticle[] {
  const doc = new DOMParser().parseFromString(xml, 'text/xml')
  return [...doc.querySelectorAll('item')].map((item) => ({
    title: textOf(item.querySelector('title')),
    link: textOf(item.querySelector('link')),
    published: textOf(item.querySelector('pubDate')),
    source: textOf(item.querySelector('source')) || 'Google News',
  }))
}

// rss2json converts the RSS feed into a JSON structure that is easier to use.
// This is the first option because it is cleaner and more stable for a frontend app.
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

// loadNews tries the preferred JSON approach first.
// If it fails, it falls back to a CORS fetch + XML parsing method.
export async function loadNews(country: NewsCountry): Promise<NewsArticle[]> {
  try {
    const articles = await fromRss2Json(country.rss)
    if (articles.length) return articles
  } catch {
    // fallback to XML parsing below
  }

  const response = await fetchThroughCors(country.rss)
  const xml = await response.text()
  return parseRssXml(xml).filter((article) => article.title && article.link)
}

// Returns the country object that matches the selected code.
// If no match is found, it falls back to the first country in the list.
export function countryByCode(code: string): NewsCountry {
  return NEWS_COUNTRIES.find((item) => item.code === code) ?? NEWS_COUNTRIES[0]
}
