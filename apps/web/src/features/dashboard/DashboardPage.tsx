'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Download, RefreshCw } from 'lucide-react'

import { cn } from '@/lib/utils'
import {
  chartPeriodToApiPeriod,
  useKpiBreakdown,
  type ChartPeriod,
} from '@/lib/hooks/use-kpis'
import { useAccounts, useSyncAccount } from '@/lib/hooks/use-accounts'
import { useChartExport } from '@/lib/hooks/use-chart-export'
import { HeadlineKpis } from '@/features/dashboard/components/HeadlineKpis'
import { MarketTicker } from '@/features/dashboard/components/MarketTicker'
import { EquityChart } from '@/features/dashboard/components/EquityChart'
import { RiskPanel } from '@/features/dashboard/components/RiskPanel'
import { TradesTable } from '@/features/dashboard/components/TradesTable'
import { AssetBreakdown } from '@/features/dashboard/components/AssetBreakdown'
import { StatsCles, StrategyPerformance } from '@/features/dashboard/components/StatsAndStrategy'

const PERIODS: Array<{ label: string; value: ChartPeriod; description: string }> = [
  { label: '7J',  value: '7J',  description: 'court terme' },
  { label: '1M',  value: '1M',  description: '30 derniers jours' },
  { label: '3M',  value: '3M',  description: 'trimestre' },
  { label: 'YTD', value: 'YTD', description: 'année en cours' },
  { label: 'ALL', value: 'ALL', description: 'historique complet' },
]

/** Segments de période — anatomie de bouton shadcn de la référence (h-9, 6px). */
function PeriodSelector({
  value,
  onChange,
}: {
  value: ChartPeriod
  onChange: (period: ChartPeriod) => void
}) {
  return (
    <div className="flex items-center gap-2">
      {PERIODS.map((period) => (
        <button
          key={period.value}
          type="button"
          onClick={() => onChange(period.value)}
          title={period.description}
          className={cn(
            'h-9 rounded-md px-3 text-sm font-medium transition-colors',
            value === period.value
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground',
          )}
        >
          {period.label}
        </button>
      ))}
    </div>
  )
}

/**
 * Ligne 4/3 — le rythme de colonnes du dashboard de référence.
 * `side` optionnel : une carte peut occuper ses 4 colonnes sans être étirée.
 */
function SplitRow({ main, side }: { main: React.ReactNode; side?: React.ReactNode }) {
  return (
    <div className="grid gap-4 lg:grid-cols-7">
      <div className="min-w-0 lg:col-span-4">{main}</div>
      {side && <div className="min-w-0 lg:col-span-3">{side}</div>}
    </div>
  )
}

export function DashboardPage() {
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>('1M')
  const kpiPeriod = chartPeriodToApiPeriod(chartPeriod)
  const breakdownQuery = useKpiBreakdown(kpiPeriod)

  const queryClient = useQueryClient()
  const { data: accounts = [] } = useAccounts()
  const syncAccount = useSyncAccount()
  const [isSyncing, setIsSyncing] = useState(false)
  const { ref: exportRef, download: exportPng, isExporting } = useChartExport('merkure-vue-ensemble', '#09090b')

  async function handleSync() {
    if (isSyncing) return
    setIsSyncing(true)
    try {
      const active = accounts.filter((a) => a.isActive)
      await Promise.allSettled(active.map((a) => syncAccount.mutateAsync(a.id)))
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['kpis'] }),
        queryClient.invalidateQueries({ queryKey: ['risk'] }),
        queryClient.invalidateQueries({ queryKey: ['performance'] }),
        queryClient.invalidateQueries({ queryKey: ['trades'] }),
      ])
    } finally {
      setIsSyncing(false)
    }
  }

  const secondaryBtn =
    'inline-flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50'

  return (
    <div ref={exportRef} className="space-y-6">

      {/* ── Bandeau d'entrée : état + 4 KPI dominants ───────────────────── */}
      <HeadlineKpis
        actions={
          <>
            <span className="hidden text-sm text-muted-foreground sm:inline">Détail sur</span>
            <PeriodSelector value={chartPeriod} onChange={setChartPeriod} />
            <button
              type="button"
              onClick={() => void handleSync()}
              disabled={isSyncing}
              aria-label="Synchroniser les comptes"
              className={secondaryBtn}
            >
              <RefreshCw className={cn('h-4 w-4', isSyncing && 'animate-spin')} />
              {isSyncing ? 'Sync…' : 'Sync'}
            </button>
            <button
              type="button"
              onClick={() => void exportPng()}
              disabled={isExporting}
              aria-label="Exporter la vue d'ensemble en image"
              className={secondaryBtn}
            >
              <Download className="h-4 w-4" />
              {isExporting ? 'Export…' : 'Export'}
            </button>
          </>
        }
      />

      {/* ── Cours live (Or, Nasdaq) ──────────────────────────────────────── */}
      <MarketTicker />

      {/* ── Performance, pleine largeur ─────────────────────────────────── */}
      <div className="border-t border-border pt-6">
        <EquityChart
          period={chartPeriod}
          onPeriodChange={setChartPeriod}
          periods={PERIODS.map((p) => p.value)}
          showPeriodControls={false}
        />
      </div>

      {/* ── Derniers trades + répartition d'actifs ──────────────────────── */}
      <SplitRow
        main={<TradesTable />}
        side={<AssetBreakdown data={breakdownQuery.data} isLoading={breakdownQuery.isLoading} />}
      />

      {/* ── Stratégies (gauche) + risque et statistiques clés (droite, empilés) ── */}
      <SplitRow
        main={<StrategyPerformance data={breakdownQuery.data} isLoading={breakdownQuery.isLoading} />}
        side={
          <div className="space-y-4">
            <RiskPanel />
            <StatsCles period={kpiPeriod} />
          </div>
        }
      />
    </div>
  )
}
