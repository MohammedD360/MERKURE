'use client'

import { useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { useKpiSnapshots, type ChartPeriod } from '@/lib/hooks/use-kpis'
import { useAccounts } from '@/lib/hooks/use-accounts'
import { useChartExport } from '@/lib/hooks/use-chart-export'
import { useCurrency } from '@/lib/hooks/use-currency'
import { formatMoney } from '@/lib/format'
import { ChartDownloadButton } from '@/shared/components/ChartDownloadButton'
import { cn } from '@/lib/utils'
import { EmptyState } from './_ui'

const PERIODS = ['1J', '7J', '1M', '3M', '6M', 'YTD', '1Y', 'ALL'] as const

interface EquityChartProps {
  period?: ChartPeriod
  onPeriodChange?: (period: ChartPeriod) => void
  periods?: readonly ChartPeriod[]
  accountId?: string | undefined
  hideAccountSelect?: boolean
  showPeriodControls?: boolean
}

function Skeleton() {
  return <div className="h-[310px] w-full animate-pulse rounded-lg bg-[hsl(var(--accent))]" />
}

/** Menu déroulant de filtre — gabarit commun aux trois selects de l'en-tête. */
const SELECT_CLS =
  'h-9 rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground outline-none transition-colors hover:bg-accent focus:border-primary'

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
  const currency = useCurrency()
  const { ref, download, isExporting } = useChartExport('courbe-equity', '#09090b')

  const isEmpty = !isLoading && (!data || data.length === 0)
  const dataKey = view === 'cumul' ? 'cumPnl' : 'pnl'

  const netPnl = data && data.length > 0 ? Number(data[data.length - 1]?.cumPnl ?? 0) : 0
  // La trajectoire porte la couleur de marque ; le signe est porté par la
  // valeur chiffrée au-dessus, en vert ou en rouge. Une courbe verte de plus
  // ne dirait rien que le nombre ne dit déjà.
  const lineColor = 'hsl(var(--primary))'
  const handlePeriodChange = (nextPeriod: ChartPeriod) => {
    if (onPeriodChange) onPeriodChange(nextPeriod)
    else setInternalPeriod(nextPeriod)
  }

  return (
    <div ref={ref} className="rounded-lg border border-border bg-card p-6 text-card-foreground">
      {/* En-tête « Performance » : titre, résultat dominant, puis les filtres
          en menus déroulants — même typologie que le bandeau d'entrée. */}
      <div className="mb-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-2xl font-semibold leading-none tracking-tight">Performance</h3>
            <div className="mt-3 flex flex-wrap items-baseline gap-3">
              <span
                className={cn(
                  'text-[32px] font-bold leading-none tracking-tight tabular-nums',
                  netPnl >= 0 ? 'text-green-500' : 'text-red-500',
                )}
              >
                {isLoading || isEmpty ? '—' : formatMoney(netPnl, { currency, signed: true })}
              </span>
              <span className="text-sm text-muted-foreground">
                {isEmpty ? 'aucun trade sur la période' : `cumulé sur ${activePeriod}`}
              </span>
            </div>
          </div>
          <ChartDownloadButton onClick={download} isExporting={isExporting} />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {showPeriodControls && (
            <select
              value={activePeriod}
              onChange={e => handlePeriodChange(e.target.value as ChartPeriod)}
              aria-label="Période affichée"
              className={SELECT_CLS}
            >
              {periods.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          )}
          <select
            value={view}
            onChange={e => setView(e.target.value as 'cumul' | 'daily')}
            aria-label="Vue du graphique"
            className={SELECT_CLS}
          >
            <option value="cumul">Cumulé</option>
            <option value="daily">Journalier</option>
          </select>
          {!hideAccountSelect && accounts.length > 0 && (
            <select
              value={internalAccountId ?? ''}
              onChange={e => setInternalAccountId(e.target.value || undefined)}
              aria-label="Compte affiché"
              className={SELECT_CLS}
            >
              <option value="">Tous les comptes</option>
              {accounts.map(a => (
                <option key={a.id} value={a.id}>{a.label}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {isLoading ? (
        <Skeleton />
      ) : isError ? (
        <div className="flex h-[310px] flex-col items-center justify-center rounded-lg border border-dashed border-red-500/40 bg-red-500/5 px-4 text-center">
          <p className="text-sm font-semibold text-red-500">Impossible de charger la courbe equity</p>
          <p className="mt-2 max-w-md text-xs leading-5 text-muted-foreground">
            {error instanceof Error ? error.message : 'Erreur réseau ou API indisponible.'}
          </p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="mt-4 h-9 rounded-md border border-red-500/40 px-3 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/10"
          >
            Réessayer
          </button>
        </div>
      ) : isEmpty ? (
        <EmptyState className="h-[310px]" title="Aucun trade sur cette période" />
      ) : (
        <ResponsiveContainer width="100%" height={310}>
          <AreaChart data={data ?? []} margin={{ top: 8, right: 12, bottom: 0, left: -8 }}>
            <defs>
              <linearGradient id="perfGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={lineColor} stopOpacity={0.28} />
                <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <ReferenceLine y={0} stroke="hsl(var(--border))" strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
              width={40}
            />
            <Tooltip content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null
              const val = Number(payload[0]?.value ?? 0)
              return (
                <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-lg">
                  <div className="mb-1 text-muted-foreground">{label}</div>
                  <div className="font-semibold text-foreground">
                    {view === 'cumul' ? 'P&L cumulé' : 'P&L journalier'} :{' '}
                    <span className={val >= 0 ? 'text-green-500' : 'text-red-500'}>
                      {formatMoney(val, { currency, signed: true })}
                    </span>
                  </div>
                </div>
              )
            }} />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={lineColor}
              strokeWidth={2}
              fill="url(#perfGradient)"
              dot={false}
              activeDot={{ r: 5, fill: lineColor, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}

    </div>
  )
}
