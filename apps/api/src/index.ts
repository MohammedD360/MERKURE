import { initSentry } from './infrastructure/monitoring/sentry.js'
initSentry() // Doit être le premier import exécuté

import { buildApp } from './app.js'
import { env } from './config/env.js'
import { prisma } from './infrastructure/database/client.js'
import { redis } from './infrastructure/cache/redis.js'
import { startBrokerSyncWorker, scheduleBrokerSyncCron } from './modules/sync/broker-sync.worker.js'
import { startAlertsWorker } from './modules/alerts/alerts.worker.js'

const app = buildApp()

// Start workers
const syncWorker    = startBrokerSyncWorker()
const alertsWorker  = startAlertsWorker()

const gracefulShutdown = async (signal: string) => {
  app.log.info(`[${signal}] Shutting down...`)
  await Promise.all([syncWorker.close(), alertsWorker.close()])
  await app.close()
  await prisma.$disconnect()
  await redis.quit()
  process.exit(0)
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

try {
  await prisma.$connect()
  await app.listen({ port: env.PORT, host: '0.0.0.0' })
  app.log.info(`MERKURE API running on port ${env.PORT}`)

  // Redis is optional — cache degraded gracefully if unavailable
  redis.connect().catch((err) => {
    app.log.warn(`[Redis] Could not connect, cache disabled: ${err instanceof Error ? err.message : String(err)}`)
  })

  await scheduleBrokerSyncCron()
  app.log.info('Broker sync cron scheduled (every 5 min)')
} catch (err) {
  const { Sentry } = await import('./infrastructure/monitoring/sentry.js')
  Sentry.captureException(err)
  app.log.error(err)
  process.exit(1)
}
