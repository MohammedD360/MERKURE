import { useQuery } from '@tanstack/react-query'
import { format, subDays, startOfYear } from 'date-fns'
import { api } from '@/src/lib/api-client'
import type { ChartPeriod } from '@/src/components/PeriodSelector'
import { chartPeriodToApiPeriod } from '@/src/components/PeriodSelector'

function chartPeriodToDates(p: ChartPeriod): { from: string; to: string } {
  const to = new Date()
  let from: Date
  switch (p) {
    case '7J':
      from = subDays(to, 7)
      break
    case '1M':
      from = subDays(to, 30)
      break
    case '3M':
      from = subDays(to, 90)
      break
    case 'YTD':
      from = startOfYear(to)
      break
    case 'ALL':
      from = new Date('2020-01-01')
      break
  }
  return { from: format(from, 'yyyy-MM-dd'), to: format(to, 'yyyy-MM-dd') }
}

export function useKpiSummary(chartPeriod: ChartPeriod = '1M') {
  const period = chartPeriodToApiPeriod(chartPeriod)
  return useQuery({
    queryKey: ['kpis', 'summary', period],
    queryFn: () => api.kpis.summary(period),
  })
}

export function useKpiSnapshots(chartPeriod: ChartPeriod = '1M') {
  const { from, to } = chartPeriodToDates(chartPeriod)
  return useQuery({
    queryKey: ['kpis', 'snapshots', from, to],
    queryFn: () => api.kpis.snapshots(from, to),
    select: (data) => {
      let cumul = 0
      return data.map((s) => ({
        date: format(new Date(s.date), 'dd MMM'),
        cumPnl: (cumul += Number(s.totalPnl ?? 0)),
      }))
    },
  })
}

export function useKpiBreakdown(chartPeriod: ChartPeriod = '1M') {
  const period = chartPeriodToApiPeriod(chartPeriod)
  return useQuery({
    queryKey: ['kpis', 'breakdown', period],
    queryFn: () => api.kpis.breakdown(period),
  })
}

export function useAiScore(chartPeriod: ChartPeriod = '1M') {
  const period = chartPeriodToApiPeriod(chartPeriod)
  return useQuery({
    queryKey: ['kpis', 'ai-score', period],
    queryFn: () => api.kpis.aiScore(period),
  })
}

export function useKpiStats(chartPeriod: ChartPeriod = '1M') {
  const period = chartPeriodToApiPeriod(chartPeriod)
  return useQuery({
    queryKey: ['kpis', 'stats', period],
    queryFn: () => api.kpis.stats(period),
  })
}