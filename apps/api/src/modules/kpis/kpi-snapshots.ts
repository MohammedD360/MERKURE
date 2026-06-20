import { prisma } from '../../infrastructure/database/client.js'

/**
 * Recalcule et upsert les KpiSnapshot journaliers pour un userId
 * depuis une date donnée. Appelé après chaque sync broker ET après import CSV.
 */
export async function recalculateKpiSnapshots(userId: string, from: Date): Promise<void> {
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
    const winners     = dayTrades.filter(t => Number(t.pnl ?? 0) > 0)
    const losers      = dayTrades.filter(t => Number(t.pnl ?? 0) < 0)
    const totalPnl    = dayTrades.reduce((s, t) => s + Number(t.pnl ?? 0), 0)
    const winRate     = dayTrades.length > 0 ? winners.length / dayTrades.length : 0
    const grossProfit = winners.reduce((s, t) => s + Number(t.pnl), 0)
    const grossLoss   = Math.abs(losers.reduce((s, t) => s + Number(t.pnl), 0))
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : null

    await prisma.kpiSnapshot.upsert({
      where:  { userId_date: { userId, date: new Date(dateStr) } },
      create: { userId, date: new Date(dateStr), totalPnl, winRate, profitFactor, nbTrades: dayTrades.length },
      update: { totalPnl, winRate, profitFactor, nbTrades: dayTrades.length },
    })
  }
}
