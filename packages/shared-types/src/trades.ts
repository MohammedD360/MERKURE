export type TradeDirection = 'long' | 'short'
export type TradeStatus = 'open' | 'closed'

export interface Trade {
  id: string
  brokerAccountId: string
  userId: string
  externalId?: string
  symbol: string
  direction: TradeDirection
  openTime: string       // ISO 8601
  closeTime?: string
  openPrice: number
  closePrice?: number
  lotSize: number
  pnl?: number
  pnlPct?: number
  swap?: number
  commission?: number
  strategyTag?: string
  status: TradeStatus
  createdAt: string
}

export interface TradeFilters {
  from?: string
  to?: string
  symbol?: string
  direction?: TradeDirection
  status?: TradeStatus
  strategyTag?: string
  brokerAccountId?: string
}

export type Period = '1D' | '7D' | '1M' | '3M' | 'YTD' | 'ALL'
