import type { FastifyInstance } from 'fastify'
import { authenticate } from '../../middleware/auth.js'
import { tradingPlanRepository, type TradingPlanPayload } from './trading-plan.repository.js'

export async function tradingPlanRoutes(app: FastifyInstance) {

  app.get('/', { preHandler: [authenticate] }, async (req) => {
    return tradingPlanRepository.get(req.user.id)
  })

  app.put<{ Body: { data?: TradingPlanPayload } }>(
    '/',
    { preHandler: [authenticate] },
    async (req, reply) => {
      const data = req.body?.data
      if (data === null || typeof data !== 'object' || Array.isArray(data)) {
        return reply.code(400).send({ error: 'invalid_payload' })
      }
      return tradingPlanRepository.save(req.user.id, data)
    },
  )

  app.delete('/', { preHandler: [authenticate] }, async (req) => {
    await tradingPlanRepository.remove(req.user.id)
    return { ok: true }
  })
}
