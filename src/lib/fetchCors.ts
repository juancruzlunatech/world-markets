// Tries same-origin Vite proxy routes first (local dev), then the raw URL.
// On GitHub Pages those /api/* proxies do not exist, so callers should fall
// back to prefetched JSON under public/data/ when this helper fails.

async function tryFetch(url: string): Promise<Response> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }
  const contentType = response.headers.get('content-type') ?? ''
  if (url.includes('/api/') && contentType.includes('text/html')) {
    throw new Error('Received HTML from API proxy path')
  }
  return response
}

function sameOriginProxy(targetUrl: string): string {
  if (targetUrl.includes('query1.finance.yahoo.com')) {
    return targetUrl.replace('https://query1.finance.yahoo.com', '/api/yahoo')
  }

  if (targetUrl.includes('news.google.com')) {
    return targetUrl.replace('https://news.google.com', '/api/google-news')
  }

  if (targetUrl.includes('api.rss2json.com')) {
    return targetUrl.replace('https://api.rss2json.com', '/api/rss2json')
  }

  return targetUrl
}

export async function fetchThroughCors(targetUrl: string): Promise<Response> {
  const candidates =
    typeof window !== 'undefined' ? [sameOriginProxy(targetUrl), targetUrl] : [targetUrl]

  let lastError: unknown
  for (const url of candidates) {
    try {
      return await tryFetch(url)
    } catch (error) {
      lastError = error
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Connection failed')
}
