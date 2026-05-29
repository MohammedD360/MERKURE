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
    <span className={`font-mono font-semibold ${pos ? 'text-green-400' : 'text-red-400'}`}>
      {pos ? '+' : ''}{pnl.toLocaleString('fr-FR', { style: 'currency', currency: 'USD' })}
    </span>
  )
}

function DirectionIcon({ dir }: { dir: 'LONG' | 'SHORT' }) {
  return dir === 'LONG'
    ? <ArrowUpRight className="w-3.5 h-3.5 text-green-400" />
    : <ArrowDownRight className="w-3.5 h-3.5 text-red-400" />
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
    <div className="border border-gray-800/60 rounded-xl overflow-hidden">
      {/* Group header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-[#111827] hover:bg-gray-800/50 transition-colors"
      >
        <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-[11px] font-bold text-gray-300 flex-shrink-0">
          {symbol.slice(0, 2)}
        </div>
        <span className="font-semibold text-white">{symbol}</span>
        <span className="text-xs text-gray-500">{positions.length} position{positions.length > 1 ? 's' : ''}</span>
        <span className="text-xs text-gray-600 font-mono">{totalLots.toFixed(2)} lots</span>
        <div className="ml-auto flex items-center gap-3">
          {/* Risk bar */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-20 h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${riskPct > 3 ? 'bg-red-500' : riskPct > 1 ? 'bg-amber-500' : 'bg-green-500'}`}
                style={{ width: `${Math.min(riskPct * 10, 100)}%` }}
              />
            </div>
            <span className="text-[10px] text-gray-500 w-10">{riskPct.toFixed(1)}%</span>
          </div>
          <span className={`font-mono font-semibold text-sm ${pos ? 'text-green-400' : 'text-red-400'}`}>
            {pos ? '+' : ''}{totalPnl.toLocaleString('fr-FR', { style: 'currency', currency: 'USD' })}
          </span>
          {open
            ? <ChevronDown className="w-4 h-4 text-gray-500" />
            : <ChevronRight className="w-4 h-4 text-gray-500" />
          }
        </div>
      </button>

      {/* Positions detail */}
      {open && (
        <div className="divide-y divide-gray-800/40 bg-[#090d14]">
          {positions.map(pos => {
            const pnlPct = balance > 0 ? (pos.pnl / balance * 100) : 0

            return (
              <div key={pos.id} className="flex items-center gap-4 px-4 py-3 hover:bg-gray-800/20 transition-colors">
                {/* Direction */}
                <div className={`flex items-center gap-1 text-xs font-medium w-16 ${pos.direction === 'LONG' ? 'text-green-400' : 'text-red-400'}`}>
                  <DirectionIcon dir={pos.direction} />
                  {pos.direction}
                </div>

                {/* Open price */}
                <div className="text-xs text-gray-400 font-mono w-20">
                  @ {pos.openPrice.toFixed(pos.symbol.includes('JPY') ? 3 : 5)}
                </div>

                {/* Lots */}
                <div className="text-xs text-gray-500 font-mono w-14">
                  {pos.lotSize.toFixed(2)} lot{pos.lotSize > 1 ? 's' : ''}
                </div>

                {/* Duration */}
                <div className="text-xs text-gray-500 w-20">
                  {formatDistanceToNow(new Date(pos.openTime), { locale: fr, addSuffix: false })}
                </div>

                {/* Strategy */}
                <div className="flex-1 min-w-0">
                  {pos.strategyTag ? (
                    <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                      {pos.strategyTag}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-700">—</span>
                  )}
                </div>

                {/* P&L + % */}
                <div className="text-right">
                  <PnlBadge pnl={pos.pnl} />
                  <p className={`text-[10px] font-mono mt-0.5 ${pos.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
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
          <div key={i} className="h-14 animate-pulse bg-gray-800/60 rounded-xl" />
        ))}
      </div>
    )
  }

  if (positions.length === 0) {
    return (
      <div className="bg-[#111827] border border-gray-800/60 rounded-xl p-12 text-center">
        <p className="text-gray-500 text-sm">Aucune position ouverte</p>
        <p className="text-gray-700 text-xs mt-1">Les positions ouvertes apparaîtront ici lors de la prochaine synchronisation</p>
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
