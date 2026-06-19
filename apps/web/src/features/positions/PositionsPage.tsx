'use client'

import { RefreshCw } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { RiskSummaryCards }  from './components/RiskSummaryCards'
import { PositionsBySymbol } from './components/PositionsBySymbol'
import { RiskExposureChart } from './components/RiskExposureChart'

export function PositionsPage() {
  const qc = useQueryClient()

  return (
    <div className="px-5 py-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-foreground">Positions</h1>
          <p className="text-xs text-[hsl(var(--foreground-soft))] mt-0.5">Gestion du risque et suivi des positions ouvertes</p>
        </div>
        <button
          onClick={() => qc.invalidateQueries({ queryKey: ['portfolio'] })}
          className="flex items-center gap-2 rounded-lg border border-[hsl(var(--border))] bg-card px-3 py-1.5 text-xs font-medium text-[hsl(var(--foreground-soft))] transition-colors hover:text-foreground hover:border-[hsl(var(--border))]"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Actualiser
        </button>
      </div>

      <RiskSummaryCards />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <h2 className="text-sm font-semibold text-foreground mb-3">Positions par instrument</h2>
          <PositionsBySymbol />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3">Exposition</h2>
          <RiskExposureChart />
        </div>
      </div>
    </div>
  )
}
