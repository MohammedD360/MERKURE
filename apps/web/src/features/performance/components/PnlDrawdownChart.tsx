'use client'

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { usePerformanceCurve } from '@/lib/hooks/use-performance'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useChartExport } from '@/lib/hooks/use-chart-export'
import { ChartDownloadButton } from '@/shared/components/ChartDownloadButton'

interface Props {
  from:       string
  to:         string
  accountId?: string
}

function ChartSkeleton() {
  return (
    <div className="h-32 animate-pulse rounded-lg bg-accent/60" />
  )
}

function PnlTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-[hsl(var(--border))] bg-white px-3 py-2 text-xs shadow-xl">
      <p className="mb-1 text-[hsl(var(--foreground-soft))]">{label}</p>
      <p className="font-mono text-emerald-600">
        P&L cumulé : {Number(payload[0]?.value ?? 0).toLocaleString('fr-FR', { style: 'currency', currency: 'USD' })}
      </p>
    </div>
  )
}

function DrawdownTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const val = Number(payload[0]?.value ?? 0)
  return (
    <div className="rounded-lg border border-[hsl(var(--border))] bg-white px-3 py-2 text-xs shadow-xl">
      <p className="mb-1 text-[hsl(var(--foreground-soft))]">{label}</p>
      <p className="font-mono text-red-500">
        Drawdown : {(val * 100).toFixed(2)} %
      </p>
    </div>
  )
}

export function PnlDrawdownChart({ from, to, accountId }: Props) {
  const query = usePerformanceCurve(from, to, ...accountId ? [accountId] : [])
  const { ref, download, isExporting } = useChartExport('pnl-drawdown')

  const data = (query.data ?? []).map(p => ({
    label:       format(new Date(p.date), 'dd MMM', { locale: fr }),
    cumPnl:      p.cumPnl,
    drawdownPct: p.drawdownPct,
  }))

  return (
    <div ref={ref} className="space-y-4 rounded-lg border border-border bg-background p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">P&L cumulé & Drawdown</h2>
        <ChartDownloadButton onClick={download} isExporting={isExporting} />
      </div>

      {/* Courbe P&L */}
      <div>
        <p className="mb-1 text-[11px] font-black uppercase tracking-wider text-[hsl(var(--foreground-soft))]">P&L cumulé</p>
        {query.isLoading ? <ChartSkeleton /> : data.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-[hsl(var(--foreground-soft))]">
            Aucune donnée disponible
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={128}>
            <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#16a34a" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="label" tick={{ fill: '#9ca3af', fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} tickLine={false} axisLine={false}
                tickFormatter={(v) => `${v > 0 ? '+' : ''}${Number(v).toFixed(0)}`} />
              <Tooltip content={<PnlTooltip />} />
              <ReferenceLine y={0} stroke="#e5e7eb" strokeDasharray="4 4" />
              <Area
                type="monotone"
                dataKey="cumPnl"
                stroke="#16a34a"
                strokeWidth={2}
                fill="url(#pnlGrad)"
                dot={false}
                activeDot={{ r: 4, fill: '#16a34a' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Courbe Drawdown */}
      <div>
        <p className="mb-1 text-[11px] font-black uppercase tracking-wider text-[hsl(var(--foreground-soft))]">Drawdown %</p>
        {query.isLoading ? <ChartSkeleton /> : data.length === 0 ? (
          <div className="flex h-24 items-center justify-center text-sm text-[hsl(var(--foreground-soft))]">
            Aucune donnée disponible
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={96}>
            <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="ddGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#dc2626" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="label" tick={{ fill: '#9ca3af', fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis
                tick={{ fill: '#9ca3af', fontSize: 10 }} tickLine={false} axisLine={false}
                tickFormatter={(v) => `${(Number(v) * 100).toFixed(0)}%`}
                reversed
              />
              <Tooltip content={<DrawdownTooltip />} />
              <Area
                type="monotone"
                dataKey="drawdownPct"
                stroke="#dc2626"
                strokeWidth={2}
                fill="url(#ddGrad)"
                dot={false}
                activeDot={{ r: 4, fill: '#dc2626' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
