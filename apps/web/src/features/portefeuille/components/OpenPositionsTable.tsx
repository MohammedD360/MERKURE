'use client'

import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useOpenPositions } from '@/lib/hooks/use-portfolio'

function DirectionBadge({ dir }: { dir: 'LONG' | 'SHORT' }) {
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
      dir === 'LONG'
        ? 'bg-green-500/10 text-green-500 border-green-500/30'
        : 'bg-red-500/10 text-red-500 border-red-500/30'
    }`}>
      {dir}
    </span>
  )
}

function PnlCell({ pnl }: { pnl: number }) {
  const pos = pnl >= 0
  return (
    <span className={`tabular-nums font-semibold ${pos ? 'text-green-500' : 'text-red-500'}`}>
      {pos ? '+' : ''}{pnl.toLocaleString('fr-FR', { style: 'currency', currency: 'USD' })}
    </span>
  )
}

function SkeletonRow() {
  return (
    <tr>
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 w-16 animate-pulse rounded bg-accent/70" />
        </td>
      ))}
    </tr>
  )
}

export function OpenPositionsTable() {
  const { data: positions = [], isLoading } = useOpenPositions()

  return (
    <div className="rounded-lg border border-border bg-background shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">Positions ouvertes</h2>
        <span className="tabular-nums text-xs text-muted-foreground">
          {positions.length} actif{positions.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {['Symbole', 'Dir.', 'Ouverture', 'Px ouvert', 'Lots', 'P&L flottant', 'Stratégie'].map(h => (
                <th key={h} className="px-4 py-2.5 text-left text-xs text-muted-foreground">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(var(--border))]">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)
            ) : positions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground/60">
                  Aucune position ouverte en ce moment
                </td>
              </tr>
            ) : (
              positions.map(pos => (
                <tr key={pos.id} className="hover:bg-[hsl(var(--accent))] transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-semibold text-foreground tabular-nums">{pos.symbol}</span>
                  </td>
                  <td className="px-4 py-3">
                    <DirectionBadge dir={pos.direction} />
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {format(new Date(pos.openTime), 'dd MMM HH:mm', { locale: fr })}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">
                    {pos.openPrice.toFixed(pos.symbol === 'USDJPY' ? 3 : pos.symbol.includes('JPY') ? 3 : 5)}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">
                    {pos.lotSize.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <PnlCell pnl={pos.pnl} />
                  </td>
                  <td className="px-4 py-3">
                    {pos.strategyTag ? (
                      <span className="rounded-full bg-[hsl(var(--primary)/0.08)] px-2 py-0.5 text-xs text-[hsl(var(--primary))]">
                        {pos.strategyTag}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground/60">—</span>
                    )}
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
