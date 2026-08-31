'use client'

import Link from 'next/link'
import { useKpiSummary, useKpiDetailedStats, type KpiPeriod } from '@/lib/hooks/use-kpis'
import { useCurrency } from '@/lib/hooks/use-currency'
import { formatMoney } from '@/lib/format'
import type { KpiBreakdown } from '@/lib/api-client'
import { SectionHeader, EmptyState } from './_ui'

function Skeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-4 animate-pulse rounded bg-[hsl(var(--accent))]" />
      ))}
    </div>
  )
}

export function StatsCles({ period = '30d', accountId }: { period?: KpiPeriod; accountId?: string | undefined }) {
  const { isLoading: l1 } = useKpiSummary(period, accountId)
  const { data: stats,   isLoading: l2 } = useKpiDetailedStats(period, accountId)
  const currency = useCurrency()
  const isLoading = l1 || l2

  const money = (n: number) => formatMoney(n, { currency, signed: true, fractionDigits: 0 })

  // Nb de trades et gagnants/perdants sont déjà portés par le bandeau d'en-tête :
  // cette carte ne garde que les extrêmes et les moyennes, qu'on ne trouve nulle part ailleurs.
  const rows = [
    { label: 'Meilleur trade', value: stats?.bestTrade ? money(stats.bestTrade) : '—', color: 'text-green-500' },
    { label: 'Pire trade', value: stats?.worstTrade ? money(stats.worstTrade) : '—', color: 'text-red-500' },
    { label: 'Gain moyen', value: stats?.avgWin ? money(stats.avgWin) : '—', color: 'text-green-500' },
    { label: 'Perte moyenne', value: stats?.avgLoss ? money(stats.avgLoss) : '—', color: 'text-red-500' },
  ]

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <SectionHeader
        className="mb-5"
        eyebrow="Lecture rapide"
        title="Statistiques clés"
        action={<Link href="/app/trades" className="shrink-0 text-xs font-bold text-[hsl(var(--primary))] transition-colors hover:text-[hsl(243_90%_58%)]">Voir toutes</Link>}
      />
      {isLoading ? <Skeleton /> : (
        <div className="space-y-2.5">
          {rows.map(({ label, value, color }) => (
            <div key={label} className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-2.5">
              <span className="text-sm font-semibold text-muted-foreground">{label}</span>
              <span className={`text-xs font-semibold tabular-nums ${color}`}>{value}</span>
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
  const currency = useCurrency()
  const strategies = data?.byStrategy ?? []

  const maxAbs = strategies.length > 0
    ? Math.max(...strategies.map(s => Math.abs(s.pnl)), 1)
    : 1

  return (
    <div className="h-full rounded-lg border border-border bg-card p-6">
      <SectionHeader
        className="mb-5"
        eyebrow="Edges"
        title="Performance par stratégie"
        action={<Link href="/app/performance" className="shrink-0 text-xs font-bold text-[hsl(var(--primary))] transition-colors hover:text-[hsl(243_90%_58%)]">Voir toutes</Link>}
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-8 animate-pulse rounded bg-[hsl(var(--accent))]" />
          ))}
        </div>
      ) : strategies.length === 0 ? (
        <EmptyState
          title="Aucune stratégie annotée"
          hint="Annotez vos trades avec une stratégie pour révéler vos edges."
          action={
            <Link
              href="/app/trades"
              className="mt-1 rounded-md border border-border px-3 py-2 text-xs font-bold text-foreground/80 transition-colors hover:border-[hsl(var(--primary))] hover:text-foreground"
            >
              Annoter un trade
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {strategies.map((s) => {
            const barWidth = (Math.abs(s.pnl) / maxAbs) * 100
            return (
              <div key={s.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="max-w-[60%] truncate text-sm text-muted-foreground">{s.name}</span>
                  <span className={`text-xs font-semibold tabular-nums ${s.positive ? 'text-green-500' : 'text-red-500'}`}>
                    {formatMoney(s.pnl, { currency, signed: true, fractionDigits: 0 })}
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
