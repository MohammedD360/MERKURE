import { prisma } from '../../infrastructure/database/client.js'

/**
 * Le plan est stocké dans une colonne JSON (`trading_plans.data`) : sa forme
 * évolue avec le produit sans migration. Le serveur ne valide que l'enveloppe,
 * le front est propriétaire du schéma métier.
 */
export interface TradingPlanPayload {
  [section: string]: unknown
}

export interface TradingPlanRecord {
  data:      TradingPlanPayload
  version:   number
  createdAt: string | null
  updatedAt: string | null
}

const EMPTY: TradingPlanRecord = { data: {}, version: 0, createdAt: null, updatedAt: null }

export const tradingPlanRepository = {

  async get(userId: string): Promise<TradingPlanRecord> {
    const plan = await prisma.tradingPlan.findUnique({ where: { userId } })
    if (!plan) return EMPTY
    return {
      data:      (plan.data ?? {}) as TradingPlanPayload,
      version:   plan.version,
      createdAt: plan.createdAt.toISOString(),
      updatedAt: plan.updatedAt.toISOString(),
    }
  },

  /** Chaque enregistrement incrémente la version — c'est le compteur de révisions du plan. */
  async save(userId: string, data: TradingPlanPayload): Promise<TradingPlanRecord> {
    const plan = await prisma.tradingPlan.upsert({
      where:  { userId },
      create: { userId, data: data as object, version: 1 },
      update: { data: data as object, version: { increment: 1 } },
    })
    return {
      data:      (plan.data ?? {}) as TradingPlanPayload,
      version:   plan.version,
      createdAt: plan.createdAt.toISOString(),
      updatedAt: plan.updatedAt.toISOString(),
    }
  },

  async remove(userId: string): Promise<void> {
    await prisma.tradingPlan.deleteMany({ where: { userId } })
  },
}
