'use client'

import {
  Activity, CalendarDays, Target, TrendingDown, TrendingUp,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useKpiSummary, type KpiPeriod } from '@/lib/hooks/use-kpis'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

const PERIOD_LABELS: Record<KpiPeriod, string> = {
  '7d':  '7 jours',
  '30d': '30 jours',
  '90d': '90 jours',
  '1y':  '1 an',
  all:   'total',
}

function formatMoney(value: number, signed = false) {
  const formatted = value.toLocaleString('fr-FR', {
    style: 'currency', currency: 'EUR',
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  })
  return signed && value > 0 ? `+${formatted}` : formatted
}

function formatPct(value: number) {
  return `${value.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`
}

function KpiCard({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <Card className="h-full min-h-[120px]">
      <CardContent className="flex h-full flex-col p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-muted-foreground">
            {icon}
          </div>
        </div>
        <div className="flex flex-1 flex-col justify-end">{children}</div>
      </CardContent>
    </Card>
  )
}

function WinRateRing({ value }: { value: number | null }) {
  const radius = 20
  const circumference = 2 * Math.PI * radius
  const safeValue = value == null ? 0 : Math.max(0, Math.min(value, 100))
  const filled = (safeValue / 100) * circumference

  return (
    <svg width="52" height="52" viewBox="0 0 56 56" className="shrink-0">
      <circle cx="28" cy="28" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="5" />
      <circle
        cx="28" cy="28" r={radius} fill="none"
        stroke="hsl(var(--sidebar-primary))"
        strokeWidth="5"
        strokeDasharray={`${filled} ${circumference - filled}`}
        strokeLinecap="round"
        transform="rotate(-90 28 28)"
      />
    </svg>
  )
}

export function KpiCards({ period = '30d', accountId }: { period?: KpiPeriod; accountId?: string | undefined }) {
  const { data, isLoading } = useKpiSummary(period, accountId)

  const totalPnl    = data?.totalPnl
  const drawdownPct = data?.maxDrawdown != null ? Math.abs(data.maxDrawdown * 100) : null
  const winRatePct  = data ? data.winRate * 100 : null
  const winTrades   = data ? Math.round(data.winRate * data.nbTrades) : null
  const pnlPositive = totalPnl == null || totalPnl >= 0

  const drawdownLabel = drawdownPct == null ? null
    : drawdownPct <= 5 ? 'Risque contenu'
    : drawdownPct <= 12 ? 'À surveiller' : 'Risque élevé'

  const profitLabel = data?.profitFactor == null ? null
    : data.profitFactor >= 1.5 ? 'Solide'
    : data.profitFactor >= 1 ? 'Neutre' : 'Faible'

  return (
    <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 xl:grid-cols-6">

      {/* P&L */}
      <KpiCard
        title={`P&L ${PERIOD_LABELS[period]}`}
        icon={pnlPositive
          ? <TrendingUp className="h-4 w-4 text-emerald-400" />
          : <TrendingDown className="h-4 w-4 text-red-400" />}
      >
        {isLoading ? (
          <><Skeleton className="mb-2 h-8 w-32" /><Skeleton className="h-3.5 w-20" /></>
        ) : totalPnl == null ? (
          <p className="font-mono text-2xl font-bold text-muted-foreground">—</p>
        ) : (
          <>
            <p className={cn('font-mono text-2xl font-bold tracking-tight', pnlPositive ? 'text-emerald-400' : 'text-red-400')}>
              {formatMoney(totalPnl, true)}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              {data && data.nbTrades > 0 ? `${data.nbTrades} trades` : 'Aucun trade'}
            </p>
          </>
        )}
      </KpiCard>

      {/* Trades */}
      <KpiCard title="Trades" icon={<Activity className="h-4 w-4 text-[hsl(var(--sidebar-primary))]" />}>
        {isLoading ? (
          <><Skeleton className="mb-2 h-8 w-16" /><Skeleton className="h-3.5 w-24" /></>
        ) : data ? (
          <>
            <p className="font-mono text-2xl font-bold text-foreground">{data.nbTrades}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              {winRatePct == null ? '—' : `${formatPct(winRatePct)} de réussite`}
            </p>
          </>
        ) : (
          <p className="font-mono text-2xl font-bold text-muted-foreground">—</p>
        )}
      </KpiCard>

      {/* Drawdown */}
      <KpiCard title="Drawdown Max" icon={<TrendingDown className="h-4 w-4 text-red-400" />}>
        {isLoading ? (
          <><Skeleton className="mb-2 h-8 w-24" /><Skeleton className="h-3.5 w-20" /></>
        ) : drawdownPct == null ? (
          <p className="font-mono text-2xl font-bold text-muted-foreground">—</p>
        ) : (
          <>
            <p className="font-mono text-2xl font-bold tracking-tight text-red-400">
              -{formatPct(drawdownPct)}
            </p>
            {drawdownLabel && <p className="mt-2 text-xs text-muted-foreground">{drawdownLabel}</p>}
          </>
        )}
      </KpiCard>

      {/* Win Rate */}
      <KpiCard title="Win Rate" icon={<Target className="h-4 w-4 text-[hsl(var(--sidebar-primary))]" />}>
        {isLoading ? (
          <div className="flex items-end gap-3">
            <Skeleton className="h-[52px] w-[52px] rounded-full" />
            <div><Skeleton className="mb-2 h-7 w-20" /><Skeleton className="h-3.5 w-20" /></div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <WinRateRing value={winRatePct} />
            <div className="min-w-0">
              <p className="font-mono text-2xl font-bold text-foreground">
                {winRatePct == null ? '—' : formatPct(winRatePct)}
              </p>
              {data && winTrades != null && (
                <p className="mt-1 text-xs text-muted-foreground">{winTrades} / {data.nbTrades}</p>
              )}
            </div>
          </div>
        )}
      </KpiCard>

      {/* Profit Factor */}
      <KpiCard title="Profit Factor" icon={<Target className="h-4 w-4 text-emerald-400" />}>
        {isLoading ? (
          <><Skeleton className="mb-2 h-8 w-20" /><Skeleton className="h-3.5 w-16" /></>
        ) : data?.profitFactor == null ? (
          <p className="font-mono text-2xl font-bold text-muted-foreground">—</p>
        ) : (
          <>
            <p className="font-mono text-2xl font-bold text-foreground">
              {data.profitFactor.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            {profitLabel && (
              <p className={cn('mt-2 text-xs font-medium', data.profitFactor >= 1 ? 'text-emerald-400' : 'text-red-400')}>
                {profitLabel}
              </p>
            )}
          </>
        )}
      </KpiCard>

      {/* Meilleur jour */}
      <KpiCard title="Meilleur jour" icon={<CalendarDays className="h-4 w-4 text-emerald-400" />}>
        {isLoading ? (
          <><Skeleton className="mb-2 h-8 w-28" /><Skeleton className="h-3.5 w-20" /></>
        ) : data?.bestDay == null ? (
          <p className="font-mono text-2xl font-bold text-muted-foreground">—</p>
        ) : (
          <>
            <p className="font-mono text-2xl font-bold tracking-tight text-emerald-400">
              {formatMoney(data.bestDay.pnl, true)}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              {new Date(data.bestDay.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </>
        )}
      </KpiCard>
    </div>
  )
}
