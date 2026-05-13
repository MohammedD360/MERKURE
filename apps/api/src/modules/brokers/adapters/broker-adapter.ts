export interface TradeData {
  externalId: string
  symbol: string
  direction: 'LONG' | 'SHORT'
  openTime: Date
  closeTime: Date | null
  openPrice: number
  closePrice: number | null
  lotSize: number
  pnl: number | null
  swap: number
  commission: number
  status: 'OPEN' | 'CLOSED'
}

export interface AccountInfo {
  balance: number
  equity: number
  currency: string
}

export interface BrokerAdapter {
  connect(credentials: Record<string, string>): Promise<void>
  getAccountInfo(): Promise<AccountInfo>
  getTradeHistory(from: Date, to: Date): Promise<TradeData[]>
  disconnect(): void
}
