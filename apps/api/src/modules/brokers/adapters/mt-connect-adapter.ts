import { env } from '../../../config/env.js'
import type { BrokerAdapter, TradeData, AccountInfo } from './broker-adapter.js'

const API_URL = 'https://app.mtconnectapi.com/api/api.php'

// H record: H,balance,equity,margin,freemargin,leverage,currency
// T record: T,ticket,opentime,type,lots,symbol,openprice,sl,tp,closetime,closeprice,commission,taxes,swap,profit
const enum T {
  TICKET      = 1,
  OPEN_TIME   = 2,
  TYPE        = 3,
  LOTS        = 4,
  SYMBOL      = 5,
  OPEN_PRICE  = 6,
  CLOSE_TIME  = 9,
  CLOSE_PRICE = 10,
  COMMISSION  = 11,
  SWAP        = 13,
  PROFIT      = 14,
}

function parseDate(s: string): Date | null {
  if (!s) return null
  // MT4 format: "2024.01.15 10:30:00" or ISO
  const normalized = s.trim().replace(/\./g, '-').replace(' ', 'T')
  const d = new Date(normalized)
  return isNaN(d.getTime()) ? null : d
}

function parseFloat2(s: string | undefined): number {
  if (!s) return 0
  return parseFloat(s.trim()) || 0
}

function isTradeType(type: string): boolean {
  const t = type.trim().toLowerCase()
  // 0=buy, 1=sell, "buy", "sell" — skip balance(6), credit(7), etc.
  return t === '0' || t === '1' || t === 'buy' || t === 'sell'
}

function direction(type: string): 'LONG' | 'SHORT' {
  const t = type.trim().toLowerCase()
  return (t === '0' || t === 'buy') ? 'LONG' : 'SHORT'
}

export class MtConnectAdapter implements BrokerAdapter {
  private creds: Record<string, string> = {}
  private cachedLines: string[] | null  = null

  async connect(credentials: Record<string, string>): Promise<void> {
    if (!env.MTCONNECT_API_KEY) throw new Error('MTCONNECT_API_KEY not configured')
    const { accountId, upass, tradeserver } = credentials
    if (!accountId || !upass || !tradeserver) {
      throw new Error('accountId, upass et tradeserver sont requis')
    }
    this.creds = credentials
    // Validation rapide — vérifie qu'on obtient au moins un H record
    const lines = await this.fetch('0')
    if (!lines.some(l => l.startsWith('H'))) {
      const preview = lines.slice(0, 3).join(' | ').slice(0, 200) || '(réponse vide)'
      throw new Error(`MTConnectAPI: pas de H record. Réponse: "${preview}"`)
    }
    this.cachedLines = lines
  }

  async getAccountInfo(): Promise<AccountInfo> {
    const lines = this.cachedLines ?? await this.fetch('0')
    const hLine = lines.find(l => l.startsWith('H,'))
    if (!hLine) throw new Error('Aucune info de compte dans la réponse')
    const p = hLine.split(',')
    return {
      balance:  parseFloat2(p[1]),
      equity:   parseFloat2(p[2]),
      currency: p[6]?.trim() ?? 'USD',
    }
  }

  async getTradeHistory(from: Date, to: Date): Promise<TradeData[]> {
    const lines = this.cachedLines ?? await this.fetch('0')
    const trades: TradeData[] = []

    for (const line of lines) {
      if (!line.startsWith('T,')) continue
      const p = line.split(',')
      if (p.length < 14) continue

      const type = p[T.TYPE] ?? ''
      if (!isTradeType(type)) continue

      const openTime = parseDate(p[T.OPEN_TIME] ?? '')
      if (!openTime) continue

      const closeTime = parseDate(p[T.CLOSE_TIME] ?? '')
      const status: 'OPEN' | 'CLOSED' = closeTime ? 'CLOSED' : 'OPEN'

      // Filtre par plage de dates
      if (closeTime && closeTime < from) continue
      if (openTime > to) continue

      trades.push({
        externalId:  p[T.TICKET] ?? '',
        symbol:      p[T.SYMBOL]?.trim() ?? '',
        direction:   direction(type),
        openTime,
        closeTime,
        openPrice:   parseFloat2(p[T.OPEN_PRICE]),
        closePrice:  closeTime ? parseFloat2(p[T.CLOSE_PRICE]) : null,
        lotSize:     parseFloat2(p[T.LOTS]),
        pnl:         status === 'CLOSED' ? parseFloat2(p[T.PROFIT]) : null,
        swap:        parseFloat2(p[T.SWAP]),
        commission:  parseFloat2(p[T.COMMISSION]),
        status,
      })
    }

    return trades
  }

  disconnect(): void {
    this.creds        = {}
    this.cachedLines  = null
  }

  private async fetch(lastticket: string): Promise<string[]> {
    const { accountId, upass, tradeserver, suffix = '' } = this.creds
    const params = new URLSearchParams()
    params.set('caller',      env.MTCONNECT_API_KEY!)
    // uid doit être unique par compte MT4 pour éviter les conflits de session
    // uid alphanumérique max 20 chars, unique par compte MT4
    const uidBase = (env.MTCONNECT_UID ?? 'merkure').replace(/[^a-zA-Z0-9]/g, '')
    params.set('uid', `${uidBase}${accountId}`.slice(0, 20))
    params.set('tradeserver', tradeserver ?? '')
    params.set('uacc',        accountId ?? '')
    params.set('upass',       upass ?? '')
    params.set('suffix',      suffix)
    params.set('lastticket',  lastticket)

    const res = await fetch(API_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    params.toString(),
    })

    if (!res.ok) throw new Error(`MTConnectAPI HTTP ${res.status}`)
    const text = await res.text()
    console.log('[mtconnect] raw response preview:', text.slice(0, 300))
    return text.split('\n').map(l => l.trim()).filter(Boolean)
  }
}
