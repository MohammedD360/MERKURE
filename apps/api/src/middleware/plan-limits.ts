/**
 * Limites par plan — source de vérité unique.
 * Toute route qui restreint l'accès selon le plan doit référencer ces constantes.
 */

/**
 * Comptes brokers connectables par plan.
 *
 * Chaque compte connecté coûte ~9 €/mois chez le fournisseur de données : ces
 * plafonds sont ce qui garantit qu'un client rapporte plus qu'il ne coûte.
 * Toute modification doit être répercutée sur `features` dans billing.config.ts.
 *
 * FREE n'est pas commercialisé : c'est l'état d'un compte sans abonnement actif,
 * qui ne peut donc connecter aucun broker.
 */
export const ACCOUNT_LIMIT: Record<string, number> = {
  FREE:          0,
  STARTER:       1,  // Standard — 29 €
  PRO:           3,  // Pro      — 59 €
  ELITE:         5,  // Elite    — 99 €
  INSTITUTIONAL: 99, // Sur mesure — négocié au devis
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

export function upgradeRequired(current: string): 'STARTER' | 'PRO' | 'ELITE' | 'INSTITUTIONAL' {
  if (current === 'FREE')    return 'STARTER'
  if (current === 'STARTER') return 'PRO'
  if (current === 'PRO')     return 'ELITE'
  return 'INSTITUTIONAL' // au-delà d'Elite, c'est du sur-mesure au devis
}
