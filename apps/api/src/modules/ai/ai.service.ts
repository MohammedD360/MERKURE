import Anthropic from '@anthropic-ai/sdk'
import { env } from '../../config/env.js'
import { prisma } from '../../infrastructure/database/client.js'

const MODEL = 'claude-sonnet-4-6'
const MAX_TOKENS = 1024

function buildClient(): Anthropic {
  if (!env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY non configurée')
  return new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })
}

interface TradeRow {
  symbol: string
  direction: string
  openTime: Date
  closeTime: Date | null
  openPrice: unknown
  closePrice: unknown
  pnl: unknown
  lotSize: unknown
  commission: unknown
  swap: unknown
}

function formatTradesForPrompt(trades: TradeRow[]): string {
  return trades.map(t =>
    `- ${t.symbol} ${t.direction} | ouverture ${t.openTime.toISOString()} | ` +
    `PnL ${Number(t.pnl ?? 0).toFixed(2)} | lots ${Number(t.lotSize).toFixed(2)} | ` +
    `commission ${Number(t.commission ?? 0).toFixed(2)} | swap ${Number(t.swap ?? 0).toFixed(2)}`
  ).join('\n')
}

export async function analyzeTradesForDay(userId: string, date: Date, userContext?: string): Promise<{
  aiAnalysis: string
  score: number
  insights: { strengths: string[]; improvements: string[]; actions: string[] }
  inputTokens: number
  outputTokens: number
}> {
  const dayStart = new Date(date)
  dayStart.setHours(0, 0, 0, 0)
  const dayEnd = new Date(date)
  dayEnd.setHours(23, 59, 59, 999)

  const trades = await prisma.trade.findMany({
    where:  { userId, closeTime: { gte: dayStart, lte: dayEnd }, status: 'CLOSED' },
    select: { symbol: true, direction: true, openTime: true, closeTime: true, openPrice: true, closePrice: true, pnl: true, lotSize: true, commission: true, swap: true },
    orderBy: { closeTime: 'asc' },
  })

  if (trades.length === 0) {
    return {
      aiAnalysis:   'Aucun trade clôturé ce jour — rien à analyser.',
      score:        0,
      insights:     { strengths: [], improvements: ['Aucun trade ce jour'], actions: [] },
      inputTokens:  0,
      outputTokens: 0,
    }
  }

  const totalPnl     = trades.reduce((s, t) => s + Number(t.pnl ?? 0), 0)
  const winners      = trades.filter(t => Number(t.pnl ?? 0) > 0)
  const winRate      = (winners.length / trades.length * 100).toFixed(0)
  const grossProfit  = winners.reduce((s, t) => s + Number(t.pnl ?? 0), 0)
  const grossLoss    = Math.abs(trades.filter(t => Number(t.pnl ?? 0) < 0).reduce((s, t) => s + Number(t.pnl ?? 0), 0))
  const profitFactor = grossLoss > 0 ? (grossProfit / grossLoss).toFixed(2) : '∞'

  const systemPrompt = `Tu es un coach de trading expert. Tu analyses les performances journalières d'un trader retail et fournis un feedback structuré, bienveillant mais honnête.
Réponds UNIQUEMENT en JSON valide avec cette structure exacte :
{
  "score": <entier 0-100>,
  "analysis": "<synthèse en 2-3 phrases>",
  "insights": {
    "strengths": ["<point fort 1>", ...],
    "improvements": ["<axe d'amélioration 1>", ...],
    "actions": ["<action concrète à faire demain 1>", ...]
  }
}`

  const userMessage = `Date : ${date.toISOString().slice(0, 10)}
Trades clôturés : ${trades.length}
PnL total : ${totalPnl.toFixed(2)}
Taux de réussite : ${winRate}%
Profit factor : ${profitFactor}

Détail des trades :
${formatTradesForPrompt(trades)}
${userContext ? `\nContexte du trader : ${userContext}` : ''}`

  const client = buildClient()
  const response = await client.messages.create({
    model:      MODEL,
    max_tokens: MAX_TOKENS,
    system:     systemPrompt,
    messages:   [{ role: 'user', content: userMessage }],
  })

  const raw = response.content[0]?.type === 'text' ? response.content[0].text : '{}'
  let parsed: { score?: number; analysis?: string; insights?: { strengths?: string[]; improvements?: string[]; actions?: string[] } }
  try {
    parsed = JSON.parse(raw)
  } catch {
    parsed = { score: 50, analysis: raw, insights: { strengths: [], improvements: [], actions: [] } }
  }

  return {
    aiAnalysis:   parsed.analysis ?? '',
    score:        Math.min(100, Math.max(0, parsed.score ?? 50)),
    insights: {
      strengths:    parsed.insights?.strengths    ?? [],
      improvements: parsed.insights?.improvements ?? [],
      actions:      parsed.insights?.actions      ?? [],
    },
    inputTokens:  response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
  }
}
