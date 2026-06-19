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
    <div className="rounded-lg border border-border/80 bg-card px-3 py-2.5 text-xs shadow-xl">
      <p className="mb-1 font-bold text-foreground">{d.label}</p>
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">P&L moyen</span>
          <span className={`font-bold font-mono ${d.avgPnl >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {d.avgPnl >= 0 ? '+' : ''}{d.avgPnl.toLocaleString('fr-FR', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Win rate</span>
          <span className="font-mono text-muted-foreground">{(d.winRate * 100).toFixed(0)} %</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Trades</span>
          <span className="font-mono text-muted-foreground">{d.nbTrades}</span>
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
    <div className="overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-card">
      <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-4 py-3">
        <div>
          <h3 className="text-sm font-bold text-foreground">Durée de position</h3>
          <p className="mt-0.5 text-[11px] text-muted-foreground">P&L moyen par durée de maintien</p>
        </div>
        <div className="flex gap-1">
          {PERIODS.map(p => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                period === p.value
                  ? 'bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] ring-1 ring-[hsl(var(--primary)/0.25)]'
                  : 'text-muted-foreground hover:text-muted-foreground'
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
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-[hsl(var(--primary)/0.3)] border-t-[hsl(var(--primary))]" />
          </div>
        ) : data.every(d => d.nbTrades === 0) ? (
          <div className="flex h-44 items-center justify-center text-sm text-muted-foreground/60">
            Aucune donnée disponible
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={176}>
              <BarChart data={data} barCategoryGap="25%" margin={{ top: 8, right: 4, bottom: 0, left: 4 }}>
                <XAxis
                  dataKey="label"
                  tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide domain={[-maxAbs * 1.2, maxAbs * 1.2]} />
                <ReferenceLine y={0} stroke="#e5e7eb" strokeWidth={1} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
                <Bar dataKey="avgPnl" radius={[4, 4, 0, 0]} maxBarSize={44}>
                  {data.map((entry, idx) => (
                    <Cell
                      key={`dur-${idx}`}
                      fill={
                        entry.nbTrades === 0
                          ? 'rgba(156,163,175,0.2)'
                          : entry.avgPnl > 0
                            ? 'rgba(22,163,74,0.7)'
                            : 'rgba(220,38,38,0.65)'
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
                  <span className={`text-[9px] font-mono ${d.nbTrades > 0 ? 'text-muted-foreground/60' : 'text-foreground/30'}`}>
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
