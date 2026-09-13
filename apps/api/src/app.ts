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
import { allowedOrigins } from './config/cors.js'
import { prisma } from './infrastructure/database/client.js'
import { getDemoUser } from './modules/auth/demo-user.js'
import { redis } from './infrastructure/cache/redis.js'

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
import { tradingPlanRoutes } from './modules/trading-plan/trading-plan.routes.js'
import { propFirmRoutes } from './modules/prop-firm/prop-firm.routes.js'
import { botsRoutes } from './modules/bots/bots.routes.js'
import { marketDataRoutes } from './modules/market-data/market-data.routes.js'

function getBearerToken(request: FastifyRequest): string | null {
  const auth = request.headers.authorization
  if (!auth?.startsWith('Bearer ')) return null
  return auth.slice(7)
}

function buildLoggerConfig() {
  if (env.NODE_ENV === 'test') return false
  // 'warn' en prod ne laissait aucune trace des requêtes traitées normalement,
  // rendant un diagnostic post-incident impossible sans logs agrégés Railway.
  return { level: 'info' }
}

export function buildApp(): FastifyInstance {
  // trustProxy: true fait confiance à n'importe quel X-Forwarded-For — correct
  // tant que l'IP/CIDR du reverse-proxy réel n'est pas connue (Railway/Vercel),
  // mais à restreindre via TRUSTED_PROXY_CIDRS dès que le VPS et son Caddy sont
  // en place (sinon le rate-limiting par IP redevient contournable).
  const trustProxy = env.TRUSTED_PROXY_CIDRS
    ? env.TRUSTED_PROXY_CIDRS.split(',').map(s => s.trim())
    : true
  const app = Fastify({ logger: buildLoggerConfig(), trustProxy, bodyLimit: 1_048_576 /* 1 MiB — défaut Fastify rendu explicite */ })

  // ─── Raw body (required for webhook signature verification) ─────────────────
  void app.register(fastifyRawBody, { global: false, encoding: 'utf8', runFirst: true })

  // ─── Security & transport plugins ────────────────────────────────────────────
  void app.register(fastifyHelmet, {
    contentSecurityPolicy: false,
    // crossOriginResourcePolicy: cross-origin requis pour une API consommée par un SPA
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    hsts: env.NODE_ENV === 'production'
      ? { maxAge: 31_536_000, includeSubDomains: true, preload: true }
      : false,
  })
  void app.register(fastifyCors, {
    // En prod, seuls les frontends connus sont autorisés
    origin: env.NODE_ENV === 'production' ? allowedOrigins : true,
    credentials: true,
  })
  void app.register(fastifyCookie)
  // Le JWT ne voyage que dans l'en-tête Authorization : aucune route ne pose de
  // cookie 'access_token', donc l'option `cookie` d'@fastify/jwt ne servirait
  // jamais de source de repli — mieux vaut ne pas suggérer un mécanisme inexistant.
  void app.register(fastifyJwt, {
    secret: env.JWT_SECRET,
  })
  void app.register(fastifyRateLimit, {
    global: true,
    max: 100,
    timeWindow: '1 minute',
    // En prod : stockage Redis partagé entre instances (scale horizontal Railway)
    // En dev/test : mémoire locale
    ...(env.NODE_ENV === 'production' ? { redis } : {}),
    // allowList retourne true → la requête n'est pas comptabilisée. Les webhooks
    // Clerk/Stripe sont déjà protégés par vérification de signature : un 429 sur
    // une rafale légitime (replay après incident) serait interprété comme un échec
    // par ces fournisseurs et retenté selon leur propre backoff.
    allowList: (req) => env.NODE_ENV === 'test' || req.url.startsWith('/api/webhooks/'),
    // Retourner 429 explicite avec message francophone
    errorResponseBuilder: (_req, context) => ({
      statusCode: 429,
      error: 'Too Many Requests',
      message: `Limite atteinte : ${context.max} requêtes / ${context.after}. Réessayez dans ${context.after}.`,
    }),
  })
  void app.register(fastifyWebsocket)
  void app.register(fastifyMultipart)

  // ─── Global error handler ─────────────────────────────────────────────────────
  // Filet de sécurité pour tout ce qui échappe aux try/catch des routes (déjà
  // responsables de traduire Zod / erreurs métier `.status` en réponses propres) :
  // ne jamais renvoyer error.message au client pour une erreur non anticipée —
  // une panne Postgres révélerait sinon le nom d'hôte interne dans la réponse HTTP.
  app.setErrorHandler((error, request, reply) => {
    const err = error as Error & { statusCode?: number }
    if (err.statusCode && err.statusCode < 500) {
      return reply.code(err.statusCode).send({ error: err.message })
    }
    request.log.error({ err: error }, 'Unhandled error')
    return reply.code(500).send({ error: 'internal_server_error' })
  })

  // ─── Health check ─────────────────────────────────────────────────────────────
  function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
    ])
  }

  const healthHandler = async (request: FastifyRequest, reply: import('fastify').FastifyReply) => {
    const [dbOk, redisOk] = await Promise.all([
      withTimeout(prisma.$queryRaw`SELECT 1`, 2000).then(() => true).catch(() => false),
      withTimeout(redis.ping(), 2000).then(() => true).catch(() => false),
    ])
    const healthy = dbOk && redisOk
    // Le détail db/redis reste dans les logs serveur uniquement : un appelant non
    // authentifié ne doit pas pouvoir cartographier quelle dépendance interne est
    // en panne (reconnaissance / fenêtre d'attaque pendant un incident).
    if (!healthy) {
      request.log.warn({ db: dbOk, redis: redisOk }, 'Health check degraded')
    }
    const body = {
      status: healthy ? 'ok' : 'degraded',
      service: 'merkure-api',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
    }
    return reply.code(healthy ? 200 : 503).send(body)
  }
  app.get('/health', healthHandler)
  app.get('/api/health', healthHandler)

  void app.register(authRoutes,       { prefix: '/api/v1/auth' })
  void app.register(googleOAuthRoutes, { prefix: '/api/v1/auth' })

  // ─── Current user ─────────────────────────────────────────────────────────────
  app.get('/api/v1/me', async (request, reply) => {
    if (env.AUTH_MODE === 'demo') {
      // Si un JWT valide est présent, retourner le vrai profil DB
      const token = getBearerToken(request)
      if (token) {
        try {
          const payload = app.jwt.verify<{ id: string; email: string; plan?: string }>(token)
          const dbUser = await prisma.user.findUnique({
            where:  { id: payload.id },
            select: {
              id: true, email: true, firstName: true, lastName: true, avatarUrl: true,
              subscription: { select: { plan: true } },
            },
          })
          if (dbUser) {
            return {
              id:        dbUser.id,
              email:     dbUser.email,
              firstName: dbUser.firstName,
              lastName:  dbUser.lastName,
              avatarUrl: dbUser.avatarUrl,
              plan:      dbUser.subscription?.plan ?? payload.plan ?? 'FREE',
              authMode:  'jwt',
            }
          }
        } catch { /* token invalide ou expiré → fallback demo */ }
      }
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
  void app.register(tradingPlanRoutes,  { prefix: '/api/v1/trading-plan' })
  void app.register(propFirmRoutes,     { prefix: '/api/v1/prop-firm' })
  void app.register(botsRoutes,         { prefix: '/api/v1/bots' })
  void app.register(marketDataRoutes,   { prefix: '/api/v1/market-data' })

  // ─── WebSocket ────────────────────────────────────────────────────────────────
  void app.register(registerWsHandler)

  return app
}
