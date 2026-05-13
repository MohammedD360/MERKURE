import type { FastifyInstance } from 'fastify'
import { ZodError } from 'zod'
import { authenticate } from '../../middleware/auth.js'
import { tradesRepository } from './trades.repository.js'
import { TradesQuerySchema, AnnotateTradeSchema } from './trades.types.js'

export async function tradesRoutes(app: FastifyInstance) {
  app.get<{ Querystring: unknown }>('/', { preHandler: [authenticate] }, async (req, reply) => {
    try {
      const query = TradesQuerySchema.parse(req.query)
      return tradesRepository.findMany(req.user.id, query)
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
      return tradesRepository.annotate(req.params.id, req.user.id, input)
    } catch (err) {
      if (err instanceof ZodError) {
        return reply.code(400).send({ error: 'validation_error', details: err.errors })
      }
      throw err
    }
  })
}
