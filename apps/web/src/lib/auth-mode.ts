export type AuthMode = 'demo' | 'clerk'

export const authMode: AuthMode = process.env.AUTH_MODE === 'clerk' ? 'clerk' : 'demo'

export const isClerkEnabled =
  authMode === 'clerk' && Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)

export const demoUser = {
  id: 'demo_user_merkure',
  email: 'demo@merkure.app',
  firstName: null,
  lastName: null,
  plan: 'FREE',
} as const
