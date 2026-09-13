// @prisma/client est un module CommonJS : sous Node en ESM strict (node dist/index.js
// en prod, contrairement à tsx en dev qui est plus permissif), un import nommé direct
// ne résout pas toujours l'export — passer par l'export par défaut est la solution
// documentée par Node lui-même.
import pkg from '@prisma/client'
import type { PrismaClient } from '@prisma/client'
const { PrismaClient: PrismaClientImpl } = pkg
import { env } from '../../config/env.js'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

// N'ajoute connection_limit que si l'URL ne le précise pas déjà — une valeur
// explicite dans DATABASE_URL (ex. via PgBouncer) reste prioritaire sur le
// défaut de ce process.
function withConnectionLimit(url: string): string {
  if (/[?&]connection_limit=/.test(url)) return url
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}connection_limit=${env.DATABASE_CONNECTION_LIMIT}`
}

function createClient(): PrismaClient {
  const client = new PrismaClientImpl({
    datasources: { db: { url: withConnectionLimit(env.DATABASE_URL) } },
    log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

  // Filtre automatique sur les trades soft-deleted — toute requête de lecture
  // reçoit automatiquement deletedAt: null sans que les appelants aient à le spécifier.
  client.$use(async (params, next) => {
    if (params.model === 'Trade') {
      const readOps = ['findMany', 'findFirst', 'findUnique', 'count', 'aggregate', 'groupBy']
      if (readOps.includes(params.action)) {
        params.args ??= {}
        params.args.where = { ...params.args.where, deletedAt: null }
      }
    }
    return next(params)
  })

  return client
}

export const prisma = globalForPrisma.prisma ?? createClient()

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
