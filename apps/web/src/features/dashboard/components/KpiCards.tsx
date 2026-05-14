'use client'

import { LineChart, Line, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { useKpiSummary } from '@/lib/hooks/use-kpis'

function Spark({ data, color }: { data: { v: number }[]; color: string }) {
  return (
    <ResponsiveContainer width={80} height={36}>
      <LineChart data={data}>
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}

function CircleProgress({ value, max, label, color = '#06b6d4' }: {
  value: number; max: number; label: string; color?: string
}) {
  const r = 24
  const circ = 2 * Math.PI * r
  const filled = Math.min((value / max) * circ, circ)

  return (
    <div className="flex items-center gap-3">
      <svg width="64" height="64" className="flex-shrink-0">
        <circle cx="32" cy="32" r={r} fill="none" stroke="#1f2937" strokeWidth="5" />
        <circle
          cx="32" cy="32" r={r} fill="none"
          stroke={color} strokeWidth="5"
          strokeDasharray={`${filled} ${circ - filled}`}
          strokeLinecap="round"
          transform="rotate(-90 32 32)"
        />
        <text x="32" y="36" textAnchor="middle" className="fill-gray-500 text-[9px] font-semibold">
          {label}
        </text>
      </svg>
    </div>
  )
}

function Delta({ value }: { value: number }) {
  const up = value >= 0
  return (
    <div className={`flex items-center gap-1 text-xs font-medium ${up ? 'text-green-400' : 'text-red-400'}`}>
      {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {up ? '+' : ''}{value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </div>
  )
}

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-800 rounded ${className}`} />
}

const cardBase = 'bg-[#111827] border border-gray-800/60 rounded-xl p-4 flex flex-col gap-2 min-w-0'

export function KpiCards() {
  const { data, isLoading } = useKpiSummary('30d')

  const fmt = (n: number) =>
    n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })

  const winRatePct  = data ? data.winRate * 100 : 0
  const drawdownPct = data ? (data.maxDrawdown ?? 0) * 100 : 0

  // Sparkline synthétique à partir des valeurs disponibles (sera remplacé par snapshots réels)
  const pnlSpark = data
    ? [{ v: 0 }, { v: data.totalPnl * 0.2 }, { v: data.totalPnl * 0.5 }, { v: data.totalPnl * 0.8 }, { v: data.totalPnl }]
    : []

  return (
    <div className="grid grid-cols-6 gap-3">
      {/* 1 — P&L 30 jours */}
      <div className={cardBase}>
        <div className="flex items-start justify-between">
          <span className="text-[11px] text-gray-500 font-medium">P&amp;L (30 jours)</span>
          <TrendingUp className="w-3.5 h-3.5 text-gray-600" />
        </div>
        {isLoading ? (
          <Skeleton className="h-7 w-28" />
        ) : (
          <div className={`text-xl font-bold font-mono leading-tight ${(data?.totalPnl ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {data ? fmt(data.totalPnl) : '—'}
          </div>
        )}
        <div className="flex items-center justify-between">
          {data ? <Delta value={data.totalPnl} /> : <span />}
          {pnlSpark.length > 0 && (
            <Spark data={pnlSpark} color={(data?.totalPnl ?? 0) >= 0 ? '#22c55e' : '#ef4444'} />
          )}
        </div>
        <p className="text-[10px] text-gray-600">30 derniers jours</p>
      </div>

      {/* 2 — Nombre de trades */}
      <div className={cardBase}>
        <div className="flex items-start justify-between">
          <span className="text-[11px] text-gray-500 font-medium">Trades</span>
          <BarChartIcon />
        </div>
        {isLoading ? (
          <Skeleton className="h-7 w-16" />
        ) : (
          <div className="text-xl font-bold text-white font-mono leading-tight">
            {data?.nbTrades ?? '—'}
          </div>
        )}
        <span className="text-[10px] text-gray-600">trades clôturés</span>
      </div>

      {/* 3 — Drawdown Max */}
      <div className={cardBase}>
        <div className="flex items-start justify-between">
          <span className="text-[11px] text-gray-500 font-medium">Drawdown Max</span>
          <TrendingDown className="w-3.5 h-3.5 text-red-500" />
        </div>
        {isLoading ? (
          <Skeleton className="h-7 w-20" />
        ) : (
          <div className="text-xl font-bold text-red-400 font-mono leading-tight">
            {data?.maxDrawdown != null ? `-${drawdownPct.toFixed(2)}%` : '—'}
          </div>
        )}
        {data?.worstDay && (
          <span className="text-[10px] text-gray-600">
            Pire jour : {fmt(data.worstDay.pnl)}
          </span>
        )}
      </div>

      {/* 4 — Sharpe (non calculé pour l'instant) */}
      <div className={`${cardBase} flex-row items-center gap-3`}>
        <CircleProgress value={0} max={3} label="Sharpe" />
        <div className="min-w-0">
          <span className="text-[11px] text-gray-500 font-medium block">Ratio de Sharpe</span>
          <div className="text-xl font-bold text-white font-mono mt-1">—</div>
          <span className="text-xs text-gray-600">Prochainement</span>
        </div>
      </div>

      {/* 5 — Win Rate */}
      <div className={`${cardBase} flex-row items-center gap-3`}>
        <CircleProgress value={winRatePct} max={100} label="Win" color="#06b6d4" />
        <div className="min-w-0">
          <span className="text-[11px] text-gray-500 font-medium block">Trades Gagnants</span>
          {isLoading ? (
            <Skeleton className="h-7 w-16 mt-1" />
          ) : (
            <div className="text-xl font-bold text-white font-mono mt-1">
              {winRatePct.toFixed(1)}%
            </div>
          )}
          {data && (
            <span className="text-xs text-gray-500">
              {Math.round(data.winRate * data.nbTrades)} / {data.nbTrades}
            </span>
          )}
        </div>
      </div>

      {/* 6 — Profit Factor */}
      <div className={cardBase}>
        <div className="flex items-start justify-between">
          <span className="text-[11px] text-gray-500 font-medium">Profit Factor</span>
        </div>
        {isLoading ? (
          <Skeleton className="h-7 w-16" />
        ) : (
          <div className="text-xl font-bold text-white font-mono leading-tight">
            {data?.profitFactor != null ? data.profitFactor.toFixed(2) : '—'}
          </div>
        )}
        {data?.profitFactor != null && (
          <span className={`text-xs font-medium ${data.profitFactor >= 2 ? 'text-green-400' : data.profitFactor >= 1 ? 'text-amber-400' : 'text-red-400'}`}>
            {data.profitFactor >= 2 ? 'Très bon' : data.profitFactor >= 1.5 ? 'Bon' : data.profitFactor >= 1 ? 'Neutre' : 'Mauvais'}
          </span>
        )}
      </div>
    </div>
  )
}

function BarChartIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  )
}
