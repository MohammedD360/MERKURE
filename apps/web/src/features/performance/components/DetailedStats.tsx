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
    <div className="flex flex-col gap-1 rounded-lg border border-slate-800 bg-background p-4 shadow-[0_10px_34px_rgba(0,0,0,0.14)]">
      <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">{label}</span>
      {loading ? (
        <div className="mt-1 h-7 w-20 animate-pulse rounded bg-slate-800" />
      ) : (
        <span className="font-mono text-2xl font-black text-white">{value}</span>
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
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatCard label="Win Rate"      value={winRate}      loading={loading} />
      <StatCard label="Avg R:R"       value={avgRR}        loading={loading} />
      <StatCard label="Durée moy."    value={avgDuration}  loading={loading} />
      <StatCard label="Profit Factor" value={profitFactor} loading={loading} />
    </div>
  )
}
