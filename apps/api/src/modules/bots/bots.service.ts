import type { Prisma, TradingBot } from '@prisma/client'
import { botsRepository } from './bots.repository.js'
import { accountsService } from '../accounts/accounts.service.js'
import { evaluateCircuitBreaker } from './circuit-breaker.js'
import type { CreateBotInput, RiskConfig } from './bots.types.js'

export const botsService = {
  list(userId: string) {
    return botsRepository.findAll(userId)
  },

  findById(id: string, userId: string) {
    return botsRepository.findById(id, userId)
  },

  async create(userId: string, input: CreateBotInput) {
    // La wallet Polymarket devient un BrokerAccount classique — même pattern
    // (chiffrement AES-256-GCM) que les autres brokers. accountType reflète
    // le mode du bot : DRY_RUN → DEMO, LIVE → LIVE.
    const brokerAccount = await accountsService.create(userId, {
      brokerType:  'POLYMARKET',
      accountType: input.mode === 'LIVE' ? 'LIVE' : 'DEMO',
      accountId:   input.walletAddress,
      label:       `Polymarket — ${input.name}`,
      credentials: { privateKey: input.privateKey, walletAddress: input.walletAddress },
    })

    const bot = await botsRepository.create(userId, {
      brokerAccountId:    brokerAccount.id,
      name:               input.name,
      mode:               input.mode,
      marketFilters:      input.marketFilters,
      riskConfig:         input.riskConfig,
      sessionStartEquity: input.sessionStartEquity,
    })

    await botsRepository.createEvent(bot.id, 'STARTED', 'Bot créé', {
      mode: input.mode,
      riskConfig: input.riskConfig,
    })

    return bot
  },

  async start(id: string, userId: string) {
    const bot = await botsRepository.findById(id, userId)
    if (!bot) return null
    const wasPaused = bot.status === 'PAUSED'
    const updated = await botsRepository.setStatus(id, 'ACTIVE', { circuitBreakerTrippedAt: null })
    await botsRepository.createEvent(id, wasPaused ? 'RESUMED' : 'STARTED', wasPaused ? 'Bot relancé' : 'Bot démarré')
    return updated
  },

  async pause(id: string, userId: string) {
    const bot = await botsRepository.findById(id, userId)
    if (!bot) return null
    const updated = await botsRepository.setStatus(id, 'PAUSED')
    await botsRepository.createEvent(id, 'PAUSED', 'Bot mis en pause manuellement')
    return updated
  },

  async stop(id: string, userId: string) {
    const bot = await botsRepository.findById(id, userId)
    if (!bot) return null
    const updated = await botsRepository.setStatus(id, 'STOPPED')
    await botsRepository.createEvent(id, 'STOPPED', 'Bot arrêté')
    return updated
  },

  delete(id: string, userId: string) {
    return botsRepository.delete(id, userId)
  },

  async updateConfig(id: string, userId: string, patch: { name?: string; marketFilters?: Prisma.InputJsonValue; riskConfig?: Prisma.InputJsonValue }) {
    const bot = await botsRepository.findById(id, userId)
    if (!bot) return null
    return botsRepository.update(id, userId, {
      ...(patch.name          !== undefined ? { name: patch.name } : {}),
      ...(patch.marketFilters !== undefined ? { marketFilters: patch.marketFilters } : {}),
      ...(patch.riskConfig    !== undefined ? { riskConfig: patch.riskConfig } : {}),
    })
  },

  listDecisions(botId: string) {
    return botsRepository.listDecisions(botId)
  },

  listEvents(botId: string) {
    return botsRepository.listEvents(botId)
  },

  /**
   * Vérifie le circuit breaker après un tick et persiste l'arrêt si déclenché.
   * Retourne true si le bot vient d'être mis en pause.
   */
  async checkCircuitBreaker(bot: TradingBot): Promise<boolean> {
    const riskConfig = bot.riskConfig as unknown as RiskConfig
    const { tripped, pnlPct } = evaluateCircuitBreaker({
      sessionStartEquity: Number(bot.sessionStartEquity),
      currentEquity:      Number(bot.currentEquity),
      maxSessionLossPct:  riskConfig.maxSessionLossPct,
    })

    if (!tripped || bot.circuitBreakerTrippedAt) return false

    await botsRepository.tripCircuitBreaker(bot.id)
    await botsRepository.createEvent(
      bot.id,
      'CIRCUIT_BREAKER_TRIPPED',
      `Session en perte de ${pnlPct.toFixed(2)}% (limite : -${riskConfig.maxSessionLossPct}%) — bot arrêté automatiquement.`,
      { pnlPct, maxSessionLossPct: riskConfig.maxSessionLossPct },
    )
    return true
  },
}
