export interface CircuitBreakerInput {
  sessionStartEquity: number
  currentEquity:      number
  maxSessionLossPct:  number // pourcentage positif, ex. 5 pour -5%
}

export interface CircuitBreakerResult {
  tripped: boolean
  pnlPct:  number // signé — ex. -5.2
}

/**
 * Fonction pure : décide si un bot doit être arrêté automatiquement.
 * Aucun accès DB ici — la persistance (statut PAUSED, BotEvent) est gérée
 * par bots.service.ts pour garder cette logique de risque testable isolément.
 */
export function evaluateCircuitBreaker(input: CircuitBreakerInput): CircuitBreakerResult {
  const { sessionStartEquity, currentEquity, maxSessionLossPct } = input

  if (sessionStartEquity <= 0) {
    return { tripped: false, pnlPct: 0 }
  }

  const pnlPct = ((currentEquity - sessionStartEquity) / sessionStartEquity) * 100
  const tripped = pnlPct <= -Math.abs(maxSessionLossPct)

  return { tripped, pnlPct: Number(pnlPct.toFixed(4)) }
}
