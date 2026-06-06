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
    <div className="h-32 animate-pulse rounded-lg bg-slate-800/60" />
  )
}

function PnlTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-slate-700/70 bg-[#071017] px-3 py-2 text-xs shadow-xl">
      <p className="mb-1 text-slate-400">{label}</p>
      <p className="font-mono text-[#56bf6b]">
        P&L cumulé : {Number(payload[0]?.value ?? 0).toLocaleString('fr-FR', { style: 'currency', currency: 'USD' })}
      </p>
    </div>
  )
}

function DrawdownTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const val = Number(payload[0]?.value ?? 0)
  return (
    <div className="rounded-lg border border-slate-700/70 bg-[#071017] px-3 py-2 text-xs shadow-xl">
      <p className="mb-1 text-slate-400">{label}</p>
      <p className="font-mono text-rose-300">
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
    <div ref={ref} className="space-y-4 rounded-lg border border-slate-800 bg-background p-4 shadow-[0_14px_46px_rgba(0,0,0,0.18)]">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white">P&L cumulé & Drawdown</h2>
        <ChartDownloadButton onClick={download} isExporting={isExporting} />
      </div>

      {/* Courbe P&L */}
      <div>
        <p className="mb-1 text-[11px] font-black uppercase tracking-wider text-slate-500">P&L cumulé</p>
        {query.isLoading ? <ChartSkeleton /> : data.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-slate-600">
            Aucune donnée disponible
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={128}>
            <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#56bf6b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#56bf6b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false}
                tickFormatter={(v) => `${v > 0 ? '+' : ''}${Number(v).toFixed(0)}`} />
              <Tooltip content={<PnlTooltip />} />
              <ReferenceLine y={0} stroke="#374151" strokeDasharray="4 4" />
              <Area
                type="monotone"
                dataKey="cumPnl"
                stroke="#56bf6b"
                strokeWidth={2}
                fill="url(#pnlGrad)"
                dot={false}
                activeDot={{ r: 4, fill: '#56bf6b' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Courbe Drawdown */}
      <div>
        <p className="mb-1 text-[11px] font-black uppercase tracking-wider text-slate-500">Drawdown %</p>
        {query.isLoading ? <ChartSkeleton /> : data.length === 0 ? (
          <div className="flex h-24 items-center justify-center text-sm text-slate-600">
            Aucune donnée disponible
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={96}>
            <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="ddGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis
                tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false}
                tickFormatter={(v) => `${(Number(v) * 100).toFixed(0)}%`}
                reversed
              />
              <Tooltip content={<DrawdownTooltip />} />
              <Area
                type="monotone"
                dataKey="drawdownPct"
                stroke="#ef4444"
                strokeWidth={2}
                fill="url(#ddGrad)"
                dot={false}
                activeDot={{ r: 4, fill: '#ef4444' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
