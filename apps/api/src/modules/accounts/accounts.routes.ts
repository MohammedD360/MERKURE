import type { FastifyInstance } from 'fastify'
import { ZodError } from 'zod'
import { authenticate } from '../../middleware/auth.js'
import { accountsService } from './accounts.service.js'
import { CreateAccountSchema } from './accounts.types.js'
import { brokerSyncQueue } from '../../infrastructure/queue/queues.js'
import type { BrokerSyncJob } from '../../infrastructure/queue/queues.js'
import { ACCOUNT_LIMIT, upgradeRequired } from '../../middleware/plan-limits.js'

export async function accountsRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: [authenticate] }, async (req) => {
    return accountsService.list(req.user.id)
  })

  app.get<{ Params: { id: string } }>('/:id', { preHandler: [authenticate] }, async (req, reply) => {
    const account = await accountsService.findById(req.params.id, req.user.id)
    if (!account) return reply.code(404).send({ error: 'account_not_found' })
    return account
  })

  app.post<{ Body: unknown }>('/', { preHandler: [authenticate] }, async (req, reply) => {
    try {
      const body  = CreateAccountSchema.parse(req.body)
      const plan  = req.user.plan ?? 'FREE'
      const limit = ACCOUNT_LIMIT[plan] ?? 1
      const count = await accountsService.count(req.user.id)

      if (count >= limit) {
        return reply.code(403).send({
          error:        'account_limit_reached',
          limit,
          plan,
          requiredPlan: upgradeRequired(plan),
        })
      }

      const account = await accountsService.create(req.user.id, body)

      // Déclenche une sync complète immédiatement après la création
      await brokerSyncQueue.add(
        `initial-${account.id}`,
        {
          accountId: account.id,
          userId: req.user.id,
          brokerType: body.brokerType.toLowerCase() as BrokerSyncJob['brokerType'],
          fullSync: true,
        },
        { priority: 1, jobId: `initial-${account.id}` },
      )

      return reply.code(201).send(account)
    } catch (err) {
      if (err instanceof ZodError) {
        return reply.code(400).send({ error: 'validation_error', details: err.errors })
      }
      if (err instanceof Error && 'code' in err && (err as { code: string }).code === 'P2002') {
        return reply.code(409).send({ error: 'account_already_exists' })
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
      `manual-${account.id}-${Date.now()}`,
      {
        accountId: account.id,
        userId: req.user.id,
        brokerType: account.brokerType.toLowerCase() as BrokerSyncJob['brokerType'],
        fullSync: false,
      },
      { priority: 1 },
    )

    return { queued: true, accountId: account.id }
  })
}
