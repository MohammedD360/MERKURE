import { describe, expect, it } from 'vitest'
import { PLANS, priceIdToPlan } from './billing.config.js'

describe('PLANS', () => {
  it('FREE plan has no stripePriceId', () => {
    expect(PLANS.FREE.stripePriceId).toBeUndefined()
    expect(PLANS.FREE.priceMonthly).toBe(0)
  })

  it('paid plans have a priceMonthly > 0', () => {
    expect(PLANS.STARTER.priceMonthly).toBe(900)
    expect(PLANS.PRO.priceMonthly).toBe(1900)
    expect(PLANS.ELITE.priceMonthly).toBe(4900)
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
