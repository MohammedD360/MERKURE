import { env } from '../../config/env.js'
import { cache } from '../cache/redis.js'

export interface Quote {
  symbol:        string
  name:          string
  price:         number
  change:        number
  percentChange: number
  previousClose: number
  isMarketOpen:  boolean
  datetime:      string | null
}

interface TwelveDataQuoteRaw {
  symbol?:          string
  name?:            string
  close?:           string
  previous_close?:  string
  change?:          string
  percent_change?:  string
  is_market_open?:  boolean
  datetime?:        string
  status?:          string
  code?:            number
  message?:         string
}

// Watchlist fixe — symboles internes → symboles Twelve Data.
// NDX (indice Nasdaq 100) exige un plan payant chez Twelve Data ; QQQ (l'ETF qui
// réplique l'indice) est disponible sur le plan gratuit et sert de proxy.
export const WATCHLIST: Record<string, string> = {
  XAUUSD: 'XAU/USD',
  NAS100: 'QQQ',
}

const CACHE_KEY = 'market-data:quotes'
const CACHE_TTL_SECONDS = 30 // plan gratuit Twelve Data : 800 requêtes/jour — on mutualise entre tous les utilisateurs

function isConfigured(): boolean {
  return Boolean(env.TWELVE_DATA_API_KEY)
}

function parseQuote(internalSymbol: string, raw: TwelveDataQuoteRaw): Quote | null {
  if (!raw || raw.status === 'error' || raw.close == null) return null
  return {
    symbol:        internalSymbol,
    name:          raw.name ?? internalSymbol,
    price:         Number(raw.close),
    change:        Number(raw.change ?? 0),
    percentChange: Number(raw.percent_change ?? 0),
    previousClose: Number(raw.previous_close ?? raw.close),
    isMarketOpen:  Boolean(raw.is_market_open),
    datetime:      raw.datetime ?? null,
  }
}

async function fetchQuotes(): Promise<Quote[]> {
  const entries = Object.entries(WATCHLIST)
  const symbols = entries.map(([, tdSymbol]) => tdSymbol).join(',')

  const res = await fetch(
    `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(symbols)}&apikey=${env.TWELVE_DATA_API_KEY}`,
  )
  if (!res.ok) throw new Error(`twelve_data_api_error_${res.status}`)

  const json = await res.json() as TwelveDataQuoteRaw | Record<string, TwelveDataQuoteRaw>

  // Twelve Data renvoie un objet unique pour 1 symbole, ou un objet keyé par symbole pour plusieurs.
  const isMultiSymbol = entries.length > 1

  return entries
    .map(([internalSymbol, tdSymbol]) => {
      const raw = isMultiSymbol
        ? (json as Record<string, TwelveDataQuoteRaw>)[tdSymbol]
        : (json as TwelveDataQuoteRaw)
      return raw ? parseQuote(internalSymbol, raw) : null
    })
    .filter((q): q is Quote => q !== null)
}

export const twelveDataClient = {
  isLiveConfigured: isConfigured,

  async getWatchlistQuotes(): Promise<Quote[]> {
    if (!isConfigured()) return []

    const cached = await cache.get<Quote[]>(CACHE_KEY)
    if (cached) return cached

    const quotes = await fetchQuotes()
    await cache.set(CACHE_KEY, quotes, CACHE_TTL_SECONDS)
    return quotes
  },
}
