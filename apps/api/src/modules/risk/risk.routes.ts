import type { FastifyInstance } from 'fastify'
import { authenticate } from '../../middleware/auth.js'
import { cache } from '../../infrastructure/cache/redis.js'
import { prisma } from '../../infrastructure/database/client.js'

const CACHE_TTL = 60
const DAILY_LOSS_THRESHOLD = 200

function buildCacheKey(userId: string): string {
  return `risk:status:${userId}`
}

export async function riskRoutes(app: FastifyInstance) {
  app.get(
    '/status',
    { preHandler: [authenticate] },
    async (req) => {
      const userId = req.user.id

      const cached = await cache.get<object>(buildCacheKey(userId))
      if (cached) return cached

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const weekAgo = new Date(Date.now() - 7 * 86400000)

      const [user, todayTrades, recentTrades] = await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          select: { riskPerTrade: true },
        }),
        prisma.trade.findMany({
          where: { userId, status: 'CLOSED', closeTime: { gte: today } },
          select: { pnl: true },
        }),
        prisma.trade.findMany({
          where: { userId, status: 'CLOSED', closeTime: { gte: weekAgo } },
          orderBy: { closeTime: 'desc' },
          take: 10,
          select: { pnl: true, closeTime: true },
        }),
      ])

      const todayPnl = todayTrades.reduce((sum, t) => sum + Number(t.pnl ?? 0), 0)
      const weeklyPnl = recentTrades.reduce((sum, t) => sum + Number(t.pnl ?? 0), 0)

      let consecutiveLosses = 0
      for (const t of recentTrades) {
        if (Number(t.pnl) < 0) {
          consecutiveLosses++
        } else {
          break
        }
      }

      const alerts: string[] = []
      if (consecutiveLosses >= 3) {
        alerts.push(`${consecutiveLosses} pertes consécutives — envisagez une pause`)
      }
      if (todayPnl < 0 && Math.abs(todayPnl) > DAILY_LOSS_THRESHOLD) {
        alerts.push(`Perte journalière élevée — ${todayPnl.toFixed(2)}€`)
      }

      const result = {
        riskPerTrade: Number(user?.riskPerTrade ?? 1),
        todayPnl,
        todayTrades: todayTrades.length,
        consecutiveLosses,
        weeklyPnl,
        alerts,
      }

      await cache.set(buildCacheKey(userId), result, CACHE_TTL)
      return result
    },
  )

  app.patch<{ Body: { riskPerTrade: number } }>(
    '/settings',
    { preHandler: [authenticate] },
    async (req, reply) => {
      const { riskPerTrade } = req.body

      if (
        typeof riskPerTrade !== 'number' ||
        isNaN(riskPerTrade) ||
        riskPerTrade < 0.1 ||
        riskPerTrade > 10
      ) {
        return reply.code(400).send({ error: 'riskPerTrade must be between 0.1 and 10' })
      }

      const updated = await prisma.user.update({
        where: { id: req.user.id },
        data: { riskPerTrade },
        select: { riskPerTrade: true },
      })

      await cache.del(buildCacheKey(req.user.id))

      return { riskPerTrade: Number(updated.riskPerTrade) }
    },
  )
}
