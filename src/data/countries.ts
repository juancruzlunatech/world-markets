// This file stores the countries that users can select in the news page.
// Each country has a code, its display name, and a Google News RSS URL.

export type NewsCountry = {
  code: string
  name: string
  rss: string
}

// The news screen uses this array to render the dropdown menu.
// Each feed is linked to a language or regional version of Google News.
export const NEWS_COUNTRIES: NewsCountry[] = [
  {
    code: 'US',
    name: 'United States',
    rss: 'https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en',
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    rss: 'https://news.google.com/rss?hl=en-GB&gl=GB&ceid=GB:en',
  },
  {
    code: 'ES',
    name: 'Spain',
    rss: 'https://news.google.com/rss?hl=es&gl=ES&ceid=ES:es',
  },
  {
    code: 'MX',
    name: 'Mexico',
    rss: 'https://news.google.com/rss?hl=es-419&gl=MX&ceid=MX:es-419',
  },
  {
    code: 'AR',
    name: 'Argentina',
    rss: 'https://news.google.com/rss?hl=es-419&gl=AR&ceid=AR:es-419',
  },
  {
    code: 'CO',
    name: 'Colombia',
    rss: 'https://news.google.com/rss?hl=es-419&gl=CO&ceid=CO:es-419',
  },
  {
    code: 'CL',
    name: 'Chile',
    rss: 'https://news.google.com/rss?hl=es-419&gl=CL&ceid=CL:es-419',
  },
  {
    code: 'BR',
    name: 'Brazil',
    rss: 'https://news.google.com/rss?hl=pt-BR&gl=BR&ceid=BR:pt-BR',
  },
  {
    code: 'FR',
    name: 'France',
    rss: 'https://news.google.com/rss?hl=fr&gl=FR&ceid=FR:fr',
  },
  {
    code: 'DE',
    name: 'Germany',
    rss: 'https://news.google.com/rss?hl=de&gl=DE&ceid=DE:de',
  },
  {
    code: 'IT',
    name: 'Italy',
    rss: 'https://news.google.com/rss?hl=it&gl=IT&ceid=IT:it',
  },
  {
    code: 'JP',
    name: 'Japan',
    rss: 'https://news.google.com/rss?hl=ja&gl=JP&ceid=JP:ja',
  },
  {
    code: 'CN',
    name: 'China',
    rss: 'https://news.google.com/rss?hl=zh-CN&gl=CN&ceid=CN:zh-Hans',
  },
  {
    code: 'IN',
    name: 'India',
    rss: 'https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en',
  },
  {
    code: 'AU',
    name: 'Australia',
    rss: 'https://news.google.com/rss?hl=en-AU&gl=AU&ceid=AU:en',
  },
  {
    code: 'CA',
    name: 'Canada',
    rss: 'https://news.google.com/rss?hl=en-CA&gl=CA&ceid=CA:en',
  },
  {
    code: 'KR',
    name: 'South Korea',
    rss: 'https://news.google.com/rss?hl=ko&gl=KR&ceid=KR:ko',
  },
]
