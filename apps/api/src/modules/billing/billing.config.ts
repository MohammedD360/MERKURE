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
    name: 'Gratuit',
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
    features: ['Journal de trading', 'Statistiques de base', 'Import manuel & CSV', '1 compte broker'],
  },
  PRO: {
    id: 'PRO',
    name: 'Trader',
    priceMonthly: 1900,
    currency: 'EUR',
    stripePriceId: env.STRIPE_PRICE_PRO,
    features: [
      'Toutes les fonctionnalités Starter',
      'Analyses avancées',
      'Suivi du risque',
      'Rapports personnalisés',
      'Jusqu’à 3 comptes brokers',
    ],
  },
  ELITE: {
    id: 'ELITE',
    name: 'Pro',
    priceMonthly: 4900,
    currency: 'EUR',
    stripePriceId: env.STRIPE_PRICE_ELITE,
    features: [
      'Toutes les fonctionnalités Trader',
      'Analyse comportementale IA',
      'Objectifs & plans de trading',
      'Exports avancés',
      'Connexions brokers illimitées',
      'Support prioritaire',
    ],
  },
}

export function priceIdToPlan(priceId: string): Plan | null {
  for (const plan of Object.values(PLANS)) {
    if (plan.stripePriceId === priceId) return plan.id
  }
  return null
}
