import { buildApp } from './app.js'
import { env } from './config/env.js'
import { prisma } from './infrastructure/database/client.js'
import { redis } from './infrastructure/cache/redis.js'
import { startBrokerSyncWorker, scheduleBrokerSyncCron } from './modules/sync/broker-sync.worker.js'

const app = buildApp()

// Start broker sync worker (processes all queue jobs in this process)
const syncWorker = startBrokerSyncWorker()

const gracefulShutdown = async (signal: string) => {
  app.log.info(`[${signal}] Shutting down...`)
  await syncWorker.close()
  await app.close()
  await prisma.$disconnect()
  await redis.quit()
  process.exit(0)
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

try {
  await redis.connect()
  await prisma.$connect()
  await app.listen({ port: env.PORT, host: '0.0.0.0' })
  app.log.info(`MERKURE API running on port ${env.PORT}`)

  // Register the hourly cron dispatch (idempotent — safe on restart)
  await scheduleBrokerSyncCron()
  app.log.info('Broker sync cron scheduled (every 1h)')
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
