'use client'

import { useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { useCurrency } from '@/lib/hooks/use-currency'
import { formatMoney } from '@/lib/format'
import type { KpiBreakdown } from '@/lib/api-client'
import { EmptyState } from './_ui'

type Mode = 'volume' | 'pnl'

function CustomTooltip({ active, payload, mode, currency }: {
  active?: boolean
  payload?: { payload: { label: string; pct: number; pnl: number; nbTrades: number } }[]
  mode: Mode
  currency: string
}) {
  if (!active || !payload?.length) return null
  const d = payload[0]!.payload
  return (
    <div className="rounded-md border border-border bg-card px-3 py-2 text-xs shadow-lg">
      <div className="font-medium text-foreground">{d.label}</div>
      {mode === 'volume' ? (
        <div className="mt-0.5 text-muted-foreground">{d.pct}% des trades ({d.nbTrades})</div>
      ) : (
        <div className={`mt-0.5 ${d.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {formatMoney(d.pnl, { currency, signed: true, fractionDigits: 0 })}
        </div>
      )}
    </div>
  )
}

export function AssetBreakdown({
  data,
  isLoading = false,
}: {
  data?: KpiBreakdown | undefined
  isLoading?: boolean
}) {
  const [mode, setMode] = useState<Mode>('volume')
  const currency = useCurrency()
  const assets = data?.bySymbol ?? []

  const pieData = assets.map(a => ({
    ...a,
    _pieValue: mode === 'volume' ? a.pct : Math.abs(a.pnl),
  }))

  const centerLabel = mode === 'volume'
    ? { value: assets.reduce((s, a) => s + a.nbTrades, 0).toString(), sub: 'trades' }
    : {
        value: formatMoney(assets.reduce((s, a) => s + a.pnl, 0), { currency, fractionDigits: 0 }),
        sub: 'P&L total',
      }

  return (
    <div className="h-full rounded-lg border border-border bg-card p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-2xl font-semibold leading-none tracking-tight text-foreground">Répartition des actifs</h3>
          <p className="mt-1.5 text-sm text-muted-foreground">Allocation des trades par instrument</p>
        </div>
        <div className="inline-flex overflow-hidden rounded-md border border-border bg-card text-xs font-bold">
          <button
            onClick={() => setMode('volume')}
            className={`px-3 py-1.5 transition-colors ${mode === 'volume' ? 'bg-[hsl(var(--primary))] text-white' : 'text-muted-foreground hover:text-foreground/80'}`}
          >
            Nb trades
          </button>
          <button
            onClick={() => setMode('pnl')}
            className={`border-l border-border px-3 py-1.5 transition-colors ${mode === 'pnl' ? 'bg-[hsl(var(--primary))] text-white' : 'text-muted-foreground hover:text-foreground/80'}`}
          >
            Par P&amp;L
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <div className="mx-auto h-[220px] w-[220px] animate-pulse rounded-full bg-[hsl(var(--accent))]" />
          <div className="space-y-4 pt-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-5 animate-pulse rounded bg-[hsl(var(--accent))]" />
            ))}
          </div>
        </div>
      ) : assets.length === 0 ? (
        <EmptyState className="h-[310px]" title="Aucun trade sur cette période" />
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
                <Tooltip content={<CustomTooltip mode={mode} currency={currency} />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-xs text-muted-foreground">{centerLabel.sub}</div>
              <div className="mt-1 tabular-nums text-xl font-semibold text-foreground">{centerLabel.value}</div>
            </div>
          </div>

          <div className="space-y-4">
            {assets.map((asset) => (
              <div key={asset.label} className="grid grid-cols-[1fr_auto_auto] items-center gap-4 text-sm">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: asset.color }} />
                  <span className="truncate text-muted-foreground">{asset.label}</span>
                </div>
                <span className="tabular-nums text-xs text-muted-foreground">
                  {mode === 'volume' ? `${asset.pct}%` : `${asset.nbTrades} trades`}
                </span>
                <span className={`min-w-20 text-right tabular-nums text-xs ${asset.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatMoney(asset.pnl, { currency, signed: true, fractionDigits: 0 })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
