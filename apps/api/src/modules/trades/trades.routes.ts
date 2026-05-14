import type { FastifyInstance } from 'fastify'
import { ZodError } from 'zod'
import { authenticate } from '../../middleware/auth.js'
import { cache, CacheKeys } from '../../infrastructure/cache/redis.js'
import { tradesRepository } from './trades.repository.js'
import { TradesQuerySchema, AnnotateTradeSchema } from './trades.types.js'

const CACHE_TTL = 60 * 2 // 2 minutes (trades changent plus souvent que les KPIs)

export async function tradesRoutes(app: FastifyInstance) {
  app.get<{ Querystring: unknown }>('/', { preHandler: [authenticate] }, async (req, reply) => {
    try {
      const query    = TradesQuerySchema.parse(req.query)
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
