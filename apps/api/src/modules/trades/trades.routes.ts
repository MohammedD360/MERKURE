import type { FastifyInstance } from 'fastify'
import { ZodError } from 'zod'
import { authenticate } from '../../middleware/auth.js'
import { cache, CacheKeys } from '../../infrastructure/cache/redis.js'
import { tradesRepository } from './trades.repository.js'
import { TradesQuerySchema, AnnotateTradeSchema } from './trades.types.js'
import { prisma } from '../../infrastructure/database/client.js'
import type { Direction, TradeStatus } from '@prisma/client'
import { CAN_EXPORT_TRADES, TRADE_HISTORY_DAYS, upgradeRequired } from '../../middleware/plan-limits.js'

const CACHE_TTL = 60 * 2 // 2 minutes (trades changent plus souvent que les KPIs)

function escapeCsv(value: unknown): string {
  if (value == null) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export async function tradesRoutes(app: FastifyInstance) {
  /**
   * GET /api/v1/trades/export?symbol=...&direction=...&status=...&accountId=...&dateFrom=...&dateTo=...
   */
  app.get<{
    Querystring: {
      symbol?: string
      direction?: string
      status?: string
      accountId?: string
      dateFrom?: string
      dateTo?: string
    }
  }>('/export', { preHandler: [authenticate] }, async (req, reply) => {
    const plan = req.user.plan ?? 'FREE'
    if (!CAN_EXPORT_TRADES.has(plan)) {
      return reply.code(403).send({ error: 'plan_required', requiredPlan: upgradeRequired(plan) })
    }

    const { symbol, direction, status, accountId, dateFrom, dateTo } = req.query

    const where = {
      userId: req.user.id,
      ...(symbol    ? { symbol:          symbol.toUpperCase() }  : {}),
      ...(direction ? { direction:        direction as Direction } : {}),
      ...(status    ? { status:           status    as TradeStatus } : {}),
      ...(accountId ? { brokerAccountId: accountId }              : {}),
      ...((dateFrom ?? dateTo) ? {
        closeTime: {
          ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
          ...(dateTo   ? { lte: new Date(dateTo)   } : {}),
        },
      } : {}),
    }

    const trades = await prisma.trade.findMany({
      where,
      orderBy: { closeTime: 'desc' },
      select: {
        id: true, symbol: true, direction: true, status: true,
        openTime: true, closeTime: true, openPrice: true, closePrice: true,
        lotSize: true, pnl: true, swap: true, commission: true,
        strategyTag: true, note: true,
      },
    })

    const today    = new Date().toISOString().slice(0, 10)
    const header   = 'id,symbol,direction,status,openTime,closeTime,openPrice,closePrice,lotSize,pnl,swap,commission,strategyTag,note'
    const lines    = trades.map(t =>
      [
        t.id,
        t.symbol,
        t.direction,
        t.status,
        t.openTime.toISOString(),
        t.closeTime?.toISOString() ?? '',
        t.openPrice.toString(),
        t.closePrice?.toString() ?? '',
        t.lotSize.toString(),
        t.pnl?.toString()        ?? '',
        t.swap.toString(),
        t.commission.toString(),
        t.strategyTag,
        t.note,
      ].map(escapeCsv).join(','),
    )
    const csv = [header, ...lines].join('\n')

    void reply.header('Content-Type', 'text/csv')
    void reply.header('Content-Disposition', `attachment; filename="trades-${today}.csv"`)
    return reply.send(csv)
  })

  app.get<{ Querystring: unknown }>('/', { preHandler: [authenticate] }, async (req, reply) => {
    try {
      const plan      = req.user.plan ?? 'FREE'
      const maxDays   = TRADE_HISTORY_DAYS[plan] ?? 30
      const earliest  = new Date(Date.now() - maxDays * 86_400_000)

      const raw   = typeof req.query === 'object' && req.query !== null ? req.query : {}
      const query = TradesQuerySchema.parse({
        ...raw,
        // Empêche de remonter au-delà de la limite du plan
        dateFrom: 'dateFrom' in raw && typeof raw.dateFrom === 'string' && new Date(raw.dateFrom) >= earliest
          ? raw.dateFrom
          : earliest.toISOString(),
      })
      const queryHash = JSON.stringify(query)
      const cacheKey  = CacheKeys.trades(req.user.id, queryHash)

      const cached = await cache.get<object>(cacheKey)
      if (cached) return cached

      const data = await tradesRepository.findMany(req.user.id, query)
      await cache.set(cacheKey, data, CACHE_TTL)
      return data
    } catch (err) {
      if (err instanceof ZodError) {
        return reply.code(400).send({ error: 'validation_error', details: err.errors })
      }
      throw err
    }
  })

  app.get<{ Params: { id: string } }>('/:id', { preHandler: [authenticate] }, async (req, reply) => {
    const trade = await tradesRepository.findById(req.params.id, req.user.id)
    if (!trade) return reply.code(404).send({ error: 'trade_not_found' })
    return trade
  })

  app.patch<{ Params: { id: string }; Body: unknown }>('/:id', { preHandler: [authenticate] }, async (req, reply) => {
    try {
      const input = AnnotateTradeSchema.parse(req.body)
      const trade = await tradesRepository.findById(req.params.id, req.user.id)
      if (!trade) return reply.code(404).send({ error: 'trade_not_found' })

      const updated = await tradesRepository.annotate(req.params.id, req.user.id, input)
      // Invalide le cache trades pour que la liste reflète l'annotation
      await cache.delPattern(`trades:${req.user.id}:*`)
      return updated
    } catch (err) {
      if (err instanceof ZodError) {
        return reply.code(400).send({ error: 'validation_error', details: err.errors })
      }
      throw err
    }
  })
}
