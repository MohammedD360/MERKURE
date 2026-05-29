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
    <div className="h-32 animate-pulse bg-gray-800/60 rounded-lg" />
  )
}

function PnlTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1a2235] border border-gray-700/60 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-gray-400 mb-1">{label}</p>
      <p className="text-indigo-400 font-mono">
        P&L cumulé : {Number(payload[0]?.value ?? 0).toLocaleString('fr-FR', { style: 'currency', currency: 'USD' })}
      </p>
    </div>
  )
}

function DrawdownTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const val = Number(payload[0]?.value ?? 0)
  return (
    <div className="bg-[#1a2235] border border-gray-700/60 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-gray-400 mb-1">{label}</p>
      <p className="text-red-400 font-mono">
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
    <div ref={ref} className="bg-[#111827] border border-gray-800/60 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white">P&L cumulé & Drawdown</h2>
        <ChartDownloadButton onClick={download} isExporting={isExporting} />
      </div>

      {/* Courbe P&L */}
      <div>
        <p className="text-[11px] text-gray-500 mb-1 uppercase tracking-wider">P&L cumulé</p>
        {query.isLoading ? <ChartSkeleton /> : data.length === 0 ? (
          <div className="h-32 flex items-center justify-center text-gray-600 text-sm">
            Aucune donnée disponible
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={128}>
            <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
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
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#pnlGrad)"
                dot={false}
                activeDot={{ r: 4, fill: '#6366f1' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Courbe Drawdown */}
      <div>
        <p className="text-[11px] text-gray-500 mb-1 uppercase tracking-wider">Drawdown %</p>
        {query.isLoading ? <ChartSkeleton /> : data.length === 0 ? (
          <div className="h-24 flex items-center justify-center text-gray-600 text-sm">
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
