import type { FastifyInstance } from 'fastify'
import { authenticate } from '../../middleware/auth.js'
import { cache } from '../../infrastructure/cache/redis.js'
import { performanceRepository, type Period } from './performance.repository.js'

const VALID_PERIODS = new Set<string>(['7d', '30d', '90d', '1y', 'all'])
const CACHE_TTL = 60 * 5 // 5 minutes

function parsePeriod(raw: string | undefined): Period {
  return (VALID_PERIODS.has(raw ?? '') ? raw : '30d') as Period
}

export async function performanceRoutes(app: FastifyInstance) {
  /**
   * GET /api/v1/performance/curve?from=YYYY-MM-DD&to=YYYY-MM-DD&accountId=...
   */
  app.get<{ Querystring: { from?: string; to?: string; accountId?: string } }>(
    '/curve',
    { preHandler: [authenticate] },
    async (req, reply) => {
      const to   = req.query.to   ? new Date(req.query.to)   : new Date()
      const from = req.query.from ? new Date(req.query.from) : new Date(to.getTime() - 30 * 86_400_000)

      if (isNaN(from.getTime()) || isNaN(to.getTime())) {
        return reply.code(400).send({ error: 'invalid_date_range' })
      }

      const accountId = req.query.accountId
      const cacheKey  = `kpis:curve:${req.user.id}:${from.toISOString().slice(0, 10)}:${to.toISOString().slice(0, 10)}:${accountId ?? ''}`

      const cached = await cache.get<object[]>(cacheKey)
      if (cached) return cached

      const data = await performanceRepository.getCurveData(req.user.id, from, to, accountId)
      await cache.set(cacheKey, data, CACHE_TTL)
      return data
    },
  )

  /**
   * GET /api/v1/performance/sessions?period=30d&accountId=...
   */
  app.get<{ Querystring: { period?: string; accountId?: string } }>(
    '/sessions',
    { preHandler: [authenticate] },
    async (req) => {
      const period    = parsePeriod(req.query.period)
      const accountId = req.query.accountId
      const cacheKey  = `kpis:sessions:${req.user.id}:${period}:${accountId ?? ''}`

      const cached = await cache.get<object[]>(cacheKey)
      if (cached) return cached

      const data = await performanceRepository.getSessionStats(req.user.id, period, accountId)
      await cache.set(cacheKey, data, CACHE_TTL)
      return data
    },
  )

  /**
   * GET /api/v1/performance/weekdays?period=30d&accountId=...
   */
  app.get<{ Querystring: { period?: string; accountId?: string } }>(
    '/weekdays',
    { preHandler: [authenticate] },
    async (req) => {
      const period    = parsePeriod(req.query.period)
      const accountId = req.query.accountId
      const cacheKey  = `kpis:weekdays:${req.user.id}:${period}:${accountId ?? ''}`

      const cached = await cache.get<object[]>(cacheKey)
      if (cached) return cached

      const data = await performanceRepository.getWeekdayStats(req.user.id, period, accountId)
      await cache.set(cacheKey, data, CACHE_TTL)
      return data
    },
  )

  /**
   * GET /api/v1/performance/heatmap?period=30d&accountId=...
   */
  app.get<{ Querystring: { period?: string; accountId?: string } }>(
    '/heatmap',
    { preHandler: [authenticate] },
    async (req) => {
      const period    = parsePeriod(req.query.period)
      const accountId = req.query.accountId
      const cacheKey  = `kpis:heatmap:${req.user.id}:${period}:${accountId ?? ''}`

      const cached = await cache.get<object[]>(cacheKey)
      if (cached) return cached

      const data = await performanceRepository.getHeatmapData(req.user.id, period, accountId)
      await cache.set(cacheKey, data, CACHE_TTL)
      return data
    },
  )

  /**
   * GET /api/v1/performance/stats?period=30d&accountId=...
   */
  app.get<{ Querystring: { period?: string; accountId?: string } }>(
    '/stats',
    { preHandler: [authenticate] },
    async (req) => {
      const period    = parsePeriod(req.query.period)
      const accountId = req.query.accountId
      const cacheKey  = `kpis:perf-stats:${req.user.id}:${period}:${accountId ?? ''}`

      const cached = await cache.get<object>(cacheKey)
      if (cached) return cached

      const data = await performanceRepository.getAdvancedStats(req.user.id, period, accountId)
      await cache.set(cacheKey, data, CACHE_TTL)
      return data
    },
  )

  /**
   * GET /api/v1/performance/revenge-trading?period=30d&threshold=30&lotPct=20
   */
  app.get<{ Querystring: { period?: string; threshold?: string; lotPct?: string } }>(
    '/revenge-trading',
    { preHandler: [authenticate] },
    async (req) => {
      const period              = parsePeriod(req.query.period)
      const timeThresholdMin    = parseInt(req.query.threshold ?? '30', 10)
      const lotIncreasePct      = parseInt(req.query.lotPct    ?? '20', 10)
      const cacheKey            = `kpis:revenge:${req.user.id}:${period}:${timeThresholdMin}:${lotIncreasePct}`

      const cached = await cache.get<object[]>(cacheKey)
      if (cached) return cached

      const data = await performanceRepository.getRevengeTradingAlerts(
        req.user.id,
        period,
        { timeThresholdMin, lotIncreasePct },
      )
      await cache.set(cacheKey, data, CACHE_TTL)
      return data
    },
  )
}
