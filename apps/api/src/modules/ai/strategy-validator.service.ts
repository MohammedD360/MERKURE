import Anthropic from '@anthropic-ai/sdk'
import type { Prisma } from '@prisma/client'
import { env } from '../../config/env.js'
import { prisma } from '../../infrastructure/database/client.js'

export interface StrategyValidatorInput {
  userId:      string
  instrument:  string
  timeframe:   string
  direction:   string
  style:       string
  entryPrice?: number
  stopLoss?:   number
  takeProfit?: number
  thesis?:     string
  imageBase64?: string // data URI complet, ex. "data:image/png;base64,...."
}

export interface ControlCheck {
  title:       string
  description: string
  status:      'valid' | 'warning' | 'error'
}

export interface AdviceItem {
  title:  string
  text:   string
  impact: string
}

export interface StrategyAnalysisResult {
  id:               string
  score:            number
  headline:         string
  aiReading:        string
  timingAssessment: string
  confidencePct:    number
  riskReward:       number | null
  controls:         ControlCheck[]
  criteria:         { label: string; value: number }[]
  advice:           AdviceItem[]
  decision:         { verdict: 'enter' | 'wait' | 'avoid'; explanation: string }
  disciplineNote:   string
  createdAt:        string
}

const ANALYSIS_TOOL: Anthropic.Tool = {
  name: 'submit_analysis',
  description: "Soumet l'analyse structurée du setup de trading.",
  input_schema: {
    type: 'object',
    properties: {
      score:            { type: 'integer', minimum: 0, maximum: 100, description: 'Note globale du setup sur 100' },
      headline:         { type: 'string', description: 'Verdict en une courte phrase, ex. "Setup correct, confirmation requise"' },
      aiReading:        { type: 'string', description: 'Paragraphe expliquant la lecture du setup/graphique (structure, zones, confluences)' },
      timingAssessment: { type: 'string', description: 'Évaluation courte du timing/session, ex. "Session à risque"' },
      confidencePct:    { type: 'integer', minimum: 0, maximum: 100, description: 'Confiance dans la lecture (données disponibles, clarté du screenshot)' },
      controls: {
        type: 'array',
        minItems: 3,
        maxItems: 6,
        items: {
          type: 'object',
          properties: {
            title:       { type: 'string' },
            description: { type: 'string' },
            status:      { type: 'string', enum: ['valid', 'warning', 'error'] },
          },
          required: ['title', 'description', 'status'],
          additionalProperties: false,
        },
        description: 'Points de contrôle vérifiés (structure de marché, stop loss, take profit, confluences, session...)',
      },
      criteria: {
        type: 'array',
        description: 'Score 0-100 pour chacun de ces 7 critères, dans cet ordre exact : Structure de marché, Zone d\'entrée, Stop Loss, Take Profit, Confluences, Timing / Session, Risk reward.',
        items: {
          type: 'object',
          properties: { label: { type: 'string' }, value: { type: 'integer', minimum: 0, maximum: 100 } },
          required: ['label', 'value'],
          additionalProperties: false,
        },
        minItems: 7,
        maxItems: 7,
      },
      advice: {
        type: 'array',
        minItems: 2,
        maxItems: 4,
        items: {
          type: 'object',
          properties: {
            title:  { type: 'string' },
            text:   { type: 'string' },
            impact: { type: 'string', description: 'Bénéfice estimé en une expression courte, ex. "+0,4R estimé"' },
          },
          required: ['title', 'text', 'impact'],
          additionalProperties: false,
        },
      },
      decision: {
        type: 'object',
        properties: {
          verdict:     { type: 'string', enum: ['enter', 'wait', 'avoid'] },
          explanation: { type: 'string' },
        },
        required: ['verdict', 'explanation'],
        additionalProperties: false,
      },
      disciplineNote: { type: 'string', description: 'Note de discipline reliant la décision aux objectifs de gestion du risque du trader' },
    },
    required: ['score', 'headline', 'aiReading', 'timingAssessment', 'confidencePct', 'controls', 'criteria', 'advice', 'decision', 'disciplineNote'],
    additionalProperties: false,
  },
}

function computeRiskReward(direction: string, entry?: number, sl?: number, tp?: number): number | null {
  if (entry == null || sl == null || tp == null) return null
  const risk   = Math.abs(entry - sl)
  const reward = Math.abs(tp - entry)
  if (risk === 0) return null
  return Number((reward / risk).toFixed(2))
}

function buildPrompt(input: StrategyValidatorInput, riskReward: number | null): string {
  const lines = [
    `Instrument : ${input.instrument}`,
    `Unité de temps : ${input.timeframe}`,
    `Direction : ${input.direction}`,
    `Style de trading : ${input.style}`,
  ]
  if (input.entryPrice != null) lines.push(`Point d'entrée : ${input.entryPrice}`)
  if (input.stopLoss   != null) lines.push(`Stop Loss : ${input.stopLoss}`)
  if (input.takeProfit != null) lines.push(`Take Profit : ${input.takeProfit}`)
  if (riskReward != null)       lines.push(`R:R calculé (exact, ne pas recalculer) : ${riskReward}`)
  if (input.thesis) lines.push(`Thèse du trader : ${input.thesis}`)
  lines.push(
    '',
    "Analyse ce setup de trading comme un coach expérimenté et rigoureux sur la gestion du risque. " +
    (input.imageBase64 ? "Utilise le screenshot du graphique fourni pour juger la structure de marché et les zones." : "Aucun screenshot fourni — base ton analyse uniquement sur les paramètres textuels ci-dessus, et signale-le comme limite dans aiReading.") +
    " Sois honnête si le setup est faible — ne valide jamais un setup médiocre pour faire plaisir.",
  )
  return lines.join('\n')
}

export async function runStrategyAnalysis(input: StrategyValidatorInput): Promise<StrategyAnalysisResult> {
  if (!env.ANTHROPIC_API_KEY) throw new Error('ai_unavailable')

  const riskReward = computeRiskReward(input.direction, input.entryPrice, input.stopLoss, input.takeProfit)
  const prompt = buildPrompt(input, riskReward)

  const content: Anthropic.ContentBlockParam[] = []
  if (input.imageBase64) {
    const match = /^data:(image\/\w+);base64,(.+)$/.exec(input.imageBase64)
    const mediaType = match?.[1]
    const data       = match?.[2]
    if (mediaType && data) {
      content.push({
        type: 'image',
        source: { type: 'base64', media_type: mediaType as 'image/png' | 'image/jpeg' | 'image/webp', data },
      })
    }
  }
  content.push({ type: 'text', text: prompt })

  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })
  const res = await client.messages.create({
    model:      'claude-opus-4-8',
    max_tokens: 4096,
    thinking:   { type: 'adaptive' },
    tools:      [ANALYSIS_TOOL],
    tool_choice: { type: 'tool', name: 'submit_analysis' },
    messages: [{ role: 'user', content }],
  })

  const toolUse = res.content.find((b): b is Anthropic.ToolUseBlock => b.type === 'tool_use')
  if (!toolUse) throw new Error('ai_no_structured_output')

  const parsed = toolUse.input as {
    score: number; headline: string; aiReading: string; timingAssessment: string; confidencePct: number
    controls: ControlCheck[]; criteria: { label: string; value: number }[]; advice: AdviceItem[]
    decision: { verdict: 'enter' | 'wait' | 'avoid'; explanation: string }; disciplineNote: string
  }

  const entry = await prisma.strategyAnalysis.create({
    data: {
      userId:       input.userId,
      instrument:   input.instrument,
      timeframe:    input.timeframe,
      direction:    input.direction,
      style:        input.style,
      entryPrice:   input.entryPrice   ?? null,
      stopLoss:     input.stopLoss     ?? null,
      takeProfit:   input.takeProfit   ?? null,
      thesis:       input.thesis       ?? null,
      score:        parsed.score,
      headline:     parsed.headline,
      aiReading:    parsed.aiReading,
      controls:     parsed.controls as unknown as Prisma.InputJsonValue,
      criteria:     parsed.criteria as unknown as Prisma.InputJsonValue,
      advice:       parsed.advice   as unknown as Prisma.InputJsonValue,
      decision:     { ...parsed.decision, timingAssessment: parsed.timingAssessment, confidencePct: parsed.confidencePct, disciplineNote: parsed.disciplineNote } as unknown as Prisma.InputJsonValue,
      inputTokens:  res.usage.input_tokens,
      outputTokens: res.usage.output_tokens,
    },
  })

  return {
    id:               entry.id,
    score:            parsed.score,
    headline:         parsed.headline,
    aiReading:        parsed.aiReading,
    timingAssessment: parsed.timingAssessment,
    confidencePct:    parsed.confidencePct,
    riskReward,
    controls:         parsed.controls,
    criteria:         parsed.criteria,
    advice:           parsed.advice,
    decision:         parsed.decision,
    disciplineNote:   parsed.disciplineNote,
    createdAt:        entry.createdAt.toISOString(),
  }
}

export async function listStrategyAnalyses(userId: string, limit: number) {
  const rows = await prisma.strategyAnalysis.findMany({
    where:   { userId },
    orderBy: { createdAt: 'desc' },
    take:    limit,
  })
  return rows.map((r) => ({
    id:         r.id,
    instrument: r.instrument,
    timeframe:  r.timeframe,
    direction:  r.direction,
    style:      r.style,
    score:      r.score,
    headline:   r.headline,
    createdAt:  r.createdAt.toISOString(),
  }))
}
