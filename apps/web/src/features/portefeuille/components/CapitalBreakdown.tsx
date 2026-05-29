'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { usePortfolioBreakdown } from '@/lib/hooks/use-portfolio'

function Skeleton() {
  return <div className="h-40 animate-pulse bg-gray-800/60 rounded-lg" />
}

function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-[#1a2235] border border-gray-700/60 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-white font-semibold">{d.symbol}</p>
      <p className="text-gray-400">{d.lots.toFixed(2)} lots — {d.pct.toFixed(1)} %</p>
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
    <div className="bg-[#1a2235] border border-gray-700/60 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-white font-semibold mb-1">{label}</p>
      <p className="text-gray-400">{payload[0]?.payload?.count} trades</p>
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
      <div className="bg-[#111827] border border-gray-800/60 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white">Répartition par instrument</h2>
          <span className="text-[10px] text-gray-600">{sourceLabel}</span>
        </div>

        {isLoading ? <Skeleton /> : (data?.bySymbol.length ?? 0) === 0 ? (
          <div className="h-40 flex items-center justify-center text-gray-600 text-sm">Aucune donnée</div>
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
                  stroke="#111827"
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
                  <span className="text-xs text-gray-300 font-mono font-medium w-16">{item.symbol}</span>
                  <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${item.pct}%`, backgroundColor: item.color }} />
                  </div>
                  <span className="text-[10px] text-gray-500 w-8 text-right">{item.pct.toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* By strategy — Bar chart */}
      <div className="bg-[#111827] border border-gray-800/60 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white">Performance par stratégie</h2>
          <span className="text-[10px] text-gray-600">{sourceLabel}</span>
        </div>

        {isLoading ? <Skeleton /> : (data?.byStrategy.length ?? 0) === 0 ? (
          <div className="h-40 flex items-center justify-center text-gray-600 text-sm">Aucune donnée</div>
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <BarChart
              data={data!.byStrategy}
              layout="vertical"
              margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false}
                tickFormatter={v => `${Number(v) >= 0 ? '+' : ''}${Number(v).toFixed(0)}`} />
              <YAxis
                type="category"
                dataKey="strategy"
                tick={{ fill: '#9ca3af', fontSize: 10 }}
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
