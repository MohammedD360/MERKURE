'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { RefreshCw } from 'lucide-react'
import type { KpiPeriod } from '@/lib/hooks/use-kpis'
import { StatsOverviewWidget } from './components/StatsOverviewWidget'
import { WeekdayPnlChart }     from './components/WeekdayPnlChart'
import { DurationChart }        from './components/DurationChart'
import { MonthlyTable }         from './components/MonthlyTable'
import { SymbolStatsTable }     from './components/SymbolStatsTable'
import { PnlDistribution }      from './components/PnlDistribution'
import { StreakAnalysis }        from './components/StreakAnalysis'

const PERIODS: { value: KpiPeriod; label: string }[] = [
  { value: '7d',  label: '7j' },
  { value: '30d', label: '30j' },
  { value: '90d', label: '90j' },
  { value: '1y',  label: '1 an' },
  { value: 'all', label: 'Tout' },
]

export function StatistiquesPage() {
  const qc = useQueryClient()
  const [period, setPeriod] = useState<KpiPeriod>('30d')

  const refresh = () => {
    void qc.invalidateQueries({ queryKey: ['stats'] })
  }

  return (
    <div className="space-y-6 px-4 py-5 sm:px-6 lg:px-8">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-wider text-[hsl(var(--foreground-soft))]">Analyse</p>
          <h1 className="mt-0.5 text-lg font-black text-foreground">Statistiques</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Period selector */}
          <div className="grid grid-cols-5 overflow-hidden rounded-md border border-border bg-white text-xs font-black sm:inline-flex">
            {PERIODS.map(p => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPeriod(p.value)}
                className={`px-3 py-2 transition-colors ${
                  period === p.value
                    ? 'bg-[hsl(var(--primary))] text-white'
                    : 'text-[hsl(var(--foreground-soft))] hover:bg-[hsl(var(--accent))] hover:text-foreground'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            onClick={refresh}
            className="flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-2 text-xs font-semibold text-[hsl(var(--foreground-soft))] transition-colors hover:text-foreground"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Actualiser
          </button>
        </div>
      </div>

      {/* ── Overview 4-section widget ────────────────────────────────────── */}
      <StatsOverviewWidget period={period} />

      {/* ── Charts row: Weekday + Duration ───────────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <WeekdayPnlChart defaultPeriod={period} />
        <DurationChart   defaultPeriod={period} />
      </div>

      {/* ── Distribution + Streak ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <PnlDistribution />
        <StreakAnalysis />
      </div>

      {/* ── Monthly table ────────────────────────────────────────────────── */}
      <MonthlyTable />

      {/* ── By symbol ────────────────────────────────────────────────────── */}
      <SymbolStatsTable />

    </div>
  )
}
