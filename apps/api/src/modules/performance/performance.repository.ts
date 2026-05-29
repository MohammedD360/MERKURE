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

// Sessions UTC : Asia 00-07, London 07-13, Overlap 13-17, NewYork 17-22, AfterHours 22-24
function getSession(utcHour: number): string {
  if (utcHour < 7)  return 'Asia'
  if (utcHour < 13) return 'London'
  if (utcHour < 17) return 'Overlap'
  if (utcHour < 22) return 'New York'
  return 'After-Hours'
}

// JS getDay() : 0=Dimanche → on remaps vers 0=Lundi
function jsWeekdayToMon0(jsDay: number): number {
  return jsDay === 0 ? 6 : jsDay - 1
}

const DAY_NAMES = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

export const performanceRepository = {
  /**
   * Courbe PnL + drawdown (journalier)
   * Depuis les KpiSnapshots globaux, ou depuis les trades si accountId fourni.
   */
  async getCurveData(
    userId: string,
    from: Date,
    to: Date,
    accountId?: string,
  ): Promise<{ date: string; pnl: number; cumPnl: number; drawdownPct: number }[]> {
    let rows: { date: string; pnl: number }[]

    if (accountId) {
      const trades = await prisma.trade.findMany({
        where: {
          userId,
          brokerAccountId: accountId,
          status: 'CLOSED',
          closeTime: { gte: from, lte: to },
        },
        orderBy: { closeTime: 'asc' },
        select: { closeTime: true, pnl: true },
      })

      const byDate = new Map<string, number>()
      for (const t of trades) {
        if (!t.closeTime) continue
        const key = t.closeTime.toISOString().slice(0, 10)
        byDate.set(key, (byDate.get(key) ?? 0) + Number(t.pnl ?? 0))
      }
      rows = Array.from(byDate.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, pnl]) => ({ date, pnl }))
    } else {
      const snapshots = await prisma.kpiSnapshot.findMany({
        where: { userId, date: { gte: from, lte: to } },
        orderBy: { date: 'asc' },
        select: { date: true, totalPnl: true },
      })
      rows = snapshots.map(s => ({
        date: s.date.toISOString().slice(0, 10),
        pnl:  Number(s.totalPnl ?? 0),
      }))
    }

    let cumPnl = 0
    let peak   = 0
    return rows.map(r => {
      cumPnl += r.pnl
      if (cumPnl > peak) peak = cumPnl
      const drawdownPct = peak > 0 ? (peak - cumPnl) / peak : 0
      return { date: r.date, pnl: r.pnl, cumPnl, drawdownPct }
    })
  },

  /**
   * Stats par session de trading (basé sur openTime UTC)
   */
  async getSessionStats(
    userId: string,
    period: Period,
    accountId?: string,
  ): Promise<{ session: string; nbTrades: number; winRate: number; totalPnl: number; avgPnl: number }[]> {
    const from = periodToDate(period)
    const trades = await prisma.trade.findMany({
      where: {
        userId,
        status: 'CLOSED',
        ...(accountId ? { brokerAccountId: accountId } : {}),
        ...(from ? { openTime: { gte: from } } : {}),
      },
      select: { openTime: true, pnl: true },
    })

    const sessionMap = new Map<string, number[]>()
    for (const t of trades) {
      const hour    = t.openTime.getUTCHours()
      const session = getSession(hour)
      if (!sessionMap.has(session)) sessionMap.set(session, [])
      sessionMap.get(session)!.push(Number(t.pnl ?? 0))
    }

    const ORDER = ['Asia', 'London', 'Overlap', 'New York', 'After-Hours']
    return ORDER.map(session => {
      const pnls     = sessionMap.get(session) ?? []
      const nbTrades = pnls.length
      const totalPnl = pnls.reduce((s, p) => s + p, 0)
      const winRate  = nbTrades > 0 ? pnls.filter(p => p > 0).length / nbTrades : 0
      const avgPnl   = nbTrades > 0 ? totalPnl / nbTrades : 0
      return { session, nbTrades, winRate, totalPnl, avgPnl }
    })
  },

  /**
   * Stats par jour de semaine (0=Lundi … 6=Dimanche)
   */
  async getWeekdayStats(
    userId: string,
    period: Period,
    accountId?: string,
  ): Promise<{ day: number; label: string; nbTrades: number; winRate: number; totalPnl: number }[]> {
    const from = periodToDate(period)
    const trades = await prisma.trade.findMany({
      where: {
        userId,
        status: 'CLOSED',
        ...(accountId ? { brokerAccountId: accountId } : {}),
        ...(from ? { openTime: { gte: from } } : {}),
      },
      select: { openTime: true, pnl: true },
    })

    const dayMap = new Map<number, number[]>()
    for (let i = 0; i < 7; i++) dayMap.set(i, [])

    for (const t of trades) {
      const dayIdx = jsWeekdayToMon0(t.openTime.getUTCDay())
      dayMap.get(dayIdx)!.push(Number(t.pnl ?? 0))
    }

    return Array.from({ length: 7 }, (_, i) => {
      const pnls     = dayMap.get(i)!
      const nbTrades = pnls.length
      const totalPnl = pnls.reduce((s, p) => s + p, 0)
      const winRate  = nbTrades > 0 ? pnls.filter(p => p > 0).length / nbTrades : 0
      return { day: i, label: DAY_NAMES[i]!, nbTrades, winRate, totalPnl }
    })
  },

  /**
   * Heatmap : jour (0-6 Lun-Dim) × heure (0-23)
   */
  async getHeatmapData(
    userId: string,
    period: Period,
    accountId?: string,
  ): Promise<{ dayOfWeek: number; hour: number; pnl: number; count: number }[]> {
    const from = periodToDate(period)
    const trades = await prisma.trade.findMany({
      where: {
        userId,
        status: 'CLOSED',
        ...(accountId ? { brokerAccountId: accountId } : {}),
        ...(from ? { openTime: { gte: from } } : {}),
      },
      select: { openTime: true, pnl: true },
    })

    const cellMap = new Map<string, { pnl: number; count: number }>()
    for (const t of trades) {
      const dayOfWeek = jsWeekdayToMon0(t.openTime.getUTCDay())
      const hour      = t.openTime.getUTCHours()
      const key       = `${dayOfWeek}:${hour}`
      const cell      = cellMap.get(key) ?? { pnl: 0, count: 0 }
      cell.pnl   += Number(t.pnl ?? 0)
      cell.count += 1
      cellMap.set(key, cell)
    }

    const result: { dayOfWeek: number; hour: number; pnl: number; count: number }[] = []
    for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
      for (let hour = 0; hour < 24; hour++) {
        const cell = cellMap.get(`${dayOfWeek}:${hour}`)
        if (cell) {
          result.push({ dayOfWeek, hour, pnl: cell.pnl, count: cell.count })
        }
      }
    }
    return result
  },

  /**
   * Stats avancées : avgRR, avgDuration en minutes
   */
  async getAdvancedStats(
    userId: string,
    period: Period,
    accountId?: string,
  ): Promise<{ winRate: number | null; avgRR: number | null; avgDurationMs: number | null; profitFactor: number | null; nbTrades: number }> {
    const from = periodToDate(period)
    const trades = await prisma.trade.findMany({
      where: {
        userId,
        status: 'CLOSED',
        ...(accountId ? { brokerAccountId: accountId } : {}),
        ...(from ? { closeTime: { gte: from } } : {}),
      },
      select: { pnl: true, openTime: true, closeTime: true },
    })

    const nbTrades = trades.length
    if (nbTrades === 0) return { winRate: null, avgRR: null, avgDurationMs: null, profitFactor: null, nbTrades: 0 }

    const pnls    = trades.map(t => Number(t.pnl ?? 0))
    const winners = pnls.filter(p => p > 0)
    const losers  = pnls.filter(p => p < 0)

    const winRate     = nbTrades > 0 ? winners.length / nbTrades : null
    const grossProfit = winners.reduce((s, p) => s + p, 0)
    const grossLoss   = Math.abs(losers.reduce((s, p) => s + p, 0))
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : null

    const avgWin  = winners.length > 0 ? grossProfit / winners.length : null
    const avgLoss = losers.length  > 0 ? grossLoss  / losers.length   : null
    const avgRR   = avgWin != null && avgLoss != null && avgLoss > 0 ? avgWin / avgLoss : null

    const durationsMs = trades
      .filter(t => t.closeTime != null)
      .map(t => t.closeTime!.getTime() - t.openTime.getTime())

    const avgDurationMs = durationsMs.length > 0
      ? durationsMs.reduce((s, d) => s + d, 0) / durationsMs.length
      : null

    return { winRate, avgRR, avgDurationMs, profitFactor, nbTrades }
  },

  /**
   * Détection revenge trading
   */
  async getRevengeTradingAlerts(
    userId: string,
    period: Period,
    config: { timeThresholdMin: number; lotIncreasePct: number },
  ): Promise<{
    id: string
    symbol: string
    type: 'fast_reentry' | 'lot_increase' | 'both'
    openTime: string
    minutesBetweenTrades: number
    prevLotSize: number
    currLotSize: number
    lotSizeDelta: number
  }[]> {
    const from = periodToDate(period)
    const trades = await prisma.trade.findMany({
      where: {
        userId,
        status: 'CLOSED',
        ...(from ? { closeTime: { gte: from } } : {}),
      },
      orderBy: { closeTime: 'asc' },
      select: { id: true, symbol: true, pnl: true, openTime: true, closeTime: true, lotSize: true },
    })

    const alerts: {
      id: string
      symbol: string
      type: 'fast_reentry' | 'lot_increase' | 'both'
      openTime: string
      minutesBetweenTrades: number
      prevLotSize: number
      currLotSize: number
      lotSizeDelta: number
    }[] = []

    for (let i = 1; i < trades.length; i++) {
      const prev = trades[i - 1]!
      const curr = trades[i]!
      const prevPnl = Number(prev.pnl ?? 0)

      // On cherche uniquement après un trade perdant
      if (prevPnl >= 0) continue

      const prevLotSize = Number(prev.lotSize)
      const currLotSize = Number(curr.lotSize)
      const lotSizeDelta = currLotSize - prevLotSize

      const minutesBetweenTrades = prev.closeTime && curr.openTime
        ? (curr.openTime.getTime() - prev.closeTime.getTime()) / 60_000
        : 0

      const isFastReentry = minutesBetweenTrades < config.timeThresholdMin
      const isLotIncrease = prevLotSize > 0 && (lotSizeDelta / prevLotSize) * 100 > config.lotIncreasePct

      if (!isFastReentry && !isLotIncrease) continue

      const type: 'fast_reentry' | 'lot_increase' | 'both' =
        isFastReentry && isLotIncrease ? 'both'
        : isFastReentry ? 'fast_reentry'
        : 'lot_increase'

      alerts.push({
        id:                   curr.id,
        symbol:               curr.symbol,
        type,
        openTime:             curr.openTime.toISOString(),
        minutesBetweenTrades: Math.round(minutesBetweenTrades),
        prevLotSize,
        currLotSize,
        lotSizeDelta,
      })
    }

    return alerts
  },
}
