'use client'

import { useState } from 'react'
import { ArrowUpRight, ArrowDownRight, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTrades, type TradesFilters } from '@/lib/hooks/use-trades'
import { useAccounts } from '@/lib/hooks/use-accounts'
import { TradesFilters as FiltersBar } from './components/TradesFilters'
import { TradeDetailModal } from './components/TradeDetailModal'

const DEFAULT_FILTERS: TradesFilters = { page: 1, limit: 25, status: 'CLOSED' }

function TableSkeleton() {
  return (
    <tbody>
      {Array.from({ length: 8 }).map((_, i) => (
        <tr key={i} className="border-b border-gray-800/40">
          {Array.from({ length: 7 }).map((_, j) => (
            <td key={j} className="py-3 pr-4">
              <div className="animate-pulse bg-gray-800 rounded h-4 w-full" />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  )
}

export function TradesPage() {
  const [filters, setFilters]       = useState<TradesFilters>(DEFAULT_FILTERS)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const { data, isLoading }  = useTrades(filters)
  const { data: accounts = [] } = useAccounts()

  const totalPages = data ? Math.ceil(data.total / (filters.limit ?? 25)) : 0
  const currentPage = filters.page ?? 1

  function updateFilters(partial: Partial<TradesFilters>) {
    setFilters(prev => ({ ...prev, ...partial }))
  }

  const fmtDate = (d: string | null) =>
    d ? new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : null

  const fmtPrice = (p: string | null) =>
    p ? Number(p).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 5 }) : '—'

  return (
    <div className="px-5 py-4 space-y-4">
      {/* Titre + compteur */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-white">Transactions</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {isLoading ? '…' : `${data?.total ?? 0} trade${(data?.total ?? 0) > 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      {/* Filtres */}
      <FiltersBar
        filters={filters}
        accounts={accounts}
        onChange={updateFilters}
        onReset={() => setFilters(DEFAULT_FILTERS)}
      />

      {/* Table */}
      <div className="bg-[#111827] border border-gray-800/60 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                {['Instrument', 'Direction', 'Ouverture', 'Fermeture', 'Lots', 'P&L', 'Stratégie'].map(h => (
                  <th key={h} className="text-left text-[11px] font-semibold text-gray-500 px-4 py-3 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            {isLoading ? <TableSkeleton /> : (
              <tbody className="divide-y divide-gray-800/40">
                {data?.items.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-gray-600 text-sm">
                      Aucun trade sur cette période
                    </td>
                  </tr>
                )}
                {data?.items.map(trade => {
                  const pnl   = trade.pnl != null ? Number(trade.pnl) : null
                  const isPos = (pnl ?? 0) >= 0
                  const isOpen = trade.status === 'OPEN'

                  return (
                    <tr
                      key={trade.id}
                      onClick={() => setSelectedId(trade.id)}
                      className="hover:bg-gray-800/40 cursor-pointer transition-colors group"
                    >
                      {/* Instrument */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-md bg-gray-800 group-hover:bg-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-300 transition-colors flex-shrink-0">
                            {trade.symbol.slice(0, 2)}
                          </div>
                          <span className="font-medium text-white whitespace-nowrap">{trade.symbol}</span>
                          {isOpen && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                              Live
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Direction */}
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${trade.direction === 'LONG' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                          {trade.direction === 'LONG' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {trade.direction}
                        </span>
                      </td>

                      {/* Ouverture */}
                      <td className="px-4 py-3 text-gray-400 font-mono text-xs whitespace-nowrap">
                        {fmtDate(trade.openTime)}
                      </td>

                      {/* Fermeture */}
                      <td className="px-4 py-3 text-xs whitespace-nowrap">
                        {fmtDate(trade.closeTime) ?? (
                          <span className="flex items-center gap-1 text-indigo-400">
                            <Clock className="w-3 h-3" />En cours
                          </span>
                        )}
                      </td>

                      {/* Lots */}
                      <td className="px-4 py-3 text-gray-400 font-mono text-xs">
                        {Number(trade.lotSize).toFixed(2)}
                      </td>

                      {/* P&L */}
                      <td className="px-4 py-3">
                        {pnl != null ? (
                          <div className={`font-mono font-semibold text-sm ${isPos ? 'text-green-400' : 'text-red-400'}`}>
                            {isPos ? '+' : ''}{pnl.toLocaleString('fr-FR', { style: 'currency', currency: 'USD' })}
                          </div>
                        ) : (
                          <span className="text-gray-600 font-mono text-xs">{fmtPrice(null)}</span>
                        )}
                      </td>

                      {/* Stratégie */}
                      <td className="px-4 py-3">
                        {trade.strategyTag ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-gray-800 text-gray-300 border border-gray-700/60">
                            {trade.strategyTag}
                          </span>
                        ) : (
                          <span className="text-gray-700 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            )}
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800/60">
            <span className="text-xs text-gray-500">
              Page {currentPage} / {totalPages} — {data?.total} trades
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => updateFilters({ page: currentPage - 1 })}
                disabled={currentPage <= 1}
                className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-500 hover:text-white transition-colors disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => updateFilters({ page: currentPage + 1 })}
                disabled={currentPage >= totalPages}
                className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-500 hover:text-white transition-colors disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal détail */}
      <TradeDetailModal tradeId={selectedId} onClose={() => setSelectedId(null)} />
    </div>
  )
}
