'use client'

import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api-client'
import type { KpiPeriod } from '@/lib/hooks/use-kpis'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PerformanceCurvePoint {
  date:        string
  pnl:         number
  cumPnl:      number
  drawdownPct: number  // 0–1
}

export interface SessionStat {
  session:  'Asia' | 'London' | 'Overlap' | 'New York' | 'After-Hours'
  nbTrades: number
  totalPnl: number
  winRate:  number
}

export interface WeekdayStat {
  day:      number  // 0 = Monday, 6 = Sunday
  label:    string
  nbTrades: number
  totalPnl: number
  winRate:  number
}

export interface HeatmapCell {
  dayOfWeek: number  // 0 = Monday
  hour:      number  // 0–23
  count:     number
  pnl:       number
}

export interface AdvancedStats {
  winRate:      number | null
  avgRR:        number | null
  avgDurationMs: number | null
  profitFactor: number | null
}

export interface RevengeTradingAlert {
  id:           string
  type:         'fast_reentry' | 'lot_increase' | 'both'
  symbol:       string
  openTime:     string
  minutesBetweenTrades: number
  lotSizeDelta: number
  prevLotSize:  number
  currLotSize:  number
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function usePerformanceCurve(from: string, to: string, accountId?: string) {
  const qs = new URLSearchParams({ from, to })
  if (accountId) qs.set('accountId', accountId)

  return useQuery({
    queryKey: ['performance', 'curve', from, to, accountId],
    queryFn:  () => apiFetch<PerformanceCurvePoint[]>(`/api/v1/performance/curve?${qs.toString()}`),
  })
}

export function useSessionStats(period: KpiPeriod = '30d', accountId?: string) {
  const qs = new URLSearchParams({ period })
  if (accountId) qs.set('accountId', accountId)

  return useQuery({
    queryKey: ['performance', 'sessions', period, accountId],
    queryFn:  () => apiFetch<SessionStat[]>(`/api/v1/performance/sessions?${qs.toString()}`),
  })
}

export function useWeekdayStats(period: KpiPeriod = '30d', accountId?: string) {
  const qs = new URLSearchParams({ period })
  if (accountId) qs.set('accountId', accountId)

  return useQuery({
    queryKey: ['performance', 'weekdays', period, accountId],
    queryFn:  () => apiFetch<WeekdayStat[]>(`/api/v1/performance/weekdays?${qs.toString()}`),
  })
}

export function useHeatmapData(period: KpiPeriod = '30d', accountId?: string) {
  const qs = new URLSearchParams({ period })
  if (accountId) qs.set('accountId', accountId)

  return useQuery({
    queryKey: ['performance', 'heatmap', period, accountId],
    queryFn:  () => apiFetch<HeatmapCell[]>(`/api/v1/performance/heatmap?${qs.toString()}`),
  })
}

export function useAdvancedStats(period: KpiPeriod = '30d', accountId?: string) {
  const qs = new URLSearchParams({ period })
  if (accountId) qs.set('accountId', accountId)

  return useQuery({
    queryKey: ['performance', 'stats', period, accountId],
    queryFn:  () => apiFetch<AdvancedStats>(`/api/v1/performance/stats?${qs.toString()}`),
  })
}

export function useRevengeTradingAlerts(
  period: KpiPeriod = '30d',
  config?: { timeThresholdMin: number; lotIncreasePct: number },
) {
  const threshold = config?.timeThresholdMin ?? 30
  const lotPct    = config?.lotIncreasePct   ?? 20
  const qs = new URLSearchParams({
    period,
    threshold: String(threshold),
    lotPct:    String(lotPct),
  })

  return useQuery({
    queryKey: ['performance', 'revenge-trading', period, threshold, lotPct],
    queryFn:  () => apiFetch<RevengeTradingAlert[]>(`/api/v1/performance/revenge-trading?${qs.toString()}`),
  })
}
