'use client'

import { useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { useKpiSnapshots, type ChartPeriod } from '@/lib/hooks/use-kpis'
import { useAccounts } from '@/lib/hooks/use-accounts'

const PERIODS = ['1J', '7J', '1M', '3M', '6M', 'YTD', '1Y', 'ALL'] as const

function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: { value: number }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  const val: number = payload[0]!.value
  return (
    <div className="rounded-lg border border-[#243957] bg-[#0b1527] px-3 py-2 text-xs shadow-2xl">
      <div className="mb-1 text-slate-400">{label}</div>
      <div className="font-semibold text-white">
        P&amp;L cumulé :{' '}
        <span className={val >= 0 ? 'text-[#9b7cff]' : 'text-[#ff5e70]'}>
          {val >= 0 ? '+' : ''}{val.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
        </span>
      </div>
    </div>
  )
}

function Skeleton() {
  return <div className="h-[310px] w-full animate-pulse rounded-xl bg-white/[0.04]" />
}

export function EquityChart() {
  const [period,    setPeriod]    = useState<ChartPeriod>('1M')
  const [accountId, setAccountId] = useState<string | undefined>()

  const { data, isLoading }         = useKpiSnapshots(period, accountId)
  const { data: accounts = [] }     = useAccounts()

  const isEmpty = !isLoading && (!data || data.length === 0)

  return (
    <div className="h-full rounded-2xl border border-[#1e2f4a] bg-[#0b1527] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.035),0_18px_60px_rgba(0,0,0,0.22)]">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-white">Évolution de la performance</h3>
          <button className="mt-3 text-xs font-semibold text-[#a798ff]">P&amp;L cumulé</button>
        </div>

        {accounts.length > 0 && (
          <select
            value={accountId ?? ''}
            onChange={e => setAccountId(e.target.value || undefined)}
            className="rounded-lg border border-[#243957] bg-[#111b2d] px-3 py-2 text-xs text-slate-300 outline-none transition-colors hover:bg-[#16233a] focus:border-[#7c5cff]"
          >
            <option value="">Tous les comptes</option>
            {accounts.map(a => (
              <option key={a.id} value={a.id}>{a.label}</option>
            ))}
          </select>
        )}
      </div>

      {isLoading ? (
        <Skeleton />
      ) : isEmpty ? (
        <div className="flex h-[310px] items-center justify-center rounded-xl border border-dashed border-[#223653] bg-[#081220] text-sm text-slate-500">
          Aucun trade sur cette période
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={310}>
          <AreaChart data={data ?? []} margin={{ top: 8, right: 12, bottom: 0, left: -8 }}>
            <defs>
              <linearGradient id="perfGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7c5cff" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#7c5cff" stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1b2a42" vertical={false} />
            <ReferenceLine y={0} stroke="#2a3d5c" strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fill: '#71819c', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: '#71819c', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="cumPnl"
              stroke="#8f72ff"
              strokeWidth={2}
              fill="url(#perfGradient)"
              dot={false}
              activeDot={{ r: 5, fill: '#a78bff', strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}

      <div className="mt-4 flex flex-wrap gap-1">
        {PERIODS.map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              period === p
                ? 'bg-[#4f46e5] text-white shadow-[0_8px_18px_rgba(79,70,229,0.28)]'
                : 'text-slate-500 hover:bg-white/[0.04] hover:text-slate-300'
            }`}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  )
}
