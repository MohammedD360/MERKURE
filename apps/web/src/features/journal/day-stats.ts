import type { Trade } from '@/lib/hooks/use-trades'

/**
 * Bornes UTC d'une journée — le backend agrège le calendrier sur `closeTime`
 * en UTC (journal.repository.getCalendar), on filtre donc à l'identique pour
 * que les trades listés correspondent exactement au P&L de la case du jour.
 */
export function dayBounds(date: string): { dateFrom: string; dateTo: string } {
  return { dateFrom: `${date}T00:00:00.000Z`, dateTo: `${date}T23:59:59.999Z` }
}

export interface DayStats {
  netPnl:       number
  trades:       number
  winners:      number
  losers:       number
  breakeven:    number
  winRate:      number | null
  profitFactor: number | null   // null = aucune perte (facteur infini)
  volume:       number          // somme des lots
  fees:         number          // commissions + swaps
  bestTrade:    number | null
  worstTrade:   number | null
}

export function computeDayStats(trades: Trade[]): DayStats {
  const closed = trades.filter(t => t.pnl != null)
  const pnls   = closed.map(t => Number(t.pnl))

  const winners   = pnls.filter(p => p > 0)
  const losers    = pnls.filter(p => p < 0)
  const breakeven = pnls.filter(p => p === 0).length

  const grossWin  = winners.reduce((s, p) => s + p, 0)
  const grossLoss = Math.abs(losers.reduce((s, p) => s + p, 0))

  return {
    netPnl:       pnls.reduce((s, p) => s + p, 0),
    trades:       closed.length,
    winners:      winners.length,
    losers:       losers.length,
    breakeven,
    winRate:      closed.length > 0 ? (winners.length / closed.length) * 100 : null,
    profitFactor: grossLoss > 0 ? grossWin / grossLoss : null,
    volume:       trades.reduce((s, t) => s + Number(t.lotSize ?? 0), 0),
    fees:         trades.reduce((s, t) => s + Number(t.commission ?? 0) + Number(t.swap ?? 0), 0),
    bestTrade:    pnls.length > 0 ? Math.max(...pnls) : null,
    worstTrade:   pnls.length > 0 ? Math.min(...pnls) : null,
  }
}

/** Courbe cumulée intrajournalière, ordonnée par heure de clôture. */
export function buildIntradayCurve(trades: Trade[]): Array<{ time: string; cum: number; pnl: number; symbol: string }> {
  const closed = trades
    .filter(t => t.pnl != null && t.closeTime)
    .sort((a, b) => new Date(a.closeTime!).getTime() - new Date(b.closeTime!).getTime())

  let cum = 0
  return closed.map(t => {
    const pnl = Number(t.pnl)
    cum += pnl
    return {
      time: new Date(t.closeTime!).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      cum: Math.round(cum * 100) / 100,
      pnl,
      symbol: t.symbol,
    }
  })
}
