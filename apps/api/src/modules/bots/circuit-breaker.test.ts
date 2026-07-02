import { describe, expect, it } from 'vitest'
import { evaluateCircuitBreaker } from './circuit-breaker.js'

describe('evaluateCircuitBreaker', () => {
  it('ne déclenche pas à -4.9% pour une limite de 5%', () => {
    const result = evaluateCircuitBreaker({
      sessionStartEquity: 1000,
      currentEquity: 951, // -4.9%
      maxSessionLossPct: 5,
    })
    expect(result.tripped).toBe(false)
    expect(result.pnlPct).toBeCloseTo(-4.9, 1)
  })

  it('déclenche pile à -5% pour une limite de 5%', () => {
    const result = evaluateCircuitBreaker({
      sessionStartEquity: 1000,
      currentEquity: 950, // -5%
      maxSessionLossPct: 5,
    })
    expect(result.tripped).toBe(true)
    expect(result.pnlPct).toBeCloseTo(-5, 1)
  })

  it('déclenche au-delà de -5%', () => {
    const result = evaluateCircuitBreaker({
      sessionStartEquity: 1000,
      currentEquity: 949, // -5.1%
      maxSessionLossPct: 5,
    })
    expect(result.tripped).toBe(true)
    expect(result.pnlPct).toBeCloseTo(-5.1, 1)
  })

  it('ne déclenche jamais en cas de gain', () => {
    const result = evaluateCircuitBreaker({
      sessionStartEquity: 1000,
      currentEquity: 1200,
      maxSessionLossPct: 5,
    })
    expect(result.tripped).toBe(false)
    expect(result.pnlPct).toBeCloseTo(20, 1)
  })

  it("ne plante pas si l'équity de départ est nulle", () => {
    const result = evaluateCircuitBreaker({
      sessionStartEquity: 0,
      currentEquity: 0,
      maxSessionLossPct: 5,
    })
    expect(result.tripped).toBe(false)
    expect(result.pnlPct).toBe(0)
  })

  it('respecte un seuil de risque personnalisé', () => {
    const result = evaluateCircuitBreaker({
      sessionStartEquity: 1000,
      currentEquity: 980, // -2%
      maxSessionLossPct: 2,
    })
    expect(result.tripped).toBe(true)
  })
})
