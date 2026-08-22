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
    // En mode demo, on accepte un JWT valide s'il est fourni, sinon on injecte le demo user
    // Le plan est toujours ELITE en mode demo pour permettre de tester tous les flows
    const auth = request.headers.authorization
    if (auth?.startsWith('Bearer ')) {
      try {
        await request.jwtVerify()
        request.user = { ...request.user, plan: 'ELITE' }
        return
      } catch {
        // Une session expirée ne doit PAS basculer silencieusement sur le compte
        // de démonstration : l'utilisateur verrait les données d'un autre compte
        // en croyant voir les siennes. On renvoie 401, le front redirige vers
        // la connexion.
        return reply.code(401).send({ error: 'session_expired' })
      }
    }
    // Aucun jeton : navigation de démonstration, on injecte le compte démo.
    request.user = { id: 'demo_user_merkure', email: 'demo@merkure.app', plan: 'ELITE' }
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
