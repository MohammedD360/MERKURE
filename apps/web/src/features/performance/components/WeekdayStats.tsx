'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'
import { useWeekdayStats } from '@/lib/hooks/use-performance'
import type { KpiPeriod } from '@/lib/hooks/use-kpis'

interface Props {
  period:     KpiPeriod
  accountId?: string
}

const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

function Skeleton() {
  return (
    <div className="flex gap-2 items-end h-32">
      {Array.from({ length: 7 }).map((_, i) => (
        <div
          key={i}
          className="flex-1 animate-pulse rounded-t bg-accent/60"
          style={{ height: `${30 + Math.random() * 70}%` }}
        />
      ))}
    </div>
  )
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border/70 bg-[#071017] px-3 py-2 text-xs shadow-xl">
      <p className="mb-1 font-medium text-muted-foreground">{label}</p>
      <p className="text-muted-foreground">Trades : {payload[0]?.payload?.nbTrades ?? 0}</p>
      <p className={`font-mono ${Number(payload[0]?.value ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
        P&L : {Number(payload[0]?.value ?? 0).toLocaleString('fr-FR', { style: 'currency', currency: 'USD' })}
      </p>
    </div>
  )
}

export function WeekdayStats({ period, accountId }: Props) {
  const query = useWeekdayStats(period, ...accountId ? [accountId] : [])

  // Normalise les données : s'assure que les 7 jours existent
  const raw = query.data ?? []
  const data = DAY_LABELS.map((label, idx) => {
    const found = raw.find(d => d.day === idx)
    return {
      label,
      totalPnl: found?.totalPnl ?? 0,
      nbTrades: found?.nbTrades ?? 0,
    }
  })

  return (
    <div className="rounded-lg border border-border bg-background p-4 shadow-[0_14px_46px_rgba(0,0,0,0.18)]">
      <h2 className="mb-4 text-sm font-black text-white">Performance par jour</h2>

      {query.isLoading ? <Skeleton /> : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis
              tick={{ fill: '#6b7280', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${Number(v) >= 0 ? '' : ''}${Number(v).toFixed(0)}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="totalPnl" name="P&L" radius={[4, 4, 0, 0]} barSize={24}>
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
