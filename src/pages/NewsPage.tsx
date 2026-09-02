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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-4xl tracking-tight">
            Noticias internacionales
          </h1>
          <p className="mt-2 max-w-xl text-black/60 dark:text-white/55">
            Titulares de {country.name} desde Google News. Elige otro país para
            cambiar el feed.
          </p>
        </div>
        <label className="text-sm">
          País
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

      {status === 'error' && (
        <p className="mt-8 rounded-2xl border border-dashed border-black/20 p-6 dark:border-white/20">
          No se pudieron cargar las noticias. Prueba de nuevo en unos segundos.
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
