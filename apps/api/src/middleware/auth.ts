import type { FastifyRequest, FastifyReply } from 'fastify'
import { verifyToken } from '@clerk/backend'
import { env } from '../config/env.js'
import { getDemoUser } from '../modules/auth/demo-user.js'

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
    const demo = getDemoUser()
    request.user = { id: demo.id, email: demo.email, plan: demo.plan }
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
    request.user = {
      id: payload.sub,
      email: typeof payload['email'] === 'string' ? payload['email'] : null,
      plan: 'FREE',
    }
  } catch {
    return reply.code(401).send({ error: 'invalid_token' })
  }
}
