'use client'

import {
  Activity,
  CalendarDays,
  Info,
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
  accent,
  children,
}: {
  title: string
  icon: ReactNode
  accent: string
  children: ReactNode
}) {
  return (
    <div className="group relative min-h-[132px] overflow-hidden rounded-2xl border border-[#1e2f4a] bg-[#0b1527] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.035),0_18px_60px_rgba(0,0,0,0.22)]">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{ background: `radial-gradient(circle at 100% 0%, ${accent}20, transparent 42%)` }}
      />
      <div className="relative flex h-full flex-col">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <p className="truncate text-xs font-medium text-slate-300">{title}</p>
            <Info className="h-3.5 w-3.5 flex-shrink-0 text-slate-500" />
          </div>
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.035] text-slate-300">
            {icon}
          </div>
        </div>
        <div className="relative flex flex-1 flex-col justify-end">{children}</div>
      </div>
    </div>
  )
}

function Donut({ value }: { value: number | null }) {
  const radius = 25
  const circumference = 2 * Math.PI * radius
  const safeValue = value == null ? 0 : Math.max(0, Math.min(value, 100))
  const filled = (safeValue / 100) * circumference

  return (
    <svg width="72" height="72" viewBox="0 0 72 72" className="shrink-0">
      <circle cx="36" cy="36" r={radius} fill="none" stroke="#1d2b44" strokeWidth="7" />
      <circle
        cx="36"
        cy="36"
        r={radius}
        fill="none"
        stroke="url(#winrate-gradient)"
        strokeWidth="7"
        strokeDasharray={`${filled} ${circumference - filled}`}
        strokeLinecap="round"
        transform="rotate(-90 36 36)"
      />
      <defs>
        <linearGradient id="winrate-gradient" x1="10" y1="10" x2="62" y2="62">
          <stop stopColor="#7c5cff" />
          <stop offset="1" stopColor="#18c7ff" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function KpiCards({ period = '30d' }: { period?: KpiPeriod }) {
  const { data, isLoading } = useKpiSummary(period)

  const totalPnl = data?.totalPnl
  const drawdownPct = data?.maxDrawdown != null ? Math.abs(data.maxDrawdown * 100) : null
  const winRatePct = data ? data.winRate * 100 : null
  const winningTrades = data ? Math.round(data.winRate * data.nbTrades) : null
  const pnlPositive = totalPnl == null || totalPnl >= 0
  const profitLabel = data?.profitFactor == null
    ? null
    : data.profitFactor >= 1.5
      ? 'Solide'
      : data.profitFactor >= 1
        ? 'Neutre'
        : 'Faible'

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
      <KpiCard
        title={`P&L ${PERIOD_LABELS[period]}`}
        icon={pnlPositive ? <TrendingUp className="h-4 w-4 text-[#38e476]" /> : <TrendingDown className="h-4 w-4 text-[#ff5e70]" />}
        accent={pnlPositive ? '#38e476' : '#ff5e70'}
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
            <p className="mt-3 text-xs font-semibold text-slate-500">Données synchronisées</p>
          </>
        )}
      </KpiCard>

      <KpiCard
        title="Trades"
        icon={<Activity className="h-4 w-4 text-[#9b7cff]" />}
        accent="#9b7cff"
      >
        {isLoading ? (
          <>
            <Skeleton className="mb-3 h-8 w-16" />
            <Skeleton className="h-4 w-24" />
          </>
        ) : data ? (
          <>
            <p className="font-mono text-2xl font-black text-white">{data.nbTrades}</p>
            <p className="mt-3 text-xs font-semibold text-slate-500">Trades clôturés</p>
          </>
        ) : (
          <p className="font-mono text-2xl font-black text-slate-500">—</p>
        )}
      </KpiCard>

      <KpiCard
        title="Drawdown Max"
        icon={<TrendingDown className="h-4 w-4 text-[#ff5e70]" />}
        accent="#ff5e70"
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
            <p className="mt-3 text-xs font-semibold text-slate-500">Maximum observé</p>
          </>
        )}
      </KpiCard>

      <KpiCard
        title="Win Rate"
        icon={<Target className="h-4 w-4 text-[#18c7ff]" />}
        accent="#18c7ff"
      >
        {isLoading ? (
          <div className="flex items-end gap-3">
            <Skeleton className="h-[72px] w-[72px] rounded-full" />
            <div>
              <Skeleton className="mb-3 h-7 w-20" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
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
        accent="#38e476"
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
        accent="#38e476"
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
