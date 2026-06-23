'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { format, subDays, startOfYear } from 'date-fns'

export type KpiPeriod = '7d' | '30d' | '90d' | '1y' | 'all'
export type ChartPeriod = '1J' | '7J' | '1M' | '3M' | '6M' | 'YTD' | '1Y' | 'ALL'

function chartPeriodToApiPeriod(p: ChartPeriod): KpiPeriod {
  switch (p) {
    case '1J':  return '7d'
    case '7J':  return '7d'
    case '1M':  return '30d'
    case '3M':  return '90d'
    case '6M':  return '90d'
    case 'YTD': return '1y'
    case '1Y':  return '1y'
    case 'ALL': return 'all'
  }
}

function chartPeriodToDates(p: ChartPeriod): { from: string; to: string } {
  const to  = new Date()
  let   from: Date

  switch (p) {
    case '1J':  from = subDays(to, 1);   break
    case '7J':  from = subDays(to, 7);   break
    case '1M':  from = subDays(to, 30);  break
    case '3M':  from = subDays(to, 90);  break
    case '6M':  from = subDays(to, 180); break
    case 'YTD': from = startOfYear(to);  break
    case '1Y':  from = subDays(to, 365); break
    case 'ALL': from = new Date('2020-01-01'); break
  }

  return {
    from: format(from, 'yyyy-MM-dd'),
    to:   format(to,   'yyyy-MM-dd'),
  }
}

export function useKpiSummary(period: KpiPeriod = '30d', accountId?: string) {
  return useQuery({
    queryKey: ['kpis', 'summary', period, accountId],
    queryFn:  () => api.kpis.summary(period, accountId),
  })
}

export function useKpiSnapshots(chartPeriod: ChartPeriod = '1M', accountId?: string) {
  const { from, to } = chartPeriodToDates(chartPeriod)

  return useQuery({
    queryKey: ['kpis', 'snapshots', from, to, accountId],
    queryFn:  () => api.kpis.snapshots(from, to, accountId),
    select:   (data) => {
      // Calcule la courbe PnL cumulé depuis le début de la période
      let cumul = 0
      return data.map((s) => ({
        date:    format(new Date(s.date), 'dd MMM'),
        pnl:     Number(s.totalPnl ?? 0),
        cumPnl:  (cumul += Number(s.totalPnl ?? 0)),
        nbTrades: s.nbTrades ?? 0,
      }))
    },
  })
}

export function useKpiDetailedStats(period: KpiPeriod = '30d', accountId?: string) {
  return useQuery({
    queryKey: ['kpis', 'stats', period, accountId],
    queryFn:  () => api.kpis.stats(period, accountId),
  })
}

export function useKpiBreakdown(period: KpiPeriod = '30d', accountId?: string, enabled = true) {
  return useQuery({
    queryKey: ['kpis', 'breakdown', period, accountId],
    queryFn:  () => api.kpis.breakdown(period, accountId),
    enabled,
  })
}

export function useBehavioral(period: KpiPeriod = '30d') {
  return useQuery({
    queryKey: ['kpis', 'behavioral', period],
    queryFn:  () => api.kpis.behavioral(period),
  })
}

export function useAiScore(period: KpiPeriod = '30d') {
  return useQuery({
    queryKey: ['kpis', 'ai-score', period],
    queryFn:  () => api.kpis.aiScore(period),
  })
}

export function usePropFirmCompliance(accountSize: number, from?: string) {
  return useQuery({
    queryKey: ['prop-firm', 'compliance', accountSize, from ?? 'all'],
    queryFn:  () => api.propFirm.compliance(accountSize, from),
    enabled:  accountSize > 0,
    refetchInterval: 2 * 60 * 1000,
  })
}

export { chartPeriodToApiPeriod }
