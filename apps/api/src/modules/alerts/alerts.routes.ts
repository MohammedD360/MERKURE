import type { FastifyInstance } from 'fastify'
import { authenticate } from '../../middleware/auth.js'
import { prisma } from '../../infrastructure/database/client.js'

export async function alertsRoutes(app: FastifyInstance) {
  /**
   * GET /api/v1/alerts?unreadOnly=true&limit=20&offset=0
   */
  app.get<{ Querystring: { unreadOnly?: string; limit?: string; offset?: string } }>(
    '/',
    { preHandler: [authenticate] },
    async (req) => {
      const unreadOnly = req.query.unreadOnly === 'true'
      const limit  = Math.min(parseInt(req.query.limit  ?? '20', 10), 100)
      const offset = parseInt(req.query.offset ?? '0', 10)

      const [alerts, total] = await Promise.all([
        prisma.alert.findMany({
          where:   { userId: req.user.id, ...(unreadOnly ? { isRead: false } : {}) },
          orderBy: { triggeredAt: 'desc' },
          take:    limit,
          skip:    offset,
        }),
        prisma.alert.count({
          where: { userId: req.user.id, ...(unreadOnly ? { isRead: false } : {}) },
        }),
      ])

      return { alerts, total, limit, offset }
    },
  )

  /**
   * PATCH /api/v1/alerts/:id/read — marque une alerte comme lue
   */
  app.patch<{ Params: { id: string } }>(
    '/:id/read',
    { preHandler: [authenticate] },
    async (req, reply) => {
      const alert = await prisma.alert.findFirst({
        where: { id: req.params.id, userId: req.user.id },
      })
      if (!alert) return reply.code(404).send({ error: 'alert_not_found' })

      return prisma.alert.update({
        where: { id: req.params.id },
        data:  { isRead: true },
      })
    },
  )

  /**
   * PATCH /api/v1/alerts/read-all — marque toutes les alertes comme lues
   */
  app.patch(
    '/read-all',
    { preHandler: [authenticate] },
    async (req) => {
      const { count } = await prisma.alert.updateMany({
        where: { userId: req.user.id, isRead: false },
        data:  { isRead: true },
      })
      return { updated: count }
    },
  )

  /**
   * DELETE /api/v1/alerts/:id
   */
  app.delete<{ Params: { id: string } }>(
    '/:id',
    { preHandler: [authenticate] },
    async (req, reply) => {
      const alert = await prisma.alert.findFirst({
        where: { id: req.params.id, userId: req.user.id },
      })
      if (!alert) return reply.code(404).send({ error: 'alert_not_found' })

      await prisma.alert.delete({ where: { id: req.params.id } })
      return reply.code(204).send()
    },
  )
}
