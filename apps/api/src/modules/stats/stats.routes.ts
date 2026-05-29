import type { FastifyInstance } from 'fastify'
import { authenticate } from '../../middleware/auth.js'
import { cache } from '../../infrastructure/cache/redis.js'
import { statsRepository, type Period } from './stats.repository.js'

const VALID_PERIODS = new Set<string>(['7d', '30d', '90d', '1y', 'all'])
const TTL = 60 * 5

function parsePeriod(raw: string | undefined): Period {
  return (VALID_PERIODS.has(raw ?? '') ? raw : '30d') as Period
}

export async function statsRoutes(app: FastifyInstance) {
  app.get<{ Querystring: { months?: string } }>(
    '/monthly',
    { preHandler: [authenticate] },
    async (req) => {
      const months = Math.min(parseInt(req.query.months ?? '12', 10), 24)
      const key    = `stats:monthly:${req.user.id}:${months}`
      const cached = await cache.get<object[]>(key)
      if (cached) return cached
      const data = await statsRepository.getMonthlyStats(req.user.id, months)
      await cache.set(key, data, TTL)
      return data
    },
  )

  app.get<{ Querystring: { period?: string } }>(
    '/by-symbol',
    { preHandler: [authenticate] },
    async (req) => {
      const period = parsePeriod(req.query.period)
      const key    = `stats:by-symbol:${req.user.id}:${period}`
      const cached = await cache.get<object[]>(key)
      if (cached) return cached
      const data = await statsRepository.getSymbolStats(req.user.id, period)
      await cache.set(key, data, TTL)
      return data
    },
  )

  app.get<{ Querystring: { period?: string } }>(
    '/distribution',
    { preHandler: [authenticate] },
    async (req) => {
      const period = parsePeriod(req.query.period)
      const key    = `stats:distribution:${req.user.id}:${period}`
      const cached = await cache.get<object[]>(key)
      if (cached) return cached
      const data = await statsRepository.getPnlDistribution(req.user.id, period)
      await cache.set(key, data, TTL)
      return data
    },
  )

  app.get<{ Querystring: { period?: string } }>(
    '/streaks',
    { preHandler: [authenticate] },
    async (req) => {
      const period = parsePeriod(req.query.period)
      const key    = `stats:streaks:${req.user.id}:${period}`
      const cached = await cache.get<object>(key)
      if (cached) return cached
      const data = await statsRepository.getStreaks(req.user.id, period)
      await cache.set(key, data, TTL)
      return data
    },
  )
}
