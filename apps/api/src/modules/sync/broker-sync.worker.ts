import { createWorker, brokerSyncQueue } from '../../infrastructure/queue/queues.js'
import type { BrokerSyncJob } from '../../infrastructure/queue/queues.js'
import { prisma } from '../../infrastructure/database/client.js'
import { cache, CacheKeys } from '../../infrastructure/cache/redis.js'
import { accountsRepository } from '../accounts/accounts.repository.js'
import { DemoAdapter } from '../brokers/adapters/demo-adapter.js'
import type { BrokerAdapter } from '../brokers/adapters/broker-adapter.js'
import { wsNotify } from '../../websocket/ws.handler.js'

// Resolve the right adapter per broker type
// TODO: add MetaAPI (MT4/MT5), Binance REST, cTrader OAuth adapters in Sprint 2
function resolveAdapter(_brokerType: BrokerSyncJob['brokerType']): BrokerAdapter {
  return new DemoAdapter()
}

export function startBrokerSyncWorker() {
  return createWorker<BrokerSyncJob>(
    'broker-sync',
    async (job) => {
      // ─── Dispatch job: triggered by cron, queues one sync job per active account ───
      if (job.name === 'dispatch-all') {
        const accounts = await accountsRepository.findAllActive()
        for (const account of accounts) {
          await brokerSyncQueue.add(
            `sync-${account.id}`,
            {
              accountId: account.id,
              userId: account.userId,
              brokerType: account.brokerType.toLowerCase() as BrokerSyncJob['brokerType'],
              fullSync: false,
            },
            { jobId: `sync-${account.id}` }, // dedup: skip if already queued
          )
        }
        return
      }

      const { accountId, userId, brokerType, fullSync = false } = job.data

      // ─── Step 1: Acquire sync lock (prevents double-sync on same account) ───────
      const lockKey = CacheKeys.brokerSyncLock(accountId)
      const alreadyRunning = await cache.get<boolean>(lockKey)
      if (alreadyRunning) {
        await job.log('Sync already in progress — skipping')
        return
      }
      await cache.set(lockKey, true, 30)
      await accountsRepository.updateSyncStatus(accountId, 'SYNCING')

      const adapter = resolveAdapter(brokerType)

      try {
        // ─── Step 2: Fetch trade history from broker ─────────────────────────────
        await adapter.connect({}) // real adapter decrypts credentialsEnc here

        const syncFrom = fullSync
          ? new Date(Date.now() - 365 * 24 * 3_600_000) // full year on first sync
          : new Date(Date.now() - 7 * 24 * 3_600_000)   // last 7 days on incremental

        const trades = await adapter.getTradeHistory(syncFrom, new Date())
        adapter.disconnect()

        if (trades.length === 0) {
          await cache.del(lockKey)
          await accountsRepository.updateSyncStatus(accountId, 'SUCCESS')
          wsNotify(userId, { type: 'sync:complete', data: { accountId, upsertCount: 0 } })
          return
        }

        // ─── Step 3: Upsert trades idempotently (dedup by externalId) ────────────
        let upsertCount = 0
        for (const trade of trades) {
          if (!trade.externalId) continue

          await prisma.trade.upsert({
            where: {
              brokerAccountId_externalId: {
                brokerAccountId: accountId,
                externalId: trade.externalId,
              },
            },
            create: {
              brokerAccountId: accountId,
              userId,
              externalId: trade.externalId,
              symbol: trade.symbol,
              direction: trade.direction,
              openTime: trade.openTime,
              closeTime: trade.closeTime,
              openPrice: trade.openPrice,
              closePrice: trade.closePrice,
              lotSize: trade.lotSize,
              pnl: trade.pnl,
              swap: trade.swap,
              commission: trade.commission,
              status: trade.status,
            },
            update: {
              // Only update mutable fields (a closed trade's P&L/price can be revised by broker)
              closeTime: trade.closeTime,
              closePrice: trade.closePrice,
              pnl: trade.pnl,
              status: trade.status,
            },
          })
          upsertCount++
        }

        // ─── Step 4: Recalculate KPI snapshots for affected dates ─────────────────
        await recalculateKpiSnapshots(userId, syncFrom)

        // ─── Step 5: Invalidate Redis cache ──────────────────────────────────────
        await cache.delPattern(`kpis:${userId}:*`)
        await cache.del(CacheKeys.livePositions(accountId))
        await cache.del(lockKey)

        // ─── Step 6: Mark success + push real-time notification ──────────────────
        await accountsRepository.updateSyncStatus(accountId, 'SUCCESS')
        wsNotify(userId, { type: 'sync:complete', data: { accountId, upsertCount } })

      } catch (err) {
        await cache.del(lockKey)
        const message = err instanceof Error ? err.message : 'unknown_error'
        await accountsRepository.updateSyncStatus(accountId, 'ERROR', message)
        wsNotify(userId, { type: 'sync:error', data: { accountId, error: message } })
        throw err // BullMQ will retry with exponential backoff
      }
    },
    3, // concurrency: process 3 accounts simultaneously
  )
}

// Register the hourly dispatch cron job (idempotent — safe to call on every restart)
export async function scheduleBrokerSyncCron(): Promise<void> {
  await brokerSyncQueue.add(
    'dispatch-all',
    {} as BrokerSyncJob,
    {
      repeat: { every: 60 * 60 * 1_000 }, // every hour
      jobId: 'dispatch-all-cron',
    },
  )
}

// ─── KPI snapshot recalculation ──────────────────────────────────────────────
// Groups closed trades by date and upserts a KpiSnapshot row per day.
// Called after every sync to keep analytics up to date.
async function recalculateKpiSnapshots(userId: string, from: Date): Promise<void> {
  const trades = await prisma.trade.findMany({
    where: { userId, status: 'CLOSED', closeTime: { gte: from } },
    orderBy: { closeTime: 'asc' },
  })

  const byDate = new Map<string, typeof trades>()
  for (const t of trades) {
    if (!t.closeTime) continue
    const key = t.closeTime.toISOString().slice(0, 10)
    if (!byDate.has(key)) byDate.set(key, [])
    byDate.get(key)!.push(t)
  }

  for (const [dateStr, dayTrades] of byDate) {
    const winners = dayTrades.filter((t) => Number(t.pnl ?? 0) > 0)
    const losers = dayTrades.filter((t) => Number(t.pnl ?? 0) < 0)
    const totalPnl = dayTrades.reduce((s, t) => s + Number(t.pnl ?? 0), 0)
    const winRate = dayTrades.length > 0 ? winners.length / dayTrades.length : 0
    const grossProfit = winners.reduce((s, t) => s + Number(t.pnl), 0)
    const grossLoss = Math.abs(losers.reduce((s, t) => s + Number(t.pnl), 0))
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : null

    await prisma.kpiSnapshot.upsert({
      where: { userId_date: { userId, date: new Date(dateStr) } },
      create: { userId, date: new Date(dateStr), totalPnl, winRate, profitFactor, nbTrades: dayTrades.length },
      update: { totalPnl, winRate, profitFactor, nbTrades: dayTrades.length },
    })
  }
}
