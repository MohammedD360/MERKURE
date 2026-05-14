'use client'

import { useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { ChevronDown } from 'lucide-react'
import { useKpiSnapshots, type ChartPeriod } from '@/lib/hooks/use-kpis'

const PERIODS = ['1J', '7J', '1M', '3M', '6M', 'YTD', '1Y', 'ALL'] as const

function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: { value: number }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  const val: number = payload[0]!.value
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs shadow-xl">
      <div className="text-gray-400 mb-1">{label}</div>
      <div className="font-semibold text-white">
        P&amp;L cumulé :{' '}
        <span className={val >= 0 ? 'text-indigo-400' : 'text-red-400'}>
          {val >= 0 ? '+' : ''}{val.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
        </span>
      </div>
    </div>
  )
}

function Skeleton() {
  return <div className="animate-pulse bg-gray-800 rounded-lg w-full h-[200px]" />
}

export function EquityChart() {
  const [period, setPeriod] = useState<ChartPeriod>('1M')
  const { data, isLoading } = useKpiSnapshots(period)

  const isEmpty = !isLoading && (!data || data.length === 0)

  return (
    <div className="bg-[#111827] border border-gray-800/60 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Évolution de la performance</h3>
        <button className="flex items-center gap-1.5 text-xs text-gray-400 bg-gray-800/60 border border-gray-700/60 rounded-lg px-3 py-1.5 hover:bg-gray-700/60 transition-colors">
          P&amp;L cumulé
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>

      {isLoading ? (
        <Skeleton />
      ) : isEmpty ? (
        <div className="flex items-center justify-center h-[200px] text-gray-600 text-sm">
          Aucun trade sur cette période
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data ?? []} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
            <defs>
              <linearGradient id="perfGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
            <ReferenceLine y={0} stroke="#374151" strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fill: '#6b7280', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: '#6b7280', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="cumPnl"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#perfGradient)"
              dot={false}
              activeDot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}

      <div className="flex gap-0.5 mt-3">
        {PERIODS.map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
              period === p
                ? 'bg-indigo-600 text-white'
                : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/60'
            }`}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  )
}
