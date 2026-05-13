export const demoUser = {
  id: 'demo_user_merkure',
  email: 'demo@merkure.app',
  firstName: 'Alexandre',
  lastName: 'L.',
  timezone: 'Europe/Paris',
  currency: 'EUR',
  riskPerTrade: 1,
  plan: 'FREE',
  authMode: 'demo',
} as const

export function getDemoUser() {
  return demoUser
}
