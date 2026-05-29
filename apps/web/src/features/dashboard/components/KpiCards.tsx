'use client'

import {
  Activity,
  CalendarDays,
  Target,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useKpiSummary, type KpiPeriod } from '@/lib/hooks/use-kpis'

const PERIOD_LABELS: Record<KpiPeriod, string> = {
  '7d':  '7 jours',
  '30d': '30 jours',
  '90d': '90 jours',
  '1y':  '1 an',
  all:   'total',
}

function formatMoney(value: number, signed = false) {
  const formatted = value.toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return signed && value > 0 ? `+${formatted}` : formatted
}

function formatPct(value: number) {
  return `${value.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`
}

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-white/[0.06] ${className}`} />
}

function KpiCard({
  title,
  icon,
  children,
}: {
  title: string
  icon: ReactNode
  children: ReactNode
}) {
  return (
    <div className="h-full min-h-[124px] rounded-lg border border-slate-800 bg-[#0b111c] p-5 shadow-[0_14px_40px_rgba(0,0,0,0.18)]">
      <div className="flex h-full flex-col">
        <div className="mb-5 flex items-center justify-between gap-3">
          <p className="truncate text-[11px] font-black uppercase tracking-wider text-slate-500">{title}</p>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-800 bg-[#071017] text-slate-300">
            {icon}
          </div>
        </div>
        <div className="flex flex-1 flex-col justify-end">{children}</div>
      </div>
    </div>
  )
}

function Donut({ value }: { value: number | null }) {
  const radius = 20
  const circumference = 2 * Math.PI * radius
  const safeValue = value == null ? 0 : Math.max(0, Math.min(value, 100))
  const filled = (safeValue / 100) * circumference

  return (
    <svg width="56" height="56" viewBox="0 0 56 56" className="shrink-0">
      <circle cx="28" cy="28" r={radius} fill="none" stroke="#1f2a3a" strokeWidth="6" />
      <circle
        cx="28"
        cy="28"
        r={radius}
        fill="none"
        stroke="url(#winrate-gradient)"
        strokeWidth="6"
        strokeDasharray={`${filled} ${circumference - filled}`}
        strokeLinecap="round"
        transform="rotate(-90 28 28)"
      />
      <defs>
        <linearGradient id="winrate-gradient" x1="8" y1="8" x2="48" y2="48">
          <stop stopColor="#2563eb" />
          <stop offset="1" stopColor="#38e476" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function KpiCards({ period = '30d', accountId }: { period?: KpiPeriod; accountId?: string | undefined }) {
  const { data, isLoading } = useKpiSummary(period, accountId)

  const totalPnl = data?.totalPnl
  const drawdownPct = data?.maxDrawdown != null ? Math.abs(data.maxDrawdown * 100) : null
  const winRatePct = data ? data.winRate * 100 : null
  const winningTrades = data ? Math.round(data.winRate * data.nbTrades) : null
  const pnlPositive = totalPnl == null || totalPnl >= 0
  const drawdownLabel = drawdownPct == null
    ? null
    : drawdownPct <= 5
      ? 'Risque contenu'
      : drawdownPct <= 12
        ? 'À surveiller'
        : 'Risque élevé'
  const profitLabel = data?.profitFactor == null
    ? null
    : data.profitFactor >= 1.5
      ? 'Solide'
      : data.profitFactor >= 1
        ? 'Neutre'
        : 'Faible'

  return (
    <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 xl:grid-cols-6">
      <KpiCard
        title={`P&L ${PERIOD_LABELS[period]}`}
        icon={pnlPositive ? <TrendingUp className="h-4 w-4 text-[#38e476]" /> : <TrendingDown className="h-4 w-4 text-[#ff5e70]" />}
      >
        {isLoading ? (
          <>
            <Skeleton className="mb-3 h-8 w-32" />
            <Skeleton className="h-4 w-16" />
          </>
        ) : totalPnl == null ? (
          <p className="font-mono text-2xl font-black text-slate-500">—</p>
        ) : (
          <>
            <p className={`font-mono text-2xl font-black tracking-normal ${pnlPositive ? 'text-[#38e476]' : 'text-[#ff5e70]'}`}>
              {formatMoney(totalPnl, true)}
            </p>
            <p className="mt-3 text-xs font-semibold text-slate-500">
              {data && data.nbTrades > 0 ? `${data.nbTrades} trades analysés` : 'Aucun trade sur la période'}
            </p>
          </>
        )}
      </KpiCard>

      <KpiCard
        title="Trades"
        icon={<Activity className="h-4 w-4 text-blue-300" />}
      >
        {isLoading ? (
          <>
            <Skeleton className="mb-3 h-8 w-16" />
            <Skeleton className="h-4 w-24" />
          </>
        ) : data ? (
          <>
            <p className="font-mono text-2xl font-black text-white">{data.nbTrades}</p>
            <p className="mt-3 text-xs font-semibold text-slate-500">
              {winRatePct == null ? 'Taux indisponible' : `${formatPct(winRatePct)} de réussite`}
            </p>
          </>
        ) : (
          <p className="font-mono text-2xl font-black text-slate-500">—</p>
        )}
      </KpiCard>

      <KpiCard
        title="Drawdown Max"
        icon={<TrendingDown className="h-4 w-4 text-[#ff5e70]" />}
      >
        {isLoading ? (
          <>
            <Skeleton className="mb-3 h-8 w-24" />
            <Skeleton className="h-4 w-20" />
          </>
        ) : drawdownPct == null ? (
          <p className="font-mono text-2xl font-black text-slate-500">—</p>
        ) : (
          <>
            <p className="font-mono text-2xl font-black tracking-normal text-[#ff5e70]">
              -{formatPct(drawdownPct)}
            </p>
            {drawdownLabel && <p className="mt-3 text-xs font-semibold text-slate-500">{drawdownLabel}</p>}
          </>
        )}
      </KpiCard>

      <KpiCard
        title="Win Rate"
        icon={<Target className="h-4 w-4 text-blue-300" />}
      >
        {isLoading ? (
          <div className="flex items-end gap-3">
            <Skeleton className="h-14 w-14 rounded-full" />
            <div>
              <Skeleton className="mb-3 h-7 w-20" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Donut value={winRatePct} />
            <div className="min-w-0">
              <p className="font-mono text-2xl font-black text-white">
                {winRatePct == null ? '—' : formatPct(winRatePct)}
              </p>
              {data && winningTrades != null && (
                <p className="mt-2 text-xs font-medium text-slate-500">
                  {winningTrades} / {data.nbTrades} trades
                </p>
              )}
            </div>
          </div>
        )}
      </KpiCard>

      <KpiCard
        title="Profit Factor"
        icon={<Target className="h-4 w-4 text-[#38e476]" />}
      >
        {isLoading ? (
          <>
            <Skeleton className="mb-3 h-8 w-20" />
            <Skeleton className="h-4 w-16" />
          </>
        ) : data?.profitFactor == null ? (
          <p className="font-mono text-2xl font-black text-slate-500">—</p>
        ) : (
          <>
            <p className="font-mono text-2xl font-black text-white">
              {data.profitFactor.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            {profitLabel && <p className="mt-3 text-xs font-semibold text-[#38e476]">{profitLabel}</p>}
          </>
        )}
      </KpiCard>

      <KpiCard
        title="Meilleur jour"
        icon={<CalendarDays className="h-4 w-4 text-[#38e476]" />}
      >
        {isLoading ? (
          <>
            <Skeleton className="mb-3 h-8 w-28" />
            <Skeleton className="h-4 w-20" />
          </>
        ) : data?.bestDay == null ? (
          <p className="font-mono text-2xl font-black text-slate-500">—</p>
        ) : (
          <>
            <p className="font-mono text-2xl font-black tracking-normal text-[#38e476]">
              {formatMoney(data.bestDay.pnl, true)}
            </p>
            <p className="mt-3 text-xs font-medium text-slate-500">
              {new Date(data.bestDay.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </>
        )}
      </KpiCard>
    </div>
  )
}
