'use client'

import { useKpiSummary, useKpiDetailedStats, useKpiBreakdown, type KpiPeriod } from '@/lib/hooks/use-kpis'

function fmt(n: number) {
  return n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
}

function Skeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-4 animate-pulse rounded bg-white/[0.04]" />
      ))}
    </div>
  )
}

export function StatsCles({ period = '30d' }: { period?: KpiPeriod }) {
  const { data: summary, isLoading: l1 } = useKpiSummary(period)
  const { data: stats,   isLoading: l2 } = useKpiDetailedStats(period)
  const isLoading = l1 || l2

  const total     = summary?.nbTrades ?? 0
  const winCount  = stats?.winTrades  ?? 0
  const lossCount = stats?.lossTrades ?? 0

  const rows = [
    { label: 'Nb total de trades', value: summary ? total.toString() : '—', color: 'text-white' },
    {
      label: 'Trades gagnants',
      value: stats ? `${winCount} (${total > 0 ? ((winCount / total) * 100).toFixed(1) : 0}%)` : '—',
      color: 'text-[#38e476]',
    },
    {
      label: 'Trades perdants',
      value: stats ? `${lossCount} (${total > 0 ? ((lossCount / total) * 100).toFixed(1) : 0}%)` : '—',
      color: 'text-[#ff5e70]',
    },
    { label: 'Meilleur trade', value: stats?.bestTrade ? `+${fmt(stats.bestTrade)}` : '—', color: 'text-[#38e476]' },
    { label: 'Pire trade', value: stats?.worstTrade ? fmt(stats.worstTrade) : '—', color: 'text-[#ff5e70]' },
    { label: 'Gain moyen', value: stats?.avgWin ? `+${fmt(stats.avgWin)}` : '—', color: 'text-[#38e476]' },
    { label: 'Perte moyenne', value: stats?.avgLoss ? fmt(stats.avgLoss) : '—', color: 'text-[#ff5e70]' },
  ]

  return (
    <div className="rounded-2xl border border-[#1e2f4a] bg-[#0b1527] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.035),0_18px_60px_rgba(0,0,0,0.22)]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-white">Statistiques clés</h3>
        <button className="text-xs font-semibold text-[#a798ff] transition-colors hover:text-[#c9bcff]">Voir toutes</button>
      </div>
      {isLoading ? <Skeleton /> : (
        <div className="space-y-2.5">
          {rows.map(({ label, value, color }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-sm text-slate-500">{label}</span>
              <span className={`text-xs font-semibold font-mono ${color}`}>{value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function StrategyPerformance({ period = '30d' }: { period?: KpiPeriod }) {
  const { data, isLoading } = useKpiBreakdown(period)
  const strategies = data?.byStrategy ?? []

  const maxAbs = strategies.length > 0
    ? Math.max(...strategies.map(s => Math.abs(s.pnl)), 1)
    : 1

  return (
    <div className="rounded-2xl border border-[#1e2f4a] bg-[#0b1527] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.035),0_18px_60px_rgba(0,0,0,0.22)]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-white">Performance par stratégie</h3>
        <button className="text-xs font-semibold text-[#a798ff] transition-colors hover:text-[#c9bcff]">Voir toutes</button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-8 animate-pulse rounded bg-white/[0.04]" />
          ))}
        </div>
      ) : strategies.length === 0 ? (
        <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-[#223653] bg-[#081220] text-xs text-slate-500">
          Annotez vos trades avec une stratégie pour voir cette section
        </div>
      ) : (
        <div className="space-y-4">
          {strategies.map((s) => {
            const barWidth = (Math.abs(s.pnl) / maxAbs) * 100
            return (
              <div key={s.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="max-w-[60%] truncate text-sm text-slate-300">{s.name}</span>
                  <span className={`text-xs font-semibold font-mono ${s.positive ? 'text-[#38e476]' : 'text-[#ff5e70]'}`}>
                    {s.positive ? '+' : ''}{s.pnl.toLocaleString('fr-FR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#15243a]">
                  <div
                    className={`h-full rounded-full transition-all ${s.positive ? 'bg-[#38e476]' : 'bg-[#ff5e70]'}`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
