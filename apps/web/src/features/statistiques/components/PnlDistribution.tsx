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
    <div className="bg-white border border-[hsl(var(--border))] rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-[hsl(var(--foreground-soft))]">{d.label}$</p>
      <p className="text-foreground font-semibold">{d.count} trade{d.count !== 1 ? 's' : ''}</p>
    </div>
  )
}

export function PnlDistribution() {
  const [period, setPeriod] = useState<KpiPeriod>('30d')
  const { data: buckets = [], isLoading } = usePnlDistribution(period)
  const { ref, download, isExporting } = useChartExport('distribution-pnl')

  return (
    <div ref={ref} className="bg-card border border-[hsl(var(--border))] rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-[hsl(var(--border))] flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Distribution des P&L</h2>
          <p className="text-[11px] text-[hsl(var(--foreground-soft))] mt-0.5">Fréquence par tranche de $50</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {PERIODS.map(p => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                  period === p.value
                    ? 'bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] border border-[hsl(var(--primary)/0.25)]'
                    : 'text-[hsl(var(--foreground-soft))] hover:text-foreground'
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
            <div className="w-8 h-8 border-2 border-[hsl(var(--primary)/0.3)] border-t-[hsl(var(--primary))] rounded-full animate-spin" />
          </div>
        ) : buckets.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-[hsl(var(--foreground-soft))] text-sm">
            Aucune donnée disponible
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={buckets} barCategoryGap="8%">
                <XAxis
                  dataKey="label"
                  tick={{ fill: '#9ca3af', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
                <Bar dataKey="count" radius={[3, 3, 0, 0]} maxBarSize={28}>
                  {buckets.map((entry) => (
                    <Cell
                      key={`cell-${entry.bucket}`}
                      fill={entry.bucket >= 0 ? 'rgba(22,163,74,0.7)' : 'rgba(220,38,38,0.7)'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <div className="mt-3 flex items-center justify-between text-[11px] text-[hsl(var(--foreground-soft))]">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-sm bg-emerald-600/70 inline-block" />
                  Gains
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-sm bg-red-500/70 inline-block" />
                  Pertes
                </span>
              </div>
              <span>
                Mode :{' '}
                <span className="text-foreground/80 font-mono">
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
