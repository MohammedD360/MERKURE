'use client'

import Link from 'next/link'
import { ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react'
import { useTrades, type Trade } from '@/lib/hooks/use-trades'
import { useCurrency } from '@/lib/hooks/use-currency'
import { formatMoney } from '@/lib/format'
import { SectionHeader, EmptyState } from './_ui'

export function TradesTable() {
  const { data, isLoading } = useTrades({ limit: 7 })
  const trades = data?.items ?? []
  const currency = useCurrency()

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <SectionHeader
        className="mb-5"
        eyebrow="Historique"
        title="Trades récents"
        action={
          <Link href="/app/trades" className="shrink-0 text-xs font-bold text-[hsl(var(--primary))] transition-colors hover:text-[hsl(243_90%_58%)]">
            Voir tout →
          </Link>
        }
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-[hsl(var(--accent))] rounded h-8" />
          ))}
        </div>
      ) : trades.length === 0 ? (
        <EmptyState title="Aucun trade récent" hint="Vos trades synchronisés apparaîtront ici." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Instrument', 'Direction', 'Ouverture', 'Fermeture', 'Lots', 'P&L'].map((h) => (
                  <th
                    key={h}
                    className="pb-3 pr-4 text-left text-sm font-medium text-muted-foreground"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border))]">
              {trades.map((trade: Trade) => {
                const pnl      = Number(trade.pnl ?? 0)
                const isProfit = pnl >= 0
                const isOpen   = trade.status === 'OPEN'

                const fmtDate = (d: string | null) =>
                  d ? new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : null

                return (
                  <tr key={trade.id} className="group transition-colors hover:bg-[hsl(var(--accent))]">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-card text-[10px] font-bold text-muted-foreground transition-colors group-hover:border-border">
                          {trade.symbol.slice(0, 2)}
                        </div>
                        <span className="font-medium text-foreground">{trade.symbol}</span>
                        {isOpen && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] border border-[hsl(var(--primary)/0.2)]">
                            Live
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 pr-4">
                      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        trade.direction === 'LONG'
                          ? 'bg-green-500/10 text-green-500'
                          : 'bg-red-500/10 text-red-500'
                      }`}>
                        {trade.direction === 'LONG'
                          ? <ArrowUpRight className="w-3 h-3" />
                          : <ArrowDownRight className="w-3 h-3" />}
                        {trade.direction}
                      </div>
                    </td>

                    <td className="py-3 pr-4 tabular-nums text-xs text-muted-foreground">{fmtDate(trade.openTime)}</td>

                    <td className="py-3 pr-4 tabular-nums text-xs text-muted-foreground">
                      {fmtDate(trade.closeTime) ?? (
                        <span className="flex items-center gap-1 text-[hsl(var(--primary))]">
                          <Clock className="w-3 h-3" />
                          En cours
                        </span>
                      )}
                    </td>

                    <td className="py-3 pr-4 tabular-nums text-xs text-muted-foreground">
                      {Number(trade.lotSize).toFixed(2)}
                    </td>

                    <td className="py-3">
                      <div className={`tabular-nums font-semibold text-sm ${isProfit ? 'text-green-500' : 'text-red-500'}`}>
                        {formatMoney(pnl, { currency, signed: true })}
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
