import { prisma } from '../../infrastructure/database/client.js'
import type { Period } from './kpis.repository.js'
import { periodToDate } from './kpis.repository.js'

export interface AiScoreBreakdown {
  winRate:      number  // 0-100 (score brut du composant)
  profitFactor: number
  drawdown:     number
  rrMoyen:      number
  discipline:   number
  consistency:  number
}

export interface AiScoreResult {
  score:     number
  label:     'Insuffisant' | 'Moyen' | 'Bon' | 'Excellent'
  breakdown: AiScoreBreakdown
  nbTrades:  number
}

function label(score: number): AiScoreResult['label'] {
  if (score >= 85) return 'Excellent'
  if (score >= 70) return 'Bon'
  if (score >= 50) return 'Moyen'
  return 'Insuffisant'
}

export async function calculateAiScore(userId: string, period: Period): Promise<AiScoreResult> {
  const from = periodToDate(period)

  const trades = await prisma.trade.findMany({
    where: {
      userId,
      status: 'CLOSED',
      ...(from ? { closeTime: { gte: from } } : {}),
    },
    select: { pnl: true, openTime: true, closeTime: true },
    orderBy: { openTime: 'asc' },
  })

  if (trades.length === 0) {
    return {
      score:     0,
      label:     'Insuffisant',
      breakdown: { winRate: 0, profitFactor: 0, drawdown: 0, rrMoyen: 0, discipline: 0, consistency: 0 },
      nbTrades:  0,
    }
  }

  const pnls    = trades.map(t => Number(t.pnl ?? 0))
  const winners = pnls.filter(p => p > 0)
  const losers  = pnls.filter(p => p < 0)

  // ── 1. Win Rate (poids 0.25) ────────────────────────────────────────────
  const winRate      = winners.length / trades.length            // 0-1
  const winRateSc    = winRate                                    // 0-1

  // ── 2. Profit Factor (poids 0.20) ───────────────────────────────────────
  const grossProfit  = winners.reduce((s, p) => s + p, 0)
  const grossLoss    = Math.abs(losers.reduce((s, p) => s + p, 0))
  const pf           = grossLoss > 0 ? grossProfit / grossLoss : (grossProfit > 0 ? 3 : 0)
  const pfSc         = Math.min(pf / 3, 1)                       // pf ≥ 3 → 100

  // ── 3. Max Drawdown (poids 0.20) ────────────────────────────────────────
  const byDate = new Map<string, number>()
  for (const t of trades) {
    if (!t.closeTime) continue
    const key = t.closeTime.toISOString().slice(0, 10)
    byDate.set(key, (byDate.get(key) ?? 0) + Number(t.pnl ?? 0))
  }
  let peak = 0, cumul = 0, maxDd = 0
  for (const daily of byDate.values()) {
    cumul += daily
    if (cumul > peak) peak = cumul
    const dd = peak > 0 ? (peak - cumul) / peak : 0
    if (dd > maxDd) maxDd = dd
  }
  const drawdownSc = Math.max(0, 1 - maxDd)                      // maxDd=0 → 1, maxDd=100% → 0

  // ── 4. R/R moyen (poids 0.15) ───────────────────────────────────────────
  const avgWin   = winners.length > 0 ? grossProfit / winners.length : 0
  const avgLoss  = losers.length  > 0 ? grossLoss   / losers.length  : 0
  const rr       = avgLoss > 0 ? avgWin / avgLoss : (avgWin > 0 ? 2 : 0)
  const rrSc     = Math.min(rr / 2, 1)                            // rr ≥ 2 → 100

  // ── 5. Discipline (poids 0.10) — absence de revenge trading ────────────
  // Revenge = trade ouvert dans les 20 min après une fermeture de perte
  const sorted      = [...trades].sort((a, b) => (a.closeTime?.getTime() ?? 0) - (b.closeTime?.getTime() ?? 0))
  let revengeTrades = 0
  let lastLossClose: Date | null = null
  for (const t of sorted) {
    if (lastLossClose && t.openTime) {
      const gapMin = (t.openTime.getTime() - lastLossClose.getTime()) / 60_000
      if (gapMin >= 0 && gapMin < 20) revengeTrades++
    }
    // On suit uniquement les pertes (une victoire réinitialise l'horloge)
    if (Number(t.pnl ?? 0) < 0) lastLossClose = t.closeTime
    else lastLossClose = null
  }
  const disciplineSc = Math.max(0, 1 - revengeTrades / trades.length)

  // ── 6. Consistency (poids 0.10) — régularité des P&L journaliers ───────
  const dailyPnls = Array.from(byDate.values())
  let consistencySc = 0
  if (dailyPnls.length >= 2) {
    const mean     = dailyPnls.reduce((s, p) => s + p, 0) / dailyPnls.length
    const variance = dailyPnls.reduce((s, p) => s + (p - mean) ** 2, 0) / dailyPnls.length
    const stdDev   = Math.sqrt(variance)
    if (mean > 0) consistencySc = Math.max(0, Math.min(1, 1 - stdDev / (2 * mean)))
  } else if (dailyPnls.length === 1) {
    consistencySc = (dailyPnls[0]! > 0) ? 0.7 : 0
  }

  // ── Pondération finale ──────────────────────────────────────────────────
  const score = Math.round(
    winRateSc    * 25 +
    pfSc         * 20 +
    drawdownSc   * 20 +
    rrSc         * 15 +
    disciplineSc * 10 +
    consistencySc * 10,
  )

  return {
    score:    Math.min(100, Math.max(0, score)),
    label:    label(score),
    breakdown: {
      winRate:      Math.round(winRateSc     * 100),
      profitFactor: Math.round(pfSc          * 100),
      drawdown:     Math.round(drawdownSc    * 100),
      rrMoyen:      Math.round(rrSc          * 100),
      discipline:   Math.round(disciplineSc  * 100),
      consistency:  Math.round(consistencySc * 100),
    },
    nbTrades: trades.length,
  }
}
