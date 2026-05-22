import type { FastifyInstance } from 'fastify'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '../../infrastructure/database/client.js'
import { authenticate } from '../../middleware/auth.js'

const UpdateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName:  z.string().min(1).max(50).optional(),
  timezone:  z.string().optional(),
  currency:  z.string().length(3).optional(),
})

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword:     z.string().min(8),
})

export async function usersRoutes(app: FastifyInstance) {
  /**
   * GET /api/v1/users/me — profil complet
   */
  app.get('/me', { preHandler: [authenticate] }, async (req) => {
    const user = await prisma.user.findUnique({
      where:  { id: req.user.id },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        timezone: true, currency: true, createdAt: true,
        subscription: { select: { plan: true, status: true } },
      },
    })
    return user
  })

  /**
   * PATCH /api/v1/users/me — mise à jour du profil
   */
  app.patch('/me', { preHandler: [authenticate] }, async (req, reply) => {
    const parsed = UpdateProfileSchema.safeParse(req.body)
    if (!parsed.success) return reply.code(400).send({ error: 'invalid_body' })

    const { firstName, lastName, timezone, currency } = parsed.data
    const updateData = {
      ...(firstName !== undefined ? { firstName } : {}),
      ...(lastName  !== undefined ? { lastName  } : {}),
      ...(timezone  !== undefined ? { timezone  } : {}),
      ...(currency  !== undefined ? { currency  } : {}),
    }
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data:  updateData,
      select: {
        id: true, email: true, firstName: true, lastName: true,
        timezone: true, currency: true,
      },
    })
    return updated
  })

  /**
   * POST /api/v1/users/me/change-password
   */
  app.post('/me/change-password', { preHandler: [authenticate] }, async (req, reply) => {
    const parsed = ChangePasswordSchema.safeParse(req.body)
    if (!parsed.success) return reply.code(400).send({ error: 'invalid_body' })

    const { currentPassword, newPassword } = parsed.data

    const user = await prisma.user.findUnique({
      where:  { id: req.user.id },
      select: { passwordHash: true },
    })

    if (!user?.passwordHash) {
      return reply.code(400).send({ error: 'no_password_set' })
    }

    const valid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!valid) {
      return reply.code(401).send({ error: 'wrong_password' })
    }

    const newHash = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({
      where: { id: req.user.id },
      data:  { passwordHash: newHash },
    })

    return { ok: true }
  })
}
