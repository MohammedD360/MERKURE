'use client'

import { useQueryClient } from '@tanstack/react-query'
import { RefreshCw } from 'lucide-react'
import { MonthlyTable }    from './components/MonthlyTable'
import { SymbolStatsTable } from './components/SymbolStatsTable'
import { PnlDistribution }  from './components/PnlDistribution'
import { StreakAnalysis }   from './components/StreakAnalysis'

export function StatistiquesPage() {
  const qc = useQueryClient()

  const refresh = () => {
    void qc.invalidateQueries({ queryKey: ['stats'] })
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-end">
        <button
          onClick={refresh}
          className="flex items-center gap-2 rounded-xl border border-gray-700/60 bg-gray-800/40 px-3 py-2 text-xs font-medium text-gray-400 hover:text-white transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Actualiser
        </button>
      </div>

      <MonthlyTable />

      <SymbolStatsTable />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <PnlDistribution />
        <StreakAnalysis />
      </div>
    </div>
  )
}
