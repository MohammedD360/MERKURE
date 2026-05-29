import Anthropic from '@anthropic-ai/sdk'
import { env } from '../../config/env.js'
import { prisma } from '../../infrastructure/database/client.js'

// ── Types internes ────────────────────────────────────────────────────────────

interface TradeRow {
  symbol:     string
  direction:  string
  openTime:   Date
  closeTime:  Date | null
  pnl:        unknown
  lotSize:    unknown
  commission: unknown
  swap:       unknown
}

interface DayStats {
  nbTrades:          number
  totalPnl:          number
  winRate:           number
  profitFactor:      number
  avgRR:             number
  grossProfit:       number
  grossLoss:         number
  longestLossStreak: number
}

// ── Calculs déterministes ─────────────────────────────────────────────────────

function computeDayStats(trades: TradeRow[]): DayStats {
  const pnls        = trades.map(t => Number(t.pnl ?? 0))
  const winnerPnls  = pnls.filter(p => p > 0)
  const loserPnls   = pnls.filter(p => p < 0)
  const grossProfit = winnerPnls.reduce((a, b) => a + b, 0)
  const grossLoss   = Math.abs(loserPnls.reduce((a, b) => a + b, 0))

  let longestLossStreak = 0
  let streak = 0
  for (const p of pnls) {
    if (p < 0) { longestLossStreak = Math.max(longestLossStreak, ++streak) }
    else streak = 0
  }

  const avgWin  = winnerPnls.length > 0 ? grossProfit / winnerPnls.length : 0
  const avgLoss = loserPnls.length  > 0 ? grossLoss   / loserPnls.length  : 1

  return {
    nbTrades:          trades.length,
    totalPnl:          pnls.reduce((a, b) => a + b, 0),
    winRate:           trades.length > 0 ? winnerPnls.length / trades.length : 0,
    profitFactor:      grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 99 : 0,
    avgRR:             avgLoss > 0 ? avgWin / avgLoss : 0,
    grossProfit,
    grossLoss,
    longestLossStreak,
  }
}

function computeScore(s: DayStats): number {
  // Win rate : 0-30 pts
  const winPts =
    s.winRate >= 0.7 ? 30 :
    s.winRate >= 0.5 ? 15 + ((s.winRate - 0.5) / 0.2) * 15 :
    s.winRate >= 0.3 ? ((s.winRate - 0.3) / 0.2) * 15 : 0

  // Profit factor : 0-30 pts
  const pf    = Math.min(s.profitFactor, 4)
  const pfPts = pf >= 2 ? 25 + ((pf - 2) / 2) * 5 : pf >= 1 ? (pf - 1) * 25 : 0

  // Discipline (pénalité surtrading) : 0-20 pts
  const discPts =
    s.nbTrades <= 5  ? 20 :
    s.nbTrades <= 10 ? 20 - (s.nbTrades - 5) * 2 :
    s.nbTrades <= 20 ? 10 - (s.nbTrades - 10) : 0

  // R:R moyen : 0-20 pts
  const rrPts = s.avgRR >= 2 ? 20 : s.avgRR >= 1 ? s.avgRR * 10 : s.avgRR * 5

  return Math.min(100, Math.max(0, Math.round(winPts + pfPts + discPts + rrPts)))
}

function generateInsights(s: DayStats): { strengths: string[]; improvements: string[]; actions: string[] } {
  const strengths:    string[] = []
  const improvements: string[] = []
  const actions:      string[] = []

  // — Strengths —
  if (s.winRate >= 0.7)
    strengths.push(`Excellent taux de réussite à ${Math.round(s.winRate * 100)}%`)
  else if (s.winRate >= 0.55)
    strengths.push(`Bon taux de réussite à ${Math.round(s.winRate * 100)}%`)

  if (s.profitFactor >= 2)
    strengths.push(`Profit factor exceptionnel à ${s.profitFactor.toFixed(2)}`)
  else if (s.profitFactor >= 1.5)
    strengths.push(`Bon profit factor à ${s.profitFactor.toFixed(2)}`)

  if (s.avgRR >= 2)
    strengths.push(`Excellent rapport risque/récompense moyen à ${s.avgRR.toFixed(1)}`)
  else if (s.avgRR >= 1.5)
    strengths.push(`Bon R:R moyen à ${s.avgRR.toFixed(1)}`)

  if (s.nbTrades <= 4 && s.totalPnl > 0)
    strengths.push('Sélectivité exemplaire — peu de trades, résultat positif')

  if (s.longestLossStreak === 0 && s.nbTrades > 0)
    strengths.push('Journée sans perte — discipline parfaite')

  // — Improvements —
  if (s.winRate < 0.4)
    improvements.push(`Taux de réussite faible à ${Math.round(s.winRate * 100)}% — revoir les critères d'entrée`)

  if (s.profitFactor < 1 && s.nbTrades > 0)
    improvements.push('Journée déficitaire — les pertes dépassent les gains')

  if (s.nbTrades > 15)
    improvements.push(`Surtrading détecté — ${s.nbTrades} trades en une journée`)
  else if (s.nbTrades > 10)
    improvements.push(`Attention au surtrading — ${s.nbTrades} trades dans la session`)

  if (s.longestLossStreak >= 4)
    improvements.push(`Série de ${s.longestLossStreak} pertes consécutives — risque de revenge trading`)
  else if (s.longestLossStreak >= 3)
    improvements.push(`${s.longestLossStreak} pertes consécutives — marquer une pause s'impose`)

  if (s.avgRR < 0.8 && s.nbTrades > 0)
    improvements.push(`R:R insuffisant à ${s.avgRR.toFixed(1)} — viser au minimum 1.5`)

  // — Actions —
  if (s.nbTrades > 10)
    actions.push(`Limiter à ${Math.max(5, Math.round(s.nbTrades * 0.5))} trades maximum par session`)
  if (s.winRate < 0.45)
    actions.push("Journaliser le contexte de marché à chaque entrée pour identifier les filtres manquants")
  if (s.longestLossStreak >= 3)
    actions.push('Définir une règle de pause automatique après 3 pertes consécutives')
  if (s.avgRR < 1)
    actions.push("N'entrer en trade que si le potentiel de gain est supérieur à la perte possible")
  if (strengths.length > 0 && improvements.length === 0)
    actions.push('Répliquer exactement cette approche demain')
  if (actions.length === 0)
    actions.push('Revoir les trades de la journée et noter le setup de chacun')

  return {
    strengths:    strengths.slice(0, 3),
    improvements: improvements.slice(0, 3),
    actions:      actions.slice(0, 3),
  }
}

// ── Texte narratif : template (0 coût) ou Haiku si clé présente ──────────────

function narrativeTemplate(s: DayStats, score: number): string {
  const pnlStr = `${s.totalPnl >= 0 ? '+' : ''}${s.totalPnl.toFixed(2)} €`
  const wrStr  = `${Math.round(s.winRate * 100)}%`
  if (score >= 75)
    return `Excellente journée — ${s.nbTrades} trades, PnL ${pnlStr}, win rate ${wrStr}. Profit factor à ${s.profitFactor.toFixed(2)} : la gestion du risque est au rendez-vous.`
  if (score >= 50)
    return `Journée correcte — ${s.nbTrades} trades pour un PnL de ${pnlStr}. Win rate de ${wrStr} dans la moyenne, quelques ajustements possibles.`
  return `Journée difficile — ${s.nbTrades} trades, PnL ${pnlStr} (${wrStr} de réussite). Point de vigilance sur la sélectivité des entrées.`
}

async function generateNarrative(
  s: DayStats,
  score: number,
  userContext?: string,
): Promise<{ text: string; inputTokens: number; outputTokens: number }> {
  if (!env.ANTHROPIC_API_KEY) {
    return { text: narrativeTemplate(s, score), inputTokens: 0, outputTokens: 0 }
  }

  try {
    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })
    const prompt =
      `Synthèse de trading en 2 phrases max, directe et personnalisée.\n` +
      `Trades: ${s.nbTrades} | PnL: ${s.totalPnl.toFixed(2)} € | Win rate: ${Math.round(s.winRate * 100)}% | ` +
      `Profit factor: ${s.profitFactor.toFixed(2)} | R:R: ${s.avgRR.toFixed(1)} | Score: ${score}/100` +
      (userContext ? `\nContexte: ${userContext}` : '')

    const res = await client.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 150,
      messages:   [{ role: 'user', content: prompt }],
    })

    return {
      text:         res.content[0]?.type === 'text' ? res.content[0].text : narrativeTemplate(s, score),
      inputTokens:  res.usage.input_tokens,
      outputTokens: res.usage.output_tokens,
    }
  } catch {
    return { text: narrativeTemplate(s, score), inputTokens: 0, outputTokens: 0 }
  }
}

// ── Export principal ──────────────────────────────────────────────────────────

export async function analyzeTradesForDay(
  userId: string,
  date: Date,
  userContext?: string,
): Promise<{
  aiAnalysis:   string
  score:        number
  insights:     { strengths: string[]; improvements: string[]; actions: string[] }
  inputTokens:  number
  outputTokens: number
}> {
  const dayStart = new Date(date); dayStart.setHours(0, 0, 0, 0)
  const dayEnd   = new Date(date); dayEnd.setHours(23, 59, 59, 999)

  const trades = await prisma.trade.findMany({
    where:   { userId, closeTime: { gte: dayStart, lte: dayEnd }, status: 'CLOSED' },
    select:  { symbol: true, direction: true, openTime: true, closeTime: true, pnl: true, lotSize: true, commission: true, swap: true },
    orderBy: { closeTime: 'asc' },
  })

  if (trades.length === 0) {
    return {
      aiAnalysis:   'Aucun trade clôturé ce jour.',
      score:        0,
      insights: {
        strengths:    [],
        improvements: ['Aucun trade clôturé ce jour'],
        actions:      ['Tenir un journal même les jours sans trade'],
      },
      inputTokens:  0,
      outputTokens: 0,
    }
  }

  const stats    = computeDayStats(trades)
  const score    = computeScore(stats)
  const insights = generateInsights(stats)
  const { text: aiAnalysis, inputTokens, outputTokens } = await generateNarrative(stats, score, userContext)

  return { aiAnalysis, score, insights, inputTokens, outputTokens }
}
