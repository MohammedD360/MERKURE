'use client'

import { useAdvancedStats } from '@/lib/hooks/use-performance'
import { useKpiSummary } from '@/lib/hooks/use-kpis'
import type { KpiPeriod } from '@/lib/hooks/use-kpis'

interface Props {
  period:     KpiPeriod
  accountId?: string
}

function StatCard({ label, value, loading }: { label: string; value: string; loading: boolean }) {
  return (
    <div className="bg-[#090d14] border border-gray-800/60 rounded-xl p-4 flex flex-col gap-1">
      <span className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">{label}</span>
      {loading ? (
        <div className="h-7 w-20 animate-pulse bg-gray-800 rounded mt-1" />
      ) : (
        <span className="text-2xl font-bold text-white font-mono">{value}</span>
      )}
    </div>
  )
}

function formatDuration(ms: number | null): string {
  if (ms === null) return '—'
  const totalMin = Math.floor(ms / 60_000)
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  if (h === 0) return `${m}m`
  return `${h}h ${m}m`
}

export function DetailedStats({ period, accountId }: Props) {
  const advQuery = useAdvancedStats(period, ...accountId ? [accountId] : [])
  const kpiQuery = useKpiSummary(period)

  const loading = advQuery.isLoading || kpiQuery.isLoading
  const adv     = advQuery.data
  const kpi     = kpiQuery.data

  const winRate = adv?.winRate != null
    ? `${(adv.winRate * 100).toFixed(1)} %`
    : kpi?.winRate != null
    ? `${(kpi.winRate * 100).toFixed(1)} %`
    : '—'

  const avgRR = adv?.avgRR != null ? adv.avgRR.toFixed(2) : '—'

  const avgDuration = formatDuration(adv?.avgDurationMs ?? null)

  const profitFactor = adv?.profitFactor != null
    ? adv.profitFactor.toFixed(2)
    : kpi?.profitFactor != null
    ? kpi.profitFactor.toFixed(2)
    : '—'

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <StatCard label="Win Rate"      value={winRate}      loading={loading} />
      <StatCard label="Avg R:R"       value={avgRR}        loading={loading} />
      <StatCard label="Durée moy."    value={avgDuration}  loading={loading} />
      <StatCard label="Profit Factor" value={profitFactor} loading={loading} />
    </div>
  )
}
