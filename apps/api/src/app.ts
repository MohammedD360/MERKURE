import Fastify from 'fastify'
import fastifyCookie from '@fastify/cookie'
import fastifyCors from '@fastify/cors'
import fastifyHelmet from '@fastify/helmet'
import fastifyJwt from '@fastify/jwt'
import fastifyRateLimit from '@fastify/rate-limit'
import fastifyWebsocket from '@fastify/websocket'
import fastifyMultipart from '@fastify/multipart'
import fastifyRawBody from 'fastify-raw-body'
import { verifyToken } from '@clerk/backend'
import type { FastifyInstance, FastifyRequest } from 'fastify'

import { env } from './config/env.js'
import { prisma } from './infrastructure/database/client.js'
import { getDemoUser } from './modules/auth/demo-user.js'

import { accountsRoutes } from './modules/accounts/accounts.routes.js'
import { tradesRoutes } from './modules/trades/trades.routes.js'
import { registerWsHandler } from './websocket/ws.handler.js'
import { clerkWebhookRoutes } from './modules/webhooks/clerk-webhook.routes.js'
import { stripeWebhookRoutes } from './modules/webhooks/stripe-webhook.routes.js'
import { billingRoutes } from './modules/billing/billing.routes.js'
import { onboardingRoutes } from './modules/onboarding/onboarding.routes.js'
import { csvImportRoutes } from './modules/trades/csv-import/csv-import.routes.js'
import { kpisRoutes } from './modules/kpis/kpis.routes.js'
import { alertsRoutes } from './modules/alerts/alerts.routes.js'
import { aiRoutes } from './modules/ai/ai.routes.js'
import { performanceRoutes } from './modules/performance/performance.routes.js'
import { reportsRoutes } from './modules/reports/reports.routes.js'
import { authRoutes } from './modules/auth/auth.routes.js'
import { googleOAuthRoutes } from './modules/auth/google-oauth.routes.js'
import { riskRoutes } from './modules/risk/risk.routes.js'
import { usersRoutes } from './modules/users/users.routes.js'
import { portfolioRoutes } from './modules/portfolio/portfolio.routes.js'
import { statsRoutes } from './modules/stats/stats.routes.js'
import { journalRoutes } from './modules/journal/journal.routes.js'

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

  // ─── Raw body (required for webhook signature verification) ─────────────────
  void app.register(fastifyRawBody, { global: false, encoding: 'utf8', runFirst: true })

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
  void app.register(fastifyMultipart)

  // ─── Health check ─────────────────────────────────────────────────────────────
  const healthHandler = async () => ({
    status: 'ok',
    service: 'merkure-api',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
  })
  app.get('/health', healthHandler)
  app.get('/api/health', healthHandler)

  void app.register(authRoutes,       { prefix: '/api/v1/auth' })
  void app.register(googleOAuthRoutes, { prefix: '/api/v1/auth' })

  // ─── Current user ─────────────────────────────────────────────────────────────
  app.get('/api/v1/me', async (request, reply) => {
    if (env.AUTH_MODE === 'demo') {
      return getDemoUser()
    }
    if (!env.CLERK_SECRET_KEY) return reply.code(500).send({ error: 'clerk_not_configured' })

    const token = getBearerToken(request)
    if (!token) return reply.code(401).send({ error: 'missing_token' })

    try {
      const payload = await verifyToken(token, { secretKey: env.CLERK_SECRET_KEY })
      const dbUser = await prisma.user.findUnique({
        where:  { clerkId: payload.sub },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          subscription: { select: { plan: true } },
        },
      })

      if (dbUser) {
        return {
          id: dbUser.id,
          email: dbUser.email,
          firstName: dbUser.firstName,
          lastName: dbUser.lastName,
          avatarUrl: dbUser.avatarUrl,
          plan: dbUser.subscription?.plan ?? 'FREE',
          authMode: 'clerk',
        }
      }

      return {
        id: payload.sub,
        email: typeof payload['email'] === 'string' ? payload['email'] : null,
        firstName: null,
        lastName: null,
        avatarUrl: null,
        plan: 'FREE',
        authMode: 'clerk',
      }
    } catch {
      return reply.code(401).send({ error: 'invalid_token' })
    }
  })

  // ─── Webhooks (public — no auth) ─────────────────────────────────────────────
  void app.register(clerkWebhookRoutes)
  void app.register(stripeWebhookRoutes)

  // ─── API modules ──────────────────────────────────────────────────────────────
  void app.register(accountsRoutes, { prefix: '/api/v1/accounts' })
  void app.register(tradesRoutes, { prefix: '/api/v1/trades' })
  void app.register(csvImportRoutes, { prefix: '/api/v1/trades' })
  void app.register(kpisRoutes,     { prefix: '/api/v1/kpis' })
  void app.register(alertsRoutes,   { prefix: '/api/v1/alerts' })
  void app.register(aiRoutes,       { prefix: '/api/v1/ai' })
  void app.register(billingRoutes,      { prefix: '/api/v1/billing' })
  void app.register(onboardingRoutes,   { prefix: '/api/v1/onboarding' })
  void app.register(performanceRoutes,  { prefix: '/api/v1/performance' })
  void app.register(reportsRoutes,      { prefix: '/api/v1/reports' })
  void app.register(riskRoutes,         { prefix: '/api/v1/risk' })
  void app.register(usersRoutes,        { prefix: '/api/v1/users' })
  void app.register(portfolioRoutes,    { prefix: '/api/v1/portfolio' })
  void app.register(statsRoutes,        { prefix: '/api/v1/stats' })
  void app.register(journalRoutes,      { prefix: '/api/v1/journal' })

  // ─── WebSocket ────────────────────────────────────────────────────────────────
  void app.register(registerWsHandler)

  return app
}
