import type { FastifyRequest, FastifyReply } from 'fastify'
import { verifyToken } from '@clerk/backend'
import { env } from '../config/env.js'
import { prisma } from '../infrastructure/database/client.js'
import { cache } from '../infrastructure/cache/redis.js'

export type AuthUser = {
  id: string
  email: string | null
  plan: string
  // Claim standard JWT ajouté automatiquement à la signature — utilisé pour la
  // révocation de session (voir isSessionRevoked ci-dessous).
  iat?: number
}

// @fastify/jwt already augments FastifyRequest.user — we override its payload type here
declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: AuthUser
  }
}

const SESSION_CHECK_CACHE_TTL = 30 // secondes — évite une requête DB à chaque appel authentifié
function sessionCheckKey(userId: string): string {
  return `auth:session-check:${userId}`
}

/**
 * Un JWT local est à plat et sans état : impossible de le révoquer avant son
 * expiration (7j) autrement qu'en comparant sa date d'émission (`iat`) à la
 * dernière révocation connue en base. Sert aussi de garde-fou : un compte
 * supprimé (DELETE /me) n'a plus de ligne à trouver → session invalidée
 * immédiatement au lieu de rester "authentifiée" jusqu'à l'expiration du JWT.
 */
async function isSessionRevoked(userId: string, iat: number | undefined): Promise<'ok' | 'user_not_found' | 'revoked'> {
  const cached = await cache.get<{ exists: boolean; revokedAtMs: number | null }>(sessionCheckKey(userId))
  const check = cached ?? await (async () => {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { sessionsRevokedAt: true } })
    const result = { exists: user !== null, revokedAtMs: user?.sessionsRevokedAt?.getTime() ?? null }
    await cache.set(sessionCheckKey(userId), result, SESSION_CHECK_CACHE_TTL)
    return result
  })()

  if (!check.exists) return 'user_not_found'
  if (check.revokedAtMs != null && iat != null && iat * 1000 < check.revokedAtMs) return 'revoked'
  return 'ok'
}

/**
 * À appeler après une suppression de compte (DELETE /me) : sans ça, un
 * résultat "exists: true" mis en cache par un appel juste avant la suppression
 * resterait valable jusqu'à SESSION_CHECK_CACHE_TTL, laissant le JWT du compte
 * supprimé "authentifié" pendant cette fenêtre.
 */
export async function invalidateSessionCache(userId: string): Promise<void> {
  await cache.del(sessionCheckKey(userId))
}

/** Invalide tous les JWT locaux émis avant maintenant pour cet utilisateur. */
export async function revokeAllSessions(userId: string): Promise<void> {
  await prisma.user.update({ where: { id: userId }, data: { sessionsRevokedAt: new Date() } })
  await cache.del(sessionCheckKey(userId))
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
      } catch {
        // Une session expirée ne doit PAS basculer silencieusement sur le compte
        // de démonstration : l'utilisateur verrait les données d'un autre compte
        // en croyant voir les siennes. On renvoie 401, le front redirige vers
        // la connexion.
        return reply.code(401).send({ error: 'session_expired' })
      }

      const status = await isSessionRevoked(request.user.id, request.user.iat)
      if (status === 'user_not_found') return reply.code(401).send({ error: 'user_not_found' })
      if (status === 'revoked') return reply.code(401).send({ error: 'session_revoked' })

      request.user = { ...request.user, plan: 'ELITE' }
      return
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
