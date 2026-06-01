export const PLAN_DISPLAY_NAMES: Record<string, string> = {
  FREE:          'Gratuit',
  STARTER:       'Starter',
  PRO:           'Trader',
  ELITE:         'Pro',
  INSTITUTIONAL: 'Institutionnel',
}

export function getPlanDisplayName(plan?: string | null): string {
  if (!plan) return 'Gratuit'
  return PLAN_DISPLAY_NAMES[plan] ?? plan
}

export function getPlanDisplayLabel(plan?: string | null): string {
  return `Plan ${getPlanDisplayName(plan)}`
}
