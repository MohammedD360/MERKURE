import { Redis } from 'ioredis'
import { env } from '../../config/env.js'

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true,
})

redis.on('error', (err) => {
  console.error('[Redis] Connection error:', err.message)
})

redis.on('connect', () => {
  console.log('[Redis] Connected')
})

// Cache helpers
export const cache = {
  async get<T>(key: string): Promise<T | null> {
    const val = await redis.get(key)
    if (!val) return null
    return JSON.parse(val) as T
  },

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const serialized = JSON.stringify(value)
    if (ttlSeconds) {
      await redis.setex(key, ttlSeconds, serialized)
    } else {
      await redis.set(key, serialized)
    }
  },

  async del(key: string): Promise<void> {
    await redis.del(key)
  },

  async delPattern(pattern: string): Promise<void> {
    const keys = await redis.keys(pattern)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  },
}

// Cache key factories
export const CacheKeys = {
  // kpis:userId:summary:period[:accountId]
  kpiSummary:    (userId: string, period: string, accountId?: string) =>
    accountId ? `kpis:${userId}:summary:${period}:${accountId}` : `kpis:${userId}:summary:${period}`,
  // kpis:userId:snapshots:from:to[:accountId]
  kpiSnapshots:  (userId: string, from: string, to: string, accountId?: string) =>
    accountId ? `kpis:${userId}:snapshots:${from}:${to}:${accountId}` : `kpis:${userId}:snapshots:${from}:${to}`,
  // trades:userId:<hash de query>
  trades:        (userId: string, queryHash: string) => `trades:${userId}:${queryHash}`,
  livePositions: (accountId: string) => `trades:live:${accountId}`,
  session:       (token: string) => `session:${token}`,
  brokerSyncLock:(accountId: string) => `broker:sync:${accountId}`,
  aiScore:       (userId: string, date: string) => `ai:score:${userId}:${date}`,
} as const
