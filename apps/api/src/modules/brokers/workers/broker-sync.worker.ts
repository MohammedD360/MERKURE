import { Worker, type Job } from 'bullmq'
import { env } from '../../../config/env.js'
import { prisma } from '../../../infrastructure/database/client.js'
import { decrypt } from '../../../infrastructure/crypto/encryption.js'
import type { BrokerSyncJob } from '../../../infrastructure/queue/queues.js'
import { redis, CacheKeys } from '../../../infrastructure/cache/redis.js'
import { MtAdapter } from '../adapters/mt-adapter.js'
import type { BrokerAdapter, TradeData } from '../adapters/broker-adapter.js'

const REDIS_LOCK_TTL = 5 * 60 * 1000 // 5 min lock per account
const DEFAULT_HISTORY_DAYS = 365 // full sync window

function resolveAdapter(brokerType: string): BrokerAdapter {
  switch (brokerType.toLowerCase()) {
    case 'mt4':
    case 'mt5':
      return new MtAdapter()
    default:
      throw new Error(`Unsupported broker type: ${brokerType}`)
  }
}

async function upsertTrades(accountId: string, userId: string, trades: TradeData[]): Promise<number> {
  let upserted = 0
  for (const trade of trades) {
    if (!trade.externalId) continue
    await prisma.trade.upsert({
      where: { brokerAccountId_externalId: { brokerAccountId: accountId, externalId: trade.externalId } },
      create: {
        brokerAccountId: accountId,
        userId,
        externalId: trade.externalId,
        symbol: trade.symbol,
        direction: trade.direction,
        openTime: trade.openTime,
        ...(trade.closeTime ? { closeTime: trade.closeTime } : {}),
        openPrice: trade.openPrice,
        ...(trade.closePrice !== null ? { closePrice: trade.closePrice } : {}),
        lotSize: trade.lotSize,
        ...(trade.pnl !== null ? { pnl: trade.pnl } : {}),
        swap: trade.swap,
        commission: trade.commission,
        status: trade.status,
      },
      update: {
        ...(trade.closeTime ? { closeTime: trade.closeTime } : {}),
        ...(trade.closePrice !== null ? { closePrice: trade.closePrice } : {}),
        ...(trade.pnl !== null ? { pnl: trade.pnl } : {}),
        swap: trade.swap,
        commission: trade.commission,
        status: trade.status,
      },
    })
    upserted++
  }
  return upserted
}

async function processSync(job: Job<BrokerSyncJob>): Promise<void> {
  const { accountId, userId, brokerType, fullSync } = job.data

  // Distributed lock: one sync per account at a time
  const lockKey = CacheKeys.brokerSyncLock(accountId)
  const lockAcquired = await redis.set(lockKey, '1', 'PX', REDIS_LOCK_TTL, 'NX')
  if (!lockAcquired) return // another worker is already syncing this account

  const adapter = resolveAdapter(brokerType)

  try {
    // 1. Load broker account from DB
    const brokerAccount = await prisma.brokerAccount.findUnique({
      where: { id: accountId },
      select: { credentialsEnc: true, lastSyncAt: true },
    })
    if (!brokerAccount) throw new Error(`BrokerAccount ${accountId} not found`)

    if (!brokerAccount.credentialsEnc) throw new Error(`No credentials stored for account ${accountId}`)

    // 2. Decrypt credentials
    const credentials = decrypt(brokerAccount.credentialsEnc)

    // 3. Mark as syncing
    await prisma.brokerAccount.update({
      where: { id: accountId },
      data: { syncStatus: 'SYNCING', syncError: null },
    })

    // 4. Connect adapter
    await adapter.connect(credentials)

    // 5. Determine sync window
    const to = new Date()
    const from = fullSync || !brokerAccount.lastSyncAt
      ? new Date(Date.now() - DEFAULT_HISTORY_DAYS * 24 * 60 * 60 * 1000)
      : new Date(brokerAccount.lastSyncAt.getTime() - 60 * 60 * 1000) // 1h overlap for in-progress trades

    // 6. Fetch and upsert trades
    const trades = await adapter.getTradeHistory(from, to)
    const count = await upsertTrades(accountId, userId, trades)

    // 7. Mark success
    await prisma.brokerAccount.update({
      where: { id: accountId },
      data: { syncStatus: 'SUCCESS', lastSyncAt: to },
    })

    job.log(`Synced ${count} trades for account ${accountId}`)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    await prisma.brokerAccount.update({
      where: { id: accountId },
      data: { syncStatus: 'ERROR', syncError: message },
    }).catch(() => {})
    throw err
  } finally {
    adapter.disconnect()
    await redis.del(lockKey)
  }
}

export function startBrokerSyncWorker(): Worker<BrokerSyncJob> {
  const worker = new Worker<BrokerSyncJob>('broker-sync', processSync, {
    connection: { url: env.REDIS_URL },
    concurrency: 3,
  })

  worker.on('completed', job => {
    console.log(`[broker-sync] Job ${job.id} completed`)
  })

  worker.on('failed', (job, err) => {
    console.error(`[broker-sync] Job ${job?.id} failed:`, err.message)
  })

  return worker
}
