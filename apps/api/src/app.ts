import Fastify from 'fastify'
import fastifyCookie from '@fastify/cookie'
import fastifyCors from '@fastify/cors'
import fastifyHelmet from '@fastify/helmet'
import fastifyJwt from '@fastify/jwt'
import fastifyRateLimit from '@fastify/rate-limit'
import fastifyWebsocket from '@fastify/websocket'
import { verifyToken } from '@clerk/backend'
import type { FastifyInstance, FastifyRequest } from 'fastify'

import { env } from './config/env.js'
import { getDemoUser } from './modules/auth/demo-user.js'
import { accountsRoutes } from './modules/accounts/accounts.routes.js'
import { tradesRoutes } from './modules/trades/trades.routes.js'
import { registerWsHandler } from './websocket/ws.handler.js'

function getBearerToken(request: FastifyRequest): string | null {
  const auth = request.headers.authorization
  if (!auth?.startsWith('Bearer ')) return null
  return auth.slice(7)
}

function buildLoggerConfig() {
  if (env.NODE_ENV === 'test') return false
  return { level: env.NODE_ENV === 'production' ? 'warn' : 'info' }
}

export function buildApp(): FastifyInstance {
  const app = Fastify({ logger: buildLoggerConfig() })

  // ─── Security & transport plugins ────────────────────────────────────────────
  void app.register(fastifyHelmet, { contentSecurityPolicy: false })
  void app.register(fastifyCors, { origin: env.FRONTEND_URL, credentials: true })
  void app.register(fastifyCookie)
  void app.register(fastifyJwt, {
    secret: env.JWT_SECRET,
    cookie: { cookieName: 'access_token', signed: false },
  })
  void app.register(fastifyRateLimit, {
    max: 100,
    timeWindow: '1 minute',
    // Auth endpoints get a tighter limit (applied at route level below)
  })
  void app.register(fastifyWebsocket)

  // ─── Health check ─────────────────────────────────────────────────────────────
  const healthHandler = async () => ({
    status: 'ok',
    service: 'merkure-api',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
  })
  app.get('/health', healthHandler)
  app.get('/api/health', healthHandler)

  // ─── Current user (no preHandler — used by Clerk middleware on the frontend) ──
  app.get('/api/v1/me', async (request, reply) => {
    if (env.AUTH_MODE === 'demo') return getDemoUser()
    if (!env.CLERK_SECRET_KEY) return reply.code(500).send({ error: 'clerk_not_configured' })

    const token = getBearerToken(request)
    if (!token) return reply.code(401).send({ error: 'missing_token' })

    try {
      const payload = await verifyToken(token, { secretKey: env.CLERK_SECRET_KEY })
      return {
        id: payload.sub,
        email: typeof payload['email'] === 'string' ? payload['email'] : null,
        firstName: null,
        lastName: null,
        plan: 'FREE',
        authMode: 'clerk',
      }
    } catch {
      return reply.code(401).send({ error: 'invalid_token' })
    }
  })

  // ─── API modules ──────────────────────────────────────────────────────────────
  void app.register(accountsRoutes, { prefix: '/api/v1/accounts' })
  void app.register(tradesRoutes, { prefix: '/api/v1/trades' })

  // ─── WebSocket ────────────────────────────────────────────────────────────────
  void app.register(registerWsHandler)

  return app
}
