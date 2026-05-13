import type { FastifyInstance } from 'fastify'
import { ZodError } from 'zod'
import { authenticate } from '../../middleware/auth.js'
import { accountsService } from './accounts.service.js'
import { CreateAccountSchema } from './accounts.types.js'
import { brokerSyncQueue } from '../../infrastructure/queue/queues.js'
import type { BrokerSyncJob } from '../../infrastructure/queue/queues.js'

export async function accountsRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: [authenticate] }, async (req) => {
    return accountsService.list(req.user.id)
  })

  app.post<{ Body: unknown }>('/', { preHandler: [authenticate] }, async (req, reply) => {
    try {
      const body = CreateAccountSchema.parse(req.body)
      const account = await accountsService.create(req.user.id, body)
      return reply.code(201).send(account)
    } catch (err) {
      if (err instanceof ZodError) {
        return reply.code(400).send({ error: 'validation_error', details: err.errors })
      }
      throw err
    }
  })

  app.delete<{ Params: { id: string } }>('/:id', { preHandler: [authenticate] }, async (req, reply) => {
    try {
      await accountsService.delete(req.params.id, req.user.id)
      return reply.code(204).send()
    } catch (err: unknown) {
      if (err instanceof Error && (err as Error & { status?: number }).status === 404) {
        return reply.code(404).send({ error: 'account_not_found' })
      }
      throw err
    }
  })

  // Manual sync — queued with high priority
  app.post<{ Params: { id: string } }>('/:id/sync', { preHandler: [authenticate] }, async (req, reply) => {
    const account = await accountsService.findById(req.params.id, req.user.id)
    if (!account) return reply.code(404).send({ error: 'account_not_found' })

    await brokerSyncQueue.add(
      `manual-${account.id}`,
      {
        accountId: account.id,
        userId: req.user.id,
        brokerType: account.brokerType.toLowerCase() as BrokerSyncJob['brokerType'],
        fullSync: false,
      },
      { priority: 1, jobId: `manual-${account.id}` },
    )

    return { queued: true, accountId: account.id }
  })
}
