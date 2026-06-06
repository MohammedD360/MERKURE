'use client'

import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { usePnlDistribution } from '@/lib/hooks/use-stats'
import type { KpiPeriod } from '@/lib/hooks/use-kpis'
import { useChartExport } from '@/lib/hooks/use-chart-export'
import { ChartDownloadButton } from '@/shared/components/ChartDownloadButton'

const PERIODS: { value: KpiPeriod; label: string }[] = [
  { value: '7d',  label: '7j' },
  { value: '30d', label: '30j' },
  { value: '90d', label: '90j' },
  { value: '1y',  label: '1 an' },
  { value: 'all', label: 'Tout' },
]

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: { label: string; count: number } }[] }) {
  if (!active || !payload?.length) return null
  const d = payload[0]!.payload
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-gray-400">{d.label}$</p>
      <p className="text-white font-semibold">{d.count} trade{d.count !== 1 ? 's' : ''}</p>
    </div>
  )
}

export function PnlDistribution() {
  const [period, setPeriod] = useState<KpiPeriod>('30d')
  const { data: buckets = [], isLoading } = usePnlDistribution(period)
  const { ref, download, isExporting } = useChartExport('distribution-pnl')

  return (
    <div ref={ref} className="bg-card border border-gray-800/60 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-800/60 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">Distribution des P&L</h2>
          <p className="text-[11px] text-gray-500 mt-0.5">Fréquence par tranche de $50</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {PERIODS.map(p => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                  period === p.value
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <ChartDownloadButton onClick={download} isExporting={isExporting} />
        </div>
      </div>

      <div className="px-4 py-4">
        {isLoading ? (
          <div className="h-48 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : buckets.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-gray-600 text-sm">
            Aucune donnée disponible
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={buckets} barCategoryGap="8%">
                <XAxis
                  dataKey="label"
                  tick={{ fill: '#6b7280', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="count" radius={[3, 3, 0, 0]} maxBarSize={28}>
                  {buckets.map((entry) => (
                    <Cell
                      key={`cell-${entry.bucket}`}
                      fill={entry.bucket >= 0 ? 'rgba(34,197,94,0.7)' : 'rgba(239,68,68,0.7)'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <div className="mt-3 flex items-center justify-between text-[11px] text-gray-500">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-sm bg-green-500/70 inline-block" />
                  Gains
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-sm bg-red-500/70 inline-block" />
                  Pertes
                </span>
              </div>
              <span>
                Mode :{' '}
                <span className="text-gray-300 font-mono">
                  {buckets.reduce((max, b) => b.count > max.count ? b : max, buckets[0]!).label}$
                </span>
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
