async function tryFetch(url: string): Promise<Response> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }
  return response
}

export async function fetchThroughCors(targetUrl: string): Promise<Response> {
  const proxies = [
    targetUrl,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`,
    `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`,
  ]

  let lastError: unknown
  for (const url of proxies) {
    try {
      return await tryFetch(url)
    } catch (error) {
      lastError = error
    }
  }
  throw lastError instanceof Error ? lastError : new Error('No se pudo conectar')
}
