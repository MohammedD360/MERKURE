/**
 * Limites par plan — source de vérité unique.
 * Toute route qui restreint l'accès selon le plan doit référencer ces constantes.
 */

export const ACCOUNT_LIMIT: Record<string, number> = {
  FREE:          1,
  STARTER:       1,
  PRO:           3,
  ELITE:         99,
  INSTITUTIONAL: 99,
}

/** Nombre de jours d'historique de trades accessibles */
export const TRADE_HISTORY_DAYS: Record<string, number> = {
  FREE:          30,
  STARTER:       365,
  PRO:           730,
  ELITE:         9999,
  INSTITUTIONAL: 9999,
}

/** Plans autorisés à exporter les trades en CSV */
export const CAN_EXPORT_TRADES = new Set(['PRO', 'ELITE', 'INSTITUTIONAL'])

/** Plans autorisés à accéder aux KPIs avancés (breakdown, stats détaillées) */
export const CAN_ACCESS_ADVANCED_KPIS = new Set(['PRO', 'ELITE', 'INSTITUTIONAL'])

/** Période max autorisée pour les KPI snapshots */
export const KPI_MAX_PERIOD_DAYS: Record<string, number> = {
  FREE:          30,
  STARTER:       90,
  PRO:           9999,
  ELITE:         9999,
  INSTITUTIONAL: 9999,
}

export function upgradeRequired(current: string): 'STARTER' | 'PRO' | 'ELITE' {
  if (current === 'FREE') return 'STARTER'
  if (current === 'STARTER') return 'PRO'
  return 'ELITE'
}
