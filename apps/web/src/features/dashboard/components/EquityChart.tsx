'use client'

import { useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { useKpiSnapshots, type ChartPeriod } from '@/lib/hooks/use-kpis'
import { useAccounts } from '@/lib/hooks/use-accounts'
import { useChartExport } from '@/lib/hooks/use-chart-export'
import { ChartDownloadButton } from '@/shared/components/ChartDownloadButton'

const PERIODS = ['1J', '7J', '1M', '3M', '6M', 'YTD', '1Y', 'ALL'] as const

interface EquityChartProps {
  period?: ChartPeriod
  onPeriodChange?: (period: ChartPeriod) => void
  periods?: readonly ChartPeriod[]
  accountId?: string | undefined
  hideAccountSelect?: boolean
  showPeriodControls?: boolean
}

const DASHBOARD_CURRENCY = 'EUR'

function Skeleton() {
  return <div className="h-[310px] w-full animate-pulse rounded-lg bg-white/[0.04]" />
}

export function EquityChart({
  period,
  onPeriodChange,
  periods = PERIODS,
  accountId,
  hideAccountSelect = false,
  showPeriodControls = true,
}: EquityChartProps = {}) {
  const [internalPeriod, setInternalPeriod] = useState<ChartPeriod>('1M')
  const [internalAccountId, setInternalAccountId] = useState<string | undefined>()
  const [view,      setView]      = useState<'cumul' | 'daily'>('cumul')
  const activePeriod = period ?? internalPeriod
  const activeAccountId = hideAccountSelect ? accountId : internalAccountId

  const { data, isLoading, isError, error, refetch } = useKpiSnapshots(activePeriod, activeAccountId)
  const { data: accounts = [] }     = useAccounts()
  const { ref, download, isExporting } = useChartExport('courbe-equity', '#0b111c')

  const isEmpty = !isLoading && (!data || data.length === 0)
  const dataKey = view === 'cumul' ? 'cumPnl' : 'pnl'
  const handlePeriodChange = (nextPeriod: ChartPeriod) => {
    if (onPeriodChange) onPeriodChange(nextPeriod)
    else setInternalPeriod(nextPeriod)
  }

  return (
    <div ref={ref} className="h-full rounded-lg border border-slate-800 bg-background p-5 shadow-[0_14px_40px_rgba(0,0,0,0.18)] lg:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">Courbe equity</p>
          <h3 className="mt-1 text-base font-black text-white">Évolution de la performance</h3>
          <div className="mt-3 inline-flex overflow-hidden rounded-md border border-slate-800 bg-[#071017] text-xs font-bold">
            <button
              onClick={() => setView('cumul')}
              className={`px-3 py-1.5 transition-colors ${view === 'cumul' ? 'bg-blue-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Cumulé
            </button>
            <button
              onClick={() => setView('daily')}
              className={`border-l border-slate-800 px-3 py-1.5 transition-colors ${view === 'daily' ? 'bg-blue-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Journalier
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          {showPeriodControls && (
            <div className="inline-flex overflow-hidden rounded-md border border-slate-800 bg-[#071017] text-xs font-black">
              {periods.map((p) => (
                <button
                  key={p}
                  onClick={() => handlePeriodChange(p)}
                  className={`px-3 py-2 transition-colors ${
                    activePeriod === p
                      ? 'bg-blue-700 text-white'
                      : 'text-slate-500 hover:bg-white/[0.04] hover:text-slate-300'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
          {!hideAccountSelect && accounts.length > 0 && (
            <select
              value={internalAccountId ?? ''}
              onChange={e => setInternalAccountId(e.target.value || undefined)}
              className="rounded-md border border-slate-800 bg-[#071017] px-3 py-2 text-xs font-semibold text-slate-300 outline-none transition-colors hover:bg-[#0f1724] focus:border-blue-500"
            >
              <option value="">Tous les comptes</option>
              {accounts.map(a => (
                <option key={a.id} value={a.id}>{a.label}</option>
              ))}
            </select>
          )}
          <ChartDownloadButton onClick={download} isExporting={isExporting} />
        </div>
      </div>

      {isLoading ? (
        <Skeleton />
      ) : isError ? (
        <div className="flex h-[310px] flex-col items-center justify-center rounded-lg border border-dashed border-[#ff5e70]/30 bg-[#ff5e70]/[0.04] px-4 text-center">
          <p className="text-sm font-black text-[#ff5e70]">Impossible de charger la courbe equity</p>
          <p className="mt-2 max-w-md text-xs font-semibold leading-5 text-slate-500">
            {error instanceof Error ? error.message : 'Erreur réseau ou API indisponible.'}
          </p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="mt-4 rounded-md border border-[#ff5e70]/25 bg-[#ff5e70]/10 px-3 py-2 text-xs font-black text-[#ff5e70] transition-colors hover:bg-[#ff5e70]/15"
          >
            Réessayer
          </button>
        </div>
      ) : isEmpty ? (
        <div className="flex h-[310px] items-center justify-center rounded-lg border border-dashed border-slate-800 bg-[#071017] text-sm font-semibold text-slate-500">
          Aucun trade sur cette période
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={310}>
          <AreaChart data={data ?? []} margin={{ top: 8, right: 12, bottom: 0, left: -8 }}>
            <defs>
              <linearGradient id="perfGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38e476" stopOpacity={0.34} />
                <stop offset="100%" stopColor="#38e476" stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
            <ReferenceLine y={0} stroke="#334155" strokeDasharray="3 3" />
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
            <Tooltip content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null
              const val = Number(payload[0]?.value ?? 0)
              return (
                <div className="rounded-md border border-slate-700 bg-background px-3 py-2 text-xs shadow-2xl">
                  <div className="mb-1 text-slate-400">{label}</div>
                  <div className="font-semibold text-white">
                    {view === 'cumul' ? 'P&L cumulé' : 'P&L journalier'} :{' '}
                    <span className={val >= 0 ? 'text-[#38e476]' : 'text-[#ff5e70]'}>
                      {val >= 0 ? '+' : ''}{val.toLocaleString('fr-FR', { style: 'currency', currency: DASHBOARD_CURRENCY })}
                    </span>
                  </div>
                </div>
              )
            }} />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke="#38e476"
              strokeWidth={2}
              fill="url(#perfGradient)"
              dot={false}
              activeDot={{ r: 5, fill: '#38e476', strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}

    </div>
  )
}
