'use client'

import { RefreshCw } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { ExposureCards }      from './components/ExposureCards'
import { OpenPositionsTable } from './components/OpenPositionsTable'
import { CapitalBreakdown }   from './components/CapitalBreakdown'
import { EquityCurveChart }   from './components/EquityCurveChart'

export function PortefeuillePage() {
  const qc = useQueryClient()

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['portfolio'] })
  }

  return (
    <div className="space-y-5 px-4 py-5 sm:px-6 lg:px-8">
      {/* En-tête */}
      <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Pilotage</p>
          <h1 className="mt-1 text-xl font-black text-white">Portefeuille</h1>
          <p className="mt-1 text-sm font-medium text-muted-foreground">Positions ouvertes, exposition et historique equity</p>
        </div>
        <button
          onClick={refresh}
          className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-xs font-black text-muted-foreground transition-colors hover:border-border hover:text-foreground"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Actualiser
        </button>
      </div>

      {/* Cartes exposition */}
      <ExposureCards />

      {/* Positions ouvertes */}
      <OpenPositionsTable />

      {/* Répartition capital */}
      <CapitalBreakdown />

      {/* Equity curve */}
      <EquityCurveChart />
    </div>
  )
}
