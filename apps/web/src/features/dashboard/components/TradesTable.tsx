'use client'

import { ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react'
import { useTrades, type Trade } from '@/lib/hooks/use-trades'

export function TradesTable() {
  const { data, isLoading } = useTrades({ limit: 7 })
  const trades = data?.items ?? []

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-medium text-gray-400">Trades Récents</h3>
        <a href="/app/trades" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
          Voir tout →
        </a>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-800 rounded h-8" />
          ))}
        </div>
      ) : trades.length === 0 ? (
        <div className="flex items-center justify-center h-24 text-gray-600 text-sm">
          Aucun trade récent
        </div>
      ) : (
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                {['Instrument', 'Direction', 'Ouverture', 'Fermeture', 'Lots', 'P&L'].map((h) => (
                  <th
                    key={h}
                    className="text-left text-xs font-medium text-gray-500 pb-3 pr-4 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {trades.map((trade: Trade) => {
                const pnl      = Number(trade.pnl ?? 0)
                const isProfit = pnl >= 0
                const isOpen   = trade.status === 'OPEN'

                const fmtDate = (d: string | null) =>
                  d ? new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : null

                return (
                  <tr key={trade.id} className="hover:bg-gray-800/30 transition-colors group">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-md bg-gray-800 flex items-center justify-center text-[10px] font-bold text-gray-300 group-hover:bg-gray-700 transition-colors">
                          {trade.symbol.slice(0, 2)}
                        </div>
                        <span className="font-medium text-white">{trade.symbol}</span>
                        {isOpen && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            Live
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 pr-4">
                      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        trade.direction === 'LONG'
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-red-500/10 text-red-400'
                      }`}>
                        {trade.direction === 'LONG'
                          ? <ArrowUpRight className="w-3 h-3" />
                          : <ArrowDownRight className="w-3 h-3" />}
                        {trade.direction}
                      </div>
                    </td>

                    <td className="py-3 pr-4 text-gray-400 font-mono text-xs">{fmtDate(trade.openTime)}</td>

                    <td className="py-3 pr-4 text-gray-400 font-mono text-xs">
                      {fmtDate(trade.closeTime) ?? (
                        <span className="flex items-center gap-1 text-indigo-400">
                          <Clock className="w-3 h-3" />
                          En cours
                        </span>
                      )}
                    </td>

                    <td className="py-3 pr-4 text-gray-400 font-mono text-xs">
                      {Number(trade.lotSize).toFixed(2)}
                    </td>

                    <td className="py-3">
                      <div className={`font-mono font-semibold text-sm ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                        {isProfit ? '+' : ''}
                        {pnl.toLocaleString('fr-FR', { style: 'currency', currency: 'USD' })}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
