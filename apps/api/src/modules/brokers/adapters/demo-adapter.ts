import type { BrokerAdapter, TradeData, AccountInfo } from './broker-adapter.js'

// Demo adapter — returns deterministic mock data for local development
export class DemoAdapter implements BrokerAdapter {
  async connect(_credentials: Record<string, string>): Promise<void> {}

  async getAccountInfo(): Promise<AccountInfo> {
    return { balance: 10_000, equity: 10_234.50, currency: 'USD' }
  }

  async getTradeHistory(_from: Date, _to: Date): Promise<TradeData[]> {
    const now = Date.now()
    return [
      {
        externalId: 'demo-trade-1',
        symbol: 'EURUSD',
        direction: 'LONG',
        openTime: new Date(now - 7_200_000),
        closeTime: new Date(now - 3_600_000),
        openPrice: 1.0950,
        closePrice: 1.0975,
        lotSize: 0.1,
        pnl: 25.0,
        swap: -0.5,
        commission: -0.7,
        status: 'CLOSED',
      },
      {
        externalId: 'demo-trade-2',
        symbol: 'GBPUSD',
        direction: 'SHORT',
        openTime: new Date(now - 3_600_000),
        closeTime: new Date(now - 1_800_000),
        openPrice: 1.2650,
        closePrice: 1.2630,
        lotSize: 0.05,
        pnl: 10.0,
        swap: 0,
        commission: -0.35,
        status: 'CLOSED',
      },
      {
        externalId: 'demo-trade-3',
        symbol: 'XAUUSD',
        direction: 'LONG',
        openTime: new Date(now - 1_800_000),
        closeTime: null,
        openPrice: 2650.50,
        closePrice: null,
        lotSize: 0.01,
        pnl: null,
        swap: 0,
        commission: -1.2,
        status: 'OPEN',
      },
    ]
  }

  disconnect(): void {}
}
