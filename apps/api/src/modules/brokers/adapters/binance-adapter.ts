import { createHmac } from 'crypto'
import type { BrokerAdapter, TradeData, AccountInfo } from './broker-adapter.js'

const BINANCE_REST = 'https://api.binance.com'
const MAX_TRADES_PER_SYMBOL = 1000 // Binance hard limit per request

// ── Binance API shapes ────────────────────────────────────────────────────────

interface BinanceBalance {
  asset: string
  free: string
  locked: string
}

interface BinanceAccount {
  balances: BinanceBalance[]
  canTrade: boolean
}

interface BinanceTrade {
  id: number
  symbol: string
  orderId: number
  price: string
  qty: string
  quoteQty: string
  commission: string
  commissionAsset: string
  time: number        // ms timestamp
  isBuyer: boolean
  isMaker: boolean
}

// ─────────────────────────────────────────────────────────────────────────────

function sign(queryString: string, secret: string): string {
  return createHmac('sha256', secret).update(queryString).digest('hex')
}

async function signedGet<T>(
  path: string,
  params: Record<string, string | number>,
  apiKey: string,
  apiSecret: string,
): Promise<T> {
  const qs = new URLSearchParams({
    ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
    timestamp: Date.now().toString(),
  }).toString()

  const url = `${BINANCE_REST}${path}?${qs}&signature=${sign(qs, apiSecret)}`
  const res = await fetch(url, { headers: { 'X-MBX-APIKEY': apiKey } })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Binance ${res.status}: ${body}`)
  }
  return res.json() as Promise<T>
}

// Dérive les symboles USDT depuis les balances non-nulles (BTC → BTCUSDT, etc.)
// Exclut USDT lui-même et les stablecoins connus.
const STABLECOINS = new Set(['USDT', 'BUSD', 'USDC', 'TUSD', 'DAI', 'FDUSD'])

function symbolsFromBalances(balances: BinanceBalance[]): string[] {
  return balances
    .filter(b => !STABLECOINS.has(b.asset) && (parseFloat(b.free) + parseFloat(b.locked)) > 0)
    .map(b => `${b.asset}USDT`)
}

// ─────────────────────────────────────────────────────────────────────────────

export class BinanceAdapter implements BrokerAdapter {
  private apiKey = ''
  private apiSecret = ''
  private symbols: string[] = []   // populated during connect()

  async connect(credentials: Record<string, string>): Promise<void> {
    const { apiKey, apiSecret, symbols } = credentials

    if (!apiKey)    throw new Error('apiKey is required in Binance credentials')
    if (!apiSecret) throw new Error('apiSecret is required in Binance credentials')

    this.apiKey    = apiKey
    this.apiSecret = apiSecret

    // Validate key + collect default symbol list in one call
    const account = await signedGet<BinanceAccount>('/api/v3/account', {}, apiKey, apiSecret)
    if (!account.canTrade) throw new Error('Binance API key does not have trade-read permission')

    this.symbols = symbols
      ? symbols.split(',').map(s => s.trim().toUpperCase()).filter(Boolean)
      : symbolsFromBalances(account.balances)
  }

  async getAccountInfo(): Promise<AccountInfo> {
    const account = await signedGet<BinanceAccount>('/api/v3/account', {}, this.apiKey, this.apiSecret)
    const usdt = account.balances.find(b => b.asset === 'USDT')
    const balance = usdt ? parseFloat(usdt.free) + parseFloat(usdt.locked) : 0

    return { balance, equity: balance, currency: 'USDT' }
  }

  async getTradeHistory(from: Date, to: Date): Promise<TradeData[]> {
    const allTrades: TradeData[] = []

    for (const symbol of this.symbols) {
      const trades = await this.fetchSymbolTrades(symbol, from, to)
      allTrades.push(...trades)
    }

    return allTrades.sort((a, b) => a.openTime.getTime() - b.openTime.getTime())
  }

  private async fetchSymbolTrades(symbol: string, from: Date, to: Date): Promise<TradeData[]> {
    const raw = await signedGet<BinanceTrade[]>('/api/v3/myTrades', {
      symbol,
      startTime: from.getTime(),
      endTime:   to.getTime(),
      limit:     MAX_TRADES_PER_SYMBOL,
    }, this.apiKey, this.apiSecret)

    return raw.map(t => this.mapTrade(symbol, t))
  }

  private mapTrade(symbol: string, t: BinanceTrade): TradeData {
    // Commission en USDT uniquement (sinon 0 — on ignore les rabais BNB pour le POC)
    const commissionUsdt = t.commissionAsset === 'USDT' ? -parseFloat(t.commission) : 0

    return {
      externalId:  String(t.id),
      symbol,
      direction:   t.isBuyer ? 'LONG' : 'SHORT',
      openTime:    new Date(t.time),
      closeTime:   new Date(t.time),   // spot = exécution instantanée
      openPrice:   parseFloat(t.price),
      closePrice:  parseFloat(t.price),
      lotSize:     parseFloat(t.qty),
      pnl:         null,               // P&L nécessite matching buy↔sell — hors scope POC
      swap:        0,
      commission:  commissionUsdt,
      status:      'CLOSED',
    }
  }

  disconnect(): void {
    // Stateless HTTP — rien à fermer
    this.apiKey    = ''
    this.apiSecret = ''
    this.symbols   = []
  }
}
