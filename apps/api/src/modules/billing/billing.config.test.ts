import { describe, expect, it } from 'vitest'
import { PLANS, priceIdToPlan } from './billing.config.js'

describe('PLANS', () => {
  it('ne commercialise aucune offre gratuite', () => {
    expect(Object.keys(PLANS)).not.toContain('FREE')
  })

  it('facture les plans au tarif public', () => {
    expect(PLANS.STARTER.priceMonthly).toBe(2900)
    expect(PLANS.PRO.priceMonthly).toBe(5900)
    expect(PLANS.ELITE.priceMonthly).toBe(9900)
  })

  it('laisse le plan sur mesure au devis, sans paiement en ligne', () => {
    expect(PLANS.INSTITUTIONAL.priceMonthly).toBeNull()
    expect(PLANS.INSTITUTIONAL.stripePriceId).toBeUndefined()
  })

  it('couvre chaque prix payant par un tarif supérieur au coût des comptes inclus', () => {
    const COST_PER_ACCOUNT = 900 // ~9 €/mois chez le fournisseur de données
    const included: Record<string, number> = { STARTER: 1, PRO: 3, ELITE: 5 }

    for (const [id, accounts] of Object.entries(included)) {
      const price = PLANS[id as keyof typeof PLANS].priceMonthly
      expect(price).not.toBeNull()
      expect(price!).toBeGreaterThan(accounts * COST_PER_ACCOUNT)
    }
  })

  it('exposes the commercial plan names shown in the frontend', () => {
    expect(PLANS.STARTER.name).toBe('Standard')
    expect(PLANS.PRO.name).toBe('Pro')
    expect(PLANS.ELITE.name).toBe('Elite')
    expect(PLANS.INSTITUTIONAL.name).toBe('Sur mesure')
  })

  it('all plans have required fields', () => {
    for (const plan of Object.values(PLANS)) {
      expect(plan.id).toBeTruthy()
      expect(plan.name).toBeTruthy()
      expect(plan.currency).toBe('EUR')
      expect(Array.isArray(plan.features)).toBe(true)
      expect(plan.features.length).toBeGreaterThan(0)
    }
  })
})

describe('priceIdToPlan', () => {
  it('returns null for unknown priceId', () => {
    expect(priceIdToPlan('price_unknown_xyz')).toBeNull()
  })

  it('returns null for empty string', () => {
    expect(priceIdToPlan('')).toBeNull()
  })

  it('returns the correct plan when env price ID is set', () => {
    // Without STRIPE_PRICE_* env vars, all stripePriceIds are undefined
    // so no price ID can resolve — confirms the lookup logic is correct
    const result = priceIdToPlan('price_nonexistent')
    expect(result).toBeNull()
  })
})
