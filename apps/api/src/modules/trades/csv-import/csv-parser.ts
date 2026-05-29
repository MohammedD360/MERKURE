import { parse } from 'csv-parse/sync'
import type { TradeData } from '../../brokers/adapters/broker-adapter.js'

// ── Alias map : champ sémantique → variantes acceptées (case-insensitive) ────
// Couvre MT4, MT5, cTrader, Binance, TradingView et formats génériques.

const COLUMN_ALIASES: Record<string, string[]> = {
  symbol:      ['symbol', 'instrument', 'pair', 'asset', 'ticker', 'currency pair', 'contract'],
  direction:   ['direction', 'type', 'side', 'action', 'buy/sell', 'trade type', 'order type', 'position type'],
  openTime:    ['open time', 'open_time', 'opentime', 'entry time', 'entry_time', 'open date', 'open_date', 'date open', 'time', 'date'],
  closeTime:   ['close time', 'close_time', 'closetime', 'exit time', 'exit_time', 'close date', 'close_date', 'date close'],
  openPrice:   ['open price', 'open_price', 'openprice', 'entry price', 'entry_price', 'price open', 'open', 'entry'],
  closePrice:  ['close price', 'close_price', 'closeprice', 'exit price', 'exit_price', 'price close', 'close', 'exit'],
  lotSize:     ['lot size', 'lot_size', 'lots', 'volume', 'quantity', 'qty', 'size', 'amount', 'units'],
  pnl:         ['pnl', 'p&l', 'profit', 'net profit', 'net_profit', 'profit/loss', 'realized pnl', 'gain/loss', 'result'],
  swap:        ['swap', 'rollover', 'financing'],
  commission:  ['commission', 'fee', 'fees', 'cost'],
}

// ── Normalise un header : minuscules, supprime les espaces multiples ──────────
function normalizeHeader(h: string): string {
  return h.toLowerCase().replace(/\s+/g, ' ').trim()
}

// ── Résout les headers du CSV vers nos champs sémantiques ────────────────────
function resolveColumnMap(headers: string[]): Map<string, string> {
  const normalized = headers.map(normalizeHeader)
  const resolved = new Map<string, string>() // champ sémantique → header original

  for (const [field, aliases] of Object.entries(COLUMN_ALIASES)) {
    for (const alias of aliases) {
      const idx = normalized.indexOf(alias)
      if (idx !== -1) {
        resolved.set(field, headers[idx] ?? '')
        break
      }
    }
  }

  return resolved
}

// ── Détecte la direction depuis les valeurs Binance / MT4 / cTrader ──────────
function parseDirection(raw: string): 'LONG' | 'SHORT' | null {
  const v = raw.toLowerCase().trim()
  if (['buy', 'long', 'b', 'bo'].includes(v)) return 'LONG'
  if (['sell', 'short', 's', 'so'].includes(v)) return 'SHORT'
  return null
}

// ── Parse une date — supporte ISO, DD.MM.YYYY HH:mm:ss, MM/DD/YYYY ──────────
function parseDate(raw: string): Date | null {
  if (!raw || raw.trim() === '') return null
  const trimmed = raw.trim()

  // ISO / standard JS parse (couvre yyyy-mm-dd, yyyy-mm-ddTHH:mm:ss...)
  const iso = new Date(trimmed)
  if (!isNaN(iso.getTime())) return iso

  // DD.MM.YYYY HH:mm:ss (format MT4/MT5)
  const mt4 = trimmed.match(/^(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}):(\d{2})(?::(\d{2}))?$/)
  if (mt4) {
    const [, dd, mm, yyyy, hh, mi, ss = '00'] = mt4
    return new Date(`${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}`)
  }

  // MM/DD/YYYY (format US)
  const us = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (us) {
    const [, mm, dd, yyyy] = us
    return new Date(`${yyyy}-${mm}-${dd}`)
  }

  return null
}

function parseNum(raw: string | undefined): number {
  if (!raw) return 0
  return parseFloat(raw.replace(/[, ]/g, '')) || 0
}

function parseNumOrNull(raw: string | undefined): number | null {
  if (!raw || raw.trim() === '' || raw.trim() === '-') return null
  const n = parseFloat(raw.replace(/[, ]/g, ''))
  return isNaN(n) ? null : n
}

// ─────────────────────────────────────────────────────────────────────────────

export interface CsvImportResult {
  trades:   TradeData[]
  skipped:  number
  errors:   string[]
}

export interface CsvParseOptions {
  delimiter?: string          // auto-détecté si absent
  dateFormat?: string         // hint optionnel (non utilisé actuellement)
}

export function parseCsvTrades(csvContent: string, options: CsvParseOptions = {}): CsvImportResult {
  const errors: string[] = []
  const trades: TradeData[] = []
  let skipped = 0

  // ── 1. Parse le CSV brut ──────────────────────────────────────────────────
  let rows: Record<string, string>[]
  try {
    rows = parse(csvContent, {
      columns:           true,
      skip_empty_lines:  true,
      trim:              true,
      relax_column_count: true,
      delimiter:         options.delimiter ?? autoDetectDelimiter(csvContent),
      bom:               true,   // gère les fichiers Windows avec BOM
    }) as Record<string, string>[]
  } catch (err) {
    return {
      trades:  [],
      skipped: 0,
      errors:  [`Erreur de parsing CSV : ${err instanceof Error ? err.message : String(err)}`],
    }
  }

  if (rows.length === 0) {
    return { trades: [], skipped: 0, errors: ['Fichier CSV vide'] }
  }

  // ── 2. Résout la carte des colonnes ──────────────────────────────────────
  const headers = Object.keys(rows[0] ?? {})
  const colMap  = resolveColumnMap(headers)

  const missing = (['symbol', 'direction', 'openTime', 'openPrice'] as const)
    .filter(f => !colMap.has(f))

  if (missing.length > 0) {
    return {
      trades:  [],
      skipped: 0,
      errors:  [
        `Colonnes obligatoires introuvables : ${missing.join(', ')}`,
        `Colonnes détectées : ${headers.join(', ')}`,
      ],
    }
  }

  // ── 3. Mappe chaque ligne ─────────────────────────────────────────────────
  rows.forEach((row, i) => {
    const lineNum = i + 2 // +1 pour le header, +1 pour l'index 0

    try {
      const get = (field: string) => row[colMap.get(field) ?? '']?.trim()

      const symbol = get('symbol')
      if (!symbol) { skipped++; return }

      const direction = parseDirection(get('direction') ?? '')
      if (!direction) {
        errors.push(`Ligne ${lineNum} : direction non reconnue "${get('direction')}"`)
        skipped++
        return
      }

      const openTime = parseDate(get('openTime') ?? '')
      if (!openTime) {
        errors.push(`Ligne ${lineNum} : date d'ouverture invalide "${get('openTime')}"`)
        skipped++
        return
      }

      const openPrice = parseNum(get('openPrice'))
      if (openPrice === 0) {
        errors.push(`Ligne ${lineNum} : prix d'ouverture invalide`)
        skipped++
        return
      }

      const closeTime  = parseDate(get('closeTime') ?? '')
      const closePrice = parseNumOrNull(get('closePrice'))
      const pnl        = parseNumOrNull(get('pnl'))

      trades.push({
        externalId:  `csv-${i}-${symbol}-${openTime.getTime()}`,
        symbol:      symbol.toUpperCase(),
        direction,
        openTime,
        closeTime,
        openPrice,
        closePrice,
        lotSize:     parseNum(get('lotSize')),
        pnl,
        swap:        parseNum(get('swap')),
        commission:  parseNum(get('commission')),
        status:      closeTime ? 'CLOSED' : 'OPEN',
      })
    } catch (err) {
      errors.push(`Ligne ${lineNum} : ${err instanceof Error ? err.message : String(err)}`)
      skipped++
    }
  })

  return { trades, skipped, errors }
}

// ── Auto-détection du délimiteur (virgule, point-virgule, tab) ───────────────
function autoDetectDelimiter(content: string): string {
  const firstLine = content.split('\n')[0] ?? ''
  const counts = {
    ',':  (firstLine.match(/,/g) ?? []).length,
    ';':  (firstLine.match(/;/g) ?? []).length,
    '\t': (firstLine.match(/\t/g) ?? []).length,
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? ','
}
