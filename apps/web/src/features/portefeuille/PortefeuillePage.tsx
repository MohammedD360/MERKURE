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
      <div className="flex flex-col gap-3 border-b border-slate-800/80 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">Pilotage</p>
          <h1 className="mt-1 text-xl font-black text-white">Portefeuille</h1>
          <p className="mt-1 text-sm font-medium text-slate-500">Positions ouvertes, exposition et historique equity</p>
        </div>
        <button
          onClick={refresh}
          className="flex items-center gap-2 rounded-md border border-slate-800 bg-[#0b111c] px-3 py-2 text-xs font-black text-slate-300 transition-colors hover:border-slate-700 hover:text-white"
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
