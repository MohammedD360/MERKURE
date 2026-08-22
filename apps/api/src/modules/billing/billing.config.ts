import type { Plan } from '@prisma/client'
import { env } from '../../config/env.js'

export interface PlanConfig {
  id: Plan
  name: string
  /** En centimes. `null` = tarif négocié, pas de paiement en ligne. */
  priceMonthly: number | null
  currency: string
  stripePriceId: string | undefined
  features: string[]
}

/**
 * Grille commerciale — source de vérité, exposée par GET /billing/plans.
 *
 * Chaque compte broker connecté coûte ~9 €/mois chez le fournisseur de données.
 * Les prix intègrent ce coût variable : Standard 29 € (1 compte, marge 20 €),
 * Pro 59 € (3 comptes, marge 32 €), Elite 99 € (5 comptes, marge 54 €).
 * Le nombre de comptes inclus est appliqué par ACCOUNT_LIMIT (plan-limits.ts) —
 * les deux doivent rester cohérents.
 *
 * FREE n'apparaît pas : aucune offre gratuite n'est commercialisée. C'est l'état
 * d'un compte sans abonnement actif, sans connexion broker possible.
 */
export const PLANS: Record<Exclude<Plan, 'FREE'>, PlanConfig> = {
  STARTER: {
    id: 'STARTER',
    name: 'Standard',
    priceMonthly: 2900,
    currency: 'EUR',
    stripePriceId: env.STRIPE_PRICE_STARTER,
    features: [
      '1 compte broker synchronisé',
      'Journal de trading',
      'Statistiques de base',
      'Import manuel & CSV',
      '1 an d’historique',
    ],
  },
  PRO: {
    id: 'PRO',
    name: 'Pro',
    priceMonthly: 5900,
    currency: 'EUR',
    stripePriceId: env.STRIPE_PRICE_PRO,
    features: [
      '3 comptes brokers synchronisés',
      'Toutes les fonctionnalités Standard',
      'Analyses avancées',
      'Suivi du risque',
      'Rapports personnalisés',
      'Export CSV',
    ],
  },
  ELITE: {
    id: 'ELITE',
    name: 'Elite',
    priceMonthly: 9900,
    currency: 'EUR',
    stripePriceId: env.STRIPE_PRICE_ELITE,
    features: [
      '5 comptes brokers synchronisés',
      'Toutes les fonctionnalités Pro',
      'Analyse comportementale IA',
      'Objectifs & plans de trading',
      'Historique illimité',
      'Support prioritaire',
    ],
  },
  INSTITUTIONAL: {
    id: 'INSTITUTIONAL',
    name: 'Sur mesure',
    priceMonthly: null,
    currency: 'EUR',
    stripePriceId: undefined, // pas de paiement en ligne : passage par le devis
    features: [
      'Plus de 5 comptes brokers',
      'Toutes les fonctionnalités Elite',
      'Multi-utilisateurs & organisation',
      'Accompagnement dédié',
    ],
  },
}

export function priceIdToPlan(priceId: string): Plan | null {
  for (const plan of Object.values(PLANS)) {
    if (plan.stripePriceId === priceId) return plan.id
  }
  return null
}
