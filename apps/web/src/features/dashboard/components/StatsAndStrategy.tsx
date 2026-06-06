'use client'

import Link from 'next/link'
import { useKpiSummary, useKpiDetailedStats, type KpiPeriod } from '@/lib/hooks/use-kpis'
import type { KpiBreakdown } from '@/lib/api-client'

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

export function StatsCles({ period = '30d', accountId }: { period?: KpiPeriod; accountId?: string | undefined }) {
  const { data: summary, isLoading: l1 } = useKpiSummary(period, accountId)
  const { data: stats,   isLoading: l2 } = useKpiDetailedStats(period, accountId)
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
    <div className="rounded-lg border border-border bg-background p-5 shadow-[0_14px_40px_rgba(0,0,0,0.18)] lg:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Lecture rapide</p>
          <h3 className="mt-1 text-base font-black text-white">Statistiques clés</h3>
        </div>
        <Link href="/app/trades" className="text-xs font-black text-blue-300 transition-colors hover:text-blue-200">Voir toutes</Link>
      </div>
      {isLoading ? <Skeleton /> : (
        <div className="space-y-2.5">
          {rows.map(({ label, value, color }) => (
            <div key={label} className="flex items-center justify-between rounded-md border border-border bg-[#071017] px-3 py-2.5">
              <span className="text-sm font-semibold text-muted-foreground">{label}</span>
              <span className={`text-xs font-semibold font-mono ${color}`}>{value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function StrategyPerformance({
  data,
  isLoading = false,
}: {
  data?: KpiBreakdown | undefined
  isLoading?: boolean
}) {
  const strategies = data?.byStrategy ?? []

  const maxAbs = strategies.length > 0
    ? Math.max(...strategies.map(s => Math.abs(s.pnl)), 1)
    : 1

  return (
    <div className="rounded-lg border border-border bg-background p-5 shadow-[0_14px_40px_rgba(0,0,0,0.18)] lg:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Edges</p>
          <h3 className="mt-1 text-base font-black text-white">Performance par stratégie</h3>
        </div>
        <Link href="/app/performance" className="text-xs font-black text-blue-300 transition-colors hover:text-blue-200">Voir toutes</Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-8 animate-pulse rounded bg-white/[0.04]" />
          ))}
        </div>
      ) : strategies.length === 0 ? (
        <div className="flex min-h-32 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-[#071017] px-4 py-6 text-center">
          <p className="text-xs font-semibold text-muted-foreground">
            Annotez vos trades avec une stratégie pour voir cette section.
          </p>
          <Link
            href="/app/trades"
            className="mt-3 rounded-md border border-border px-3 py-2 text-xs font-black text-foreground/80 transition-colors hover:border-blue-500 hover:text-foreground"
          >
            Annoter un trade
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {strategies.map((s) => {
            const barWidth = (Math.abs(s.pnl) / maxAbs) * 100
            return (
              <div key={s.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="max-w-[60%] truncate text-sm text-muted-foreground">{s.name}</span>
                  <span className={`text-xs font-semibold font-mono ${s.positive ? 'text-[#38e476]' : 'text-[#ff5e70]'}`}>
                    {s.positive ? '+' : ''}{s.pnl.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-accent">
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
