'use client'

import { Info } from 'lucide-react'
import { useStatsOverview, useStreaks, type StatsOverview } from '@/lib/hooks/use-stats'
import type { KpiPeriod } from '@/lib/hooks/use-kpis'

function fmt(val: number, opts?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency', currency: 'USD',
    minimumFractionDigits: 2, maximumFractionDigits: 2,
    ...opts,
  }).format(val)
}

function fmtDuration(sec: number): string {
  if (sec < 60)   return `${Math.round(sec)}s`
  if (sec < 3600) return `${Math.floor(sec / 60)}m ${Math.round(sec % 60)}s`
  return `${Math.floor(sec / 3600)}h ${Math.floor((sec % 3600) / 60)}m`
}

function Tip({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex">
      <Info className="h-3 w-3 text-slate-600 hover:text-slate-400 cursor-default transition-colors" />
      <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-800 px-2 py-1 text-[11px] text-slate-300 opacity-0 shadow-lg group-hover:opacity-100 transition-opacity">
        {text}
      </span>
    </span>
  )
}

function SkeletonRow() {
  return (
    <div className="space-y-2 p-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex items-center justify-between">
          <div className="h-3 w-20 animate-pulse rounded bg-slate-800" />
          <div className="h-3 w-16 animate-pulse rounded bg-slate-800" />
        </div>
      ))}
    </div>
  )
}

interface RowProps {
  label: string
  value: string
  valueClass?: string
  tip?: string
}
function Row({ label, value, valueClass = 'text-slate-300', tip }: RowProps) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
        {label}
        {tip && <Tip text={tip} />}
      </div>
      <span className={`text-[13px] font-bold font-mono ${valueClass}`}>{value}</span>
    </div>
  )
}

interface ProgressBarProps { pct: number; color: string; label: string; value: string }
function ProgressBar({ pct, color, label, value }: ProgressBarProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-slate-500 font-medium">{label}</span>
        <span className="font-bold text-slate-300 font-mono">{value}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
    </div>
  )
}

interface SectionProps {
  title: string
  children: React.ReactNode
  isLoading?: boolean
  className?: string
}
function Section({ title, children, isLoading, className = '' }: SectionProps) {
  return (
    <div className={`p-4 ${className}`}>
      <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-600">{title}</p>
      {isLoading ? <SkeletonRow /> : children}
    </div>
  )
}

interface Props { period?: KpiPeriod }

export function StatsOverviewWidget({ period = '30d' }: Props) {
  const { data, isLoading } = useStatsOverview(period)
  const { data: streaks, isLoading: streaksLoading } = useStreaks(period)

  const d: StatsOverview = data ?? {
    totalPnl: 0, grossProfit: 0, grossLoss: 0, totalFees: 0,
    nbTrades: 0, winTrades: 0, lossTrades: 0, beTrades: 0,
    winRate: 0, avgWin: 0, avgLoss: 0, profitFactor: null,
    longCount: 0, shortCount: 0, longPct: 50, shortPct: 50,
    avgDurationSec: 0,
  }

  const winRatePct    = Math.round(d.winRate * 100)
  const streakCurrent = streaks?.current ?? 0
  const streakType    = streaks?.currentType

  const totalPnlClass = d.totalPnl >= 0 ? 'text-green-400' : 'text-red-400'

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#0d1521] shadow-[0_8px_32px_rgba(0,0,0,0.25)]">
      {/* 2×2 grid */}
      <div className="grid grid-cols-2 divide-x divide-slate-800 divide-y">

        {/* ── Top-left : P&L ─────────────────────────────────────────────── */}
        <Section title="Profit / Perte" isLoading={isLoading}>
          <Row label="Profits bruts"  value={fmt(d.grossProfit)} valueClass="text-green-400" />
          <Row label="Pertes brutes"  value={fmt(-d.grossLoss)}  valueClass="text-red-400" />
          <Row label="Commissions"    value={fmt(-d.totalFees)}  valueClass="text-slate-400"
            tip="Total des frais de courtage déduits" />
          <div className="mt-2 border-t border-slate-800/70 pt-2">
            <Row
              label="Résultat net"
              value={`${d.totalPnl >= 0 ? '+' : ''}${fmt(d.totalPnl)}`}
              valueClass={`text-base ${totalPnlClass}`}
            />
          </div>
        </Section>

        {/* ── Top-right : Performance ─────────────────────────────────────── */}
        <Section title="Performance" isLoading={isLoading}>
          <div className="mb-3">
            <div className="flex items-end justify-between">
              <span className="text-[11px] font-medium text-slate-500">Win Rate</span>
              <span className={`text-2xl font-black font-mono ${winRatePct >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                {winRatePct} %
              </span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className={`h-full rounded-full transition-all ${winRatePct >= 50 ? 'bg-green-500' : 'bg-red-500'}`}
                style={{ width: `${winRatePct}%` }}
              />
            </div>
          </div>
          <Row
            label="Gain moyen"
            value={fmt(d.avgWin)}
            valueClass="text-green-400"
            tip="P&L moyen des trades gagnants"
          />
          <Row
            label="Perte moyenne"
            value={fmt(d.avgLoss)}
            valueClass="text-red-400"
            tip="P&L moyen des trades perdants"
          />
          {d.profitFactor !== null && (
            <Row
              label="Profit Factor"
              value={d.profitFactor.toFixed(2)}
              valueClass={d.profitFactor >= 1.5 ? 'text-green-400' : d.profitFactor >= 1 ? 'text-amber-400' : 'text-red-400'}
              tip="Gains bruts / Pertes brutes"
            />
          )}
        </Section>

        {/* ── Bottom-left : Activité ─────────────────────────────────────── */}
        <Section title="Activité" isLoading={isLoading} className="border-t border-slate-800">
          <Row label="Total trades"   value={String(d.nbTrades)} />
          <Row label="Gagnants"       value={String(d.winTrades)}  valueClass="text-green-400" />
          <Row label="Perdants"       value={String(d.lossTrades)} valueClass="text-red-400" />
          {d.beTrades > 0 && (
            <Row label="Break-even"   value={String(d.beTrades)} valueClass="text-slate-400" />
          )}
          <Row
            label="Durée moyenne"
            value={fmtDuration(d.avgDurationSec)}
            tip="Durée moyenne de maintien d'une position"
          />
        </Section>

        {/* ── Bottom-right : Distribution ─────────────────────────────────── */}
        <Section title="Distribution" isLoading={isLoading || streaksLoading} className="border-t border-slate-800">
          <div className="space-y-3">
            <ProgressBar
              pct={d.longPct}
              color="bg-violet-500"
              label="Long"
              value={`${d.longPct.toFixed(1)} %`}
            />
            <ProgressBar
              pct={d.shortPct}
              color="bg-blue-500"
              label="Short"
              value={`${d.shortPct.toFixed(1)} %`}
            />
          </div>
          <div className="mt-3 border-t border-slate-800/70 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-500">Série en cours</span>
              <span className={`text-sm font-black font-mono ${
                streakType === 'win' ? 'text-green-400'
                : streakType === 'loss' ? 'text-red-400'
                : 'text-slate-500'
              }`}>
                {streakCurrent > 0
                  ? `${streakCurrent} ${streakType === 'win' ? 'W' : 'L'}`
                  : '—'}
              </span>
            </div>
          </div>
        </Section>

      </div>
    </div>
  )
}
