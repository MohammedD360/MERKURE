import { createRequire } from 'module'
import { env } from '../../../config/env.js'

interface MetaApiInstance {
  metatraderAccountApi: {
    getAccount(accountId: string): Promise<{
      state: string
      deploy(): Promise<void>
      waitDeployed(timeoutSeconds: number): Promise<void>
      getRPCConnection(): RpcConnection
    }>
  }
}

const _require = createRequire(import.meta.url)
const MetaApi = (_require('metaapi.cloud-sdk') as { default: new (token: string) => MetaApiInstance }).default
import type { BrokerAdapter, TradeData, AccountInfo } from './broker-adapter.js'

// Subset of MetatraderDeal we actually use
interface MetatraderDeal {
  id: string
  type: string
  entryType?: string
  symbol?: string
  time: Date
  volume?: number
  price?: number
  commission?: number
  swap?: number
  profit: number
  positionId?: string
}

const TRADE_DEAL_TYPES = new Set(['DEAL_TYPE_BUY', 'DEAL_TYPE_SELL'])
const EXIT_ENTRY_TYPES = new Set(['DEAL_ENTRY_OUT', 'DEAL_ENTRY_OUT_BY', 'DEAL_ENTRY_INOUT'])

type RpcConnection = {
  connect(): Promise<void>
  waitSynchronized(timeoutSeconds: number): Promise<void>
  getAccountInformation(): Promise<{ balance: number; equity: number; currency: string }>
  getDealsByTimeRange(startTime: Date, endTime: Date, offset?: number, limit?: number): Promise<{ deals: MetatraderDeal[] }>
  close(): Promise<void>
}

export class MtAdapter implements BrokerAdapter {
  private api: MetaApiInstance | null = null
  private connection: RpcConnection | null = null

  async connect(credentials: Record<string, string>): Promise<void> {
    const token = env.META_API_TOKEN
    if (!token) throw new Error('META_API_TOKEN not configured')

    const { accountId } = credentials
    if (!accountId) throw new Error('accountId is required in credentials')

    this.api = new MetaApi(token)
    const account = await this.api.metatraderAccountApi.getAccount(accountId)

    if (!['DEPLOYING', 'DEPLOYED'].includes(account.state)) {
      await account.deploy()
      await account.waitDeployed(300)
    }

    this.connection = account.getRPCConnection()
    await this.connection.connect()
    await this.connection.waitSynchronized(120)
  }

  async getAccountInfo(): Promise<AccountInfo> {
    if (!this.connection) throw new Error('Not connected — call connect() first')
    const info = await this.connection.getAccountInformation()
    return {
      balance: info.balance as number,
      equity: info.equity as number,
      currency: info.currency as string,
    }
  }

  async getTradeHistory(from: Date, to: Date): Promise<TradeData[]> {
    if (!this.connection) throw new Error('Not connected — call connect() first')

    // Paginate in batches of 1000 until we have all deals
    const allDeals: MetatraderDeal[] = []
    let offset = 0
    const limit = 1000

    while (true) {
      const result = await this.connection.getDealsByTimeRange(from, to, offset, limit)
      const batch = result.deals ?? []
      allDeals.push(...batch)
      if (batch.length < limit) break
      offset += limit
    }

    // Group trade deals by positionId
    const byPosition = new Map<string, MetatraderDeal[]>()
    for (const deal of allDeals) {
      if (!TRADE_DEAL_TYPES.has(deal.type)) continue
      if (!deal.positionId) continue
      const group = byPosition.get(deal.positionId) ?? []
      group.push(deal)
      byPosition.set(deal.positionId, group)
    }

    const trades: TradeData[] = []

    for (const [positionId, deals] of byPosition) {
      const entryDeal = deals.find(d => d.entryType === 'DEAL_ENTRY_IN')
      if (!entryDeal) continue

      const exitDeal = deals.find(d => EXIT_ENTRY_TYPES.has(d.entryType ?? ''))

      const totalPnl = deals.reduce((sum, d) => sum + (d.profit ?? 0), 0)
      const totalSwap = deals.reduce((sum, d) => sum + (d.swap ?? 0), 0)
      const totalCommission = deals.reduce((sum, d) => sum + (d.commission ?? 0), 0)

      trades.push({
        externalId: positionId,
        symbol: entryDeal.symbol ?? '',
        direction: entryDeal.type === 'DEAL_TYPE_BUY' ? 'LONG' : 'SHORT',
        openTime: entryDeal.time,
        closeTime: exitDeal?.time ?? null,
        openPrice: entryDeal.price ?? 0,
        closePrice: exitDeal?.price ?? null,
        lotSize: entryDeal.volume ?? 0,
        pnl: exitDeal ? totalPnl : null,
        swap: totalSwap,
        commission: totalCommission,
        status: exitDeal ? 'CLOSED' : 'OPEN',
      })
    }

    return trades
  }

  disconnect(): void {
    this.connection?.close().catch(() => {})
    this.connection = null
    this.api = null
  }
}
