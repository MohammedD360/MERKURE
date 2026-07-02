/**
 * Entrypoint dédié au worker de trading bot — pensé pour tourner isolément
 * (ex. sur un VPS OVH séparé de l'API HTTP), sans démarrer Fastify.
 * Se connecte à la même base Postgres / Redis que l'API principale.
 */
import { initSentry } from './infrastructure/monitoring/sentry.js'
initSentry()

import { env } from './config/env.js'
import { prisma } from './infrastructure/database/client.js'
import { redis } from './infrastructure/cache/redis.js'
import { startBotTradingWorker, scheduleBotTradingCron } from './modules/bots/bot-trading.worker.js'

console.log('[worker] Démarrage du worker Bot Trading (Polymarket)...')

const botTradingWorker = startBotTradingWorker()

const gracefulShutdown = async (signal: string) => {
  console.log(`[worker] [${signal}] Arrêt en cours...`)
  await botTradingWorker.close()
  await prisma.$disconnect()
  await redis.quit()
  process.exit(0)
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

try {
  await prisma.$connect()
  await redis.connect()
  await scheduleBotTradingCron()
  console.log(`[worker] Prêt — tick toutes les ${env.BOT_TRADING_TICK_MS / 1000}s.`)
} catch (err) {
  const { Sentry } = await import('./infrastructure/monitoring/sentry.js')
  Sentry.captureException(err)
  console.error('[worker] Échec du démarrage :', err)
  process.exit(1)
}
