import { prisma } from '../../infrastructure/database/client.js'

const SYMBOL_COLORS: Record<string, string> = {
  EURUSD:  '#6366f1',
  GBPUSD:  '#8b5cf6',
  USDJPY:  '#f59e0b',
  GBPJPY:  '#ef4444',
  XAUUSD:  '#fbbf24',
  US30:    '#22c55e',
  NAS100:  '#06b6d4',
  BTCUSD:  '#f97316',
}

function symbolColor(symbol: string): string {
  return SYMBOL_COLORS[symbol] ?? '#6b7280'
}

export const portfolioRepository = {
  async getSummary(userId: string) {
    // Le solde ne vient pas de kpi_snapshots : ce champ n'est jamais renseigné
    // (recalculateKpiSnapshots ne calcule que le P&L, pas balance/equity — et
    // aucun broker sync ne branche l'appel getAccountInfo() qui le fournirait).
    // On calcule donc directement : capital de départ déclaré par compte actif
    // (seule source pour les comptes MANUAL, sans sync broker live) + P&L
    // réalisé cumulé des trades clôturés. L'équité ajoute le P&L flottant des
    // positions ouvertes.
    const [openTrades, closedAgg, accounts] = await Promise.all([
      prisma.trade.findMany({
        where:  { userId, status: 'OPEN' },
        select: { lotSize: true, pnl: true, openPrice: true },
      }),
      prisma.trade.aggregate({
        where: { userId, status: 'CLOSED' },
        _sum:  { pnl: true },
      }),
      prisma.brokerAccount.findMany({
        where:  { userId, isActive: true, deletedAt: null },
        select: { startingBalance: true },
      }),
    ])

    const totalExposureLots = openTrades.reduce((s, t) => s + Number(t.lotSize), 0)
    const totalPnlOpen      = openTrades.reduce((s, t) => s + Number(t.pnl ?? 0), 0)
    const startingCapital   = accounts.reduce((s, a) => s + Number(a.startingBalance ?? 0), 0)
    const realizedPnl       = Number(closedAgg._sum.pnl ?? 0)
    const balance           = startingCapital + realizedPnl
    const equity            = balance + totalPnlOpen

    return {
      openPositionsCount: openTrades.length,
      totalExposureLots:  parseFloat(totalExposureLots.toFixed(2)),
      totalPnlOpen:       parseFloat(totalPnlOpen.toFixed(2)),
      balance:            parseFloat(balance.toFixed(2)),
      equity:             parseFloat(equity.toFixed(2)),
      riskPct: balance > 0 ? parseFloat((Math.abs(totalPnlOpen) / balance * 100).toFixed(2)) : 0,
    }
  },

  async getOpenPositions(userId: string) {
    const trades = await prisma.trade.findMany({
      where:   { userId, status: 'OPEN' },
      orderBy: { openTime: 'desc' },
      select: {
        id:             true,
        symbol:         true,
        direction:      true,
        openTime:       true,
        openPrice:      true,
        lotSize:        true,
        pnl:            true,
        swap:           true,
        commission:     true,
        strategyTag:    true,
        brokerAccountId: true,
      },
    })

    return trades.map(t => ({
      id:             t.id,
      symbol:         t.symbol,
      direction:      t.direction,
      openTime:       t.openTime.toISOString(),
      openPrice:      Number(t.openPrice),
      lotSize:        Number(t.lotSize),
      pnl:            Number(t.pnl ?? 0),
      swap:           Number(t.swap),
      commission:     Number(t.commission),
      strategyTag:    t.strategyTag ?? null,
      brokerAccountId: t.brokerAccountId,
    }))
  },

  async getBreakdown(userId: string) {
    // Open positions first; fallback to last 30 days closed trades
    const openTrades = await prisma.trade.findMany({
      where:  { userId, status: 'OPEN' },
      select: { symbol: true, lotSize: true, strategyTag: true, pnl: true },
    })

    const source = openTrades.length > 0 ? 'open' : 'closed_30d'
    let trades = openTrades

    if (trades.length === 0) {
      const from = new Date(Date.now() - 30 * 86_400_000)
      trades = await prisma.trade.findMany({
        where:  { userId, status: 'CLOSED', closeTime: { gte: from } },
        select: { symbol: true, lotSize: true, strategyTag: true, pnl: true },
      })
    }

    // By symbol
    const symbolMap = new Map<string, { lots: number; pnl: number; count: number }>()
    for (const t of trades) {
      const s = symbolMap.get(t.symbol) ?? { lots: 0, pnl: 0, count: 0 }
      s.lots  += Number(t.lotSize)
      s.pnl   += Number(t.pnl ?? 0)
      s.count += 1
      symbolMap.set(t.symbol, s)
    }
    const totalLots = Array.from(symbolMap.values()).reduce((s, v) => s + v.lots, 0)
    const bySymbol  = Array.from(symbolMap.entries())
      .map(([symbol, v]) => ({
        symbol,
        lots:  parseFloat(v.lots.toFixed(2)),
        pnl:   parseFloat(v.pnl.toFixed(2)),
        count: v.count,
        pct:   totalLots > 0 ? parseFloat((v.lots / totalLots * 100).toFixed(1)) : 0,
        color: symbolColor(symbol),
      }))
      .sort((a, b) => b.lots - a.lots)

    // By strategy
    const stratMap = new Map<string, { pnl: number; count: number }>()
    for (const t of trades) {
      const key = t.strategyTag ?? 'Sans stratégie'
      const s   = stratMap.get(key) ?? { pnl: 0, count: 0 }
      s.pnl   += Number(t.pnl ?? 0)
      s.count += 1
      stratMap.set(key, s)
    }
    const totalCount  = Array.from(stratMap.values()).reduce((s, v) => s + v.count, 0)
    const byStrategy  = Array.from(stratMap.entries())
      .map(([strategy, v]) => ({
        strategy,
        pnl:   parseFloat(v.pnl.toFixed(2)),
        count: v.count,
        pct:   totalCount > 0 ? parseFloat((v.count / totalCount * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.count - a.count)

    return { bySymbol, byStrategy, source }
  },

  async getEquityCurve(userId: string) {
    // Même raison qu'au-dessus : kpi_snapshots.balance/equity ne sont jamais
    // renseignés, on reconstruit donc la courbe depuis le capital de départ
    // des comptes actifs + le P&L réalisé jour par jour.
    const from = new Date(Date.now() - 90 * 86_400_000)

    const [accounts, trades] = await Promise.all([
      prisma.brokerAccount.findMany({
        where:  { userId, isActive: true, deletedAt: null },
        select: { startingBalance: true },
      }),
      prisma.trade.findMany({
        where:   { userId, status: 'CLOSED', closeTime: { gte: from } },
        select:  { closeTime: true, pnl: true },
        orderBy: { closeTime: 'asc' },
      }),
    ])

    const startingCapital = accounts.reduce((s, a) => s + Number(a.startingBalance ?? 0), 0)

    const byDay = new Map<string, number>()
    for (const t of trades) {
      if (!t.closeTime) continue
      const day = t.closeTime.toISOString().slice(0, 10)
      byDay.set(day, (byDay.get(day) ?? 0) + Number(t.pnl ?? 0))
    }

    let cumul = startingCapital
    return Array.from(byDay.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, dayPnl]) => {
        cumul += dayPnl
        return { date, balance: parseFloat(cumul.toFixed(2)), equity: parseFloat(cumul.toFixed(2)) }
      })
  },
}
