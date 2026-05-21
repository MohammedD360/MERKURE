import type { FastifyRequest, FastifyReply } from 'fastify'
import { verifyToken } from '@clerk/backend'
import { env } from '../config/env.js'
import { prisma } from '../infrastructure/database/client.js'

export type AuthUser = {
  id: string
  email: string | null
  plan: string
}

// @fastify/jwt already augments FastifyRequest.user — we override its payload type here
declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: AuthUser
  }
}

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  if (env.AUTH_MODE === 'demo') {
    const auth = request.headers.authorization
    if (!auth?.startsWith('Bearer ')) {
      return reply.code(401).send({ error: 'not_authenticated' })
    }
    try {
      await request.jwtVerify()
    } catch {
      return reply.code(401).send({ error: 'invalid_token' })
    }
    return
  }

  if (!env.CLERK_SECRET_KEY) {
    return reply.code(500).send({ error: 'auth_not_configured' })
  }

  const auth = request.headers.authorization
  if (!auth?.startsWith('Bearer ')) {
    return reply.code(401).send({ error: 'missing_token' })
  }

  const token = auth.slice(7)
  try {
    const payload = await verifyToken(token, { secretKey: env.CLERK_SECRET_KEY })

    const user = await prisma.user.findUnique({
      where: { clerkId: payload.sub },
      select: { id: true, email: true },
    })

    if (!user) {
      return reply.code(401).send({ error: 'user_not_found' })
    }

    const sub = await prisma.subscription.findUnique({
      where: { userId: user.id },
      select: { plan: true },
    })

    request.user = { id: user.id, email: user.email, plan: sub?.plan ?? 'FREE' }
  } catch {
    return reply.code(401).send({ error: 'invalid_token' })
  }
}
