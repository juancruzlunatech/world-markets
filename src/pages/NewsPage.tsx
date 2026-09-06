import { useEffect, useState } from 'react'
import { NEWS_COUNTRIES } from '../data/countries'
import { formatNewsDate } from '../lib/formatNumbers.js'
import { countryByCode, loadNews, type NewsArticle } from '../lib/news'

const DEFAULT = 'ES'

export function NewsPage() {
  const [code, setCode] = useState(DEFAULT)
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

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
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.16em] text-accent uppercase">
            Headlines
          </p>
          <h1 className="font-display mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
            International news
          </h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted">
            Coverage from {country.name} via Google News. Switch country to change the
            feed.
          </p>
        </div>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-muted">
          Country
          <select
            value={code}
            onChange={(event) => setCode(event.target.value)}
            className="field min-w-[12rem] text-ink dark:text-slate-100"
          >
            {NEWS_COUNTRIES.map((item) => (
              <option key={item.code} value={item.code}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {status === 'loading' && (
        <div className="mt-8 grid gap-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="surface h-[88px] animate-pulse rounded-2xl" />
          ))}
        </div>
      )}

      {status === 'error' && (
        <p className="surface mt-8 rounded-2xl border-dashed p-6 text-sm text-muted">
          News could not be loaded. Try again in a few seconds.
        </p>
      )}

      {status === 'ready' && (
        <ul className="mt-8 grid gap-3">
          {articles.map((article) => (
            <li key={article.link}>
              <a
                href={article.link}
                target="_blank"
                rel="noreferrer"
                className="surface block rounded-2xl p-5 transition duration-200 hover:-translate-y-0.5 hover:border-orange-500/30 hover:shadow-lg dark:hover:shadow-black/40"
              >
                <p className="text-xs font-semibold tracking-wide text-accent">
                  {article.source}
                  {article.published ? ` · ${formatNewsDate(article.published)}` : ''}
                </p>
                <h2 className="font-display mt-1.5 text-xl leading-snug font-semibold tracking-tight">
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
