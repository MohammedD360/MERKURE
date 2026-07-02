import { PrismaClient } from '@prisma/client'
import { env } from '../../config/env.js'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function createClient(): PrismaClient {
  const client = new PrismaClient({
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
