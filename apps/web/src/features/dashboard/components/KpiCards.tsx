'use client'

import { LineChart, Line, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { mockKpis, sparkBalance, sparkPerf, sparkDrawdown, sparkPF } from '@/lib/mock-data'

// ── Sparkline mini ────────────────────────────────────────────────
function Spark({ data, color }: { data: { v: number }[]; color: string }) {
  return (
    <ResponsiveContainer width={80} height={36}>
      <LineChart data={data}>
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}

// ── Cercle de progression (Sharpe / Win Rate) ─────────────────────
function CircleProgress({ value, max, label, color = '#06b6d4' }: {
  value: number; max: number; label: string; color?: string
}) {
  const r = 24
  const circ = 2 * Math.PI * r
  const filled = (value / max) * circ

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

// ── Delta badge ───────────────────────────────────────────────────
function Delta({ pct, abs, currency }: { pct?: number; abs?: number; currency?: boolean }) {
  const up = (pct ?? abs ?? 0) >= 0
  return (
    <div className={`flex items-center gap-1 text-xs font-medium ${up ? 'text-green-400' : 'text-red-400'}`}>
      {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {pct !== undefined && `${up ? '+' : ''}${pct.toFixed(2)}%`}
      {abs !== undefined && currency && (
        <span className="text-gray-500 ml-0.5">
          {up ? '+' : ''}{abs.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
        </span>
      )}
    </div>
  )
}

const cardBase = 'bg-[#111827] border border-gray-800/60 rounded-xl p-4 flex flex-col gap-2 min-w-0'

export function KpiCards() {
  const fmt = (n: number) => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })

  return (
    <div className="grid grid-cols-6 gap-3">
      {/* 1 — Solde Total */}
      <div className={cardBase}>
        <div className="flex items-start justify-between">
          <span className="text-[11px] text-gray-500 font-medium">Solde Total</span>
          <span className="text-gray-600"><TrendingUp className="w-3.5 h-3.5" /></span>
        </div>
        <div className="text-xl font-bold text-white font-mono leading-tight">
          {fmt(mockKpis.balanceTotal)}
        </div>
        <div className="flex items-center justify-between">
          <Delta pct={mockKpis.balanceDeltaPct} abs={mockKpis.balanceDeltaAbs} currency />
          <Spark data={sparkBalance} color="#22c55e" />
        </div>
        <p className="text-[10px] text-gray-600">vs Période précédente</p>
      </div>

      {/* 2 — Performance */}
      <div className={cardBase}>
        <div className="flex items-start justify-between">
          <span className="text-[11px] text-gray-500 font-medium">Performance</span>
          <span className="text-gray-600"><BarChartIcon /></span>
        </div>
        <div className="text-xl font-bold text-green-400 font-mono leading-tight">
          +{mockKpis.performance.toFixed(2)}%
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            +{fmt(mockKpis.performanceDeltaAbs)}
          </span>
          <Spark data={sparkPerf} color="#22c55e" />
        </div>
      </div>

      {/* 3 — Drawdown Max */}
      <div className={cardBase}>
        <div className="flex items-start justify-between">
          <span className="text-[11px] text-gray-500 font-medium">Drawdown Max</span>
          <TrendingDown className="w-3.5 h-3.5 text-red-500" />
        </div>
        <div className="text-xl font-bold text-red-400 font-mono leading-tight">
          {mockKpis.drawdownMax.toFixed(2)}%
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-red-500/70">
            {mockKpis.drawdownDeltaAbs.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </span>
          <Spark data={sparkDrawdown} color="#ef4444" />
        </div>
      </div>

      {/* 4 — Sharpe Ratio */}
      <div className={`${cardBase} flex-row items-center gap-3`}>
        <CircleProgress value={mockKpis.sharpe} max={3} label="Sharpe" />
        <div className="min-w-0">
          <span className="text-[11px] text-gray-500 font-medium block">Ratio de Sharpe</span>
          <div className="text-xl font-bold text-white font-mono mt-1">{mockKpis.sharpe}</div>
          <span className="text-xs font-medium text-cyan-400">{mockKpis.sharpeLabel}</span>
        </div>
      </div>

      {/* 5 — Win Rate */}
      <div className={`${cardBase} flex-row items-center gap-3`}>
        <CircleProgress value={mockKpis.winRate} max={100} label="Win" color="#06b6d4" />
        <div className="min-w-0">
          <span className="text-[11px] text-gray-500 font-medium block">Trades Gagnants</span>
          <div className="text-xl font-bold text-white font-mono mt-1">{mockKpis.winRate}%</div>
          <span className="text-xs text-gray-500">{mockKpis.winCount} / {mockKpis.totalTrades}</span>
        </div>
      </div>

      {/* 6 — Profit Factor */}
      <div className={cardBase}>
        <div className="flex items-start justify-between">
          <span className="text-[11px] text-gray-500 font-medium">Profit Factor</span>
        </div>
        <div className="text-xl font-bold text-white font-mono leading-tight">
          {mockKpis.profitFactor}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-cyan-400">{mockKpis.profitFactorLabel}</span>
          <Spark data={sparkPF} color="#06b6d4" />
        </div>
      </div>
    </div>
  )
}

// Inline icon pour éviter import supplémentaire
function BarChartIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  )
}
