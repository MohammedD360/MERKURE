import { ClobClient, Chain, OrderSide } from '@polymarket/clob-client'
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

export interface PlaceOrderInput {
  privateKey: string
  tokenId:    string
  side:       'BUY' | 'SELL'
  price:      number
  sizeUsd:    number
}

export interface PlaceOrderResult {
  orderId:      string
  status:       'SUBMITTED' | 'FILLED' | 'REJECTED'
  filledPrice?: number
  source:       'real' | 'simulated'
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

// ── Client public ──────────────────────────────────────────────────────────────

export const polymarketClient = {
  isLiveConfigured: isConfigured,

  async getMarkets(): Promise<PolymarketMarket[]> {
    if (!isConfigured()) return simulatedMarkets()

    try {
      const client = readClient()
      const page = await client.getMarkets()
      const rows = (page as { data?: unknown[] })?.data ?? []
      if (rows.length === 0) return simulatedMarkets()

      // NOTE: le CLOB Polymarket renvoie des objets faiblement typés (`any`) côté SDK.
      // Champs mappés d'après la doc publique de l'API — à revérifier avec une clé
      // réelle avant la mise en LIVE (cf. plan Bot Trading, phase simulée → réelle).
      return rows.slice(0, 25).map((raw) => {
        const r = raw as Record<string, unknown>
        const tokens = (r['tokens'] as Array<Record<string, unknown>> | undefined) ?? []
        const yesToken = tokens.find((t) => String(t['outcome']).toUpperCase() === 'YES') ?? tokens[0]
        const noToken  = tokens.find((t) => String(t['outcome']).toUpperCase() === 'NO')  ?? tokens[1]
        return {
          id:           String(r['condition_id'] ?? r['conditionId'] ?? ''),
          question:     String(r['question'] ?? 'Marché Polymarket'),
          category:     String(r['category'] ?? 'Autre'),
          yesTokenId:   String(yesToken?.['token_id'] ?? yesToken?.['tokenId'] ?? ''),
          noTokenId:    String(noToken?.['token_id'] ?? noToken?.['tokenId'] ?? ''),
          yesPrice:     Number(yesToken?.['price'] ?? 0.5),
          liquidityUsd: Number(r['liquidity'] ?? 0),
          volume24hUsd: Number(r['volume24hr'] ?? r['volume_24hr'] ?? 0),
          source:       'real' as const,
        }
      })
    } catch {
      return simulatedMarkets()
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
      return {
        marketId,
        bids:   (book.bids ?? []).slice(0, 5).map(toLevel),
        asks:   (book.asks ?? []).slice(0, 5).map(toLevel),
        source: 'real',
      }
    } catch {
      return simulatedOrderBook(marketId)
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

    // Dérive les creds L2 (déterministe à partir de la signature de la wallet).
    const bootstrapClient = new ClobClient(clobUrl, Chain.POLYGON, walletClient)
    const creds = await bootstrapClient.deriveApiKey()
    const client = new ClobClient(clobUrl, Chain.POLYGON, walletClient, creds)

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
