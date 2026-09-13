import { env } from './env.js'

export const allowedOrigins = [
  env.FRONTEND_URL,
  ...(env.CORS_EXTRA_ORIGINS?.split(',').map(o => o.trim()).filter(Boolean) ?? []),
]

// Utilisé par les routes qui court-circuitent le plugin @fastify/cors (ex. streaming
// via reply.hijack()) et doivent donc rejouer manuellement la même politique de
// liste blanche, plutôt que de réfléchir n'importe quelle origine reçue.
export function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return false
  if (env.NODE_ENV !== 'production') return true
  return allowedOrigins.includes(origin)
}
