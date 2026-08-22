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
import { polymarketClient } from '../../infrastructure/polymarket/clob-client.js'
import type { PolymarketAccountKind, MarketResolution } from '../../infrastructure/polymarket/clob-client.js'

async function loadWalletCredentials(brokerAccountId: string): Promise<{
  privateKey: string; walletAddress: string; funderAddress: string; accountKind: PolymarketAccountKind
}> {
  const account = await prisma.brokerAccount.findUnique({
    where: { id: brokerAccountId },
    select: { credentialsEnc: true, accountId: true },
  })
  if (!account?.credentialsEnc) {
    return { privateKey: '', walletAddress: account?.accountId ?? '', funderAddress: '', accountKind: 'FRESH_WALLET' }
  }
  const creds = decrypt(account.credentialsEnc)
  return {
    privateKey:    creds['privateKey'] ?? '',
    walletAddress: creds['walletAddress'] ?? account.accountId,
    funderAddress: creds['funderAddress'] ?? '',
    accountKind:   creds['accountKind'] === 'MAGIC_EMAIL' ? 'MAGIC_EMAIL' : 'FRESH_WALLET',
  }
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

      // ─── Règlement : pour chaque position ouverte, vérifie si le marché
      // Polymarket sous-jacent est résolu et calcule le PnL réel (gain si le
      // token détenu a gagné, perte sinon). Sans ça, currentEquity ne reflète
      // que le coût des positions prises, jamais leur issue.
      if (job.name === 'settle-positions') {
        const pending = await botsRepository.findUnsettledDecisions()
        const resolutionCache = new Map<string, MarketResolution>()
        const affectedBotIds = new Set<string>()

        for (const decision of pending) {
          let resolution = resolutionCache.get(decision.marketId)
          if (!resolution) {
            resolution = await polymarketClient.getMarketResolution(decision.marketId)
            resolutionCache.set(decision.marketId, resolution)
          }
          if (!resolution.closed || resolution.yesWon === null) continue

          const price = Number(decision.price)
          if (price <= 0) continue // donnée incohérente, on ne règle pas au hasard

          const sizeUsd = Number(decision.sizeUsd)
          const won     = decision.side === 'YES' ? resolution.yesWon : !resolution.yesWon
          const shares  = sizeUsd / price // le token gagnant rembourse 1$ par part
          const payout  = won ? shares : 0
          const pnl     = payout - sizeUsd

          const settled = await botsRepository.settleDecision(decision.id, pnl)
          if (!settled) continue // déjà réglée par une exécution concurrente — ne pas créditer deux fois
          await botsRepository.incrementEquity(decision.botId, payout)
          affectedBotIds.add(decision.botId)
        }

        for (const affectedBotId of affectedBotIds) {
          const bot = await prisma.tradingBot.findUnique({ where: { id: affectedBotId } })
          if (!bot) continue
          const justTripped = await botsService.checkCircuitBreaker(bot)
          if (justTripped) wsNotify(bot.userId, { type: 'bot:circuit_breaker', data: { botId: affectedBotId } })
          else wsNotify(bot.userId, { type: 'bot:decision', data: { botId: affectedBotId } })
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

        // Débite le coût de la position dès qu'une position réelle est prise
        // (DRY_RUN inclus — un trade "SIMULATED" avec un marketId non vide reste
        // une position papier, distincte d'un HOLD). Le gain/perte à la résolution
        // du marché est réglé séparément par le job 'settle-positions'.
        const tookPosition = result.marketId !== '' && (result.side === 'YES' || result.side === 'NO')
        if (tookPosition) {
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

  await botTradingQueue.add(
    'settle-positions',
    {} as BotTradingJob,
    {
      repeat: { every: env.BOT_SETTLEMENT_TICK_MS },
      jobId: 'settle-positions-cron',
    },
  )
}
