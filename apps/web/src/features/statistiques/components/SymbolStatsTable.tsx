'use client'

import { useState } from 'react'
import { useSymbolStats } from '@/lib/hooks/use-stats'
import type { KpiPeriod } from '@/lib/hooks/use-kpis'

const PERIODS: { value: KpiPeriod; label: string }[] = [
  { value: '7d',  label: '7j' },
  { value: '30d', label: '30j' },
  { value: '90d', label: '90j' },
  { value: '1y',  label: '1 an' },
  { value: 'all', label: 'Tout' },
]

function pnlColor(v: number) {
  return v >= 0 ? 'text-green-400' : 'text-red-400'
}

export function SymbolStatsTable() {
  const [period, setPeriod] = useState<KpiPeriod>('30d')
  const { data: rows = [], isLoading } = useSymbolStats(period)

  return (
    <div className="bg-card border border-gray-800/60 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-800/60 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">Statistiques par instrument</h2>
          <p className="text-[11px] text-gray-500 mt-0.5">{rows.length} symbole{rows.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-1">
          {PERIODS.map(p => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                period === p.value
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800/40">
              {['Symbole', 'Trades', 'Win Rate', 'P&L Total', 'Moy/Trade', 'PF', 'Meilleur', 'Pire'].map(h => (
                <th key={h} className="px-4 py-2.5 text-left text-[11px] text-gray-500 uppercase tracking-wider font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/30">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 animate-pulse bg-gray-800 rounded w-16" />
                    </td>
                  ))}
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-gray-600 text-sm">
                  Aucune donnée disponible
                </td>
              </tr>
            ) : (
              rows.map(row => (
                <tr key={row.symbol} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 font-semibold text-white font-mono">{row.symbol}</td>
                  <td className="px-4 py-3 text-gray-400 font-mono">{row.nbTrades}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${row.winRate >= 0.5 ? 'bg-green-500' : 'bg-red-500'}`}
                          style={{ width: `${row.winRate * 100}%` }}
                        />
                      </div>
                      <span className={`text-xs font-mono ${row.winRate >= 0.5 ? 'text-green-400' : 'text-red-400'}`}>
                        {(row.winRate * 100).toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td className={`px-4 py-3 font-mono font-semibold ${pnlColor(row.totalPnl)}`}>
                    {row.totalPnl >= 0 ? '+' : ''}
                    {row.totalPnl.toLocaleString('fr-FR', { style: 'currency', currency: 'USD' })}
                  </td>
                  <td className={`px-4 py-3 font-mono text-xs ${pnlColor(row.avgPnl)}`}>
                    {row.avgPnl >= 0 ? '+' : ''}
                    {row.avgPnl.toLocaleString('fr-FR', { style: 'currency', currency: 'USD' })}
                  </td>
                  <td className="px-4 py-3 font-mono text-gray-300 text-xs">
                    {row.profitFactor != null ? row.profitFactor.toFixed(2) : '—'}
                  </td>
                  <td className="px-4 py-3 font-mono text-green-400 text-xs">
                    +{row.bestTrade.toLocaleString('fr-FR', { style: 'currency', currency: 'USD' })}
                  </td>
                  <td className="px-4 py-3 font-mono text-red-400 text-xs">
                    {row.worstTrade.toLocaleString('fr-FR', { style: 'currency', currency: 'USD' })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
