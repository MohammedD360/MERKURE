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
          <div className="h-4 w-16 animate-pulse rounded bg-slate-800/70" />
        </td>
      ))}
    </tr>
  )
}

export function OpenPositionsTable() {
  const { data: positions = [], isLoading } = useOpenPositions()

  return (
    <div className="rounded-lg border border-slate-800 bg-[#0b111c] shadow-[0_18px_45px_rgba(0,0,0,0.22)]">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
        <h2 className="text-sm font-black text-white">Positions ouvertes</h2>
        <span className="font-mono text-xs text-slate-500">
          {positions.length} actif{positions.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800">
              {['Symbole', 'Dir.', 'Ouverture', 'Px ouvert', 'Lots', 'P&L flottant', 'Stratégie'].map(h => (
                <th key={h} className="px-4 py-2.5 text-left text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)
            ) : positions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-600">
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
                  <td className="px-4 py-3 text-xs text-slate-400">
                    {format(new Date(pos.openTime), 'dd MMM HH:mm', { locale: fr })}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-300">
                    {pos.openPrice.toFixed(pos.symbol === 'USDJPY' ? 3 : pos.symbol.includes('JPY') ? 3 : 5)}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-300">
                    {pos.lotSize.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <PnlCell pnl={pos.pnl} />
                  </td>
                  <td className="px-4 py-3">
                    {pos.strategyTag ? (
                      <span className="rounded-full bg-blue-400/[0.08] px-2 py-0.5 text-xs text-blue-300">
                        {pos.strategyTag}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-600">—</span>
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
