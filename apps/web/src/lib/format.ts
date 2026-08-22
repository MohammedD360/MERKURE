// Helpers de formatage partagés (monnaie, pourcentage) — source unique de vérité
// pour la locale fr-FR et la précision décimale sur tout le dashboard.

const LOCALE = 'fr-FR'

interface MoneyOptions {
  /** Code ISO de la devise (ex. 'EUR', 'USD'). Défaut : 'EUR'. */
  currency?: string
  /** Préfixe explicite '+' pour les valeurs positives. */
  signed?: boolean
  /** Nombre de décimales (min = max). Défaut : 2. */
  fractionDigits?: number
}

export function formatMoney(value: number, options: MoneyOptions = {}): string {
  const { currency = 'EUR', signed = false, fractionDigits = 2 } = options
  const formatted = value.toLocaleString(LOCALE, {
    style: 'currency',
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })
  return signed && value > 0 ? `+${formatted}` : formatted
}

export function formatPercent(value: number, fractionDigits = 1): string {
  return `${value.toLocaleString(LOCALE, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })}%`
}
