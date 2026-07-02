export function formatMoney(value: number, signed = false): string {
  const formatted = value.toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return signed && value > 0 ? `+${formatted}` : formatted
}

export function formatPct(value: number): string {
  return `${value.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`
}

export function pnlColor(value: number): string {
  if (value > 0) return '#22C55E'
  if (value < 0) return '#EF4444'
  return '#655F5B'
}