import { prisma } from '../../infrastructure/database/client.js'
import type { Period } from './kpis.repository.js'
import { periodToDate } from './kpis.repository.js'

export type BehavioralPattern =
  | 'REVENGE_TRADING'
  | 'OVERTRADING'
  | 'FOMO'
  | 'DIRECTIONAL_BIAS'
  | 'FATIGUE'
  | 'MORNING_RUSH'

export type Severity = 'LOW' | 'MEDIUM' | 'HIGH'

export interface PatternResult {
  type:     BehavioralPattern
  detected: boolean
  severity: Severity | null
  count:    number
  total:    number
  pct:      number
  detail:   string
  impact:   string | null
}

export interface BehavioralResult {
  patterns:   PatternResult[]
  nbTrades:   number
  alertCount: number
}

function sev(pct: number): Severity {
  if (pct >= 25) return 'HIGH'
  if (pct >= 10) return 'MEDIUM'
  return 'LOW'
}

function notDetected(type: BehavioralPattern): PatternResult {
  return { type, detected: false, severity: null, count: 0, total: 0, pct: 0, detail: 'Pas assez de données', impact: null }
}

// ── 1. Revenge trading ────────────────────────────────────────────────────────
function detectRevenge(trades: { pnl: unknown; openTime: Date; closeTime: Date | null }[]): PatternResult {
  let revenge = 0
  let lastLossClose: Date | null = null

  for (const t of trades) {
    if (lastLossClose && t.openTime) {
      const gapMin = (t.openTime.getTime() - lastLossClose.getTime()) / 60_000
      if (gapMin >= 0 && gapMin < 20) revenge++
    }
    if (Number(t.pnl ?? 0) < 0) lastLossClose = t.closeTime
    else lastLossClose = null
  }

  const pct = Math.round((revenge / trades.length) * 100)
  return {
    type:     'REVENGE_TRADING',
    detected: revenge > 0,
    severity: revenge > 0 ? sev(pct) : null,
    count:    revenge,
    total:    trades.length,
    pct,
    detail:   `${revenge} trade${revenge > 1 ? 's' : ''} ouvert${revenge > 1 ? 's' : ''} dans les 20 min après une perte`,
    impact:   null,
  }
}

// ── 2. Overtrading ────────────────────────────────────────────────────────────
function detectOvertrading(trades: { openTime: Date }[]): PatternResult {
  const byDay = new Map<string, number>()
  for (const t of trades) {
    const k = t.openTime.toISOString().slice(0, 10)
    byDay.set(k, (byDay.get(k) ?? 0) + 1)
  }
  const days      = byDay.size || 1
  const avg       = trades.length / days
  const threshold = avg * 1.5
  let   overtDays = 0
  let   maxDay    = 0
  for (const c of byDay.values()) {
    if (c > threshold) overtDays++
    if (c > maxDay) maxDay = c
  }
  const pct = Math.round((overtDays / days) * 100)
  return {
    type:     'OVERTRADING',
    detected: overtDays > 0,
    severity: overtDays > 0 ? sev(pct) : null,
    count:    overtDays,
    total:    days,
    pct,
    detail:   `${overtDays} jour${overtDays > 1 ? 's' : ''} dépassant ${Math.round(threshold)} trades/jour (moy. ${avg.toFixed(1)})`,
    impact:   maxDay > 0 ? `Pic : ${maxDay} trades en une journée` : null,
  }
}

// ── 3. FOMO — trades hors meilleures heures ───────────────────────────────────
function detectFomo(trades: { pnl: unknown; openTime: Date }[], globalWr: number): PatternResult {
  const byHour = new Map<number, { wins: number; total: number }>()
  for (const t of trades) {
    const h    = t.openTime.getUTCHours()
    const stat = byHour.get(h) ?? { wins: 0, total: 0 }
    stat.total++
    if (Number(t.pnl ?? 0) > 0) stat.wins++
    byHour.set(h, stat)
  }
  const bestHours = new Set<number>()
  for (const [h, s] of byHour) {
    if (s.total >= 3 && s.wins / s.total > globalWr) bestHours.add(h)
  }
  if (bestHours.size === 0) return notDetected('FOMO')

  const fomo    = trades.filter(t => !bestHours.has(t.openTime.getUTCHours()))
  const pct     = Math.round((fomo.length / trades.length) * 100)
  const detected = pct > 30

  return {
    type:     'FOMO',
    detected,
    severity: detected ? sev(pct) : null,
    count:    fomo.length,
    total:    trades.length,
    pct,
    detail:   `${pct}% des trades hors de vos créneaux les plus performants`,
    impact:   `Meilleures heures : ${Array.from(bestHours).sort((a, b) => a - b).slice(0, 3).map(h => `${h}h`).join(', ')}`,
  }
}

// ── 4. Biais directionnel ─────────────────────────────────────────────────────
function detectBias(trades: { direction: string }[]): PatternResult {
  const longs  = trades.filter(t => t.direction === 'LONG').length
  const shorts = trades.filter(t => t.direction === 'SHORT').length
  const total  = longs + shorts
  if (total === 0) return notDetected('DIRECTIONAL_BIAS')

  const dominant = longs >= shorts ? 'LONG' : 'SHORT'
  const domPct   = Math.round((Math.max(longs, shorts) / total) * 100)
  const detected = domPct >= 70

  return {
    type:     'DIRECTIONAL_BIAS',
    detected,
    severity: detected ? sev(domPct - 50) : null,
    count:    Math.max(longs, shorts),
    total,
    pct:      domPct,
    detail:   `${domPct}% de positions ${dominant} (${longs}L / ${shorts}S)`,
    impact:   detected ? `Exposition systématique côté ${dominant}` : null,
  }
}

// ── 5. Fatigue — win rate dégradé après 2h de session ─────────────────────────
function detectFatigue(trades: { pnl: unknown; openTime: Date }[]): PatternResult {
  const byDay = new Map<string, { pnl: number; time: Date }[]>()
  for (const t of trades) {
    const k = t.openTime.toISOString().slice(0, 10)
    if (!byDay.has(k)) byDay.set(k, [])
    byDay.get(k)!.push({ pnl: Number(t.pnl ?? 0), time: t.openTime })
  }

  const early: number[] = []
  const late:  number[] = []

  for (const day of byDay.values()) {
    if (day.length < 3) continue
    const sorted = [...day].sort((a, b) => a.time.getTime() - b.time.getTime())
    const t0     = sorted[0]!.time.getTime()
    for (const t of sorted) {
      if (t.time.getTime() - t0 <= 2 * 3_600_000) early.push(t.pnl)
      else                                          late.push(t.pnl)
    }
  }

  if (early.length < 3 || late.length < 3) return notDetected('FATIGUE')

  const earlyWr = early.filter(p => p > 0).length / early.length
  const lateWr  = late.filter(p => p > 0).length  / late.length
  const drop    = earlyWr - lateWr
  const detected = drop >= 0.15

  return {
    type:     'FATIGUE',
    detected,
    severity: detected ? (drop >= 0.30 ? 'HIGH' : drop >= 0.20 ? 'MEDIUM' : 'LOW') : null,
    count:    late.length,
    total:    early.length + late.length,
    pct:      Math.round((late.length / (early.length + late.length)) * 100),
    detail:   `Win rate après 2h : ${Math.round(lateWr * 100)}% vs ${Math.round(earlyWr * 100)}% en début de session`,
    impact:   detected ? `−${Math.round(drop * 100)} pts de win rate après 2h` : null,
  }
}

// ── 6. Morning rush — trades précipités en ouverture ─────────────────────────
function detectMorningRush(trades: { pnl: unknown; openTime: Date }[]): PatternResult {
  const byDay = new Map<string, { pnl: number; time: Date }[]>()
  for (const t of trades) {
    const k = t.openTime.toISOString().slice(0, 10)
    if (!byDay.has(k)) byDay.set(k, [])
    byDay.get(k)!.push({ pnl: Number(t.pnl ?? 0), time: t.openTime })
  }

  const rushed:    number[] = []
  const nonRushed: number[] = []

  for (const day of byDay.values()) {
    if (day.length < 2) continue
    const sorted = [...day].sort((a, b) => a.time.getTime() - b.time.getTime())
    const t0     = sorted[0]!.time.getTime()
    for (const t of sorted) {
      if (t.time.getTime() - t0 <= 15 * 60_000) rushed.push(t.pnl)
      else                                        nonRushed.push(t.pnl)
    }
  }

  if (rushed.length < 3) return notDetected('MORNING_RUSH')

  const rushedWr    = rushed.filter(p => p > 0).length / rushed.length
  const nonRushedWr = nonRushed.length > 0
    ? nonRushed.filter(p => p > 0).length / nonRushed.length
    : 0.5
  const gap      = nonRushedWr - rushedWr
  const detected = gap >= 0.15

  return {
    type:     'MORNING_RUSH',
    detected,
    severity: detected ? (gap >= 0.30 ? 'HIGH' : gap >= 0.20 ? 'MEDIUM' : 'LOW') : null,
    count:    rushed.length,
    total:    rushed.length + nonRushed.length,
    pct:      Math.round((rushed.length / (rushed.length + nonRushed.length)) * 100),
    detail:   `${rushed.length} trade${rushed.length > 1 ? 's' : ''} dans les 15 min d'ouverture de session`,
    impact:   detected ? `Win rate ouverture : ${Math.round(rushedWr * 100)}% vs ${Math.round(nonRushedWr * 100)}% reste` : null,
  }
}

// ── Export principal ──────────────────────────────────────────────────────────
export async function detectBehavioralPatterns(
  userId: string,
  period: Period,
): Promise<BehavioralResult> {
  const from = periodToDate(period)

  const trades = await prisma.trade.findMany({
    where: {
      userId,
      status: 'CLOSED',
      ...(from ? { closeTime: { gte: from } } : {}),
    },
    select: { pnl: true, openTime: true, closeTime: true, direction: true },
    orderBy: { openTime: 'asc' },
  })

  if (trades.length < 3) {
    const empty: PatternResult[] = (
      ['REVENGE_TRADING', 'OVERTRADING', 'FOMO', 'DIRECTIONAL_BIAS', 'FATIGUE', 'MORNING_RUSH'] as BehavioralPattern[]
    ).map(notDetected)
    return { patterns: empty, nbTrades: trades.length, alertCount: 0 }
  }

  const pnls       = trades.map(t => Number(t.pnl ?? 0))
  const globalWr   = pnls.filter(p => p > 0).length / pnls.length

  const patterns: PatternResult[] = [
    detectRevenge(trades),
    detectOvertrading(trades),
    detectFomo(trades, globalWr),
    detectBias(trades),
    detectFatigue(trades),
    detectMorningRush(trades),
  ]

  return {
    patterns,
    nbTrades:   trades.length,
    alertCount: patterns.filter(p => p.detected && p.severity === 'HIGH').length,
  }
}
