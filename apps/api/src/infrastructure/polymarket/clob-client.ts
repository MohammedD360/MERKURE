import { ClobClient, Chain, OrderSide, SignatureType } from '@polymarket/clob-client'
import { createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { polygon } from 'viem/chains'
import { env } from '../../config/env.js'

export interface PolymarketMarket {
  id:           string // condition ID
  question:     string
  category:     string
  yesTokenId:   string
  noTokenId:    string
  yesPrice:     number
  liquidityUsd: number
  volume24hUsd: number
  source:       'real' | 'simulated'
  resolvesAt?:  string // ISO — utile pour les marchés récurrents (5 min, horaire) où le temps restant compte
}

export interface OrderBookLevel {
  price: number
  size:  number
}

export interface PolymarketOrderBook {
  marketId: string
  bids:     OrderBookLevel[]
  asks:     OrderBookLevel[]
  source:   'real' | 'simulated'
}

// Comment le compte Polymarket de l'utilisateur a été créé — détermine le
// signatureType EIP-712 attendu par le CLOB (cf. Polymarket/agent-skills) :
//  - MAGIC_EMAIL   → compte existant connecté par email (Magic Link) → POLY_PROXY (1)
//  - FRESH_WALLET  → wallet EOA dédiée créée pour le bot, sans Magic Link → POLY_GNOSIS_SAFE (2)
export type PolymarketAccountKind = 'MAGIC_EMAIL' | 'FRESH_WALLET'

function toSignatureType(kind: PolymarketAccountKind): SignatureType {
  return kind === 'MAGIC_EMAIL' ? SignatureType.POLY_PROXY : SignatureType.POLY_GNOSIS_SAFE
}

export interface PlaceOrderInput {
  privateKey:    string
  funderAddress: string // adresse du proxy wallet Polymarket qui détient les fonds
  accountKind:   PolymarketAccountKind
  tokenId:       string
  side:          'BUY' | 'SELL'
  price:         number
  sizeUsd:       number
}

export interface PlaceOrderResult {
  orderId:      string
  status:       'SUBMITTED' | 'FILLED' | 'REJECTED'
  filledPrice?: number
  source:       'real' | 'simulated'
}

export interface MarketResolution {
  closed: boolean
  // null si le marché n'est pas encore résolu (closed === false)
  yesWon: boolean | null
}

// ── Config ─────────────────────────────────────────────────────────────────────

function isConfigured(): boolean {
  return Boolean(env.POLYMARKET_CLOB_URL)
}

function requireClobUrl(): string {
  if (!env.POLYMARKET_CLOB_URL) throw new Error('polymarket_clob_url_not_configured')
  return env.POLYMARKET_CLOB_URL
}

function readClient(): ClobClient {
  return new ClobClient(requireClobUrl(), Chain.POLYGON)
}

// ── Mode simulé (aucune URL CLOB configurée, ou l'appel réel échoue) ───────────
// Marchés canoniques déterministes (seedés par jour) — permet de développer et
// tester tout le pipeline (agent, worker, UI) sans dépendre de Polymarket.

const SIMULATED_MARKET_TEMPLATES = [
  { id: 'sim-btc-100k',   question: 'Le BTC dépassera-t-il 100 000 $ ce mois-ci ?',           category: 'Crypto' },
  { id: 'sim-fed-cut',    question: 'La Fed baissera-t-elle ses taux à la prochaine réunion ?', category: 'Économie' },
  { id: 'sim-eth-etf',    question: 'Un nouvel ETF ETH sera-t-il approuvé ce trimestre ?',       category: 'Crypto' },
  { id: 'sim-elections',  question: "Le candidat sortant l'emportera-t-il ?",                    category: 'Politique' },
]

function seededFraction(seed: string): number {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return (h % 10_000) / 10_000
}

function daySeed(): string {
  return new Date().toISOString().slice(0, 10)
}

function simulatedMarkets(): PolymarketMarket[] {
  const seed = daySeed()
  return SIMULATED_MARKET_TEMPLATES.map((m) => {
    const yesPrice = 0.15 + seededFraction(`${seed}:${m.id}:price`) * 0.7
    return {
      id:           m.id,
      question:     m.question,
      category:     m.category,
      yesTokenId:   `${m.id}-yes`,
      noTokenId:    `${m.id}-no`,
      yesPrice:     Number(yesPrice.toFixed(4)),
      liquidityUsd: Math.round(5_000 + seededFraction(`${seed}:${m.id}:liq`) * 95_000),
      volume24hUsd: Math.round(1_000 + seededFraction(`${seed}:${m.id}:vol`) * 40_000),
      source:       'simulated',
    }
  })
}

function simulatedOrderBook(marketId: string): PolymarketOrderBook {
  const seed = `${daySeed()}:${marketId}:${Math.floor(Date.now() / 60_000)}` // change chaque minute
  const mid = 0.15 + seededFraction(seed) * 0.7
  const spread = 0.01 + seededFraction(`${seed}:spread`) * 0.02
  const level = (offset: number, i: number): OrderBookLevel => ({
    price: Number(Math.max(0.01, Math.min(0.99, offset)).toFixed(4)),
    size:  Math.round(50 + seededFraction(`${seed}:${i}`) * 950),
  })
  return {
    marketId,
    bids:   [0, 1, 2].map((i) => level(mid - spread / 2 - i * 0.005, i)),
    asks:   [0, 1, 2].map((i) => level(mid + spread / 2 + i * 0.005, i + 10)),
    source: 'simulated',
  }
}

// ── Marchés réels (Gamma API — l'endpoint CLOB brut /markets n'est pas filtré
// et renvoie des marchés clôturés depuis 2020 en premier ; Gamma expose active/
// closed/liquidity/volume directement et permet de trier par volume). ─────────

const CATEGORY_PATTERNS: Array<[string, RegExp]> = [
  ['Crypto',    /\b(bitcoin|btc|ethereum|eth|solana|sol|crypto|altcoin|defi|xrp|dogecoin)\b/i],
  ['Économie',  /\b(fed|inflation|gdp|recession|interest rate|jobs report|unemployment|cpi)\b/i],
  ['Politique', /\b(president|election|senate|congress|governor|impeachment|nomination|prime minister|parliament)\b/i],
  ['Sport',     /\b(vs\.|world cup|nba|nfl|nhl|mlb|ufc|olympics|championship|match|fifa)\b/i],
]

// Heuristique par mots-clés — Gamma API n'expose pas de champ catégorie direct.
function guessCategory(question: string): string {
  const match = CATEGORY_PATTERNS.find(([, pattern]) => pattern.test(question))
  return match?.[0] ?? 'Autre'
}

interface GammaMarket {
  conditionId?:   string
  question?:      string
  outcomes?:      string // JSON stringifié, ex. '["Yes","No"]'
  clobTokenIds?:  string // JSON stringifié, même ordre que outcomes
  outcomePrices?: string // JSON stringifié, même ordre que outcomes
  liquidityNum?:  number
  volume24hr?:    number
  active?:        boolean
  closed?:        boolean
  endDate?:       string
}

function mapGammaMarket(r: GammaMarket): PolymarketMarket {
  const outcomes = JSON.parse(r.outcomes ?? '[]') as string[]
  const tokenIds = JSON.parse(r.clobTokenIds ?? '[]') as string[]
  const prices   = JSON.parse(r.outcomePrices ?? '[]') as string[]
  const yesIdx = outcomes.findIndex((o) => o.toUpperCase() === 'YES')
  const noIdx  = outcomes.findIndex((o) => o.toUpperCase() === 'NO')
  const question = r.question ?? 'Marché Polymarket'

  return {
    id:           r.conditionId ?? '',
    question,
    category:     guessCategory(question),
    yesTokenId:   tokenIds[yesIdx] ?? tokenIds[0] ?? '',
    noTokenId:    tokenIds[noIdx]  ?? tokenIds[1] ?? '',
    yesPrice:     Number(prices[yesIdx] ?? 0.5),
    liquidityUsd: Number(r.liquidityNum ?? 0),
    volume24hUsd: Number(r.volume24hr ?? 0),
    source:       'real' as const,
    ...(r.endDate ? { resolvesAt: r.endDate } : {}),
  }
}

async function fetchGammaMarkets(): Promise<PolymarketMarket[]> {
  const res = await fetch(
    'https://gamma-api.polymarket.com/markets?active=true&closed=false&order=volume24hr&ascending=false&limit=25',
  )
  if (!res.ok) throw new Error(`gamma_api_error_${res.status}`)

  const rows = (await res.json()) as GammaMarket[]
  return rows.map(mapGammaMarket)
}

interface GammaSearchEvent {
  markets?: GammaMarket[]
}

// Recherche par mot-clé — utile quand un signal baleine référence un marché
// hors du top N par volume que get_markets renvoie (ex. un match précis alors
// que le top volume ne contient que des marchés "vainqueur du tournoi").
async function searchGammaMarkets(query: string): Promise<PolymarketMarket[]> {
  const res = await fetch(
    `https://gamma-api.polymarket.com/public-search?${new URLSearchParams({ q: query, limit_per_type: '10' })}`,
  )
  if (!res.ok) throw new Error(`gamma_search_error_${res.status}`)

  const json = (await res.json()) as { events?: GammaSearchEvent[] }
  const markets = (json.events ?? []).flatMap((e) => e.markets ?? [])

  return markets
    .filter((m) => m.active && !m.closed)
    .map(mapGammaMarket)
    .sort((a, b) => b.volume24hUsd - a.volume24hUsd)
    .slice(0, 5)
}

// ── Marchés crypto "Up or Down" à haute fréquence (5 min / horaire) ────────────
// Ce ne sont pas des marchés fixes : Polymarket en recrée un nouveau à chaque
// fenêtre. Le slug encode la fenêtre — active=true/closed=false n'est PAS fiable
// pour les retrouver (constaté : de nombreuses instances passées restent mal
// indexées comme actives), donc on calcule directement le slug de la fenêtre en
// cours plutôt que de filtrer/trier une liste.

function fiveMinuteUpDownSlug(prefix: 'btc-updown-5m' | 'sol-updown-5m'): string {
  const windowStart = Math.floor(Date.now() / 1000 / 300) * 300
  return `${prefix}-${windowStart}`
}

// Les marchés horaires ETH utilisent un slug lisible en heure de New York
// (ex. "ethereum-up-or-down-july-4-2026-11am-et"), pas un slug à base d'epoch.
function ethHourlyUpDownSlug(): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', hour12: true,
  }).formatToParts(new Date())
  const part = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  const month = part('month').toLowerCase()
  const day   = part('day')
  const year  = part('year')
  const hour  = part('hour')
  const ampm  = part('dayPeriod').toLowerCase()
  return `ethereum-up-or-down-${month}-${day}-${year}-${hour}${ampm}-et`
}

async function fetchMarketBySlug(slug: string): Promise<PolymarketMarket | null> {
  const res = await fetch(`https://gamma-api.polymarket.com/markets?${new URLSearchParams({ slug })}`)
  if (!res.ok) throw new Error(`gamma_slug_error_${res.status}`)
  const rows = (await res.json()) as GammaMarket[]
  return rows[0] ? mapGammaMarket(rows[0]) : null
}

async function fetchCryptoUpDownMarkets(): Promise<PolymarketMarket[]> {
  const slugs = [
    fiveMinuteUpDownSlug('btc-updown-5m'),
    fiveMinuteUpDownSlug('sol-updown-5m'),
    ethHourlyUpDownSlug(),
  ]
  const markets = await Promise.all(slugs.map((slug) => fetchMarketBySlug(slug).catch(() => null)))
  return markets.filter((m): m is PolymarketMarket => m !== null)
}

// ── Résolution de marché (pour le règlement du PnL) ────────────────────────────

interface ClobMarketToken {
  outcome?: string
  winner?:  boolean
}

async function fetchMarketResolution(conditionId: string): Promise<MarketResolution> {
  const res = await fetch(`${requireClobUrl()}/markets/${conditionId}`)
  if (!res.ok) throw new Error(`clob_market_error_${res.status}`)

  const market = (await res.json()) as { closed?: boolean; tokens?: ClobMarketToken[] }
  if (!market.closed) return { closed: false, yesWon: null }

  const yesToken = (market.tokens ?? []).find((t) => String(t.outcome).toUpperCase() === 'YES')
  return { closed: true, yesWon: Boolean(yesToken?.winner) }
}

// ── Client public ──────────────────────────────────────────────────────────────

export const polymarketClient = {
  isLiveConfigured: isConfigured,

  async getMarkets(): Promise<PolymarketMarket[]> {
    if (!isConfigured()) return simulatedMarkets()

    try {
      const markets = await fetchGammaMarkets()
      return markets.length > 0 ? markets : simulatedMarkets()
    } catch {
      return simulatedMarkets()
    }
  },

  // Les 3 marchés crypto haute fréquence ciblés par le bot : BTC/SOL Up or Down
  // (5 min) et ETH Up or Down (horaire) — toujours l'instance en cours.
  async getCryptoUpDownMarkets(): Promise<PolymarketMarket[]> {
    if (!isConfigured()) return []

    try {
      return await fetchCryptoUpDownMarkets()
    } catch {
      return []
    }
  },

  async searchMarkets(query: string): Promise<PolymarketMarket[]> {
    if (!isConfigured()) {
      const needle = query.toLowerCase()
      return simulatedMarkets().filter((m) => m.question.toLowerCase().includes(needle))
    }

    try {
      return await searchGammaMarkets(query)
    } catch {
      return []
    }
  },

  async getOrderBook(marketId: string, tokenId: string): Promise<PolymarketOrderBook> {
    if (!isConfigured() || !tokenId) return simulatedOrderBook(marketId)

    try {
      const client = readClient()
      const book = await client.getOrderBook(tokenId)
      const toLevel = (l: { price: string; size: string }): OrderBookLevel => ({
        price: Number(l.price),
        size:  Number(l.size),
      })
      // Le CLOB renvoie bids/asks triés du pire au meilleur prix (bids croissants,
      // asks décroissants) — le meilleur prix est donc en fin de tableau, pas en tête.
      return {
        marketId,
        bids:   (book.bids ?? []).slice(-5).reverse().map(toLevel),
        asks:   (book.asks ?? []).slice(-5).reverse().map(toLevel),
        source: 'real',
      }
    } catch {
      return simulatedOrderBook(marketId)
    }
  },

  // Sert au règlement du PnL : le marché est-il résolu, et quel côté a gagné ?
  // En mode simulé, on ne prétend pas simuler une résolution réaliste — les
  // positions DRY_RUN sur marchés simulés restent simplement non réglées.
  async getMarketResolution(conditionId: string): Promise<MarketResolution> {
    if (!isConfigured()) return { closed: false, yesWon: null }

    try {
      return await fetchMarketResolution(conditionId)
    } catch {
      return { closed: false, yesWon: null }
    }
  },

  /**
   * Place un ordre réel signé (EIP-712) via la wallet du bot.
   * N'est appelé par l'agent que si le bot est en mode LIVE — en DRY_RUN,
   * l'appelant simule le fill sans jamais invoquer cette fonction avec
   * un ordre réel (voir trading-agent.ts).
   */
  async placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
    if (!isConfigured()) {
      return { orderId: `sim_${Date.now()}`, status: 'FILLED', filledPrice: input.price, source: 'simulated' }
    }

    const clobUrl = requireClobUrl()
    const account = privateKeyToAccount(input.privateKey as `0x${string}`)
    const walletClient = createWalletClient({ account, chain: polygon, transport: http() })

    // funderAddress = adresse du proxy wallet qui détient réellement les fonds,
    // distincte de l'adresse EOA qui signe (visible dans les paramètres du
    // compte sur polymarket.com). Le signatureType dépend de la façon dont le
    // compte a été créé (cf. PolymarketAccountKind ci-dessus).
    const signatureType = toSignatureType(input.accountKind)

    // Dérive les creds L2 (déterministe à partir de la signature de la wallet).
    const bootstrapClient = new ClobClient(clobUrl, Chain.POLYGON, walletClient, undefined, signatureType, input.funderAddress)
    const creds = await bootstrapClient.deriveApiKey()
    const client = new ClobClient(clobUrl, Chain.POLYGON, walletClient, creds, signatureType, input.funderAddress)

    const order = await client.createOrder({
      tokenID: input.tokenId,
      price:   input.price,
      size:    Number((input.sizeUsd / input.price).toFixed(2)),
      // `as any` : le package publie des types dupliqués (résolution ESM/CJS)
      // pour l'enum Side, ce qui rend les deux imports nominalement distincts
      // aux yeux de TypeScript malgré des valeurs identiques (BUY=0, SELL=1).
      side: (input.side === 'BUY' ? OrderSide.BUY : OrderSide.SELL) as any,
    })

    const res = (await client.postOrder(order)) as Record<string, unknown>
    const orderId = String(res['orderID'] ?? res['orderId'] ?? 'unknown')

    return { orderId, status: 'SUBMITTED', source: 'real' }
  },
}
