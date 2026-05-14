import { prisma } from '../../infrastructure/database/client.js'

export type Period = '7d' | '30d' | '90d' | '1y' | 'all'

export function periodToDate(period: Period): Date | null {
  const now = new Date()
  switch (period) {
    case '7d':  return new Date(now.getTime() - 7   * 86_400_000)
    case '30d': return new Date(now.getTime() - 30  * 86_400_000)
    case '90d': return new Date(now.getTime() - 90  * 86_400_000)
    case '1y':  return new Date(now.getTime() - 365 * 86_400_000)
    case 'all': return null
  }
}

function aggregateSnapshots(snapshots: { date: Date; totalPnl: unknown; winRate: unknown; profitFactor: unknown; nbTrades: number | null }[]) {
  if (snapshots.length === 0) {
    return { totalPnl: 0, winRate: 0, profitFactor: null, nbTrades: 0, maxDrawdown: null, bestDay: null, worstDay: null }
  }

  const totalPnl    = snapshots.reduce((s, r) => s + Number(r.totalPnl ?? 0), 0)
  const totalTrades = snapshots.reduce((s, r) => s + (r.nbTrades ?? 0), 0)

  const winRate = totalTrades > 0
    ? snapshots.reduce((s, r) => s + Number(r.winRate ?? 0) * (r.nbTrades ?? 0), 0) / totalTrades
    : 0

  const pfSnap      = [...snapshots].reverse().find(r => r.profitFactor != null)
  const profitFactor = pfSnap ? Number(pfSnap.profitFactor) : null

  let peak = 0, cumulPnl = 0, maxDrawdown = 0
  for (const snap of snapshots) {
    cumulPnl += Number(snap.totalPnl ?? 0)
    if (cumulPnl > peak) peak = cumulPnl
    const dd = peak > 0 ? (peak - cumulPnl) / peak : 0
    if (dd > maxDrawdown) maxDrawdown = dd
  }

  const best  = snapshots.reduce((a, b) => Number(b.totalPnl ?? 0) > Number(a.totalPnl ?? 0) ? b : a)
  const worst = snapshots.reduce((a, b) => Number(b.totalPnl ?? 0) < Number(a.totalPnl ?? 0) ? b : a)

  return {
    totalPnl,
    winRate,
    profitFactor,
    nbTrades: totalTrades,
    maxDrawdown: maxDrawdown > 0 ? maxDrawdown : null,
    bestDay:  { date: best.date,  pnl: Number(best.totalPnl  ?? 0) },
    worstDay: { date: worst.date, pnl: Number(worst.totalPnl ?? 0) },
  }
}

// Calcule des snapshots journaliers à la volée depuis les trades d'un compte précis.
// Utilisé uniquement quand accountId est fourni (les snapshots pré-calculés sont globaux).
async function computeSnapshotsFromTrades(userId: string, from: Date | null, to: Date, accountId: string) {
  const trades = await prisma.trade.findMany({
    where: {
      userId,
      brokerAccountId: accountId,
      status: 'CLOSED',
      closeTime: { gte: from ?? new Date(0), lte: to },
    },
    orderBy: { closeTime: 'asc' },
    select: { closeTime: true, pnl: true },
  })

  const byDate = new Map<string, number[]>()
  for (const t of trades) {
    if (!t.closeTime) continue
    const key = t.closeTime.toISOString().slice(0, 10)
    if (!byDate.has(key)) byDate.set(key, [])
    byDate.get(key)!.push(Number(t.pnl ?? 0))
  }

  return Array.from(byDate.entries()).map(([dateStr, pnls]) => {
    const winners = pnls.filter(p => p > 0)
    const losers  = pnls.filter(p => p < 0)
    const totalPnl = pnls.reduce((s, p) => s + p, 0)
    const winRate  = pnls.length > 0 ? winners.length / pnls.length : 0
    const grossProfit = winners.reduce((s, p) => s + p, 0)
    const grossLoss   = Math.abs(losers.reduce((s, p) => s + p, 0))
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : null
    return { date: new Date(dateStr), totalPnl, winRate, profitFactor, nbTrades: pnls.length }
  })
}

export const kpisRepository = {
  async getSummary(userId: string, period: Period, accountId?: string) {
    const from = periodToDate(period)

    if (accountId) {
      const snaps = await computeSnapshotsFromTrades(userId, from, new Date(), accountId)
      return aggregateSnapshots(snaps)
    }

    const where = {
      userId,
      ...(from ? { date: { gte: from } } : {}),
    }
    const snapshots = await prisma.kpiSnapshot.findMany({ where, orderBy: { date: 'asc' } })
    return aggregateSnapshots(snapshots)
  },

  async getSnapshots(userId: string, from: Date, to: Date, accountId?: string) {
    if (accountId) {
      return computeSnapshotsFromTrades(userId, from, to, accountId)
    }

    return prisma.kpiSnapshot.findMany({
      where:   { userId, date: { gte: from, lte: to } },
      orderBy: { date: 'asc' },
      select:  { date: true, totalPnl: true, winRate: true, profitFactor: true, nbTrades: true, balance: true, equity: true },
    })
  },
}
