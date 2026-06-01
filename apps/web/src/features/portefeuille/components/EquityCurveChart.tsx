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
    <div className="rounded-lg border border-slate-700 bg-[#101827] px-3 py-2 text-xs shadow-xl">
      <p className="mb-1 text-slate-400">{label}</p>
      <p className="font-mono text-blue-300">
        Equity : {Number(payload[0]?.value ?? 0).toLocaleString('fr-FR', { style: 'currency', currency: 'USD' })}
      </p>
      {payload[1] && (
        <p className="text-amber-400 font-mono">
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
    <div ref={ref} className="rounded-lg border border-slate-800 bg-[#0b111c] p-4 shadow-[0_18px_45px_rgba(0,0,0,0.22)]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-black text-white">Historique equity (90 jours)</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 text-[10px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-0.5 w-2.5 rounded bg-blue-400" />Equity
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-0.5 w-2.5 rounded bg-amber-400" />Balance
            </span>
          </div>
          <ChartDownloadButton onClick={download} isExporting={isExporting} />
        </div>
      </div>

      {isLoading ? (
        <div className="h-48 animate-pulse rounded-lg bg-slate-800/70" />
      ) : data.length === 0 ? (
        <div className="flex h-48 items-center justify-center text-sm text-slate-600">
          Aucune donnée historique
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={192}>
          <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.22} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="label"
              tick={{ fill: '#64748b', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              domain={[minVal, 'auto']}
              tickFormatter={v => `${(Number(v) / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="#334155" strokeDasharray="4 4" />
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
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#equityGrad)"
              dot={false}
              activeDot={{ r: 4, fill: '#3b82f6' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
