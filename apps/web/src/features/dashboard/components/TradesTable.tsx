'use client'

import { ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react'
import { useTrades, type Trade } from '@/lib/hooks/use-trades'

const DASHBOARD_CURRENCY = 'EUR'

export function TradesTable() {
  const { data, isLoading } = useTrades({ limit: 7 })
  const trades = data?.items ?? []

  return (
    <div className="rounded-lg border border-border bg-background p-5 shadow-[0_14px_40px_rgba(0,0,0,0.18)] lg:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Historique</p>
          <h3 className="mt-1 text-base font-black text-white">Trades récents</h3>
        </div>
        <a href="/app/trades" className="text-xs font-black text-blue-300 transition-colors hover:text-blue-200">
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
        <div className="flex h-28 items-center justify-center rounded-lg border border-dashed border-border bg-[#071017] text-sm font-semibold text-muted-foreground">
          Aucun trade récent
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Instrument', 'Direction', 'Ouverture', 'Fermeture', 'Lots', 'P&L'].map((h) => (
                  <th
                    key={h}
                    className="pb-3 pr-4 text-left text-[11px] font-black uppercase tracking-wider text-muted-foreground"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {trades.map((trade: Trade) => {
                const pnl      = Number(trade.pnl ?? 0)
                const isProfit = pnl >= 0
                const isOpen   = trade.status === 'OPEN'

                const fmtDate = (d: string | null) =>
                  d ? new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : null

                return (
                  <tr key={trade.id} className="group transition-colors hover:bg-white/[0.03]">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-[#071017] text-[10px] font-bold text-muted-foreground transition-colors group-hover:border-border">
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

                    <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">{fmtDate(trade.openTime)}</td>

                    <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">
                      {fmtDate(trade.closeTime) ?? (
                        <span className="flex items-center gap-1 text-indigo-400">
                          <Clock className="w-3 h-3" />
                          En cours
                        </span>
                      )}
                    </td>

                    <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">
                      {Number(trade.lotSize).toFixed(2)}
                    </td>

                    <td className="py-3">
                      <div className={`font-mono font-semibold text-sm ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                        {isProfit ? '+' : ''}
                        {pnl.toLocaleString('fr-FR', { style: 'currency', currency: DASHBOARD_CURRENCY })}
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
