'use client'

import { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts'
import { useDurationStats } from '@/lib/hooks/use-stats'
import type { KpiPeriod } from '@/lib/hooks/use-kpis'

const PERIODS: { value: KpiPeriod; label: string }[] = [
  { value: '30d', label: '30j' },
  { value: '90d', label: '90j' },
  { value: '1y',  label: '1 an' },
  { value: 'all', label: 'Tout' },
]

function CustomTooltip({ active, payload }: {
  active?: boolean
  payload?: { payload: { label: string; avgPnl: number; nbTrades: number; winRate: number } }[]
}) {
  if (!active || !payload?.length) return null
  const d = payload[0]!.payload
  return (
    <div className="rounded-lg border border-slate-700/80 bg-card px-3 py-2.5 text-xs shadow-xl">
      <p className="mb-1 font-bold text-white">{d.label}</p>
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-500">P&L moyen</span>
          <span className={`font-bold font-mono ${d.avgPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {d.avgPnl >= 0 ? '+' : ''}{d.avgPnl.toLocaleString('fr-FR', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-500">Win rate</span>
          <span className="font-mono text-slate-300">{(d.winRate * 100).toFixed(0)} %</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-500">Trades</span>
          <span className="font-mono text-slate-300">{d.nbTrades}</span>
        </div>
      </div>
    </div>
  )
}

interface Props { defaultPeriod?: KpiPeriod }

export function DurationChart({ defaultPeriod = '30d' }: Props) {
  const [period, setPeriod] = useState<KpiPeriod>(defaultPeriod)
  const { data = [], isLoading } = useDurationStats(period)

  const maxAbs = Math.max(...data.map(d => Math.abs(d.avgPnl)), 1)

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-card">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
        <div>
          <h3 className="text-sm font-bold text-white">Durée de position</h3>
          <p className="mt-0.5 text-[11px] text-slate-500">P&L moyen par durée de maintien</p>
        </div>
        <div className="flex gap-1">
          {PERIODS.map(p => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                period === p.value
                  ? 'bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/30'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-3 pb-4 pt-3">
        {isLoading ? (
          <div className="flex h-44 items-center justify-center">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-500" />
          </div>
        ) : data.every(d => d.nbTrades === 0) ? (
          <div className="flex h-44 items-center justify-center text-sm text-slate-600">
            Aucune donnée disponible
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={176}>
              <BarChart data={data} barCategoryGap="25%" margin={{ top: 8, right: 4, bottom: 0, left: 4 }}>
                <XAxis
                  dataKey="label"
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide domain={[-maxAbs * 1.2, maxAbs * 1.2]} />
                <ReferenceLine y={0} stroke="#334155" strokeWidth={1} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="avgPnl" radius={[4, 4, 0, 0]} maxBarSize={44}>
                  {data.map((entry, idx) => (
                    <Cell
                      key={`dur-${idx}`}
                      fill={
                        entry.nbTrades === 0
                          ? 'rgba(100,116,139,0.15)'
                          : entry.avgPnl > 0
                            ? 'rgba(139,92,246,0.75)'
                            : 'rgba(239,68,68,0.65)'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Nb trades row */}
            <div className="mt-2 grid grid-cols-7 gap-1">
              {data.map((d, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <span className={`text-[9px] font-mono ${d.nbTrades > 0 ? 'text-slate-600' : 'text-slate-800'}`}>
                    {d.nbTrades > 0 ? d.nbTrades : '—'}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
