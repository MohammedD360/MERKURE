'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'
import { useSessionStats } from '@/lib/hooks/use-performance'
import type { KpiPeriod } from '@/lib/hooks/use-kpis'

interface Props {
  period:     KpiPeriod
  accountId?: string
}

function Skeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-6 animate-pulse rounded bg-slate-800/60" />
      ))}
    </div>
  )
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-slate-700/70 bg-[#071017] px-3 py-2 text-xs shadow-xl">
      <p className="mb-1 font-medium text-slate-300">{label}</p>
      {payload.map((p: { name: string; value: number; color: string }, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-mono">
          {p.name} : {p.name === 'P&L' ? Number(p.value).toLocaleString('fr-FR', { style: 'currency', currency: 'USD' }) : p.value}
        </p>
      ))}
    </div>
  )
}

export function SessionStats({ period, accountId }: Props) {
  const query = useSessionStats(period, ...accountId ? [accountId] : [])

  const data = (query.data ?? []).map(s => ({
    session:  s.session,
    nbTrades: s.nbTrades,
    totalPnl: s.totalPnl,
  }))

  return (
    <div className="rounded-lg border border-slate-800 bg-[#0b111c] p-4 shadow-[0_14px_46px_rgba(0,0,0,0.18)]">
      <h2 className="mb-4 text-sm font-black text-white">Performance par session</h2>

      {query.isLoading ? <Skeleton /> : data.length === 0 ? (
        <div className="flex h-48 items-center justify-center text-sm text-slate-600">
          Aucune donnée disponible
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
            <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} />
            <YAxis
              type="category"
              dataKey="session"
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={72}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="nbTrades" name="Trades" fill="#6b7280" radius={[0, 3, 3, 0]} barSize={8} />
            <Bar dataKey="totalPnl" name="P&L" radius={[0, 3, 3, 0]} barSize={8}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.totalPnl >= 0 ? '#22c55e' : '#ef4444'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
