'use client'

import { useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { useKpiBreakdown, type KpiPeriod } from '@/lib/hooks/use-kpis'

type Mode = 'volume' | 'pnl'

function CustomTooltip({ active, payload, mode }: {
  active?: boolean
  payload?: { payload: { label: string; pct: number; pnl: number; nbTrades: number } }[]
  mode: Mode
}) {
  if (!active || !payload?.length) return null
  const d = payload[0]!.payload
  return (
    <div className="rounded-lg border border-[#243957] bg-[#0b1527] px-3 py-2 text-xs shadow-2xl">
      <div className="font-medium text-white">{d.label}</div>
      {mode === 'volume' ? (
        <div className="mt-0.5 text-slate-400">{d.pct}% des trades ({d.nbTrades})</div>
      ) : (
        <div className={`mt-0.5 ${d.pnl >= 0 ? 'text-[#38e476]' : 'text-[#ff5e70]'}`}>
          {d.pnl >= 0 ? '+' : ''}{d.pnl.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
        </div>
      )}
    </div>
  )
}

export function AssetBreakdown({ period = '30d' }: { period?: KpiPeriod }) {
  const [mode, setMode] = useState<Mode>('volume')
  const { data, isLoading } = useKpiBreakdown(period)
  const assets = data?.bySymbol ?? []

  const pieData = assets.map(a => ({
    ...a,
    _pieValue: mode === 'volume' ? a.pct : Math.abs(a.pnl),
  }))

  const centerLabel = mode === 'volume'
    ? { value: assets.reduce((s, a) => s + a.nbTrades, 0).toString(), sub: 'trades' }
    : {
        value: assets.reduce((s, a) => s + a.pnl, 0)
          .toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }),
        sub: 'P&L total',
      }

  return (
    <div className="h-full rounded-2xl border border-[#1e2f4a] bg-[#0b1527] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.035),0_18px_60px_rgba(0,0,0,0.22)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-base font-bold text-white">Répartition des actifs</h3>
        <div className="inline-flex overflow-hidden rounded-lg border border-[#243957] bg-[#111b2d] text-xs font-medium">
          <button
            onClick={() => setMode('volume')}
            className={`px-3 py-1.5 transition-colors ${mode === 'volume' ? 'bg-[#7c5cff]/20 text-[#b9a8ff]' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Nb trades
          </button>
          <button
            onClick={() => setMode('pnl')}
            className={`border-l border-[#243957] px-3 py-1.5 transition-colors ${mode === 'pnl' ? 'bg-[#7c5cff]/20 text-[#b9a8ff]' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Par P&amp;L
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <div className="mx-auto h-[220px] w-[220px] animate-pulse rounded-full bg-white/[0.04]" />
          <div className="space-y-4 pt-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-5 animate-pulse rounded bg-white/[0.04]" />
            ))}
          </div>
        </div>
      ) : assets.length === 0 ? (
        <div className="flex h-[310px] items-center justify-center rounded-xl border border-dashed border-[#223653] bg-[#081220] text-sm text-slate-500">
          Aucun trade sur cette période
        </div>
      ) : (
        <div className="grid min-h-[310px] items-center gap-6 lg:grid-cols-[240px_1fr]">
          <div className="relative flex justify-center">
            <ResponsiveContainer width={230} height={230}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={64}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="_pieValue"
                  strokeWidth={0}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip mode={mode} />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-xs text-slate-500">{centerLabel.sub}</div>
              <div className="mt-1 font-mono text-xl font-black text-white">{centerLabel.value}</div>
            </div>
          </div>

          <div className="space-y-4">
            {assets.map((asset) => (
              <div key={asset.label} className="grid grid-cols-[1fr_auto_auto] items-center gap-4 text-sm">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: asset.color }} />
                  <span className="truncate text-slate-300">{asset.label}</span>
                </div>
                <span className="font-mono text-xs text-slate-300">
                  {mode === 'volume' ? `${asset.pct}%` : `${asset.nbTrades} trades`}
                </span>
                <span className={`min-w-20 text-right font-mono text-xs ${asset.pnl >= 0 ? 'text-[#38e476]' : 'text-[#ff5e70]'}`}>
                  {asset.pnl >= 0 ? '+' : ''}{asset.pnl.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
