'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { usePortfolioBreakdown } from '@/lib/hooks/use-portfolio'

function Skeleton() {
  return <div className="h-40 animate-pulse rounded-lg bg-slate-800/70" />
}

function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-lg border border-slate-700 bg-[#101827] px-3 py-2 text-xs shadow-xl">
      <p className="text-white font-semibold">{d.symbol}</p>
      <p className="text-slate-400">{d.lots.toFixed(2)} lots — {d.pct.toFixed(1)} %</p>
      <p className={d.pnl >= 0 ? 'text-green-400 font-mono' : 'text-red-400 font-mono'}>
        {d.pnl >= 0 ? '+' : ''}{d.pnl.toLocaleString('fr-FR', { style: 'currency', currency: 'USD' })}
      </p>
    </div>
  )
}

function BarTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const pnl = payload[0]?.value ?? 0
  return (
    <div className="rounded-lg border border-slate-700 bg-[#101827] px-3 py-2 text-xs shadow-xl">
      <p className="text-white font-semibold mb-1">{label}</p>
      <p className="text-slate-400">{payload[0]?.payload?.count} trades</p>
      <p className={pnl >= 0 ? 'text-green-400 font-mono' : 'text-red-400 font-mono'}>
        {pnl >= 0 ? '+' : ''}{Number(pnl).toLocaleString('fr-FR', { style: 'currency', currency: 'USD' })}
      </p>
    </div>
  )
}

export function CapitalBreakdown() {
  const { data, isLoading } = usePortfolioBreakdown()

  const sourceLabel = data?.source === 'open'
    ? 'Positions ouvertes'
    : '30 derniers jours (trades clôturés)'

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* By symbol — Pie chart */}
      <div className="rounded-lg border border-slate-800 bg-background p-4 shadow-[0_18px_45px_rgba(0,0,0,0.22)]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-black text-white">Répartition par instrument</h2>
          <span className="text-[10px] text-slate-600">{sourceLabel}</span>
        </div>

        {isLoading ? <Skeleton /> : (data?.bySymbol.length ?? 0) === 0 ? (
          <div className="flex h-40 items-center justify-center text-sm text-slate-600">Aucune donnée</div>
        ) : (
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie
                  data={data!.bySymbol}
                  dataKey="lots"
                  nameKey="symbol"
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={65}
                  strokeWidth={2}
                  stroke="#0b111c"
                >
                  {data!.bySymbol.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            <div className="flex-1 space-y-1.5">
              {data!.bySymbol.slice(0, 6).map(item => (
                <div key={item.symbol} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="w-16 font-mono text-xs font-semibold text-slate-300">{item.symbol}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800">
                    <div className="h-full rounded-full" style={{ width: `${item.pct}%`, backgroundColor: item.color }} />
                  </div>
                  <span className="w-8 text-right text-[10px] text-slate-500">{item.pct.toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* By strategy — Bar chart */}
      <div className="rounded-lg border border-slate-800 bg-background p-4 shadow-[0_18px_45px_rgba(0,0,0,0.22)]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-black text-white">Performance par stratégie</h2>
          <span className="text-[10px] text-slate-600">{sourceLabel}</span>
        </div>

        {isLoading ? <Skeleton /> : (data?.byStrategy.length ?? 0) === 0 ? (
          <div className="flex h-40 items-center justify-center text-sm text-slate-600">Aucune donnée</div>
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <BarChart
              data={data!.byStrategy}
              layout="vertical"
              margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false}
                tickFormatter={v => `${Number(v) >= 0 ? '+' : ''}${Number(v).toFixed(0)}`} />
              <YAxis
                type="category"
                dataKey="strategy"
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                width={88}
              />
              <Tooltip content={<BarTooltip />} />
              <Bar dataKey="pnl" name="P&L" radius={[0, 3, 3, 0]} barSize={10}>
                {data!.byStrategy.map((entry, i) => (
                  <Cell key={i} fill={entry.pnl >= 0 ? '#22c55e' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
