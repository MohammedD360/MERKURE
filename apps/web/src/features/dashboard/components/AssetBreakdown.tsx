'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { ChevronDown } from 'lucide-react'
import { useKpiBreakdown, type KpiPeriod } from '@/lib/hooks/use-kpis'

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: { label: string; pct: number } }[] }) {
  if (!active || !payload?.length) return null
  const d = payload[0]!.payload
  return (
    <div className="rounded-lg border border-[#243957] bg-[#0b1527] px-3 py-2 text-xs shadow-2xl">
      <div className="font-medium text-white">{d.label}</div>
      <div className="mt-0.5 text-slate-400">{d.pct}% des trades</div>
    </div>
  )
}

export function AssetBreakdown({ period = '30d' }: { period?: KpiPeriod }) {
  const { data, isLoading } = useKpiBreakdown(period)
  const assets = data?.bySymbol ?? []

  return (
    <div className="h-full rounded-2xl border border-[#1e2f4a] bg-[#0b1527] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.035),0_18px_60px_rgba(0,0,0,0.22)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-base font-bold text-white">Répartition des actifs</h3>
        <button className="flex items-center gap-2 rounded-lg border border-[#243957] bg-[#111b2d] px-3 py-2 text-xs font-medium text-slate-300 transition-colors hover:bg-[#16233a]">
          Par valeur
          <ChevronDown className="w-3 h-3" />
        </button>
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
                  data={assets}
                  cx="50%"
                  cy="50%"
                  innerRadius={64}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="pct"
                  strokeWidth={0}
                >
                  {assets.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="text-xs text-slate-500">Total</div>
              <div className="mt-1 font-mono text-2xl font-black text-white">
                {assets.reduce((s, a) => s + a.nbTrades, 0)}
              </div>
              <div className="mt-1 text-[10px] text-slate-500">trades</div>
            </div>
          </div>

          <div className="space-y-4">
            {assets.map((asset) => (
              <div key={asset.label} className="grid grid-cols-[1fr_auto_auto] items-center gap-4 text-sm">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: asset.color }} />
                  <span className="truncate text-slate-300">{asset.label}</span>
                </div>
                <span className="font-mono text-xs text-slate-300">{asset.pct}%</span>
                <span className={`min-w-20 text-right font-mono text-xs ${asset.pnl >= 0 ? 'text-slate-400' : 'text-[#ff5e70]'}`}>
                  {asset.pnl.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
