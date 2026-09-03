// This helper tries a standard fetch and throws an error if the status is not successful.
// It is useful when the browser blocks direct access to an external resource.
async function tryFetch(url: string): Promise<Response> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
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

// This function first uses same-origin proxy routes so the browser avoids CORS
// restrictions while developing locally. In production, the app would still need a
// backend or an API layer to access third-party sources safely.
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
