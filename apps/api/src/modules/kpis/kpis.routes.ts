import type { FastifyInstance } from 'fastify'
import { authenticate } from '../../middleware/auth.js'
import { cache, CacheKeys } from '../../infrastructure/cache/redis.js'
import { kpisRepository, type Period } from './kpis.repository.js'

const VALID_PERIODS = new Set<string>(['7d', '30d', '90d', '1y', 'all'])
const CACHE_TTL = 60 * 5 // 5 minutes

export async function kpisRoutes(app: FastifyInstance) {
  /**
   * GET /api/v1/kpis/summary?period=30d&accountId=uuid
   */
  app.get<{ Querystring: { period?: string; accountId?: string } }>(
    '/summary',
    { preHandler: [authenticate] },
    async (req) => {
      const period    = (VALID_PERIODS.has(req.query.period ?? '') ? req.query.period : '30d') as Period
      const accountId = req.query.accountId
      const cacheKey  = CacheKeys.kpiSummary(req.user.id, period, accountId)

      const cached = await cache.get<object>(cacheKey)
      if (cached) return cached

      const data = await kpisRepository.getSummary(req.user.id, period, accountId)
      await cache.set(cacheKey, data, CACHE_TTL)
      return data
    },
  )

  /**
   * GET /api/v1/kpis/stats?period=30d&accountId=uuid
   */
  app.get<{ Querystring: { period?: string; accountId?: string } }>(
    '/stats',
    { preHandler: [authenticate] },
    async (req) => {
      const period    = (VALID_PERIODS.has(req.query.period ?? '') ? req.query.period : '30d') as Period
      const accountId = req.query.accountId
      const cacheKey  = `kpis:stats:${req.user.id}:${period}:${accountId ?? ''}`

      const cached = await cache.get<object>(cacheKey)
      if (cached) return cached

      const data = await kpisRepository.getDetailedStats(req.user.id, period, accountId)
      await cache.set(cacheKey, data, CACHE_TTL)
      return data
    },
  )

  /**
   * GET /api/v1/kpis/breakdown?period=30d&accountId=uuid
   */
  app.get<{ Querystring: { period?: string; accountId?: string } }>(
    '/breakdown',
    { preHandler: [authenticate] },
    async (req) => {
      const period    = (VALID_PERIODS.has(req.query.period ?? '') ? req.query.period : '30d') as Period
      const accountId = req.query.accountId
      const cacheKey  = `kpis:breakdown:${req.user.id}:${period}:${accountId ?? ''}`

      const cached = await cache.get<object>(cacheKey)
      if (cached) return cached

      const data = await kpisRepository.getBreakdown(req.user.id, period, accountId)
      await cache.set(cacheKey, data, CACHE_TTL)
      return data
    },
  )

  /**
   * GET /api/v1/kpis/snapshots?from=2026-01-01&to=2026-05-14&accountId=uuid
   */
  app.get<{ Querystring: { from?: string; to?: string; accountId?: string } }>(
    '/snapshots',
    { preHandler: [authenticate] },
    async (req, reply) => {
      const to        = req.query.to   ? new Date(req.query.to)   : new Date()
      const from      = req.query.from ? new Date(req.query.from) : new Date(to.getTime() - 30 * 86_400_000)
      const accountId = req.query.accountId

      if (isNaN(from.getTime()) || isNaN(to.getTime())) {
        return reply.code(400).send({ error: 'invalid_date_range' })
      }

      const cacheKey = CacheKeys.kpiSnapshots(
        req.user.id,
        from.toISOString().slice(0, 10),
        to.toISOString().slice(0, 10),
        accountId,
      )

      const cached = await cache.get<object[]>(cacheKey)
      if (cached) return cached

      const data = await kpisRepository.getSnapshots(req.user.id, from, to, accountId)
      await cache.set(cacheKey, data, CACHE_TTL)
      return data
    },
  )
}
