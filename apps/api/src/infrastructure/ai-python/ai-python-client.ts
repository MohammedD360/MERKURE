import { env } from '../../config/env.js'

const BASE_URL = env.AI_SERVICE_URL
const SECRET   = env.AI_SERVICE_SECRET

const HEADERS = {
  'Content-Type':       'application/json',
  'X-AI-Service-Secret': SECRET,
}

export interface Trade {
  id?:         string
  pnl?:        number | null
  open_time?:  string | null
  close_time?: string | null
  direction?:  string | null
  symbol?:     string | null
}

export interface KpisResult {
  win_rate:      number
  profit_factor: number
  sharpe_ratio:  number
  max_drawdown:  number
  avg_rr:        number
  total_trades:  number
  total_pnl:     number
  avg_pnl:       number
  best_trade:    number
  worst_trade:   number
  best_day:      { pnl: number; date: string } | null
}

export interface CoachingResult {
  analysis:           string
  input_tokens:       number
  output_tokens:      number
  cache_read_tokens:  number
}

export async function computeKpis(trades: Trade[]): Promise<KpisResult> {
  const res = await fetch(`${BASE_URL}/api/v1/kpis`, {
    method:  'POST',
    headers: HEADERS,
    body:    JSON.stringify({ trades }),
  })
  if (!res.ok) throw new Error(`AI service KPIs error: ${res.status}`)
  return res.json() as Promise<KpisResult>
}

export async function getCoaching(payload: {
  trader_context:        { style: string; markets: string[]; experience_years: number }
  kpis:                  { win_rate: number; profit_factor: number; sharpe_ratio: number; max_drawdown: number; total_trades: number; avg_rr: number; total_pnl: number }
  recent_trades_summary: string
  question?:             string
}): Promise<CoachingResult> {
  const res = await fetch(`${BASE_URL}/api/v1/coaching`, {
    method:  'POST',
    headers: HEADERS,
    body:    JSON.stringify(payload),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`AI service coaching error: ${res.status} — ${body}`)
  }
  return res.json() as Promise<CoachingResult>
}
