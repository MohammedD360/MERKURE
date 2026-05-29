'use client'

import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api-client'
import type { KpiPeriod } from '@/lib/hooks/use-kpis'

export interface MonthlyRow {
  month:        string
  nbTrades:     number
  totalPnl:     number
  winRate:      number
  profitFactor: number | null
}

export interface SymbolStat {
  symbol:       string
  nbTrades:     number
  winRate:      number
  totalPnl:     number
  avgPnl:       number
  profitFactor: number | null
  bestTrade:    number
  worstTrade:   number
}

export interface DistributionBucket {
  bucket: number
  count:  number
  label:  string
}

export interface StreakData {
  current:       number
  currentType:   'win' | 'loss' | null
  longestWin:    number
  longestLoss:   number
  avgWinStreak:  number
  avgLossStreak: number
}

export function useMonthlyStats(months = 12) {
  return useQuery({
    queryKey: ['stats', 'monthly', months],
    queryFn:  () => apiFetch<MonthlyRow[]>(`/api/v1/stats/monthly?months=${months}`),
  })
}

export function useSymbolStats(period: KpiPeriod = '30d') {
  return useQuery({
    queryKey: ['stats', 'by-symbol', period],
    queryFn:  () => apiFetch<SymbolStat[]>(`/api/v1/stats/by-symbol?period=${period}`),
  })
}

export function usePnlDistribution(period: KpiPeriod = '30d') {
  return useQuery({
    queryKey: ['stats', 'distribution', period],
    queryFn:  () => apiFetch<DistributionBucket[]>(`/api/v1/stats/distribution?period=${period}`),
  })
}

export function useStreaks(period: KpiPeriod = '30d') {
  return useQuery({
    queryKey: ['stats', 'streaks', period],
    queryFn:  () => apiFetch<StreakData>(`/api/v1/stats/streaks?period=${period}`),
  })
}
