'use client'

import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useOpenPositions } from '@/lib/hooks/use-portfolio'

function DirectionBadge({ dir }: { dir: 'LONG' | 'SHORT' }) {
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
      dir === 'LONG'
        ? 'bg-green-500/15 text-green-400 border-green-500/30'
        : 'bg-red-500/15 text-red-400 border-red-500/30'
    }`}>
      {dir}
    </span>
  )
}

function PnlCell({ pnl }: { pnl: number }) {
  const pos = pnl >= 0
  return (
    <span className={`font-mono font-semibold ${pos ? 'text-green-400' : 'text-red-400'}`}>
      {pos ? '+' : ''}{pnl.toLocaleString('fr-FR', { style: 'currency', currency: 'USD' })}
    </span>
  )
}

function SkeletonRow() {
  return (
    <tr>
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 animate-pulse bg-gray-800 rounded w-16" />
        </td>
      ))}
    </tr>
  )
}

export function OpenPositionsTable() {
  const { data: positions = [], isLoading } = useOpenPositions()

  return (
    <div className="bg-[#111827] border border-gray-800/60 rounded-xl">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800/60">
        <h2 className="text-sm font-semibold text-white">Positions ouvertes</h2>
        <span className="text-xs text-gray-500 font-mono">
          {positions.length} actif{positions.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800/40">
              {['Symbole', 'Dir.', 'Ouverture', 'Px ouvert', 'Lots', 'P&L flottant', 'Stratégie'].map(h => (
                <th key={h} className="px-4 py-2.5 text-left text-[11px] text-gray-500 uppercase tracking-wider font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/40">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)
            ) : positions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-gray-600 text-sm">
                  Aucune position ouverte en ce moment
                </td>
              </tr>
            ) : (
              positions.map(pos => (
                <tr key={pos.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-semibold text-white font-mono">{pos.symbol}</span>
                  </td>
                  <td className="px-4 py-3">
                    <DirectionBadge dir={pos.direction} />
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {format(new Date(pos.openTime), 'dd MMM HH:mm', { locale: fr })}
                  </td>
                  <td className="px-4 py-3 font-mono text-gray-300">
                    {pos.openPrice.toFixed(pos.symbol === 'USDJPY' ? 3 : pos.symbol.includes('JPY') ? 3 : 5)}
                  </td>
                  <td className="px-4 py-3 font-mono text-gray-300">
                    {pos.lotSize.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <PnlCell pnl={pos.pnl} />
                  </td>
                  <td className="px-4 py-3">
                    {pos.strategyTag ? (
                      <span className="text-xs text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                        {pos.strategyTag}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-600">—</span>
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
