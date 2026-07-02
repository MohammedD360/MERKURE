import { useQuery } from '@tanstack/react-query'
import { api } from '@/src/lib/api-client'
import type { ChartPeriod } from '@/src/components/PeriodSelector'
import { chartPeriodToApiPeriod } from '@/src/components/PeriodSelector'

export function useWeekdayStats(chartPeriod: ChartPeriod = '1M', accountId?: string) {
  const period = chartPeriodToApiPeriod(chartPeriod)
  return useQuery({
    queryKey: ['performance', 'weekdays', period, accountId],
    queryFn: () => api.performance.weekdays(period, accountId),
  })
}

export function useSessionStats(chartPeriod: ChartPeriod = '1M', accountId?: string) {
  const period = chartPeriodToApiPeriod(chartPeriod)
  return useQuery({
    queryKey: ['performance', 'sessions', period, accountId],
    queryFn: () => api.performance.sessions(period, accountId),
  })
}

export function useHeatmapData(chartPeriod: ChartPeriod = '1M', accountId?: string) {
  const period = chartPeriodToApiPeriod(chartPeriod)
  return useQuery({
    queryKey: ['performance', 'heatmap', period, accountId],
    queryFn: () => api.performance.heatmap(period, accountId),
  })
}

export function useRevengeAlerts(chartPeriod: ChartPeriod = '1M') {
  const period = chartPeriodToApiPeriod(chartPeriod)
  return useQuery({
    queryKey: ['performance', 'revenge', period],
    queryFn: () => api.performance.revenge(period),
  })
}

export function useAdvancedStats(chartPeriod: ChartPeriod = '1M', accountId?: string) {
  const period = chartPeriodToApiPeriod(chartPeriod)
  return useQuery({
    queryKey: ['performance', 'advanced', period, accountId],
    queryFn: () => api.performance.advancedStats(period, accountId),
  })
}