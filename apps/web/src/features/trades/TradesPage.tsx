'use client'

import { useState } from 'react'
import { ArrowUpRight, ArrowDownRight, Clock, ChevronLeft, ChevronRight, Download, Plus } from 'lucide-react'
import { useTrades, type TradesFilters, buildQs } from '@/lib/hooks/use-trades'
import { useAccounts } from '@/lib/hooks/use-accounts'
import { TradesFilters as FiltersBar } from './components/TradesFilters'
import { TradeDetailModal } from './components/TradeDetailModal'
import { AddTradeModal } from './components/AddTradeModal'

const DEFAULT_FILTERS: TradesFilters = { page: 1, limit: 25, status: 'CLOSED' }

function TableSkeleton() {
  return (
    <tbody>
      {Array.from({ length: 8 }).map((_, i) => (
        <tr key={i} className="border-b border-[hsl(var(--border))]/40">
          {Array.from({ length: 7 }).map((_, j) => (
            <td key={j} className="py-3 pr-4">
              <div className="animate-pulse bg-[hsl(var(--accent))] rounded h-4 w-full" />
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
  const [addOpen, setAddOpen]       = useState(false)

  const { data, isLoading, isError }  = useTrades(filters)
  const { data: accounts = [] } = useAccounts()

  const totalPages = data ? Math.ceil(data.total / (filters.limit ?? 25)) : 0
  const currentPage = filters.page ?? 1

  function updateFilters(partial: Partial<TradesFilters>) {
    setFilters(prev => ({ ...prev, ...partial }))
  }

  const handleExport = () => {
    const { page: _page, limit: _limit, ...exportFilters } = filters
    const qs    = buildQs(exportFilters)
    const token = (window as unknown as Record<string, unknown>).__clerkToken as string | undefined
    const url   = `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/api/v1/trades/export?${qs}`
    fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then(r => r.blob())
      .then(blob => {
        const a     = document.createElement('a')
        a.href      = URL.createObjectURL(blob)
        a.download  = `trades-${new Date().toISOString().slice(0, 10)}.csv`
        a.click()
      })
      .catch(console.error)
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
          <h1 className="text-base font-bold text-foreground">Transactions</h1>
          <p className="text-xs text-[hsl(var(--foreground-soft))] mt-0.5">
            {isLoading ? '…' : `${data?.total ?? 0} trade${(data?.total ?? 0) > 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-card border border-[hsl(var(--border))] text-[hsl(var(--foreground-soft))] hover:text-foreground text-xs font-medium rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[hsl(var(--primary))] hover:bg-[hsl(244_42%_44%)] text-white text-xs font-medium rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Ajouter
          </button>
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
      <div className="bg-card border border-[hsl(var(--border))] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                {['Instrument', 'Direction', 'Ouverture', 'Fermeture', 'Lots', 'P&L', 'Stratégie'].map(h => (
                  <th key={h} className="text-left text-[11px] font-semibold text-[hsl(var(--foreground-soft))] px-4 py-3 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            {isLoading ? <TableSkeleton /> : (
              <tbody className="divide-y divide-[hsl(var(--border))]/40">
                {isError && (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-red-500 text-sm">
                      Erreur lors du chargement des trades — vérifiez la connexion au serveur.
                    </td>
                  </tr>
                )}
                {!isError && data?.items.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-[hsl(var(--foreground-soft))] text-sm">
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
                      className="hover:bg-[hsl(var(--accent))] cursor-pointer transition-colors group"
                    >
                      {/* Instrument */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-md bg-[hsl(var(--accent))] group-hover:bg-[hsl(var(--accent))] flex items-center justify-center text-[10px] font-bold text-[hsl(var(--foreground-soft))] transition-colors flex-shrink-0">
                            {trade.symbol.slice(0, 2)}
                          </div>
                          <span className="font-medium text-foreground whitespace-nowrap">{trade.symbol}</span>
                          {isOpen && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] border border-[hsl(var(--primary)/0.25)]">
                              Live
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Direction */}
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${trade.direction === 'LONG' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                          {trade.direction === 'LONG' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {trade.direction}
                        </span>
                      </td>

                      {/* Ouverture */}
                      <td className="px-4 py-3 text-[hsl(var(--foreground-soft))] font-mono text-xs whitespace-nowrap">
                        {fmtDate(trade.openTime)}
                      </td>

                      {/* Fermeture */}
                      <td className="px-4 py-3 text-xs whitespace-nowrap">
                        {fmtDate(trade.closeTime) ?? (
                          <span className="flex items-center gap-1 text-[hsl(var(--primary))]">
                            <Clock className="w-3 h-3" />En cours
                          </span>
                        )}
                      </td>

                      {/* Lots */}
                      <td className="px-4 py-3 text-[hsl(var(--foreground-soft))] font-mono text-xs">
                        {Number(trade.lotSize).toFixed(2)}
                      </td>

                      {/* P&L */}
                      <td className="px-4 py-3">
                        {pnl != null ? (
                          <div className={`font-mono font-semibold text-sm ${isPos ? 'text-emerald-600' : 'text-red-500'}`}>
                            {isPos ? '+' : ''}{pnl.toLocaleString('fr-FR', { style: 'currency', currency: 'USD' })}
                          </div>
                        ) : (
                          <span className="text-[hsl(var(--foreground-soft))] font-mono text-xs">{fmtPrice(null)}</span>
                        )}
                      </td>

                      {/* Stratégie */}
                      <td className="px-4 py-3">
                        {trade.strategyTag ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[hsl(var(--accent))] text-[hsl(var(--foreground-soft))] border border-[hsl(var(--border))]">
                            {trade.strategyTag}
                          </span>
                        ) : (
                          <span className="text-[hsl(var(--foreground-soft))]/50 text-xs">—</span>
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
          <div className="flex items-center justify-between px-4 py-3 border-t border-[hsl(var(--border))]">
            <span className="text-xs text-[hsl(var(--foreground-soft))]">
              Page {currentPage} / {totalPages} — {data?.total} trades
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => updateFilters({ page: currentPage - 1 })}
                disabled={currentPage <= 1}
                className="p-1.5 rounded-lg hover:bg-[hsl(var(--accent))] text-[hsl(var(--foreground-soft))] hover:text-foreground transition-colors disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => updateFilters({ page: currentPage + 1 })}
                disabled={currentPage >= totalPages}
                className="p-1.5 rounded-lg hover:bg-[hsl(var(--accent))] text-[hsl(var(--foreground-soft))] hover:text-foreground transition-colors disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal détail */}
      <TradeDetailModal tradeId={selectedId} onClose={() => setSelectedId(null)} />

      {/* Modal ajout */}
      <AddTradeModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  )
}
