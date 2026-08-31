export type AuthMode = 'demo' | 'clerk'

// NEXT_PUBLIC_* est obligatoire ici : ce module est importé par des composants
// 'use client' (Header, sign-in, use-current-user...). Une variable sans ce
// préfixe (l'ancien AUTH_MODE) n'est jamais inlinée dans le bundle navigateur —
// isClerkEnabled y valait donc toujours false en prod, quel que soit le AUTH_MODE
// réel côté serveur, faisant retomber la connexion sur le flux démo désactivé.
export const authMode: AuthMode = process.env.NEXT_PUBLIC_AUTH_MODE === 'clerk' ? 'clerk' : 'demo'

export const isClerkEnabled =
  authMode === 'clerk' && Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)

export const demoUser = {
  id: 'demo_user_merkure',
  email: 'demo@merkure.app',
  firstName: null,
  lastName: null,
  plan: 'FREE',
} as const
