'use client'

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { usePortfolioEquityCurve } from '@/lib/hooks/use-portfolio'
import { useChartExport } from '@/lib/hooks/use-chart-export'
import { ChartDownloadButton } from '@/shared/components/ChartDownloadButton'

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-white px-3 py-2 text-xs shadow-xl">
      <p className="mb-1 text-muted-foreground">{label}</p>
      <p className="font-mono text-[hsl(var(--primary))]">
        Equity : {Number(payload[0]?.value ?? 0).toLocaleString('fr-FR', { style: 'currency', currency: 'USD' })}
      </p>
      {payload[1] && (
        <p className="text-amber-600 font-mono">
          Balance : {Number(payload[1]?.value ?? 0).toLocaleString('fr-FR', { style: 'currency', currency: 'USD' })}
        </p>
      )}
    </div>
  )
}

export function EquityCurveChart() {
  const { data: raw = [], isLoading } = usePortfolioEquityCurve()
  const { ref, download, isExporting } = useChartExport('equity-curve')

  const data = raw.map(p => ({
    label:   format(new Date(p.date), 'dd MMM', { locale: fr }),
    equity:  p.equity,
    balance: p.balance,
  }))

  const minVal = data.length > 0
    ? Math.min(...data.map(d => Math.min(d.equity, d.balance))) * 0.995
    : 0

  return (
    <div ref={ref} className="rounded-lg border border-border bg-background p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-black text-foreground">Historique equity (90 jours)</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-0.5 w-2.5 rounded bg-[hsl(var(--primary))]" />Equity
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-0.5 w-2.5 rounded bg-amber-500" />Balance
            </span>
          </div>
          <ChartDownloadButton onClick={download} isExporting={isExporting} />
        </div>
      </div>

      {isLoading ? (
        <div className="h-48 animate-pulse rounded-lg bg-accent/70" />
      ) : data.length === 0 ? (
        <div className="flex h-48 items-center justify-center text-sm text-muted-foreground/60">
          Aucune donnée historique
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={192}>
          <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="hsl(244, 42%, 51%)" stopOpacity={0.18} />
                <stop offset="95%" stopColor="hsl(244, 42%, 51%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="label"
              tick={{ fill: '#9ca3af', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: '#9ca3af', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              domain={[minVal, 'auto']}
              tickFormatter={v => `${(Number(v) / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="#e5e7eb" strokeDasharray="4 4" />
            <Area
              type="monotone"
              dataKey="balance"
              stroke="#f59e0b"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              fill="url(#balanceGrad)"
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="equity"
              stroke="hsl(244, 42%, 51%)"
              strokeWidth={2}
              fill="url(#equityGrad)"
              dot={false}
              activeDot={{ r: 4, fill: 'hsl(244, 42%, 51%)' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
