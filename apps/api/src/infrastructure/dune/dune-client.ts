import { env } from '../../config/env.js'
import { cache } from '../cache/redis.js'

export interface WhaleSignal {
  wallet:     string
  sizeUsd:    number
  side:       'BUY' | 'SELL'
  marketHint: string | null
  detectedAt: string
  source:     'real' | 'simulated'
}

const CACHE_TTL_SECONDS = 300 // les requêtes Dune sont lentes/rate-limitées — on ne les tape pas à chaque tick agent
const CACHE_KEY = 'dune:polymarket:whale-signals'

function isConfigured(): boolean {
  return Boolean(env.DUNE_API_KEY && env.DUNE_WHALE_QUERY_ID)
}

// ── Mode simulé ─────────────────────────────────────────────────────────────────

const WHALE_WALLETS = [
  '0x7a3f...c9e1', '0x1b6d...4f02', '0x9e44...a71c', '0x3c88...0dd9',
]

function seededFraction(seed: string): number {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return (h % 10_000) / 10_000
}

function simulatedWhaleSignals(): WhaleSignal[] {
  const bucket = Math.floor(Date.now() / (5 * 60_000)) // change toutes les 5 min
  const count = 1 + Math.floor(seededFraction(`whale:${bucket}:count`) * 3) // 1 à 3 signaux
  return Array.from({ length: count }, (_, i) => {
    const seed = `whale:${bucket}:${i}`
    const wallet = WHALE_WALLETS[Math.floor(seededFraction(`${seed}:w`) * WHALE_WALLETS.length)] ?? WHALE_WALLETS[0]!
    return {
      wallet,
      sizeUsd:    Math.round(10_000 + seededFraction(`${seed}:size`) * 90_000),
      side:       seededFraction(`${seed}:side`) > 0.5 ? 'BUY' as const : 'SELL' as const,
      marketHint: null,
      detectedAt: new Date(bucket * 5 * 60_000).toISOString(),
      source:     'simulated' as const,
    }
  })
}

// ── Client réel (Dune Analytics API v1 — requête sauvegardée) ──────────────────

interface DuneResultRow {
  wallet_address?: string
  wallet?:         string
  amount_usd?:     number
  size_usd?:       number
  side?:           string
  market?:         string
  block_time?:     string
  timestamp?:      string
}

async function fetchRealWhaleSignals(): Promise<WhaleSignal[]> {
  const res = await fetch(
    `https://api.dune.com/api/v1/query/${env.DUNE_WHALE_QUERY_ID}/results?limit=20`,
    { headers: { 'X-Dune-API-Key': env.DUNE_API_KEY as string } },
  )
  if (!res.ok) throw new Error(`dune_api_error_${res.status}`)

  const json = await res.json() as { result?: { rows?: DuneResultRow[] } }
  const rows = json.result?.rows ?? []

  return rows.map((r) => ({
    wallet:     String(r.wallet_address ?? r.wallet ?? 'unknown'),
    sizeUsd:    Number(r.amount_usd ?? r.size_usd ?? 0),
    side:       String(r.side ?? 'BUY').toUpperCase() === 'SELL' ? 'SELL' as const : 'BUY' as const,
    marketHint: r.market ?? null,
    detectedAt: r.block_time ?? r.timestamp ?? new Date().toISOString(),
    source:     'real' as const,
  }))
}

// ── Client public ────────────────────────────────────────────────────────────────

export const duneClient = {
  isLiveConfigured: isConfigured,

  async getWhaleActivity(): Promise<WhaleSignal[]> {
    const cached = await cache.get<WhaleSignal[]>(CACHE_KEY)
    if (cached) return cached

    const signals = isConfigured()
      ? await fetchRealWhaleSignals().catch(() => simulatedWhaleSignals())
      : simulatedWhaleSignals()

    await cache.set(CACHE_KEY, signals, CACHE_TTL_SECONDS)
    return signals
  },
}
