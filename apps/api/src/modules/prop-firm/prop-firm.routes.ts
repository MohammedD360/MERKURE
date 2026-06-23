import type { FastifyInstance } from 'fastify'
import { authenticate } from '../../middleware/auth.js'
import { prisma } from '../../infrastructure/database/client.js'
import { cache } from '../../infrastructure/cache/redis.js'

const CACHE_TTL = 60 * 2 // 2 min — données temps réel

export async function propFirmRoutes(app: FastifyInstance) {
  /**
   * GET /api/v1/prop-firm/compliance
   * Calcule les métriques de conformité prop firm à partir des vrais trades.
   *
   * Query params:
   *   from        — date ISO de début du challenge (optionnel, sinon tout l'historique)
   *   accountSize — capital du compte prop firm (ex: 100000)
   */
  app.get<{
    Querystring: { from?: string; accountSize?: string }
  }>(
    '/compliance',
    { preHandler: [authenticate] },
    async (req) => {
      const accountSize = Number(req.query.accountSize ?? 0)
      if (!accountSize || accountSize <= 0) {
        return { error: 'accountSize_required' }
      }

      const from   = req.query.from ? new Date(req.query.from) : null
      const userId = req.user.id

      const cacheKey = `propfirm:compliance:${userId}:${from?.toISOString().slice(0, 10) ?? 'all'}:${accountSize}`
      const cached = await cache.get<object>(cacheKey)
      if (cached) return cached

      // ── Récupérer les trades depuis la date de début ─────────────────────
      const trades = await prisma.trade.findMany({
        where: {
          userId,
          status: 'CLOSED',
          ...(from ? { closeTime: { gte: from } } : {}),
        },
        select: { pnl: true, openTime: true, closeTime: true },
        orderBy: { closeTime: 'asc' },
      })

      // ── PnL par jour ─────────────────────────────────────────────────────
      const byDay = new Map<string, number>()
      for (const t of trades) {
        if (!t.closeTime) continue
        const day = t.closeTime.toISOString().slice(0, 10)
        byDay.set(day, (byDay.get(day) ?? 0) + Number(t.pnl ?? 0))
      }
      const dailyPnls = Array.from(byDay.values())

      // ── Profit total ─────────────────────────────────────────────────────
      const profitAmount = dailyPnls.reduce((s, p) => s + p, 0)
      const profitPct    = (profitAmount / accountSize) * 100

      // ── Drawdown journalier max (pire journée / accountSize) ──────────────
      const worstDayLoss   = Math.min(0, ...dailyPnls)
      const dailyDdPct     = (Math.abs(worstDayLoss) / accountSize) * 100

      // ── Drawdown maximal (peak-to-trough sur equity cumulée) ──────────────
      let peak = 0, cumul = 0, maxDdAmount = 0
      for (const daily of dailyPnls) {
        cumul += daily
        if (cumul > peak) peak = cumul
        const dd = peak - cumul
        if (dd > maxDdAmount) maxDdAmount = dd
      }
      const maxDdPct = (maxDdAmount / accountSize) * 100

      // ── Jours de trading ─────────────────────────────────────────────────
      const tradingDays = byDay.size

      // ── Trades aujourd'hui ───────────────────────────────────────────────
      const today = new Date().toISOString().slice(0, 10)
      const todayTrades = await prisma.trade.count({
        where: {
          userId,
          status: 'CLOSED',
          closeTime: {
            gte: new Date(`${today}T00:00:00.000Z`),
            lt:  new Date(`${today}T23:59:59.999Z`),
          },
        },
      })

      // ── Règle de constance (meilleur jour / profit total) ─────────────────
      const bestDayProfit  = Math.max(0, ...dailyPnls)
      const consistencyPct = profitAmount > 0
        ? (bestDayProfit / profitAmount) * 100
        : 0

      const result = {
        profitAmount:  Math.round(profitAmount * 100) / 100,
        profitPct:     Math.round(profitPct * 100) / 100,
        dailyDdPct:    Math.round(dailyDdPct * 100) / 100,
        maxDdPct:      Math.round(maxDdPct * 100) / 100,
        tradingDays,
        tradesToday:   todayTrades,
        nbTrades:      trades.length,
        consistencyPct: Math.round(consistencyPct * 100) / 100,
        bestDayProfit:  Math.round(bestDayProfit * 100) / 100,
      }

      await cache.set(cacheKey, result, CACHE_TTL)
      return result
    },
  )
}
