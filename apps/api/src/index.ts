import Fastify from 'fastify'
import fastifyCors from '@fastify/cors'
import fastifyHelmet from '@fastify/helmet'
import fastifyJwt from '@fastify/jwt'
import fastifyCookie from '@fastify/cookie'
import fastifyRateLimit from '@fastify/rate-limit'
import fastifyWebsocket from '@fastify/websocket'

import { env } from './config/env.js'
import { prisma } from './infrastructure/database/client.js'
import { redis } from './infrastructure/cache/redis.js'

const app = Fastify({
  logger: {
    level: env.NODE_ENV === 'production' ? 'warn' : 'info',
    transport:
      env.NODE_ENV === 'development'
        ? { target: 'pino-pretty', options: { colorize: true } }
        : undefined,
  },
})

// Plugins
await app.register(fastifyHelmet, {
  contentSecurityPolicy: false, // Gere par Cloudflare en prod
})

await app.register(fastifyCors, {
  origin: env.FRONTEND_URL,
  credentials: true,
})

await app.register(fastifyCookie)

await app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
  cookie: { cookieName: 'access_token', signed: false },
})

await app.register(fastifyRateLimit, {
  max: 100,
  timeWindow: '1 minute',
})

await app.register(fastifyWebsocket)

// Health check
app.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})

// Routes — seront ajoutees module par module
// await app.register(authRoutes, { prefix: '/api/v1/auth' })
// await app.register(tradesRoutes, { prefix: '/api/v1/trades' })
// await app.register(kpisRoutes, { prefix: '/api/v1/kpis' })
// await app.register(riskRoutes, { prefix: '/api/v1/risk' })

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  app.log.info(`[${signal}] Shutting down...`)
  await app.close()
  await prisma.$disconnect()
  await redis.quit()
  process.exit(0)
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

// Start
try {
  await redis.connect()
  await prisma.$connect()
  await app.listen({ port: env.PORT, host: '0.0.0.0' })
  app.log.info(`TradeEdge API running on port ${env.PORT}`)
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
