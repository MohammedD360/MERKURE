'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useOpenPositions, usePortfolioSummary } from '@/lib/hooks/use-portfolio'
import type { OpenPosition } from '@/lib/hooks/use-portfolio'

function PnlBadge({ pnl }: { pnl: number }) {
  const pos = pnl >= 0
  return (
    <span className={`font-mono font-semibold ${pos ? 'text-emerald-600' : 'text-red-500'}`}>
      {pos ? '+' : ''}{pnl.toLocaleString('fr-FR', { style: 'currency', currency: 'USD' })}
    </span>
  )
}

function DirectionIcon({ dir }: { dir: 'LONG' | 'SHORT' }) {
  return dir === 'LONG'
    ? <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
    : <ArrowDownRight className="w-3.5 h-3.5 text-red-500" />
}

function SymbolGroup({ symbol, positions, balance }: {
  symbol:    string
  positions: OpenPosition[]
  balance:   number
}) {
  const [open, setOpen] = useState(true)

  const totalPnl  = positions.reduce((s, p) => s + p.pnl, 0)
  const totalLots = positions.reduce((s, p) => s + p.lotSize, 0)
  const riskPct   = balance > 0 ? Math.abs(totalPnl) / balance * 100 : 0
  const pos       = totalPnl >= 0

  return (
    <div className="border border-[hsl(var(--border))] rounded-xl overflow-hidden">
      {/* Group header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-card hover:bg-[hsl(var(--accent))] transition-colors"
      >
        <div className="w-8 h-8 rounded-lg bg-[hsl(var(--accent))] flex items-center justify-center text-[11px] font-bold text-foreground/70 flex-shrink-0">
          {symbol.slice(0, 2)}
        </div>
        <span className="font-semibold text-foreground">{symbol}</span>
        <span className="text-xs text-[hsl(var(--foreground-soft))]">{positions.length} position{positions.length > 1 ? 's' : ''}</span>
        <span className="text-xs text-foreground/50 font-mono">{totalLots.toFixed(2)} lots</span>
        <div className="ml-auto flex items-center gap-3">
          {/* Risk bar */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-20 h-1.5 bg-[hsl(var(--accent))] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${riskPct > 3 ? 'bg-red-500' : riskPct > 1 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                style={{ width: `${Math.min(riskPct * 10, 100)}%` }}
              />
            </div>
            <span className="text-[10px] text-[hsl(var(--foreground-soft))] w-10">{riskPct.toFixed(1)}%</span>
          </div>
          <span className={`font-mono font-semibold text-sm ${pos ? 'text-emerald-600' : 'text-red-500'}`}>
            {pos ? '+' : ''}{totalPnl.toLocaleString('fr-FR', { style: 'currency', currency: 'USD' })}
          </span>
          {open
            ? <ChevronDown className="w-4 h-4 text-[hsl(var(--foreground-soft))]" />
            : <ChevronRight className="w-4 h-4 text-[hsl(var(--foreground-soft))]" />
          }
        </div>
      </button>

      {/* Positions detail */}
      {open && (
        <div className="divide-y divide-[hsl(var(--border))] bg-white">
          {positions.map(pos => {
            const pnlPct = balance > 0 ? (pos.pnl / balance * 100) : 0

            return (
              <div key={pos.id} className="flex items-center gap-4 px-4 py-3 hover:bg-[hsl(var(--accent))] transition-colors">
                {/* Direction */}
                <div className={`flex items-center gap-1 text-xs font-medium w-16 ${pos.direction === 'LONG' ? 'text-emerald-600' : 'text-red-500'}`}>
                  <DirectionIcon dir={pos.direction} />
                  {pos.direction}
                </div>

                {/* Open price */}
                <div className="text-xs text-[hsl(var(--foreground-soft))] font-mono w-20">
                  @ {pos.openPrice.toFixed(pos.symbol.includes('JPY') ? 3 : 5)}
                </div>

                {/* Lots */}
                <div className="text-xs text-[hsl(var(--foreground-soft))] font-mono w-14">
                  {pos.lotSize.toFixed(2)} lot{pos.lotSize > 1 ? 's' : ''}
                </div>

                {/* Duration */}
                <div className="text-xs text-[hsl(var(--foreground-soft))] w-20">
                  {formatDistanceToNow(new Date(pos.openTime), { locale: fr, addSuffix: false })}
                </div>

                {/* Strategy */}
                <div className="flex-1 min-w-0">
                  {pos.strategyTag ? (
                    <span className="text-[10px] text-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.1)] px-2 py-0.5 rounded-full">
                      {pos.strategyTag}
                    </span>
                  ) : (
                    <span className="text-xs text-foreground/30">—</span>
                  )}
                </div>

                {/* P&L + % */}
                <div className="text-right">
                  <PnlBadge pnl={pos.pnl} />
                  <p className={`text-[10px] font-mono mt-0.5 ${pos.pnl >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {pos.pnl >= 0 ? '+' : ''}{pnlPct.toFixed(2)} %
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function PositionsBySymbol() {
  const { data: positions = [], isLoading } = useOpenPositions()
  const { data: summary }                   = usePortfolioSummary()
  const balance = summary?.balance ?? 10_000

  // Group by symbol
  const groups = new Map<string, OpenPosition[]>()
  for (const pos of positions) {
    if (!groups.has(pos.symbol)) groups.set(pos.symbol, [])
    groups.get(pos.symbol)!.push(pos)
  }
  // Sort groups by abs(totalPnl) desc
  const sorted = Array.from(groups.entries()).sort(([, a], [, b]) => {
    const pnlA = Math.abs(a.reduce((s, p) => s + p.pnl, 0))
    const pnlB = Math.abs(b.reduce((s, p) => s + p.pnl, 0))
    return pnlB - pnlA
  })

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-14 animate-pulse bg-[hsl(var(--accent))] rounded-xl" />
        ))}
      </div>
    )
  }

  if (positions.length === 0) {
    return (
      <div className="bg-card border border-[hsl(var(--border))] rounded-xl p-12 text-center">
        <p className="text-[hsl(var(--foreground-soft))] text-sm">Aucune position ouverte</p>
        <p className="text-foreground/30 text-xs mt-1">Les positions ouvertes apparaîtront ici lors de la prochaine synchronisation</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {sorted.map(([symbol, pos]) => (
        <SymbolGroup key={symbol} symbol={symbol} positions={pos} balance={balance} />
      ))}
    </div>
  )
}
