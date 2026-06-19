/**
 * Tradovate adapter — synchronisation futures Apex Trader Funding
 *
 * Flux d'auth :  POST /auth/accesstokenrequest  → accessToken (1h)
 * Fills         : GET  /fill/list                → toutes les exécutions
 * Positions     : GET  /position/list            → positions ouvertes
 * Contrats      : GET  /contract/items           → symboles + bigPointValue
 * Balance       : GET  /cashBalance/getCashBalanceSnapshot?accountId=...
 *
 * Les fills sont agrégés en trades complets via matching FIFO par contrat.
 */

import type { BrokerAdapter, TradeData, AccountInfo } from './broker-adapter.js'
import { env } from '../../../config/env.js'

// ── Types Tradovate ────────────────────────────────────────────────────────────

interface TradovateTokenResponse {
  accessToken?: string
  errorText?:   string
  errorCode?:   string
  userId?:      number
}

interface TradovateFill {
  id:         number
  orderId:    number
  contractId: number
  timestamp:  string          // ISO 8601
  action:     'Buy' | 'Sell'
  qty:        number
  price:      number
}

interface TradovatePosition {
  id:         number
  accountId:  number
  contractId: number
  timestamp:  string
  netPos:     number          // positive = long, negative = short
  netPrice:   number | null
  openPnl:    number
}

interface TradovateContract {
  id:        number
  name:      string           // e.g. "MNQM6", "NQM6", "ESM6"
  productId: number
}

interface TradovateProduct {
  id:            number
  name:          string       // e.g. "MNQ", "NQ", "ES"
  bigPointValue: number       // $ per full point
  tickSize:      number
}

interface TradovateCashBalance {
  accountId:     number
  amount:        number
  realizedPnl:   number
  weekRealizedPnl: number
}

// ── Correspondance produit → bigPointValue (cache local) ─────────────────────
// Tradovate expose bigPointValue via l'API product, mais on garde une table de
// fallback pour les contrats courants Apex afin d'éviter des round-trips.
const BIG_POINT_FALLBACK: Record<string, number> = {
  // Micro E-mini
  MNQ: 2,    // Micro Nasdaq
  MES: 5,    // Micro S&P 500
  M2K: 5,    // Micro Russell 2000
  MYM: 0.5,  // Micro Dow
  MGC: 10,   // Micro Gold
  MCL: 100,  // Micro Crude Oil
  // Standard E-mini
  NQ:  20,   // Nasdaq
  ES:  50,   // S&P 500
  RTY: 50,   // Russell 2000
  YM:  5,    // Dow Jones
  GC:  100,  // Gold
  CL:  1000, // Crude Oil
  // Forex futures (CME)
  '6E': 125000, // EUR/USD
  '6B': 62500,  // GBP/USD
  '6J': 12500000, // USD/JPY
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Extrait le code produit d'un nom de contrat (ex: "MNQM6" → "MNQ") */
function extractProduct(contractName: string): string {
  // Retire les 2 derniers chars (mois + année) : "MNQM6" → "MNQ", "ESZ25" → "ES"
  return contractName.replace(/[A-Z]\d{1,2}$/, '')
}

/** Normalise un symbole Tradovate en symbole lisible : "MNQM6" → "MNQ" */
function normalizeSymbol(contractName: string): string {
  return extractProduct(contractName)
}

// ── Adapter ───────────────────────────────────────────────────────────────────

export class TradovateAdapter implements BrokerAdapter {
  private baseUrl     = 'https://demo.tradovateapi.com/v1'  // Apex utilise l'env demo/sim
  private accessToken = ''
  private accountId   = 0
  private productCache = new Map<number, TradovateProduct>()

  async connect(credentials: Record<string, string>): Promise<void> {
    const environment = (credentials['environment'] ?? 'demo') as 'live' | 'demo'
    this.baseUrl   = environment === 'live'
      ? 'https://live.tradovateapi.com/v1'
      : 'https://demo.tradovateapi.com/v1'
    this.accountId = parseInt(credentials['accountId'] ?? '0', 10)

    const body = {
      name:        credentials['username'] ?? '',
      password:    credentials['password'] ?? '',
      appId:       env.TRADOVATE_APP_ID,
      appVersion:  env.TRADOVATE_APP_VERSION,
      cid:         env.TRADOVATE_CID,
      sec:         env.TRADOVATE_SEC,
      deviceId:    'merkure-server',
    }

    const res = await fetch(`${this.baseUrl}/auth/accesstokenrequest`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`Tradovate auth failed ${res.status}: ${text}`)
    }

    const data = await res.json() as TradovateTokenResponse
    if (data.errorText) throw new Error(`Tradovate auth: ${data.errorText}`)
    if (!data.accessToken) throw new Error('Tradovate: no access token returned')

    this.accessToken = data.accessToken
  }

  async getAccountInfo(): Promise<AccountInfo> {
    if (!this.accountId) {
      const accounts = await this.get<{ id: number; name: string }[]>('/account/list')
      if (!accounts.length) throw new Error('Tradovate: no accounts found')
      this.accountId = accounts[0]!.id
    }

    const snapshot = await this.get<TradovateCashBalance>(
      `/cashBalance/getCashBalanceSnapshot?accountId=${this.accountId}`,
    )

    const balance = snapshot.amount ?? 0
    const openPnl = await this.getOpenPnl()

    return {
      balance,
      equity:   balance + openPnl,
      currency: 'USD',
    }
  }

  async getTradeHistory(from: Date, to: Date): Promise<TradeData[]> {
    // ── 1. Récupérer tous les fills du compte ──────────────────────────────
    const allFills = await this.get<TradovateFill[]>('/fill/list')

    const fills = allFills.filter(f => {
      const ts = new Date(f.timestamp)
      return ts >= from && ts <= to
    })

    if (!fills.length) return []

    // ── 2. Résoudre les symboles (contractId → nom) ────────────────────────
    const contractIds = [...new Set(fills.map(f => f.contractId))]
    const contracts   = await this.resolveContracts(contractIds)

    // ── 3. Agréger les fills en trades via FIFO par contrat ────────────────
    return this.aggregateFillsToTrades(fills, contracts)
  }

  disconnect(): void {
    this.accessToken = ''
  }

  // ── Méthodes privées ───────────────────────────────────────────────────────

  private async get<T>(path: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`Tradovate GET ${path} — ${res.status}: ${text}`)
    }
    return res.json() as Promise<T>
  }

  private async getOpenPnl(): Promise<number> {
    try {
      const positions = await this.get<TradovatePosition[]>('/position/list')
      return positions
        .filter(p => p.accountId === this.accountId && p.netPos !== 0)
        .reduce((sum, p) => sum + (p.openPnl ?? 0), 0)
    } catch {
      return 0
    }
  }

  private async resolveContracts(ids: number[]): Promise<Map<number, TradovateContract>> {
    const map = new Map<number, TradovateContract>()
    if (!ids.length) return map

    // Tradovate bulk fetch: POST /contract/items
    try {
      const contracts = await fetch(`${this.baseUrl}/contract/items`, {
        method:  'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids }),
      }).then(r => r.json()) as TradovateContract[]

      for (const c of contracts) map.set(c.id, c)
    } catch {
      // fallback: contrats inconnus → symbol = contractId
    }
    return map
  }

  private getBigPointValue(product: string): number {
    return BIG_POINT_FALLBACK[product] ?? 1
  }

  /**
   * FIFO matching : les fills d'un même contrat sont appariés pour reconstituer
   * les trades complets (entrée → sortie).
   */
  private aggregateFillsToTrades(
    fills:     TradovateFill[],
    contracts: Map<number, TradovateContract>,
  ): TradeData[] {
    const trades: TradeData[] = []

    // Groupe les fills par contrat, triés par timestamp ASC
    const byContract = new Map<number, TradovateFill[]>()
    for (const fill of fills) {
      if (!byContract.has(fill.contractId)) byContract.set(fill.contractId, [])
      byContract.get(fill.contractId)!.push(fill)
    }
    for (const list of byContract.values()) {
      list.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    }

    for (const [contractId, contractFills] of byContract) {
      const contract     = contracts.get(contractId)
      const symbol       = contract ? normalizeSymbol(contract.name) : `CT${contractId}`
      const bigPointVal  = this.getBigPointValue(extractProduct(symbol))

      // Pile FIFO pour le matching long/short
      type PendingLeg = { price: number; qty: number; time: Date; commission: number }
      const longLegs:  PendingLeg[] = []
      const shortLegs: PendingLeg[] = []

      for (const fill of contractFills) {
        const fillTime  = new Date(fill.timestamp)
        const fillComm  = 0 // Tradovate ne retourne pas la commission par fill — on met 0

        if (fill.action === 'Buy') {
          if (shortLegs.length > 0) {
            // Ferme une position short existante
            let remaining = fill.qty
            while (remaining > 0 && shortLegs.length > 0) {
              const leg = shortLegs[0]!
              const matched = Math.min(remaining, leg.qty)

              const pnl = (leg.price - fill.price) * matched * bigPointVal
              trades.push({
                externalId:  `tv-${contractId}-${leg.time.getTime()}-${fillTime.getTime()}`,
                symbol,
                direction:   'SHORT',
                openTime:    leg.time,
                closeTime:   fillTime,
                openPrice:   leg.price,
                closePrice:  fill.price,
                lotSize:     matched,
                pnl:         Math.round(pnl * 100) / 100,
                swap:        0,
                commission:  leg.commission + fillComm,
                status:      'CLOSED',
              })

              leg.qty -= matched
              remaining -= matched
              if (leg.qty <= 0) shortLegs.shift()
            }
            // Le reste ouvre une position long
            if (remaining > 0) {
              longLegs.push({ price: fill.price, qty: remaining, time: fillTime, commission: fillComm })
            }
          } else {
            // Ouvre ou ajoute à une position long
            longLegs.push({ price: fill.price, qty: fill.qty, time: fillTime, commission: fillComm })
          }
        } else {
          // Sell
          if (longLegs.length > 0) {
            // Ferme une position long existante
            let remaining = fill.qty
            while (remaining > 0 && longLegs.length > 0) {
              const leg = longLegs[0]!
              const matched = Math.min(remaining, leg.qty)

              const pnl = (fill.price - leg.price) * matched * bigPointVal
              trades.push({
                externalId:  `tv-${contractId}-${leg.time.getTime()}-${fillTime.getTime()}`,
                symbol,
                direction:   'LONG',
                openTime:    leg.time,
                closeTime:   fillTime,
                openPrice:   leg.price,
                closePrice:  fill.price,
                lotSize:     matched,
                pnl:         Math.round(pnl * 100) / 100,
                swap:        0,
                commission:  leg.commission + fillComm,
                status:      'CLOSED',
              })

              leg.qty -= matched
              remaining -= matched
              if (leg.qty <= 0) longLegs.shift()
            }
            // Le reste ouvre une position short
            if (remaining > 0) {
              shortLegs.push({ price: fill.price, qty: remaining, time: fillTime, commission: fillComm })
            }
          } else {
            // Ouvre ou ajoute à une position short
            shortLegs.push({ price: fill.price, qty: fill.qty, time: fillTime, commission: fillComm })
          }
        }
      }

      // Positions encore ouvertes
      for (const leg of longLegs) {
        trades.push({
          externalId: `tv-open-long-${contractId}-${leg.time.getTime()}`,
          symbol,
          direction:  'LONG',
          openTime:   leg.time,
          closeTime:  null,
          openPrice:  leg.price,
          closePrice: null,
          lotSize:    leg.qty,
          pnl:        null,
          swap:       0,
          commission: leg.commission,
          status:     'OPEN',
        })
      }
      for (const leg of shortLegs) {
        trades.push({
          externalId: `tv-open-short-${contractId}-${leg.time.getTime()}`,
          symbol,
          direction:  'SHORT',
          openTime:   leg.time,
          closeTime:  null,
          openPrice:  leg.price,
          closePrice: null,
          lotSize:    leg.qty,
          pnl:        null,
          swap:       0,
          commission: leg.commission,
          status:     'OPEN',
        })
      }
    }

    return trades
  }
}
