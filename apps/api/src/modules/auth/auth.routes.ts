import type { FastifyInstance } from 'fastify'
import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '../../infrastructure/database/client.js'
import { env } from '../../config/env.js'
import { emailService } from '../../infrastructure/email/email.service.js'

const LoginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
})

const RegisterSchema = z.object({
  email:     z.string().email(),
  password:  z.string().min(8),
  firstName: z.string().min(1).max(50).optional(),
  lastName:  z.string().min(1).max(50).optional(),
})

export async function authRoutes(app: FastifyInstance) {
  app.post('/register', async (req, reply) => {
    const parsed = RegisterSchema.safeParse(req.body)
    if (!parsed.success) return reply.code(400).send({ error: 'invalid_body' })

    const { email, password, firstName, lastName } = parsed.data

    const existing = await prisma.user.findFirst({ where: { email } })
    if (existing) return reply.code(409).send({ error: 'email_already_exists' })

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          email,
          passwordHash,
          firstName: firstName ?? null,
          lastName:  lastName ?? null,
          clerkId:   `local_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        },
      })
      await tx.subscription.create({
        data: { userId: created.id, plan: 'FREE', status: 'ACTIVE' },
      })
      return created
    })

    const token = app.jwt.sign(
      { id: user.id, email: user.email ?? '', plan: 'FREE' },
      { expiresIn: '7d' },
    )

    // Email de bienvenue (fire & forget)
    emailService.sendWelcome(user.email!, user.firstName).catch(() => {})

    return reply.code(201).send({ token, user: { id: user.id, email: user.email, plan: 'FREE' } })
  })

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

      const subscription = await prisma.subscription.findUnique({
        where: { userId: user.id },
        select: { plan: true },
      })
      const plan = subscription?.plan ?? 'FREE'

      const token = app.jwt.sign(
        { id: user.id, email: user.email ?? '', plan },
        { expiresIn: '7d' },
      )

      return { token, user: { id: user.id, email: user.email, plan } }
    },
  )

  app.post('/logout', async () => ({ ok: true }))

  // POST /api/v1/auth/forgot-password
  app.post<{ Body: { email: string } }>('/forgot-password', async (req, reply) => {
    const { email } = req.body ?? {}
    if (!email || typeof email !== 'string') {
      return reply.code(400).send({ error: 'invalid_body' })
    }

    // Toujours répondre 200 même si l'email n'existe pas (sécurité anti-enumération)
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { id: true, email: true, firstName: true },
    })

    if (user) {
      const rawToken = crypto.randomBytes(32).toString('hex')
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1h

      // Invalider les anciens tokens
      await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } })

      await prisma.passwordResetToken.create({
        data: { userId: user.id, tokenHash, expiresAt },
      })

      const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${rawToken}`
      await emailService.sendResetPassword(user.email!, resetUrl)
    }

    return reply.code(200).send({ ok: true })
  })

  // POST /api/v1/auth/reset-password
  app.post<{ Body: { token: string; password: string } }>('/reset-password', async (req, reply) => {
    const { token, password } = req.body ?? {}
    if (!token || !password || password.length < 8) {
      return reply.code(400).send({ error: 'invalid_body' })
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: { select: { id: true } } },
    })

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
      return reply.code(400).send({ error: 'token_invalid_or_expired' })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
    ])

    return { ok: true }
  })

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
