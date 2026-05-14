import type { FastifyInstance } from 'fastify'
import { authenticate } from '../../middleware/auth.js'
import { cache, CacheKeys } from '../../infrastructure/cache/redis.js'
import { kpisRepository, type Period } from './kpis.repository.js'

const VALID_PERIODS = new Set<string>(['7d', '30d', '90d', '1y', 'all'])
const CACHE_TTL = 60 * 5 // 5 minutes

export async function kpisRoutes(app: FastifyInstance) {
  /**
   * GET /api/v1/kpis/summary?period=30d
   * Retourne les métriques agrégées sur la période demandée.
   */
  app.get<{ Querystring: { period?: string } }>(
    '/summary',
    { preHandler: [authenticate] },
    async (req, reply) => {
      const period = (VALID_PERIODS.has(req.query.period ?? '') ? req.query.period : '30d') as Period
      const cacheKey = `kpis:${req.user.id}:summary:${period}`

      const cached = await cache.get<object>(cacheKey)
      if (cached) return cached

      const data = await kpisRepository.getSummary(req.user.id, period)
      await cache.set(cacheKey, data, CACHE_TTL)
      return data
    },
  )

  /**
   * GET /api/v1/kpis/snapshots?from=2026-01-01&to=2026-05-14
   * Retourne les snapshots journaliers pour le graphique d'équité.
   */
  app.get<{ Querystring: { from?: string; to?: string } }>(
    '/snapshots',
    { preHandler: [authenticate] },
    async (req, reply) => {
      const to   = req.query.to   ? new Date(req.query.to)   : new Date()
      const from = req.query.from ? new Date(req.query.from) : new Date(to.getTime() - 30 * 86_400_000)

      if (isNaN(from.getTime()) || isNaN(to.getTime())) {
        return reply.code(400).send({ error: 'invalid_date_range' })
      }

      const cacheKey = `kpis:${req.user.id}:snapshots:${from.toISOString().slice(0, 10)}:${to.toISOString().slice(0, 10)}`
      const cached = await cache.get<object[]>(cacheKey)
      if (cached) return cached

      const data = await kpisRepository.getSnapshots(req.user.id, from, to)
      await cache.set(cacheKey, data, CACHE_TTL)
      return data
    },
  )
}
