import type { FastifyInstance } from 'fastify'
import { authenticate } from '../../middleware/auth.js'
import { cache, CacheKeys } from '../../infrastructure/cache/redis.js'
import { kpisRepository, type Period } from './kpis.repository.js'
import { calculateAiScore } from './ai-score.js'
import { detectBehavioralPatterns } from './behavioral-detection.js'
import { CAN_ACCESS_ADVANCED_KPIS, KPI_MAX_PERIOD_DAYS, upgradeRequired } from '../../middleware/plan-limits.js'

const VALID_PERIODS = new Set<string>(['7d', '30d', '90d', '1y', 'all'])
const CACHE_TTL = 60 * 5 // 5 minutes

export async function kpisRoutes(app: FastifyInstance) {
  /**
   * GET /api/v1/kpis/summary?period=30d&accountId=uuid
   * Accessible à tous les plans, mais FREE limité à 30d.
   */
  app.get<{ Querystring: { period?: string; accountId?: string } }>(
    '/summary',
    { preHandler: [authenticate] },
    async (req) => {
      const plan      = req.user.plan ?? 'FREE'
      const maxDays   = KPI_MAX_PERIOD_DAYS[plan] ?? 30
      // Forcer 30d pour FREE même si l'utilisateur demande 1y
      const requested = req.query.period ?? '30d'
      const allowed   = periodToDays(requested) <= maxDays ? requested : '30d'
      const period    = (VALID_PERIODS.has(allowed) ? allowed : '30d') as Period
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
   * PRO+ seulement.
   */
  app.get<{ Querystring: { period?: string; accountId?: string } }>(
    '/stats',
    { preHandler: [authenticate] },
    async (req, reply) => {
      const plan = req.user.plan ?? 'FREE'
      if (!CAN_ACCESS_ADVANCED_KPIS.has(plan)) {
        return reply.code(403).send({ error: 'plan_required', requiredPlan: upgradeRequired(plan) })
      }

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
   * PRO+ seulement.
   */
  app.get<{ Querystring: { period?: string; accountId?: string } }>(
    '/breakdown',
    { preHandler: [authenticate] },
    async (req, reply) => {
      const plan = req.user.plan ?? 'FREE'
      if (!CAN_ACCESS_ADVANCED_KPIS.has(plan)) {
        return reply.code(403).send({ error: 'plan_required', requiredPlan: upgradeRequired(plan) })
      }

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
   * Limité selon le plan (FREE=30j, STARTER=90j, PRO+=illimité).
   */
  app.get<{ Querystring: { from?: string; to?: string; accountId?: string } }>(
    '/snapshots',
    { preHandler: [authenticate] },
    async (req, reply) => {
      const plan    = req.user.plan ?? 'FREE'
      const maxDays = KPI_MAX_PERIOD_DAYS[plan] ?? 30
      const to      = req.query.to   ? new Date(req.query.to)   : new Date()
      const earliest = new Date(to.getTime() - maxDays * 86_400_000)

      // On ne remonte pas au-delà de la limite du plan
      const rawFrom  = req.query.from ? new Date(req.query.from) : earliest
      const from     = rawFrom < earliest ? earliest : rawFrom
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

  /**
   * GET /api/v1/kpis/ai-score?period=30d
   * Score global IA (0-100) — accessible à tous les plans.
   */
  app.get<{ Querystring: { period?: string } }>(
    '/ai-score',
    { preHandler: [authenticate] },
    async (req) => {
      const period   = (VALID_PERIODS.has(req.query.period ?? '') ? req.query.period : '30d') as Period
      const cacheKey = `kpis:ai-score:${req.user.id}:${period}`

      const cached = await cache.get<object>(cacheKey)
      if (cached) return cached

      const data = await calculateAiScore(req.user.id, period)
      await cache.set(cacheKey, data, CACHE_TTL)
      return data
    },
  )

  /**
   * GET /api/v1/kpis/behavioral?period=30d
   * Détection des 6 patterns comportementaux — Pro+.
   */
  app.get<{ Querystring: { period?: string } }>(
    '/behavioral',
    { preHandler: [authenticate] },
    async (req) => {
      const period   = (VALID_PERIODS.has(req.query.period ?? '') ? req.query.period : '30d') as Period
      const cacheKey = `kpis:behavioral:${req.user.id}:${period}`

      const cached = await cache.get<object>(cacheKey)
      if (cached) return cached

      const data = await detectBehavioralPatterns(req.user.id, period)
      await cache.set(cacheKey, data, CACHE_TTL)
      return data
    },
  )
}

function periodToDays(period: string): number {
  switch (period) {
    case '7d':  return 7
    case '30d': return 30
    case '90d': return 90
    case '1y':  return 365
    case 'all': return 9999
    default:    return 30
  }
}
