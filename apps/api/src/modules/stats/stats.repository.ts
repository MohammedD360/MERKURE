import { prisma } from '../../infrastructure/database/client.js'

export type Period = '7d' | '30d' | '90d' | '1y' | 'all'

function periodToDate(period: Period): Date | null {
  const now = new Date()
  switch (period) {
    case '7d':  return new Date(now.getTime() - 7   * 86_400_000)
    case '30d': return new Date(now.getTime() - 30  * 86_400_000)
    case '90d': return new Date(now.getTime() - 90  * 86_400_000)
    case '1y':  return new Date(now.getTime() - 365 * 86_400_000)
    case 'all': return null
  }
}

export const statsRepository = {
  async getMonthlyStats(userId: string, months = 12) {
    const from = new Date()
    from.setMonth(from.getMonth() - months)

    const trades = await prisma.trade.findMany({
      where:   { userId, status: 'CLOSED', closeTime: { gte: from } },
      orderBy: { closeTime: 'asc' },
      select:  { closeTime: true, pnl: true },
    })

    const monthMap = new Map<string, number[]>()
    for (const t of trades) {
      if (!t.closeTime) continue
      const key = `${t.closeTime.getUTCFullYear()}-${String(t.closeTime.getUTCMonth() + 1).padStart(2, '0')}`
      if (!monthMap.has(key)) monthMap.set(key, [])
      monthMap.get(key)!.push(Number(t.pnl ?? 0))
    }

    return Array.from(monthMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, pnls]) => {
        const winners     = pnls.filter(p => p > 0)
        const losers      = pnls.filter(p => p < 0)
        const totalPnl    = pnls.reduce((s, p) => s + p, 0)
        const winRate     = pnls.length > 0 ? winners.length / pnls.length : 0
        const grossProfit = winners.reduce((s, p) => s + p, 0)
        const grossLoss   = Math.abs(losers.reduce((s, p) => s + p, 0))
        const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : null
        return {
          month,
          nbTrades:    pnls.length,
          totalPnl:    parseFloat(totalPnl.toFixed(2)),
          winRate:     parseFloat(winRate.toFixed(4)),
          profitFactor: profitFactor ? parseFloat(profitFactor.toFixed(2)) : null,
        }
      })
  },

  async getSymbolStats(userId: string, period: Period) {
    const from = periodToDate(period)
    const trades = await prisma.trade.findMany({
      where: {
        userId,
        status: 'CLOSED',
        ...(from ? { closeTime: { gte: from } } : {}),
      },
      select: { symbol: true, pnl: true },
    })

    const symbolMap = new Map<string, number[]>()
    for (const t of trades) {
      if (!symbolMap.has(t.symbol)) symbolMap.set(t.symbol, [])
      symbolMap.get(t.symbol)!.push(Number(t.pnl ?? 0))
    }

    return Array.from(symbolMap.entries())
      .map(([symbol, pnls]) => {
        const winners     = pnls.filter(p => p > 0)
        const losers      = pnls.filter(p => p < 0)
        const totalPnl    = pnls.reduce((s, p) => s + p, 0)
        const winRate     = pnls.length > 0 ? winners.length / pnls.length : 0
        const grossProfit = winners.reduce((s, p) => s + p, 0)
        const grossLoss   = Math.abs(losers.reduce((s, p) => s + p, 0))
        const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : null
        const avgPnl      = pnls.length > 0 ? totalPnl / pnls.length : 0
        return {
          symbol,
          nbTrades:    pnls.length,
          winRate:     parseFloat(winRate.toFixed(4)),
          totalPnl:    parseFloat(totalPnl.toFixed(2)),
          avgPnl:      parseFloat(avgPnl.toFixed(2)),
          profitFactor: profitFactor ? parseFloat(profitFactor.toFixed(2)) : null,
          bestTrade:   winners.length > 0 ? parseFloat(Math.max(...winners).toFixed(2)) : 0,
          worstTrade:  losers.length  > 0 ? parseFloat(Math.min(...losers).toFixed(2))  : 0,
        }
      })
      .sort((a, b) => Math.abs(b.totalPnl) - Math.abs(a.totalPnl))
  },

  async getPnlDistribution(userId: string, period: Period) {
    const from = periodToDate(period)
    const trades = await prisma.trade.findMany({
      where: {
        userId,
        status: 'CLOSED',
        ...(from ? { closeTime: { gte: from } } : {}),
      },
      select: { pnl: true },
    })

    const pnls = trades.map(t => Number(t.pnl ?? 0))
    if (pnls.length === 0) return []

    const BUCKET = 50
    const min = Math.floor(Math.min(...pnls) / BUCKET) * BUCKET
    const max = Math.ceil(Math.max(...pnls)  / BUCKET) * BUCKET

    const buckets = new Map<number, number>()
    for (let b = min; b <= max; b += BUCKET) buckets.set(b, 0)
    for (const pnl of pnls) {
      const b = Math.floor(pnl / BUCKET) * BUCKET
      buckets.set(b, (buckets.get(b) ?? 0) + 1)
    }

    return Array.from(buckets.entries())
      .sort(([a], [b]) => a - b)
      .map(([bucket, count]) => ({
        bucket,
        count,
        label: `${bucket >= 0 ? '+' : ''}${bucket}`,
      }))
  },

  async getOverview(userId: string, period: Period) {
    const from = periodToDate(period)
    const where = {
      userId,
      status: 'CLOSED' as const,
      ...(from ? { closeTime: { gte: from } } : {}),
    }

    const trades = await prisma.trade.findMany({
      where,
      orderBy: { closeTime: 'asc' },
      select: { pnl: true, commission: true, direction: true, openTime: true, closeTime: true },
    })

    if (trades.length === 0) {
      return {
        totalPnl: 0, grossProfit: 0, grossLoss: 0, totalFees: 0,
        nbTrades: 0, winTrades: 0, lossTrades: 0, beTrades: 0,
        winRate: 0, avgWin: 0, avgLoss: 0, profitFactor: null,
        longCount: 0, shortCount: 0, longPct: 0, shortPct: 0,
        avgDurationSec: 0,
      }
    }

    const pnls    = trades.map(t => Number(t.pnl ?? 0))
    const fees    = trades.map(t => Number(t.commission ?? 0))
    const winners = pnls.filter(p => p > 0)
    const losers  = pnls.filter(p => p < 0)
    const bes     = pnls.filter(p => p === 0)

    const grossProfit = winners.reduce((s, p) => s + p, 0)
    const grossLoss   = Math.abs(losers.reduce((s, p) => s + p, 0))
    const totalFees   = fees.reduce((s, f) => s + f, 0)
    const totalPnl    = pnls.reduce((s, p) => s + p, 0)

    const longCount  = trades.filter(t => t.direction === 'LONG').length
    const shortCount = trades.filter(t => t.direction === 'SHORT').length
    const total      = trades.length

    const durations = trades
      .filter(t => t.openTime && t.closeTime)
      .map(t => (t.closeTime!.getTime() - t.openTime.getTime()) / 1000)
    const avgDurationSec = durations.length > 0
      ? durations.reduce((s, d) => s + d, 0) / durations.length
      : 0

    return {
      totalPnl:    parseFloat(totalPnl.toFixed(2)),
      grossProfit: parseFloat(grossProfit.toFixed(2)),
      grossLoss:   parseFloat(grossLoss.toFixed(2)),
      totalFees:   parseFloat(totalFees.toFixed(2)),
      nbTrades:    total,
      winTrades:   winners.length,
      lossTrades:  losers.length,
      beTrades:    bes.length,
      winRate:     parseFloat((winners.length / total).toFixed(4)),
      avgWin:      winners.length > 0 ? parseFloat((grossProfit / winners.length).toFixed(2)) : 0,
      avgLoss:     losers.length  > 0 ? parseFloat((-grossLoss / losers.length).toFixed(2))   : 0,
      profitFactor: grossLoss > 0 ? parseFloat((grossProfit / grossLoss).toFixed(2)) : null,
      longCount,
      shortCount,
      longPct:     parseFloat(((longCount / total) * 100).toFixed(1)),
      shortPct:    parseFloat(((shortCount / total) * 100).toFixed(1)),
      avgDurationSec: parseFloat(avgDurationSec.toFixed(0)),
    }
  },

  async getWeekdayStats(userId: string, period: Period) {
    const from = periodToDate(period)
    const trades = await prisma.trade.findMany({
      where: {
        userId,
        status: 'CLOSED',
        ...(from ? { closeTime: { gte: from } } : {}),
      },
      select: { pnl: true, closeTime: true },
    })

    // 0=Sun, 1=Mon ... 6=Sat → on réordonne en Lun=0..Dim=6 pour affichage FR
    const dayLabels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
    const dayData   = Array.from({ length: 7 }, (_, i) => ({ day: dayLabels[i]!, pnls: [] as number[] }))

    for (const t of trades) {
      if (!t.closeTime) continue
      const dow = t.closeTime.getUTCDay() // 0=Sun
      const idx = dow === 0 ? 6 : dow - 1 // Lun=0..Dim=6
      dayData[idx]!.pnls.push(Number(t.pnl ?? 0))
    }

    return dayData.map(({ day, pnls }) => {
      const nbTrades = pnls.length
      const avgPnl   = nbTrades > 0 ? pnls.reduce((s, p) => s + p, 0) / nbTrades : 0
      const totalPnl = pnls.reduce((s, p) => s + p, 0)
      const winRate  = nbTrades > 0 ? pnls.filter(p => p > 0).length / nbTrades : 0
      return {
        day,
        nbTrades,
        avgPnl:    parseFloat(avgPnl.toFixed(2)),
        totalPnl:  parseFloat(totalPnl.toFixed(2)),
        winRate:   parseFloat(winRate.toFixed(4)),
      }
    })
  },

  async getDurationStats(userId: string, period: Period) {
    const from = periodToDate(period)
    const trades = await prisma.trade.findMany({
      where: {
        userId,
        status: 'CLOSED',
        ...(from ? { closeTime: { gte: from } } : {}),
      },
      select: { pnl: true, openTime: true, closeTime: true },
    })

    const BUCKETS = [
      { key: '<1m',    label: '< 1 min',   max: 60 },
      { key: '1-5m',   label: '1–5 min',   max: 300 },
      { key: '5-15m',  label: '5–15 min',  max: 900 },
      { key: '15-30m', label: '15–30 min', max: 1800 },
      { key: '30-60m', label: '30–60 min', max: 3600 },
      { key: '1-4h',   label: '1–4 h',     max: 14400 },
      { key: '>4h',    label: '> 4 h',     max: Infinity },
    ]

    const bucketData = BUCKETS.map(b => ({ ...b, pnls: [] as number[] }))

    for (const t of trades) {
      if (!t.openTime || !t.closeTime) continue
      const durSec = (t.closeTime.getTime() - t.openTime.getTime()) / 1000
      const pnl    = Number(t.pnl ?? 0)
      const bucket = bucketData.find(b => durSec < b.max)
      if (bucket) bucket.pnls.push(pnl)
    }

    return bucketData.map(({ label, pnls }) => {
      const nbTrades = pnls.length
      const avgPnl   = nbTrades > 0 ? pnls.reduce((s, p) => s + p, 0) / nbTrades : 0
      const winRate  = nbTrades > 0 ? pnls.filter(p => p > 0).length / nbTrades : 0
      return {
        label,
        nbTrades,
        avgPnl:  parseFloat(avgPnl.toFixed(2)),
        winRate: parseFloat(winRate.toFixed(4)),
      }
    })
  },

  async getStreaks(userId: string, period: Period) {
    const from = periodToDate(period)
    const trades = await prisma.trade.findMany({
      where: {
        userId,
        status: 'CLOSED',
        ...(from ? { closeTime: { gte: from } } : {}),
      },
      orderBy: { closeTime: 'asc' },
      select: { pnl: true },
    })

    if (trades.length === 0) {
      return { current: 0, currentType: null, longestWin: 0, longestLoss: 0, avgWinStreak: 0, avgLossStreak: 0 }
    }

    let current     = 0
    let currentType: 'win' | 'loss' | null = null
    let longestWin  = 0
    let longestLoss = 0
    const winStreaks: number[]  = []
    const lossStreaks: number[] = []

    for (const trade of trades) {
      const type: 'win' | 'loss' = Number(trade.pnl ?? 0) > 0 ? 'win' : 'loss'

      if (type === currentType) {
        current++
      } else {
        if (currentType === 'win')  { winStreaks.push(current);  if (current > longestWin)  longestWin  = current }
        if (currentType === 'loss') { lossStreaks.push(current); if (current > longestLoss) longestLoss = current }
        currentType = type
        current = 1
      }
    }
    // Flush last streak
    if (currentType === 'win')  { winStreaks.push(current);  if (current > longestWin)  longestWin  = current }
    if (currentType === 'loss') { lossStreaks.push(current); if (current > longestLoss) longestLoss = current }

    const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((s, n) => s + n, 0) / arr.length : 0

    return {
      current,
      currentType,
      longestWin,
      longestLoss,
      avgWinStreak:  parseFloat(avg(winStreaks).toFixed(1)),
      avgLossStreak: parseFloat(avg(lossStreaks).toFixed(1)),
    }
  },
}
