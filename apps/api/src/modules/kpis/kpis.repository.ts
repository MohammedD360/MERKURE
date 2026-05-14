import { prisma } from '../../infrastructure/database/client.js'

export type Period = '7d' | '30d' | '90d' | '1y' | 'all'

function periodToDate(period: Period): Date | null {
  const now = new Date()
  switch (period) {
    case '7d':  return new Date(now.getTime() - 7  * 86_400_000)
    case '30d': return new Date(now.getTime() - 30 * 86_400_000)
    case '90d': return new Date(now.getTime() - 90 * 86_400_000)
    case '1y':  return new Date(now.getTime() - 365 * 86_400_000)
    case 'all': return null
  }
}

export const kpisRepository = {
  async getSummary(userId: string, period: Period) {
    const from = periodToDate(period)
    const where = {
      userId,
      ...(from ? { date: { gte: from } } : {}),
    }

    const snapshots = await prisma.kpiSnapshot.findMany({ where, orderBy: { date: 'asc' } })

    if (snapshots.length === 0) {
      return {
        totalPnl:     0,
        winRate:      0,
        profitFactor: null,
        nbTrades:     0,
        maxDrawdown:  null,
        bestDay:      null,
        worstDay:     null,
      }
    }

    const totalPnl     = snapshots.reduce((s, r) => s + Number(r.totalPnl ?? 0), 0)
    const totalTrades  = snapshots.reduce((s, r) => s + (r.nbTrades ?? 0), 0)

    // Winrate pondéré par nombre de trades
    const winRate = totalTrades > 0
      ? snapshots.reduce((s, r) => s + Number(r.winRate ?? 0) * (r.nbTrades ?? 0), 0) / totalTrades
      : 0

    // Profit factor : dernier non-null
    const pfSnap = [...snapshots].reverse().find(r => r.profitFactor != null)
    const profitFactor = pfSnap ? Number(pfSnap.profitFactor) : null

    // Max drawdown : min des pnl cumulés depuis le pic
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
  },

  getSnapshots(userId: string, from: Date, to: Date) {
    return prisma.kpiSnapshot.findMany({
      where:   { userId, date: { gte: from, lte: to } },
      orderBy: { date: 'asc' },
      select:  { date: true, totalPnl: true, winRate: true, profitFactor: true, nbTrades: true, balance: true, equity: true },
    })
  },
}
