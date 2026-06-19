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
        <div key={i} className="h-4 animate-pulse rounded bg-[hsl(var(--accent))]" />
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
    { label: 'Nb total de trades', value: summary ? total.toString() : '—', color: 'text-foreground' },
    {
      label: 'Trades gagnants',
      value: stats ? `${winCount} (${total > 0 ? ((winCount / total) * 100).toFixed(1) : 0}%)` : '—',
      color: 'text-emerald-600',
    },
    {
      label: 'Trades perdants',
      value: stats ? `${lossCount} (${total > 0 ? ((lossCount / total) * 100).toFixed(1) : 0}%)` : '—',
      color: 'text-red-500',
    },
    { label: 'Meilleur trade', value: stats?.bestTrade ? `+${fmt(stats.bestTrade)}` : '—', color: 'text-emerald-600' },
    { label: 'Pire trade', value: stats?.worstTrade ? fmt(stats.worstTrade) : '—', color: 'text-red-500' },
    { label: 'Gain moyen', value: stats?.avgWin ? `+${fmt(stats.avgWin)}` : '—', color: 'text-emerald-600' },
    { label: 'Perte moyenne', value: stats?.avgLoss ? fmt(stats.avgLoss) : '—', color: 'text-red-500' },
  ]

  return (
    <div className="rounded-lg border border-border bg-white p-5 shadow-sm lg:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Lecture rapide</p>
          <h3 className="mt-1 text-base font-black text-foreground">Statistiques clés</h3>
        </div>
        <Link href="/app/trades" className="text-xs font-black text-[hsl(var(--primary))] transition-colors hover:text-[hsl(244_42%_44%)]">Voir toutes</Link>
      </div>
      {isLoading ? <Skeleton /> : (
        <div className="space-y-2.5">
          {rows.map(({ label, value, color }) => (
            <div key={label} className="flex items-center justify-between rounded-md border border-border bg-white px-3 py-2.5">
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
    <div className="rounded-lg border border-border bg-white p-5 shadow-sm lg:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Edges</p>
          <h3 className="mt-1 text-base font-black text-foreground">Performance par stratégie</h3>
        </div>
        <Link href="/app/performance" className="text-xs font-black text-[hsl(var(--primary))] transition-colors hover:text-[hsl(244_42%_44%)]">Voir toutes</Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-8 animate-pulse rounded bg-[hsl(var(--accent))]" />
          ))}
        </div>
      ) : strategies.length === 0 ? (
        <div className="flex min-h-32 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-white px-4 py-6 text-center">
          <p className="text-xs font-semibold text-muted-foreground">
            Annotez vos trades avec une stratégie pour voir cette section.
          </p>
          <Link
            href="/app/trades"
            className="mt-3 rounded-md border border-border px-3 py-2 text-xs font-black text-foreground/80 transition-colors hover:border-[hsl(var(--primary))] hover:text-foreground"
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
                  <span className={`text-xs font-semibold font-mono ${s.positive ? 'text-emerald-600' : 'text-red-500'}`}>
                    {s.positive ? '+' : ''}{s.pnl.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-accent">
                  <div
                    className={`h-full rounded-full transition-all ${s.positive ? 'bg-emerald-500' : 'bg-red-500'}`}
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
