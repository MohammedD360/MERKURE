import type { FastifyInstance } from 'fastify'
import { authenticate } from '../../middleware/auth.js'
import { prisma } from '../../infrastructure/database/client.js'
import { analyzeTradesForDay } from './ai.service.js'

export async function aiRoutes(app: FastifyInstance) {
  /**
   * POST /api/v1/ai/analysis
   * Body: { date?: string (YYYY-MM-DD), context?: string }
   * Génère une analyse IA pour la journée donnée et la persiste.
   */
  app.post<{ Body: { date?: string; context?: string } }>(
    '/analysis',
    { preHandler: [authenticate] },
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
