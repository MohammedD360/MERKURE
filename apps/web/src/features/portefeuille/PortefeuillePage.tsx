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
    <div className="px-5 py-4 space-y-4">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-white">Portefeuille</h1>
          <p className="text-xs text-gray-500 mt-0.5">Positions ouvertes, exposition et historique equity</p>
        </div>
        <button
          onClick={refresh}
          className="flex items-center gap-2 rounded-lg border border-gray-800/60 bg-[#111827] px-3 py-1.5 text-xs font-medium text-gray-400 transition-colors hover:text-white hover:border-gray-700"
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
