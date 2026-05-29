import type { FastifyInstance } from 'fastify'
import { authenticate } from '../../middleware/auth.js'
import { journalRepository } from './journal.repository.js'

export async function journalRoutes(app: FastifyInstance) {

  app.get<{ Querystring: { year?: string; month?: string } }>(
    '/calendar',
    { preHandler: [authenticate] },
    async (req) => {
      const now   = new Date()
      const year  = parseInt(req.query.year  ?? String(now.getFullYear()), 10)
      const month = parseInt(req.query.month ?? String(now.getMonth() + 1), 10)
      return journalRepository.getCalendar(req.user.id, year, month)
    },
  )

  app.get<{ Params: { date: string } }>(
    '/entry/:date',
    { preHandler: [authenticate] },
    async (req, reply) => {
      const entry = await journalRepository.getEntry(req.user.id, req.params.date)
      if (!entry) return reply.code(404).send(null)
      return entry
    },
  )

  app.put<{
    Params: { date: string }
    Body: { mood?: string; planBefore?: string; reviewAfter?: string; notes?: string }
  }>(
    '/entry/:date',
    { preHandler: [authenticate] },
    async (req) => {
      const { mood, planBefore, reviewAfter, notes } = req.body
      return journalRepository.upsertEntry(req.user.id, req.params.date, {
        mood:        mood        ?? null,
        planBefore:  planBefore  ?? null,
        reviewAfter: reviewAfter ?? null,
        notes:       notes       ?? null,
      })
    },
  )

  app.delete<{ Params: { date: string } }>(
    '/entry/:date',
    { preHandler: [authenticate] },
    async (req) => {
      await journalRepository.deleteEntry(req.user.id, req.params.date)
      return { ok: true }
    },
  )
}
