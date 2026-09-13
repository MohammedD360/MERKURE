import { initSentry } from './infrastructure/monitoring/sentry.js'
initSentry() // Doit être le premier import exécuté

import { buildApp } from './app.js'
import { env } from './config/env.js'
import { prisma } from './infrastructure/database/client.js'
import { redis } from './infrastructure/cache/redis.js'
import { startBrokerSyncWorker, scheduleBrokerSyncCron } from './modules/sync/broker-sync.worker.js'
import { startAlertsWorker } from './modules/alerts/alerts.worker.js'
import { startBotTradingWorker, scheduleBotTradingCron } from './modules/bots/bot-trading.worker.js'

const app = buildApp()

// Start workers
const syncWorker      = startBrokerSyncWorker()
const alertsWorker    = startAlertsWorker()
const botTradingWorker = startBotTradingWorker()

const gracefulShutdown = async (signal: string) => {
  app.log.info(`[${signal}] Shutting down...`)
  // Filet de sécurité : sur un VPS, Docker envoie SIGKILL après stop_grace_period
  // (10s par défaut) — mieux vaut sortir proprement à 8s que subir un kill brutal
  // en pleine fermeture de connexions.
  const forceExit = setTimeout(() => process.exit(1), 8_000)
  forceExit.unref()
  try {
    await Promise.all([syncWorker.close(), alertsWorker.close(), botTradingWorker.close()])
    await app.close()
    await prisma.$disconnect()
    await redis.quit()
    process.exit(0)
  } catch (err) {
    app.log.error(err, 'Error during graceful shutdown')
    process.exit(1)
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

try {
  await app.listen({ port: env.PORT, host: '0.0.0.0' })
  app.log.info(`MERKURE API running on port ${env.PORT}`)

  // DB connection — non-bloquant en dev/demo
  prisma.$connect().catch((err: unknown) => {
    const msg = err instanceof Error ? err.message : String(err)
    if (env.NODE_ENV === 'production') {
      app.log.error(`[DB] Connection failed: ${msg}`)
      process.exit(1)
    } else {
      app.log.warn(`[DB] Could not connect (demo mode): ${msg}`)
    }
  })

  // Redis is optional — cache degraded gracefully if unavail         able
  redis.connect().catch((err: unknown) => {
    app.log.warn(`[Redis] Could not connect, cache disabled: ${err instanceof Error ? err.message : String(err)}`)
  })

  await scheduleBrokerSyncCron()
  app.log.info('Broker sync cron scheduled (every 5 min)')

  await scheduleBotTradingCron()
  app.log.info(`Bot trading cron scheduled (every ${env.BOT_TRADING_TICK_MS / 1000}s)`)
} catch (err) {
  const { Sentry } = await import('./infrastructure/monitoring/sentry.js')
  Sentry.captureException(err)
  app.log.error(err)
  process.exit(1)
}
