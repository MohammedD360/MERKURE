import type { Period } from './trades.js'

export interface KpiSnapshot {
  date: string
  balance: number
  equity: number
  totalPnl: number
  winRate: number          // 0-1
  profitFactor: number
  sharpeRatio: number
  maxDrawdown: number      // valeur négative, ex: -0.12 = -12%
  nbTrades: number
  avgRr: number
}

export interface KpiSummary {
  period: Period
  current: KpiSnapshot
  previous?: KpiSnapshot   // Pour calculer les deltas
  equityCurve: Array<{
    date: string
    value: number
  }>
  assetBreakdown: Array<{
    symbol: string
    totalPnl: number
    nbTrades: number
    pct: number
  }>
}

export interface DashboardData {
  kpis: KpiSummary
  recentTrades: import('./trades.js').Trade[]
  openPositions: import('./trades.js').Trade[]
  activeAccountsCount: number
}
