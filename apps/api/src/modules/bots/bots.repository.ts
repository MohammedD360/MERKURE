import type { BotDecisionStatus, BotEventType, BotMode, BotStatus, Prisma } from '@prisma/client'
import { prisma } from '../../infrastructure/database/client.js'

export const botsRepository = {
  findAll(userId: string) {
    return prisma.tradingBot.findMany({
      where:   { userId },
      orderBy: { createdAt: 'desc' },
    })
  },

  findById(id: string, userId: string) {
    return prisma.tradingBot.findFirst({ where: { id, userId } })
  },

  findAllActive() {
    return prisma.tradingBot.findMany({
      where:  { status: 'ACTIVE' },
      select: { id: true, userId: true, brokerAccountId: true },
    })
  },

  create(userId: string, data: {
    brokerAccountId:    string
    name:               string
    mode:               BotMode
    marketFilters:      Prisma.InputJsonValue
    riskConfig:         Prisma.InputJsonValue
    sessionStartEquity: number
  }) {
    return prisma.tradingBot.create({
      data: {
        userId,
        brokerAccountId:    data.brokerAccountId,
        name:               data.name,
        mode:               data.mode,
        marketFilters:      data.marketFilters,
        riskConfig:         data.riskConfig,
        sessionStartEquity: data.sessionStartEquity,
        currentEquity:      data.sessionStartEquity,
      },
    })
  },

  update(id: string, userId: string, data: Prisma.TradingBotUpdateInput) {
    return prisma.tradingBot.update({ where: { id, userId }, data })
  },

  updateEquity(id: string, currentEquity: number) {
    return prisma.tradingBot.update({ where: { id }, data: { currentEquity } })
  },

  incrementEquity(id: string, amount: number) {
    return prisma.tradingBot.update({ where: { id }, data: { currentEquity: { increment: amount } } })
  },

  setStatus(id: string, status: BotStatus, extra: Prisma.TradingBotUpdateInput = {}) {
    return prisma.tradingBot.update({ where: { id }, data: { status, ...extra } })
  },

  tripCircuitBreaker(id: string) {
    return prisma.tradingBot.update({
      where: { id },
      data:  { status: 'PAUSED', circuitBreakerTrippedAt: new Date() },
    })
  },

  delete(id: string, userId: string) {
    return prisma.tradingBot.delete({ where: { id, userId } })
  },

  // ── Décisions de l'agent ──────────────────────────────────────────────────────

  createDecision(data: {
    botId:     string
    marketId:  string
    question:  string
    side:      string
    sizeUsd:   number
    price:     number
    reasoning: Prisma.InputJsonValue
    status:    BotDecisionStatus
    pnl?:      number | null
  }) {
    return prisma.botDecision.create({ data })
  },

  listDecisions(botId: string, limit = 50) {
    return prisma.botDecision.findMany({
      where:   { botId },
      orderBy: { createdAt: 'desc' },
      take:    limit,
    })
  },

  // Positions ouvertes non réglées : une décision avec une taille réelle (pas un
  // HOLD, identifiable par marketId vide) dont le PnL n'a pas encore été calculé.
  findUnsettledDecisions() {
    return prisma.botDecision.findMany({
      where: {
        pnl:      null,
        marketId: { not: '' },
        side:     { in: ['YES', 'NO'] },
        status:   { in: ['SIMULATED', 'SUBMITTED', 'FILLED'] },
      },
    })
  },

  // updateMany + condition pnl IS NULL plutôt que update() par id : si deux
  // exécutions du job de règlement se recoupent (ex. schedulers dupliqués après
  // un changement de config), seule la première "gagne" la ligne — la seconde
  // affecte 0 ligne et ne doit donc pas créditer l'équity une seconde fois.
  async settleDecision(id: string, pnl: number): Promise<boolean> {
    const result = await prisma.botDecision.updateMany({ where: { id, pnl: null }, data: { pnl } })
    return result.count > 0
  },

  // ── Événements (démarrage, pause, circuit breaker, erreurs) ───────────────────

  createEvent(botId: string, type: BotEventType, message: string, metadata?: Prisma.InputJsonValue) {
    return prisma.botEvent.create({
      data: { botId, type, message, ...(metadata !== undefined ? { metadata } : {}) },
    })
  },

  listEvents(botId: string, limit = 50) {
    return prisma.botEvent.findMany({
      where:   { botId },
      orderBy: { createdAt: 'desc' },
      take:    limit,
    })
  },
}
