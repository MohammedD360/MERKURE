'use client'

import { useState } from 'react'
import { Download, RefreshCw } from 'lucide-react'

import { cn } from '@/lib/utils'
import {
  chartPeriodToApiPeriod,
  useKpiBreakdown,
  type ChartPeriod,
} from '@/lib/hooks/use-kpis'
import { useCurrentUser } from '@/lib/hooks/use-current-user'
import { KpiCards } from '@/features/dashboard/components/KpiCards'
import { EquityChart } from '@/features/dashboard/components/EquityChart'
import { RiskPanel } from '@/features/dashboard/components/RiskPanel'
import { TradesTable } from '@/features/dashboard/components/TradesTable'
import { AiAnalysisBanner } from '@/features/dashboard/components/AiAnalysisBanner'
import { AssetBreakdown } from '@/features/dashboard/components/AssetBreakdown'
import { StatsCles, StrategyPerformance } from '@/features/dashboard/components/StatsAndStrategy'
import { EconomicCalendar } from '@/features/dashboard/components/EconomicCalendar'
import { RightPanel } from '@/features/dashboard/components/RightPanel'
import { AiScoreCard } from '@/features/dashboard/components/AiScoreCard'
import { BehavioralCard } from '@/features/dashboard/components/BehavioralCard'

const PERIODS: Array<{ label: string; value: ChartPeriod; description: string }> = [
  { label: '7J',  value: '7J',  description: 'court terme' },
  { label: '1M',  value: '1M',  description: '30 derniers jours' },
  { label: '3M',  value: '3M',  description: 'trimestre' },
  { label: 'YTD', value: 'YTD', description: 'année en cours' },
  { label: 'ALL', value: 'ALL', description: 'historique complet' },
]

function PeriodSelector({
  value,
  onChange,
}: {
  value: ChartPeriod
  onChange: (period: ChartPeriod) => void
}) {
  return (
    <div className="inline-flex rounded-md border border-border bg-white p-1">
      {PERIODS.map((period) => (
        <button
          key={period.value}
          type="button"
          onClick={() => onChange(period.value)}
          className={cn(
            'h-8 rounded px-3 text-xs font-bold transition-colors',
            value === period.value
              ? 'bg-foreground text-white'
              : 'text-muted-foreground hover:bg-[hsl(var(--accent))] hover:text-foreground',
          )}
          title={period.description}
        >
          {period.label}
        </button>
      ))}
    </div>
  )
}

export function DashboardPage() {
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>('1M')
  const kpiPeriod = chartPeriodToApiPeriod(chartPeriod)
  const { data: user } = useCurrentUser()
  const breakdownQuery = useKpiBreakdown(kpiPeriod)

  const firstName = user?.firstName ?? 'Alex'

  return (
    <div className="min-h-screen bg-[#f6f7f9] px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px] space-y-5">

        {/* ── Barre de titre compacte ─────────────────────────────────── */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-base font-bold text-foreground">
              Bonjour {firstName}
            </h1>
            <p className="text-xs text-muted-foreground">Vue d'ensemble · {PERIODS.find(p => p.value === chartPeriod)?.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <PeriodSelector value={chartPeriod} onChange={setChartPeriod} />
            <button
              type="button"
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-white px-3 text-xs font-bold text-muted-foreground transition-colors hover:bg-[hsl(var(--accent))] hover:text-foreground"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Sync
            </button>
            <button
              type="button"
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-white px-3 text-xs font-bold text-muted-foreground transition-colors hover:bg-[hsl(var(--accent))] hover:text-foreground"
            >
              <Download className="h-3.5 w-3.5" />
              Export
            </button>
          </div>
        </div>

        {/* ── KPI Cards ───────────────────────────────────────────────── */}
        <KpiCards period={kpiPeriod} />

        {/* ── IA Row — Score + Comportements côte à côte ──────────────── */}
        <div className="grid gap-5 lg:grid-cols-2">
          <AiScoreCard period={kpiPeriod} />
          <BehavioralCard period={kpiPeriod} />
        </div>

        {/* ── Contenu principal ────────────────────────────────────────── */}
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0 space-y-5">
            <EquityChart
              period={chartPeriod}
              onPeriodChange={setChartPeriod}
              periods={PERIODS.map(p => p.value)}
            />

            <AiAnalysisBanner />

            <div className="grid gap-5 2xl:grid-cols-2">
              <AssetBreakdown
                data={breakdownQuery.data}
                isLoading={breakdownQuery.isLoading}
              />
              <StrategyPerformance
                data={breakdownQuery.data}
                isLoading={breakdownQuery.isLoading}
              />
            </div>

            <TradesTable />
          </div>

          {/* ── Sidebar droite allégée ──────────────────────────────── */}
          <aside className="min-w-0 space-y-5">
            <RiskPanel />
            <StatsCles period={kpiPeriod} />
            <RightPanel />
            <EconomicCalendar />
          </aside>
        </div>

      </div>
    </div>
  )
}
