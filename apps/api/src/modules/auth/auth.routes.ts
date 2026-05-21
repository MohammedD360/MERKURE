import type { FastifyInstance } from 'fastify'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '../../infrastructure/database/client.js'
import { env } from '../../config/env.js'

const LoginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
})

export async function authRoutes(app: FastifyInstance) {
  app.post<{ Body: { email: string; password: string } }>(
    '/login',
    async (req, reply) => {
      const parsed = LoginSchema.safeParse(req.body)
      if (!parsed.success) return reply.code(400).send({ error: 'invalid_body' })

      const { email, password } = parsed.data

      const user = await prisma.user.findFirst({
        where: { email },
        select: { id: true, email: true, passwordHash: true },
      })

      if (!user?.passwordHash) {
        return reply.code(401).send({ error: 'invalid_credentials' })
      }

      const valid = await bcrypt.compare(password, user.passwordHash)
      if (!valid) {
        return reply.code(401).send({ error: 'invalid_credentials' })
      }

      const token = app.jwt.sign(
        { id: user.id, email: user.email ?? '', plan: 'FREE' },
        { expiresIn: '7d' },
      )

      return { token, user: { id: user.id, email: user.email, plan: 'FREE' } }
    },
  )

  app.post('/logout', async () => ({ ok: true }))

  // Accès démo instantané — signe un JWT démo sans passer par la DB
  app.post('/demo', async (req, reply) => {
    if (env.AUTH_MODE !== 'demo') {
      return reply.code(403).send({ error: 'demo_not_available' })
    }

    const token = app.jwt.sign(
      { id: 'demo_user_merkure', email: 'demo@merkure.app', plan: 'FREE' },
      { expiresIn: '7d' },
    )

    return {
      token,
      user: { id: 'demo_user_merkure', email: 'demo@merkure.app', plan: 'FREE' },
    }
  })
}
