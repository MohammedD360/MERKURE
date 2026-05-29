import { env } from '../../../config/env.js'
import type { BrokerAdapter, TradeData, AccountInfo } from './broker-adapter.js'

const PROVISION_URL = 'https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai'

interface MetaDeal {
  id:          string
  type:        string   // DEAL_TYPE_BUY | DEAL_TYPE_SELL | DEAL_TYPE_BALANCE | ...
  entryType?:  string   // DEAL_ENTRY_IN | DEAL_ENTRY_OUT | DEAL_ENTRY_INOUT
  positionId?: string
  orderId?:    string
  symbol?:     string
  volume?:     number
  price?:      number
  profit?:     number
  commission?: number
  swap?:       number
  time:        string
  brokerTime?: string
}

interface MetaAccountInfo {
  balance:  number
  equity:   number
  currency: string
  leverage: number
}

function clientUrl(region: string): string {
  return `https://mt-client-api-v1.${region}.agiliumtrade.ai`
}

function token(): string {
  const t = env.METAAPI_TOKEN ?? env.META_API_TOKEN
  if (!t) throw new Error('METAAPI_TOKEN not configured')
  return t
}

async function metaFetch(url: string, init?: RequestInit) {
  const res = await fetch(url, {
    ...init,
    headers: { 'auth-token': token(), 'Content-Type': 'application/json', ...init?.headers },
  })
  const text = await res.text()
  if (!res.ok) {
    let msg = text
    try { msg = JSON.parse(text).message ?? text } catch { /* raw */ }
    throw new Error(`MetaAPI ${res.status}: ${msg}`)
  }
  return text ? JSON.parse(text) : null
}

export class MetaApiAdapter implements BrokerAdapter {
  private metaApiId: string | null = null
  private region:    string        = 'london'

  async connect(credentials: Record<string, string>): Promise<void> {
    const accountId   = credentials['accountId']   ?? ''
    const upass       = credentials['upass']       ?? ''
    const tradeserver = credentials['tradeserver'] ?? ''
    const platform    = credentials['platform']    ?? 'mt4'
    const metaApiId   = credentials['metaApiId']

    this.metaApiId = metaApiId ?? (await this.findOrProvision(accountId, upass, tradeserver, platform))

    const account = await metaFetch(`${PROVISION_URL}/users/current/accounts/${this.metaApiId}`)
    this.region = account.region ?? 'london'

    if (account.state === 'UNDEPLOYED' || account.state === 'DEPLOYING') {
      await this.deploy()
    }

    if (account.connectionStatus !== 'CONNECTED') {
      await this.waitForConnection(90_000)
    }
  }

  async getAccountInfo(): Promise<AccountInfo> {
    if (!this.metaApiId) throw new Error('Not connected')
    const info: MetaAccountInfo = await metaFetch(
      `${clientUrl(this.region)}/users/current/accounts/${this.metaApiId}/account-information`,
    )
    return {
      balance:  info.balance,
      equity:   info.equity,
      currency: info.currency ?? 'USD',
    }
  }

  async getTradeHistory(from: Date, to: Date): Promise<TradeData[]> {
    if (!this.metaApiId) throw new Error('Not connected')

    const fromEnc = encodeURIComponent(from.toISOString())
    const toEnc   = encodeURIComponent(to.toISOString())
    const deals: MetaDeal[] = await metaFetch(
      `${clientUrl(this.region)}/users/current/accounts/${this.metaApiId}/history-deals/time/${fromEnc}/${toEnc}`,
    )

    return this.dealsToTrades(deals ?? [])
  }

  disconnect(): void {
    this.metaApiId = null
  }

  // ── Private helpers ──────────────────────────────────────────────────────────

  private async findOrProvision(
    login: string, password: string, server: string, platform: string,
  ): Promise<string> {
    // MetaAPI returns _id (MongoDB convention), not id
    const accounts: { _id: string; login: string; server: string }[] = await metaFetch(
      `${PROVISION_URL}/users/current/accounts?limit=100`,
    )

    // Try exact match first, then fall back to login-only (server name format may differ)
    const byLoginServer = accounts.find(a => a.login === login && a.server === server)
    if (byLoginServer) return byLoginServer._id

    const byLogin = accounts.find(a => a.login === login)
    if (byLogin) return byLogin._id

    // Provision new account — use the broker server name as-is
    const created = await metaFetch(`${PROVISION_URL}/users/current/accounts`, {
      method: 'POST',
      body: JSON.stringify({
        name:     `${login}@${server}`,
        type:     'cloud',
        login,
        password,
        server,
        platform,
        magic:    0,
      }),
    })
    return created._id ?? created.id
  }

  private async deploy(): Promise<void> {
    await metaFetch(
      `${PROVISION_URL}/users/current/accounts/${this.metaApiId}/deploy`,
      { method: 'POST', body: '{}' },
    )
  }

  private async waitForConnection(timeoutMs: number): Promise<void> {
    const deadline = Date.now() + timeoutMs
    while (Date.now() < deadline) {
      await new Promise(r => setTimeout(r, 5_000))
      const account = await metaFetch(`${PROVISION_URL}/users/current/accounts/${this.metaApiId}`)
      if (account.connectionStatus === 'CONNECTED') return
      if (account.connectionStatus === 'ERROR') {
        throw new Error(`MetaAPI connection error: ${account.connectionError ?? 'unknown'}`)
      }
    }
    throw new Error('MetaAPI: délai de connexion dépassé (90s)')
  }

  private dealsToTrades(deals: MetaDeal[]): TradeData[] {
    const TRADE_TYPES = new Set(['DEAL_TYPE_BUY', 'DEAL_TYPE_SELL'])

    // Index IN deals by positionId for open price/time lookup
    const inDeals = new Map<string, MetaDeal>()
    for (const d of deals) {
      if (TRADE_TYPES.has(d.type) && d.entryType === 'DEAL_ENTRY_IN' && d.positionId) {
        inDeals.set(d.positionId, d)
      }
    }

    const trades: TradeData[] = []
    for (const d of deals) {
      if (!TRADE_TYPES.has(d.type)) continue
      if (d.entryType !== 'DEAL_ENTRY_OUT' && d.entryType !== 'DEAL_ENTRY_INOUT') continue
      if (!d.symbol) continue

      const inDeal = d.positionId ? inDeals.get(d.positionId) : undefined
      const openTime  = inDeal ? new Date(inDeal.time) : new Date(d.time)
      const closeTime = new Date(d.time)

      trades.push({
        externalId:  d.positionId ?? d.id,
        symbol:      d.symbol,
        direction:   d.type === 'DEAL_TYPE_BUY' ? 'LONG' : 'SHORT',
        openTime,
        closeTime,
        openPrice:   inDeal?.price ?? d.price ?? 0,
        closePrice:  d.price ?? null,
        lotSize:     d.volume ?? 0,
        pnl:         d.profit ?? null,
        swap:        d.swap ?? 0,
        commission:  d.commission ?? 0,
        status:      'CLOSED',
      })
    }

    return trades
  }
}
