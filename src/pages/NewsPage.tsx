// This page shows news headlines for one selected country.
// The component loads a different feed when the user changes the country in the dropdown.

import { useEffect, useState } from 'react'
import { NEWS_COUNTRIES } from '../data/countries'
import { formatNewsDate } from '../lib/formatNumbers.js'
import { countryByCode, loadNews, type NewsArticle } from '../lib/news'

// We start with Spain as the default country when the page opens.
const DEFAULT = 'ES'

export function NewsPage() {
  // code stores the selected country code like ES, US, BR, FR, etc.
  const [code, setCode] = useState(DEFAULT)

  // articles holds all items returned by the news feed.
  const [articles, setArticles] = useState<NewsArticle[]>([])

  // status is one of: loading, ready, or error.
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  // Every time the selected country changes, we fetch the new headlines.
  useEffect(() => {
    let cancelled = false
    setStatus('loading')

    void loadNews(countryByCode(code))
      .then((items) => {
        if (cancelled) return
        setArticles(items)
        setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [code])

  const country = countryByCode(code)

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-4xl tracking-tight">
            International news
          </h1>
          <p className="mt-2 max-w-xl text-black/60 dark:text-white/55">
            Headline coverage from {country.name} via Google News. Choose another country
            to switch the feed.
          </p>
        </div>

        {/* Country dropdown lets the user switch the entire feed instantly. */}
        <label className="text-sm">
          Country
          <select
            value={code}
            onChange={(event) => setCode(event.target.value)}
            className="ml-2 rounded-full border border-black/15 bg-white/80 px-3 py-1.5 dark:border-white/15 dark:bg-panel"
          >
            {NEWS_COUNTRIES.map((item) => (
              <option key={item.code} value={item.code}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* While waiting for the API response, show placeholder blocks. */}
      {status === 'loading' && (
        <div className="mt-8 grid gap-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={index}
              className="h-20 animate-pulse rounded-2xl bg-white/50 dark:bg-panel/70"
            />
          ))}
        </div>
      )}

      {/* If the request fails, show a clear message instead of a blank screen. */}
      {status === 'error' && (
        <p className="mt-8 rounded-2xl border border-dashed border-black/20 p-6 dark:border-white/20">
          News could not be loaded. Try again in a few seconds.
        </p>
      )}

      {/* Once the data is ready, render each article as a link card. */}
      {status === 'ready' && (
        <ul className="mt-8 grid gap-3">
          {articles.map((article) => (
            <li key={article.link}>
              <a
                href={article.link}
                target="_blank"
                rel="noreferrer"
                className="block rounded-2xl border border-black/10 bg-white/70 p-5 transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-panel"
              >
                <p className="text-xs text-gold">
                  {article.source}
                  {article.published ? ` · ${formatNewsDate(article.published)}` : ''}
                </p>
                <h2 className="mt-1 font-display text-xl leading-snug">
                  {article.title}
                </h2>
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
