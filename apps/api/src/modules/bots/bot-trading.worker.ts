import { createWorker, botTradingQueue } from '../../infrastructure/queue/queues.js'
import type { BotTradingJob } from '../../infrastructure/queue/queues.js'
import { prisma } from '../../infrastructure/database/client.js'
import { cache, CacheKeys } from '../../infrastructure/cache/redis.js'
import { decrypt } from '../../infrastructure/crypto/encryption.js'
import { env } from '../../config/env.js'
import { botsRepository } from './bots.repository.js'
import { botsService } from './bots.service.js'
import { runTradingCycle } from './trading-agent.js'
import { wsNotify } from '../../websocket/ws.handler.js'

async function loadWalletCredentials(brokerAccountId: string): Promise<{ privateKey: string; walletAddress: string }> {
  const account = await prisma.brokerAccount.findUnique({
    where: { id: brokerAccountId },
    select: { credentialsEnc: true, accountId: true },
  })
  if (!account?.credentialsEnc) return { privateKey: '', walletAddress: account?.accountId ?? '' }
  const creds = decrypt(account.credentialsEnc)
  return { privateKey: creds['privateKey'] ?? '', walletAddress: creds['walletAddress'] ?? account.accountId }
}

export function startBotTradingWorker() {
  return createWorker<BotTradingJob>(
    'bot-trading-cycle',
    async (job) => {
      // ─── Dispatch : enqueue un tick par bot actif (dédup via jobId) ────────────
      if (job.name === 'dispatch-active-bots') {
        const bots = await botsRepository.findAllActive()
        for (const bot of bots) {
          await botTradingQueue.add(
            `tick-${bot.id}`,
            { botId: bot.id },
            { jobId: `tick-${bot.id}-${Date.now()}`, removeOnComplete: true, removeOnFail: true },
          )
        }
        return
      }

      const { botId } = job.data
      const lockKey = CacheKeys.botTradingLock(botId)
      const alreadyRunning = await cache.get<boolean>(lockKey)
      if (alreadyRunning) {
        await job.log('Cycle déjà en cours pour ce bot — ignoré')
        return
      }
      await cache.set(lockKey, true, 90)

      try {
        const bot = await prisma.tradingBot.findUnique({ where: { id: botId } })
        if (!bot || bot.status !== 'ACTIVE') return

        // Circuit breaker vérifié AVANT le cycle : un bot déjà en perte ne doit
        // jamais relancer l'agent.
        const alreadyTripped = await botsService.checkCircuitBreaker(bot)
        if (alreadyTripped) {
          wsNotify(bot.userId, { type: 'bot:circuit_breaker', data: { botId } })
          return
        }

        const wallet = await loadWalletCredentials(bot.brokerAccountId)
        const result = await runTradingCycle(bot, wallet)

        const decision = await botsRepository.createDecision({
          botId,
          marketId:  result.marketId,
          question:  result.question,
          side:      result.side,
          sizeUsd:   result.sizeUsd,
          price:     result.price,
          reasoning: result.reasoning as never,
          status:    result.status,
          pnl:       result.pnl,
        })

        // Recalcule l'équity courante (mode simulé : le PnL est approximé côté
        // agent ; en LIVE, un futur module de réconciliation lira l'état on-chain).
        if (result.status === 'FILLED' || result.status === 'SUBMITTED') {
          const newEquity = Number(bot.currentEquity) - result.sizeUsd
          await botsRepository.updateEquity(botId, newEquity)
        }

        wsNotify(bot.userId, { type: 'bot:decision', data: { botId, decision } })

        // Re-vérifie après le cycle, au cas où celui-ci aurait fait basculer l'équity.
        const refreshed = await prisma.tradingBot.findUnique({ where: { id: botId } })
        if (refreshed) {
          const justTripped = await botsService.checkCircuitBreaker(refreshed)
          if (justTripped) wsNotify(refreshed.userId, { type: 'bot:circuit_breaker', data: { botId } })
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'unknown_error'
        await botsRepository.createEvent(botId, 'ERROR', `Erreur pendant le cycle de trading : ${message}`)
      } finally {
        await cache.del(lockKey)
      }
    },
    3,
  )
}

// Dispatcher répétable — idempotent, sûr à rappeler à chaque redémarrage.
export async function scheduleBotTradingCron(): Promise<void> {
  await botTradingQueue.add(
    'dispatch-active-bots',
    {} as BotTradingJob,
    {
      repeat: { every: env.BOT_TRADING_TICK_MS },
      jobId: 'dispatch-active-bots-cron',
    },
  )
}
