import type { Plan } from '@prisma/client'
import { env } from '../../config/env.js'

export interface PlanConfig {
  id: Plan
  name: string
  priceMonthly: number
  currency: string
  stripePriceId: string | undefined
  features: string[]
}

export const PLANS: Record<Exclude<Plan, 'INSTITUTIONAL'>, PlanConfig> = {
  FREE: {
    id: 'FREE',
    name: 'Free',
    priceMonthly: 0,
    currency: 'EUR',
    stripePriceId: undefined,
    features: ['10 trades/mois', 'KPIs de base', 'Journal manuel'],
  },
  STARTER: {
    id: 'STARTER',
    name: 'Starter',
    priceMonthly: 900,
    currency: 'EUR',
    stripePriceId: env.STRIPE_PRICE_STARTER,
    features: ['Trades illimités', 'Sync broker (1)', 'KPIs avancés', 'Journal IA'],
  },
  PRO: {
    id: 'PRO',
    name: 'Pro',
    priceMonthly: 1900,
    currency: 'EUR',
    stripePriceId: env.STRIPE_PRICE_PRO,
    features: ['Sync broker (3)', 'Analytics avancés', 'Alertes', 'Coach IA illimité'],
  },
  ELITE: {
    id: 'ELITE',
    name: 'Elite',
    priceMonthly: 4900,
    currency: 'EUR',
    stripePriceId: env.STRIPE_PRICE_ELITE,
    features: ['Sync broker illimité', 'Rapports PDF', 'API access', 'Support prioritaire'],
  },
}

export function priceIdToPlan(priceId: string): Plan | null {
  for (const plan of Object.values(PLANS)) {
    if (plan.stripePriceId === priceId) return plan.id
  }
  return null
}
