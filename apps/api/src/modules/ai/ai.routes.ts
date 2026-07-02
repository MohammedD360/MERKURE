import type { FastifyInstance } from 'fastify'
import { authenticate } from '../../middleware/auth.js'
import { requirePlan } from '../../middleware/require-plan.js'
import { prisma } from '../../infrastructure/database/client.js'
import { analyzeTradesForDay } from './ai.service.js'
import { getCoaching, computeKpis } from '../../infrastructure/ai-python/ai-python-client.js'

export async function aiRoutes(app: FastifyInstance) {
  /**
   * POST /api/v1/ai/analysis
   * Body: { date?: string (YYYY-MM-DD), context?: string }
   * Génère une analyse IA pour la journée donnée et la persiste.
   */
  app.post<{ Body: { date?: string; context?: string } }>(
    '/analysis',
    { preHandler: [authenticate, requirePlan('PRO')] },
    async (req, reply) => {
      const date = req.body?.date ? new Date(req.body.date) : new Date()
      if (isNaN(date.getTime())) {
        return reply.code(400).send({ error: 'invalid_date' })
      }

      const dateOnly = new Date(date.toISOString().slice(0, 10))

      // Vérifie si une analyse existe déjà ce jour (on la retourne sans rappeler Claude)
      const existing = await prisma.aiJournalEntry.findFirst({
        where: { userId: req.user.id, date: dateOnly },
        orderBy: { createdAt: 'desc' },
      })
      if (existing) return existing

      try {
        const result = await analyzeTradesForDay(req.user.id, date, req.body?.context)

        const entry = await prisma.aiJournalEntry.create({
          data: {
            userId:       req.user.id,
            date:         dateOnly,
            userInput:    req.body?.context ?? null,
            aiAnalysis:   result.aiAnalysis,
            score:        result.score,
            insights:     result.insights,
            inputTokens:  result.inputTokens,
            outputTokens: result.outputTokens,
          },
        })

        return reply.code(201).send(entry)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'ai_error'
        return reply.code(502).send({ error: 'ai_unavailable', detail: message })
      }
    },
  )

  /**
   * POST /api/v1/ai/coaching
   * Analyse approfondie par Claude via le service Python (Sonnet + prompt caching).
   * Body: { period?: '7d'|'30d'|'90d'; question?: string }
   */
  app.post<{ Body: { period?: string; question?: string } }>(
    '/coaching',
    { preHandler: [authenticate, requirePlan('PRO')] },
    async (req, reply) => {
      const userId = req.user.id
      const since  = buildSince(req.body?.period ?? '30d')

      const [profile, trades] = await Promise.all([
        prisma.traderProfile.findUnique({ where: { userId } }),
        prisma.trade.findMany({
          where:   { userId, status: 'CLOSED', closeTime: { gte: since } },
          orderBy: { closeTime: 'desc' },
          take:    200,
          select:  { id: true, pnl: true, openTime: true, closeTime: true, direction: true, symbol: true },
        }),
      ])

      if (trades.length === 0) {
        return reply.code(422).send({ error: 'no_trades', detail: 'Aucun trade clôturé sur la période.' })
      }

      // KPIs précis via Pandas
      const kpis = await computeKpis(
        trades.map(t => ({
          id:         t.id,
          pnl:        t.pnl != null ? Number(t.pnl) : null,
          open_time:  t.openTime?.toISOString() ?? null,
          close_time: t.closeTime?.toISOString() ?? null,
          direction:  t.direction ?? null,
          symbol:     t.symbol ?? null,
        })),
      ).catch(() => null)

      if (!kpis) {
        return reply.code(502).send({ error: 'kpis_unavailable', detail: 'Service de calcul KPIs indisponible.' })
      }

      // Résumé textuel des 10 derniers trades
      const recentSummary = trades.slice(0, 10)
        .map(t => `${t.symbol ?? '?'} ${t.direction ?? '?'} PnL ${Number(t.pnl ?? 0).toFixed(2)} €`)
        .join('\n')

      const result = await getCoaching({
        trader_context: {
          style:            profile?.style   ?? 'inconnu',
          markets:          profile?.markets ?? [],
          experience_years: profile?.experienceYears ?? 0,
        },
        kpis: {
          win_rate:      kpis.win_rate,
          profit_factor: kpis.profit_factor,
          sharpe_ratio:  kpis.sharpe_ratio,
          max_drawdown:  kpis.max_drawdown,
          total_trades:  kpis.total_trades,
          avg_rr:        kpis.avg_rr,
          total_pnl:     kpis.total_pnl,
        },
        recent_trades_summary: recentSummary,
        ...(req.body?.question ? { question: req.body.question } : {}),
      }).catch((err: unknown) => {
        throw reply.code(502).send({ error: 'coaching_unavailable', detail: String(err) })
      })

      return reply.code(200).send(result)
    },
  )

  /**
   * GET /api/v1/ai/journal?limit=10&offset=0
   * Liste l'historique des analyses IA de l'utilisateur.
   */
  app.get<{ Querystring: { limit?: string; offset?: string } }>(
    '/journal',
    { preHandler: [authenticate] },
    async (req) => {
      const limit  = Math.min(parseInt(req.query.limit  ?? '10', 10), 50)
      const offset = parseInt(req.query.offset ?? '0', 10)

      const [entries, total] = await Promise.all([
        prisma.aiJournalEntry.findMany({
          where:   { userId: req.user.id },
          orderBy: { date: 'desc' },
          take:    limit,
          skip:    offset,
          select:  { id: true, date: true, score: true, aiAnalysis: true, insights: true, createdAt: true },
        }),
        prisma.aiJournalEntry.count({ where: { userId: req.user.id } }),
      ])

      return { entries, total, limit, offset }
    },
  )
}

function buildSince(period: string): Date {
  const now = new Date()
  switch (period) {
    case '7d':  return new Date(now.getTime() - 7   * 86_400_000)
    case '90d': return new Date(now.getTime() - 90  * 86_400_000)
    case '1y':  return new Date(now.getTime() - 365 * 86_400_000)
    default:    return new Date(now.getTime() - 30  * 86_400_000)
  }
}
