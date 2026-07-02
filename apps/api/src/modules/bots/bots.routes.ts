import type { FastifyInstance } from 'fastify'
import { ZodError } from 'zod'
import { authenticate } from '../../middleware/auth.js'
import { botsService } from './bots.service.js'
import { CreateBotSchema, UpdateBotSchema } from './bots.types.js'
import { polymarketClient } from '../../infrastructure/polymarket/clob-client.js'
import { duneClient } from '../../infrastructure/dune/dune-client.js'

export async function botsRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: [authenticate] }, async (req) => {
    return botsService.list(req.user.id)
  })

  // Données de marché — utilisées par le wizard de création et le dashboard live.
  // Exposées ici (plutôt que dans un module dédié) car uniquement consommées par
  // la section Bot Trading pour l'instant.
  app.get('/markets', { preHandler: [authenticate] }, async () => {
    const markets = await polymarketClient.getMarkets()
    return { markets, live: polymarketClient.isLiveConfigured() }
  })

  app.get('/whale-activity', { preHandler: [authenticate] }, async () => {
    const signals = await duneClient.getWhaleActivity()
    return { signals, live: duneClient.isLiveConfigured() }
  })

  app.get<{ Params: { id: string } }>('/:id', { preHandler: [authenticate] }, async (req, reply) => {
    const bot = await botsService.findById(req.params.id, req.user.id)
    if (!bot) return reply.code(404).send({ error: 'bot_not_found' })
    return bot
  })

  app.get<{ Params: { id: string } }>('/:id/decisions', { preHandler: [authenticate] }, async (req, reply) => {
    const bot = await botsService.findById(req.params.id, req.user.id)
    if (!bot) return reply.code(404).send({ error: 'bot_not_found' })
    return botsService.listDecisions(req.params.id)
  })

  app.get<{ Params: { id: string } }>('/:id/events', { preHandler: [authenticate] }, async (req, reply) => {
    const bot = await botsService.findById(req.params.id, req.user.id)
    if (!bot) return reply.code(404).send({ error: 'bot_not_found' })
    return botsService.listEvents(req.params.id)
  })

  app.post<{ Body: unknown }>('/', { preHandler: [authenticate] }, async (req, reply) => {
    try {
      const body = CreateBotSchema.parse(req.body)
      const bot = await botsService.create(req.user.id, body)
      return reply.code(201).send(bot)
    } catch (err) {
      if (err instanceof ZodError) {
        return reply.code(400).send({ error: 'validation_error', details: err.errors })
      }
      throw err
    }
  })

  app.patch<{ Params: { id: string }; Body: unknown }>('/:id', { preHandler: [authenticate] }, async (req, reply) => {
    try {
      const body = UpdateBotSchema.parse(req.body)

      if (body.status) {
        const updated =
          body.status === 'ACTIVE'  ? await botsService.start(req.params.id, req.user.id) :
          body.status === 'PAUSED'  ? await botsService.pause(req.params.id, req.user.id) :
          body.status === 'STOPPED' ? await botsService.stop(req.params.id, req.user.id) :
          null
        if (!updated) return reply.code(404).send({ error: 'bot_not_found' })
        return updated
      }

      const updated = await botsService.updateConfig(req.params.id, req.user.id, {
        ...(body.name          !== undefined ? { name: body.name } : {}),
        ...(body.marketFilters !== undefined ? { marketFilters: body.marketFilters } : {}),
        ...(body.riskConfig    !== undefined ? { riskConfig: body.riskConfig } : {}),
      })
      if (!updated) return reply.code(404).send({ error: 'bot_not_found' })
      return updated
    } catch (err) {
      if (err instanceof ZodError) {
        return reply.code(400).send({ error: 'validation_error', details: err.errors })
      }
      throw err
    }
  })

  app.delete<{ Params: { id: string } }>('/:id', { preHandler: [authenticate] }, async (req, reply) => {
    await botsService.delete(req.params.id, req.user.id)
    return reply.code(204).send()
  })
}
